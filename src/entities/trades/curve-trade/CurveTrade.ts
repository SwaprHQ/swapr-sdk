import { Provider as MulticallProvider } from 'ethers-multicall'
import { UnsignedTransaction } from '@ethersproject/transactions'
import { BigNumber } from '@ethersproject/bignumber'
import { parseUnits } from '@ethersproject/units'
import { Contract } from '@ethersproject/contracts'
import { Provider } from '@ethersproject/providers'
import invariant from 'tiny-invariant'

import { RoutablePlatform } from '../routable-platform/routable-platform'
import { ChainId, ONE, TradeType } from '../../../constants'
import { CurrencyAmount } from '../../fractions/currencyAmount'
import { TokenAmount } from '../../fractions/tokenAmount'
import { Fraction } from '../../fractions/fraction'
import { currencyEquals, Token } from '../../token'
import { Percent } from '../../fractions/percent'
import { Price } from '../../fractions/price'
import { Trade } from '../interfaces/trade'
import { Currency } from '../../currency'
import { debug } from '../../../utils'

// Curve imports
import { getProvider, getExchangeRoutingInfo, getBestCurvePoolAndOutput, MAINNET_CONTRACTS } from './contracts'
import { getCurveToken, getRoutablePools, getTokenIndex } from './utils'
import { CURVE_POOLS, CurveToken } from './constants'
import { wrappedCurrency } from '../utils'
import { CURVE_ROUTER_ABI } from './abi'

const ZERO_HEX = '0x0'

export interface CurveTradeConstructorParams {
  inputAmount: CurrencyAmount
  outputAmount: CurrencyAmount
  maximumSlippage: Percent
  tradeType: TradeType
  chainId: ChainId
  transactionRequest: UnsignedTransaction
  approveAddress?: string
  fee?: Percent
}

export interface CurveTradeBestTradeExactInParams {
  currencyAmountIn: CurrencyAmount
  currencyOut: Currency
  maximumSlippage: Percent
}

/**
 * Represents a trade executed against a list of pairs.
 * Does not account for slippage, i.e. trades that front run this trade and move the price.
 */
export class CurveTrade extends Trade {
  /**
   * An address the EOA must approve to spend its tokenIn
   */
  public readonly approveAddress: string
  /**
   * The Unsigned transaction
   */
  public readonly transactionRequest: UnsignedTransaction

  /**
   *
   * @param input Input token
   * @param output Output token
   * @param maximumSlippage Maximum slippage indicated by the user
   * @param tradeType Trade type
   * @param to Address to to which transaction is send
   * @param callData Unsigned transaction signature
   * @param value ETH value
   * @param approveAddress Approve address, defaults to `to`
   */
  public constructor({
    inputAmount,
    outputAmount,
    maximumSlippage,
    tradeType,
    chainId,
    transactionRequest,
    approveAddress,
    fee
  }: CurveTradeConstructorParams) {
    invariant(!currencyEquals(inputAmount.currency, outputAmount.currency), 'SAME_TOKEN')
    super({
      details: undefined,
      type: tradeType,
      inputAmount,
      outputAmount,
      executionPrice: new Price({
        baseCurrency: inputAmount.currency,
        quoteCurrency: outputAmount.currency,
        denominator: inputAmount.raw,
        numerator: outputAmount.raw
      }),
      maximumSlippage,
      priceImpact: new Percent('0', '100'),
      chainId,
      platform: RoutablePlatform.CURVE,
      fee
    })
    this.transactionRequest = transactionRequest
    this.approveAddress = approveAddress || (transactionRequest.to as string)
  }

  public minimumAmountOut(): CurrencyAmount {
    if (this.tradeType === TradeType.EXACT_OUTPUT) {
      return this.outputAmount
    } else {
      const slippageAdjustedAmountOut = new Fraction(ONE)
        .add(this.maximumSlippage)
        .invert()
        .multiply(this.outputAmount.raw).quotient

      return this.outputAmount instanceof TokenAmount
        ? new TokenAmount(this.outputAmount.token, slippageAdjustedAmountOut)
        : CurrencyAmount.nativeCurrency(slippageAdjustedAmountOut, this.chainId)
    }
  }

