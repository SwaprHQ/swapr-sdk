import { Contract as MulticallContract, Provider as MulticallProvider } from 'ethers-multicall'
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

// Curve imports
import { CurvePool, CURVE_POOLS, CurveToken } from './constants'
import { getProvider, MAINNET_CONTRACTS } from './contracts'
import { CURVE_ROUTER_ABI } from './abi'
import { wrappedCurrency } from '../utils'
import { getExchangeRoutingInfo } from '.'

const ZERO_HEX = '0x0'

/**
 * Returns the token index of a token in a Curve pool
 * @param pool the Curve pool
 * @param tokenAddress the token address
 */
function getTokenIndex(pool: CurvePool, tokenAddress: string) {
  // Use main tokens
  let tokenList = pool.tokens
  // Combine tokens + meta tokens
  if (pool.isMeta) {
    // Combine all tokens without 3CRV
    const tokenWithout3CRV = pool.tokens.filter(token => token.symbol.toLowerCase() !== '3crv')

    tokenList = [...tokenWithout3CRV, ...(pool.metaTokens as CurveToken[])]
  }

  return tokenList.findIndex(({ address }) => address.toLowerCase() == tokenAddress.toLowerCase())
}

/**
 *
 * @param pools The list of Curve pools
 * @param tokenInAddress Token in address
 * @param tokenOutAddress Token out address
 * @returns List of potential pools at which the trade can be done
 */