  public maximumAmountIn(): CurrencyAmount {
    if (this.tradeType === TradeType.EXACT_INPUT) {
      return this.inputAmount
    } else {
      const slippageAdjustedAmountIn = new Fraction(ONE).add(this.maximumSlippage).multiply(this.inputAmount.raw)
        .quotient
      return this.inputAmount instanceof TokenAmount
        ? new TokenAmount(this.inputAmount.token, slippageAdjustedAmountIn)
        : CurrencyAmount.nativeCurrency(slippageAdjustedAmountIn, this.chainId)
    }
  }

  /**
   * Checks if two tokens can be routed between on Curve Finance pools
   * @param tokenIn
   * @param tokenOut
   * @returns a `boolean` whether the tokens can be exchanged on Curve Finance pools
   */
  public static async canRoute(tokenIn: Token, tokenOut: Token): Promise<boolean> {
    // Validations
    const chainId: ChainId | undefined =
      tokenIn instanceof Token ? tokenIn.chainId : tokenOut instanceof Token ? tokenOut.chainId : undefined
    invariant(chainId !== undefined && RoutablePlatform.CURVE.supportsChain(chainId), 'CHAIN_ID')
    invariant(!tokenIn.equals(tokenOut), 'CURRENCY')
    const routerContract = new Contract(MAINNET_CONTRACTS.router, CURVE_ROUTER_ABI, getProvider(ChainId.MAINNET))
    // Get the the router an pass arguments
    return routerContract.can_route(tokenIn.address, tokenOut.address)
  }

  /**
   * Computes and returns the best trade from Curve pools
   * by comparing all the Curve pools on target chain
   * @param currencyAmountIn the amount of curreny in - sell token
   * @param currencyOut the currency out - buy token
   * @param maximumSlippage Maximum slippage
   * @param provider an optional provider, the router defaults public providers
   * @returns the best trade if found
   */
  public static async bestTradeExactIn(
    { currencyAmountIn, currencyOut, maximumSlippage }: CurveTradeBestTradeExactInParams,
    provider?: Provider
  ): Promise<CurveTrade | undefined> {
    // Try to extract the chain ID from the tokens
    const chainId: ChainId | undefined =
      currencyAmountIn instanceof TokenAmount
        ? currencyAmountIn.token.chainId
        : currencyOut instanceof Token
        ? currencyOut.chainId
        : undefined

    // Require the chain ID
    invariant(chainId !== undefined && RoutablePlatform.CURVE.supportsChain(chainId), 'CHAIN_ID')
    // const wrappedTokenIn = wrappedCurrency(currencyAmountIn.currency, chainId)
    const wrappedtokenOut = wrappedCurrency(currencyOut, chainId)

    // Get the token's data from Curve
    const tokenIn = getCurveToken(currencyAmountIn.currency?.address as string, chainId)
    const tokenOut = getCurveToken(currencyOut.address as string, chainId)

    // Validations
    invariant(tokenIn != undefined, 'NO_TOKEN_IN')
    invariant(tokenOut != undefined, 'NO_TOKEN_OUT')
    invariant(tokenIn.address.toLowerCase() != tokenOut.address.toLowerCase(), 'SAME_TOKEN')

    // const etherOut = this.outputAmount.currency === nativeCurrency
    // // the router does not support both ether in and out
    // invariant(!(etherIn && etherOut), 'ETHER_IN_OUT')
    provider = provider || getProvider(chainId)

    let bestTrade
    try {
      // Use multicall provider
      const multicallProvider = new MulticallProvider(provider as any)
      await multicallProvider.init()

      let value = ZERO_HEX // With Curve, most value exchanged is ERC20
      // Get the Router contract to populate the unsigned transaction
      // Get all Curve pools for the chain
      const curvePools = CURVE_POOLS[chainId]

      const nativeCurrency = Currency.getNative(chainId)
      // Determine if the currency sent is ETH
      // First using address
      // then, using symbol
      const etherIn =
        tokenIn.address.toLowerCase() == nativeCurrency.address?.toLowerCase()
          ? true
          : currencyAmountIn.currency.name?.toLowerCase() === nativeCurrency.name?.toLowerCase()
          ? true
          : currencyAmountIn.currency === nativeCurrency

      // Baisc trade information
      let amountInBN = parseUnits(currencyAmountIn.toSignificant(), tokenIn.decimals)

      // Determine if user has sent ETH
      if (etherIn) {
        value = amountInBN.toString()
      }

      // Check if the two pairs are of different type
      // When the pair types are different, there is
      // a potential that Curve Smart Router can handle the trade
      const isCryptoSwap = tokenIn.type !== tokenOut.type

      // Find all pools that the trade can go through
      // Manually find all routable pools
      let routablePools = getRoutablePools(curvePools, tokenIn as CurveToken, tokenOut as CurveToken, chainId)

      // On mainnet, use the exchange info to get the best pool
      const bestPoolAndOutputRes =
        chainId === ChainId.MAINNET
          ? await getBestCurvePoolAndOutput({
              amountIn: amountInBN,
              tokenInAddress: tokenIn.address,
              tokenOutAddress: tokenOut.address,
              chainId
            })
          : undefined

      // Majority of Curve pools
      // have 4bps fee of which 50% goes to Curve
      let fee = new Percent('4', '10000')

      // If a pool is found
      // Ignore the manual off-chain search
      if (bestPoolAndOutputRes) {
        routablePools = curvePools.filter(
          pool => pool.swapAddress.toLowerCase() === bestPoolAndOutputRes.poolAddress.toLowerCase()
        )
      }

      // Start finding a possible pool
      // First via Curve's internal best pool finder
      // On Mainnet, try to find a route via Curve's Smart Router
      if (isCryptoSwap && chainId === ChainId.MAINNET) {
        const exchangeRoutingInfo = await getExchangeRoutingInfo({
          amountIn: amountInBN.toString(),
          chainId: ChainId.MAINNET,
          tokenInAddress: tokenIn.address,
          tokenOutAddress: tokenOut.address
        })

        // If the swap can be handled by the smart router, use it
        if (exchangeRoutingInfo) {
          const params = [
            amountInBN.toString(),
            exchangeRoutingInfo.routes,
            exchangeRoutingInfo.indices,
            exchangeRoutingInfo.expectedAmountOut
              .mul(98)
              .div(100)
              .toString()
          ]

          const curveRouterContract = new Contract(MAINNET_CONTRACTS.router, CURVE_ROUTER_ABI, provider)

          debug(`Found a rout via Smart Router at ${curveRouterContract.address}`, params)

          const populatedTransaction = await curveRouterContract.populateTransaction.exchange(...params, {
            value
          })

          // Add 30% gas buffer
          const gasLimitWithBuffer = populatedTransaction.gasLimit?.mul(130).div(100)

          populatedTransaction.gasLimit = gasLimitWithBuffer

          return new CurveTrade({
            inputAmount: currencyAmountIn,
            outputAmount: Currency.isNative(currencyOut)
              ? CurrencyAmount.nativeCurrency(exchangeRoutingInfo.expectedAmountOut.toBigInt(), chainId)
              : new TokenAmount(wrappedtokenOut, exchangeRoutingInfo.expectedAmountOut.toBigInt()),
            maximumSlippage,
            tradeType: TradeType.EXACT_INPUT,
            chainId,
            transactionRequest: populatedTransaction,
            fee
          })
        }
      }

      // Exit since no pools have been found
      if (routablePools.length === 0) {
        console.log('CurveTrade: no pools found for trade pair')
        return
      }

      // The final
      // Compile all the output
      // Using Multicall contract
      const estimatedAmountOutPerPool = await Promise.all(
        routablePools.map(async pool => {
          const poolContract = new Contract(pool.swapAddress, pool.abi as any, provider)
          // Map token address to index
          const tokenInIndex = getTokenIndex(pool, tokenIn.address)
          const tokenOutIndex = getTokenIndex(pool, tokenOut.address)

          // Skip pool that return -1
          if (tokenInIndex < 0 || tokenOutIndex < 0) {
            return BigNumber.from(0)
          }

          // Get expected output from the pool
          // Use underylying signature if the pool is a meta pool
          // A meta pool is a pool composed of an ERC20 pair with the Curve base 3Pool (DAI+USDC+USDT)
          const dyMethodSignature = pool.isMeta ? 'get_dy_underlying' : 'get_dy'

          // Construct the params
          const dyMethodParams = [tokenInIndex.toString(), tokenOutIndex.toString(), amountInBN.toString()]

          // Debug
          debug('Fetching estimated output', pool.swapAddress, dyMethodSignature, dyMethodParams)

          try {
            // Return the call bytes
            return poolContract[dyMethodSignature](...dyMethodParams) as BigNumber
          } catch (e) {
            console.log(e)
            return BigNumber.from(0)
          }
        })
      )

      // Get the estimated output
      // estimatedAmountOutPerPool = await multicallProvider.all(bestPoolOutputCalls)

      if (estimatedAmountOutPerPool.length === 0) {
        return
      }

      // Append back the pool list
      // Using the index
      const poolWithEstimatedAmountOut = estimatedAmountOutPerPool.map((estimatedAmountOut, index) => ({
        estimatedAmountOut,
        pool: routablePools[index]
      }))

      // Sort the pool by best output
      const poolWithEstimatedAmountOutSorted = poolWithEstimatedAmountOut.sort((poolA, poolB) =>
        poolA.estimatedAmountOut.gt(poolB.estimatedAmountOut)
          ? -1
          : poolA.estimatedAmountOut.eq(poolB.estimatedAmountOut)
          ? 0
          : 1
      )

      // Select the best (first) pool
      // among the sorted pools
      const { pool, estimatedAmountOut } = poolWithEstimatedAmountOutSorted[0]

      // Construct the contrac call
      const poolContract = new Contract(pool.swapAddress, pool.abi, provider)

      // Try to fetch the fee from the contract the newest
      // If the call fails, the fee defaults back to 4bps
      try {
        const feeFromContract = (await poolContract.fee()) as BigNumber
        fee = new Percent(feeFromContract.toString(), '10000000000')
      } catch (e) {}

      // Map token address to index
      const tokenInIndex = getTokenIndex(pool, tokenIn.address)
      const tokenOutIndex = getTokenIndex(pool, tokenOut.address)

      // Construct the unsigned transaction
      // Default method signature and params
      // This is the most optimistic
      let exchangeSignature = 'exchange'

      if (!(exchangeSignature in poolContract.populateTransaction)) {
        // debug(`Signature ${exchangeSignature} not found`)
        // debug(poolContract.functions)
        exchangeSignature = 'exchange(int128,int128,uint256,uint256)'
      }

      // Reduce by 1% to cover fees
      const dyMinimumReceived = estimatedAmountOut.mul(99).div(100)

      let exchangeParams: (string | string[] | boolean | boolean[])[] = [
        tokenInIndex.toString(),
        tokenOutIndex.toString(),
        amountInBN.toString(),
        dyMinimumReceived.toString()
      ]

      // If the pool has meta coins
      if (pool.isMeta) {
        exchangeSignature = 'exchange_underlying(uint256,uint256,uint256,uint256)'
      }

      // Pools that allow trading ETH
      if (pool.allowsTradingETH) {
        exchangeSignature = 'exchange(uint256,uint256,uint256,uint256,bool)'

        // Native currency ETH
        if (etherIn) {
          exchangeParams.push(true)
        }
      }

      debug(`Final pool is ${poolContract.address} ${exchangeSignature}`, exchangeParams)

      const populatedTransaction = await poolContract.populateTransaction[exchangeSignature](...exchangeParams, {
        value
      })

      // Return the CurveTrade
      bestTrade = new CurveTrade({
        inputAmount: currencyAmountIn,
        outputAmount: Currency.isNative(currencyOut)
          ? CurrencyAmount.nativeCurrency(estimatedAmountOut.toBigInt(), chainId)
          : new TokenAmount(wrappedtokenOut, estimatedAmountOut.toBigInt()),
        maximumSlippage,
        tradeType: TradeType.EXACT_INPUT,
        chainId,
        transactionRequest: populatedTransaction,
        fee
      })
    } catch (error) {
      console.error('could not fetch Curve trade', error)
    }
    return bestTrade
  }

  /**
   * Returns unsigned transaction for the trade
   * @returns the unsigned transaction
   */
  public async swapTransaction(): Promise<UnsignedTransaction> {
    return {
      ...this.transactionRequest,
      gasLimit: this.transactionRequest.gasLimit ? BigNumber.from(this.transactionRequest.gasLimit) : undefined,
      value: this.transactionRequest.value ? this.transactionRequest.value : BigNumber.from(0)
    }
  }
}