function getRoutablePools(pools: CurvePool[], tokenInAddress: string, tokenOutAddress: string) {
  return pools.filter(({ tokens, metaTokens }) => {
    const hasTokenIn = tokens.some(token => token.address.toLowerCase() === tokenInAddress.toLowerCase())
    const hasTokenOut = tokens.some(token => token.address.toLowerCase() === tokenOutAddress.toLowerCase())

    const hasMetaTokenIn = metaTokens?.some(token => token.address.toLowerCase() === tokenInAddress.toLowerCase())
    const hasMetaTokenOut = metaTokens?.some(token => token.address.toLowerCase() === tokenOutAddress.toLowerCase())

    return (hasTokenIn && hasTokenOut) || (hasTokenIn && hasMetaTokenOut) || (hasTokenOut && hasMetaTokenIn)
  })
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
  public constructor(
    input: CurrencyAmount,
    output: CurrencyAmount,
    maximumSlippage: Percent,
    tradeType: TradeType,
    chainId: ChainId,
    transactionRequest: UnsignedTransaction,
    approveAddress?: string
  ) {
    invariant(!currencyEquals(input.currency, output.currency), 'CURRENCY')
    super(
      undefined,
      tradeType,
      input,
      output,
      new Price(input.currency, output.currency, input.raw, output.raw),
      maximumSlippage,
      new Percent('0', '100'),
      chainId,
      RoutablePlatform.CURVE
    )
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
   * @param provider an optional provider, the router defaults back to default public providers
   * @returns the best trade if found
   */
  public static async bestTradeExactIn(
    currencyAmountIn: CurrencyAmount,
    currencyOut: Currency,
    maximumSlippage: Percent,
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
    // const amountIn = wrappedAmount(currencyAmountIn, chainId)
    const tokenIn = wrappedCurrency(currencyAmountIn.currency, chainId)
    const tokenOut = wrappedCurrency(currencyOut, chainId)
    invariant(!tokenIn.equals(tokenOut), 'CURRENCY')

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
      const amountInBN = parseUnits(currencyAmountIn.toExact(), tokenIn.decimals)

      // Find all pools that the trade can go through
      const routablePools = getRoutablePools(curvePools, tokenIn.address, tokenOut.address)

      if (routablePools.length === 0) {
        return
      }

      let estimatedAmountOutPerPool: BigNumber[] = []
      // The current multicall library does not support Arbitrum One
      if (chainId == ChainId.ARBITRUM_ONE) {
        // Compile all the output
        // Using Multicall contract
        estimatedAmountOutPerPool = await Promise.all(
          routablePools.map(pool => {
            // Construct the contract
            const poolContract = new Contract(pool.swapAddress, pool.abi as any, provider)

            // Map token address to index
            const tokenInIndex = getTokenIndex(pool, tokenIn.address)
            const tokenOutIndex = getTokenIndex(pool, tokenOut.address)

            // Get expected output from the pool
            // Use underylying signature if the pool is a meta pool
            // A meta pool is a pool composed of an ERC20 pair with the Curve base 3Pool (DAI+USDC+USDT)
            const dyMethodSignature = pool.isMeta ? 'get_dy_underlying' : 'get_dy'

            // Return the call bytes
            return poolContract[dyMethodSignature](
              tokenInIndex.toString(),
              tokenOutIndex.toString(),
              amountInBN.toString()
            ) as BigNumber
          })
        )
      } else {
        // Try using crypto router
        const curveRouterContract = new Contract(MAINNET_CONTRACTS.router, CURVE_ROUTER_ABI, provider)
        const exchangeRoutingInfo = await getExchangeRoutingInfo({
          amountIn: amountInBN,
          chainId: ChainId.MAINNET,
          tokenInAddress: tokenIn.address,
          tokenOutAddress: tokenOut.address
        })

        console.log({
          exchangeRoutingInfo
        })

        // If the swap can be handled by the smart router, use it
        if (exchangeRoutingInfo) {
          const params = [
            amountInBN.toString(),
            exchangeRoutingInfo.indices.map(index => index.toString()),
            exchangeRoutingInfo.routes,
            exchangeRoutingInfo.expectedAmountOut.toString()
          ]

          console.log(params, curveRouterContract.populateTransaction)
          const populatedTransaction = await curveRouterContract.populateTransaction[
            'exchange(uint256,address[6],uint256[8],uint256)'
          ](...params, {
            value: 0
          })

          console.log(populatedTransaction)

          bestTrade = new CurveTrade(
            currencyAmountIn,
            Currency.isNative(currencyOut)
              ? CurrencyAmount.nativeCurrency(exchangeRoutingInfo.expectedAmountOut.toBigInt(), chainId)
              : new TokenAmount(tokenOut, exchangeRoutingInfo.expectedAmountOut.toBigInt()),
            maximumSlippage,
            TradeType.EXACT_INPUT,
            chainId,
            populatedTransaction
          )
        } else {
          // Compile all the output
          // Using Multicall contract
          const bestPoolOutputCalls = routablePools.map(pool => {
          const poolContractMulticall = new MulticallContract(pool.swapAddress, pool.abi as any)
          // Map token address to index
          const tokenInIndex = getTokenIndex(pool, tokenIn.address)
          const tokenOutIndex = getTokenIndex(pool, tokenOut.address)
          // Get expected output from the pool
          const dyMethodSignature = pool.isMeta ? 'get_dy_underlying' : 'get_dy'

          // Debug
          // console.log('Fetching estimated output', dyMethodSignature, [
          //   tokenInIndex.toString(),
          //   tokenOutIndex.toString(),
          //   amountInBN.toString()
          // ])

          // Return the call bytes
          return poolContractMulticall[dyMethodSignature](
            tokenInIndex.toString(),
            tokenOutIndex.toString(),
            amountInBN.toString()
          )
        })

        // Get the estimated output
          estimatedAmountOutPerPool = await multicallProvider.all(bestPoolOutputCalls)
        }

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

      // Map token address to index
      const tokenInIndex = getTokenIndex(pool, tokenIn.address)
      const tokenOutIndex = getTokenIndex(pool, tokenOut.address)

      // console.log({ etherIn, tokenIn, tokenOut })

        // Construct the unsigned transaction
        // Default method signature and params
        // This is the most optimistic
        let exchangeSignature = 'exchange'

        if (!(exchangeSignature in poolContract.populateTransaction)) {
          // console.log(`Signature ${exchangeSignature} not found`)
          // console.log(poolContract.functions)
          exchangeSignature = 'exchange(int128,int128,uint256,uint256)'
        }

        // Take out 10 to cover fees
        const dyMinimumReceived = estimatedAmountOut.sub(10)

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

      // Determine if user has sent ETH
      if (etherIn) {
        value = amountInBN.toString()
      }

      const populatedTransaction = await poolContract.populateTransaction[exchangeSignature](...exchangeParams, {
        value
      })

      // Return the CurveTrade
      bestTrade = new CurveTrade(
        currencyAmountIn,
        Currency.isNative(currencyOut)
          ? CurrencyAmount.nativeCurrency(estimatedAmountOut.toBigInt(), chainId)
          : new TokenAmount(tokenOut, estimatedAmountOut.toBigInt()),
        maximumSlippage,
        TradeType.EXACT_INPUT,
          chainId,
          populatedTransaction
        )
      }
    } catch (error) {
      console.error('could not fetch Curve trade', error)
    }
    return bestTrade
  }

  public async swapTransaction(): Promise<UnsignedTransaction> {
    return {
      ...this.transactionRequest,
      gasLimit: this.transactionRequest.gasLimit ? BigNumber.from(this.transactionRequest.gasLimit) : undefined,
      value: this.transactionRequest.value ? this.transactionRequest.value : BigNumber.from(0)
    }
  }
}
