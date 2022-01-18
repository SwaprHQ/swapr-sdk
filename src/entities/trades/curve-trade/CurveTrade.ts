import { Contract as MulticallContract, Provider as MulticallProvider } from 'ethers-multicall'
import { UnsignedTransaction } from '@ethersproject/transactions'
import { BigNumber } from '@ethersproject/bignumber'
import { formatUnits, parseUnits } from '@ethersproject/units'
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
import { CurvePool, CURVE_POOLS, CurveToken, TOKENS_MAINNET } from './constants'
import { getProvider, getExchangeRoutingInfo, MAINNET_CONTRACTS } from './contracts'
import { CURVE_ROUTER_ABI } from './abi'
import { wrappedCurrency } from '../utils'

const ZERO_HEX = '0x0'

/**
 * Returns the token index of a token in a Curve pool
 * @param pool the Curve pool
 * @param tokenAddress the token address
 */
function getTokenIndex(pool: CurvePool, tokenAddress: string, chainId: ChainId = ChainId.MAINNET) {
  // Use main tokens
  let tokenList = pool.tokens
  // Combine tokens + meta tokens
  if (pool.isMeta && pool.metaTokens) {
    // Combine all tokens without 3CRV
    const tokenWithout3CRV = pool.tokens.filter(token => token.symbol.toLowerCase() !== '3crv')

    tokenList = [...tokenWithout3CRV, ...(pool.metaTokens as CurveToken[])]
  }

  if (
    pool.allowsTradingETH === true &&
    chainId === ChainId.MAINNET &&
    tokenAddress.toLowerCase() === TOKENS_MAINNET.eth.address.toLowerCase()
  ) {
    tokenAddress = TOKENS_MAINNET.weth.address
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
function getRoutablePools(pools: CurvePool[], tokenIn: CurveToken, tokenOut: CurveToken, chainId: ChainId) {
  return pools.filter(({ tokens, metaTokens, underlyingTokens, allowsTradingETH }) => {
    let tokenInAddress = tokenIn.address
    let tokenOutAddress = tokenOut.address

    // For mainnet, account for ETH/WETH
    if (chainId === ChainId.MAINNET) {
      const isTokenInEther = tokenIn.address.toLowerCase() === TOKENS_MAINNET.eth.address.toLowerCase()
      const isTokenOutEther = tokenOut.address.toLowerCase() === TOKENS_MAINNET.eth.address.toLowerCase()

      tokenInAddress = allowsTradingETH === true && isTokenInEther ? TOKENS_MAINNET.weth.address : tokenIn.address
      tokenOutAddress = allowsTradingETH === true && isTokenOutEther ? TOKENS_MAINNET.weth.address : tokenOut.address
    }

    // main tokens
    const hasTokenIn = tokens.some(token => token.address.toLowerCase() === tokenInAddress.toLowerCase())
    const hasTokenOut = tokens.some(token => token.address.toLowerCase() === tokenOutAddress.toLowerCase())

    // Meta tokens in MetaPools [ERC20, [...3PoolTokens]]
    const hasMetaTokenIn = metaTokens?.some(token => token.address.toLowerCase() === tokenInAddress.toLowerCase())
    const hasMetaTokenOut = metaTokens?.some(token => token.address.toLowerCase() === tokenOutAddress.toLowerCase())

    // Underlying tokens, similar to meta tokens
    const hasUnderlyingTokenIn = underlyingTokens?.some(
      token => token.address.toLowerCase() === tokenInAddress.toLowerCase()
    )
    const hasUnderlyingTokenOut = underlyingTokens?.some(
      token => token.address.toLowerCase() === tokenOutAddress.toLowerCase()
    )

    return (
      (hasTokenIn || hasUnderlyingTokenIn || hasMetaTokenIn) &&
      (hasTokenOut || hasUnderlyingTokenOut || hasMetaTokenOut)
    )
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
    const tokenIn = wrappedCurrency(currencyAmountIn.currency, chainId)
    const tokenOut = wrappedCurrency(currencyOut, chainId)
    invariant(!tokenIn.equals(tokenOut), 'CURRENCY')

    console.log(tokenIn)

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
      let amountInBN = parseUnits(currencyAmountIn.toExact(), tokenIn.decimals)

      // This is a bug with tokens on xDAI
      // currencyAmountIn.toExact() produces the double amount of digits
      // For example, an 18 decimal tokens results in 1 * 10^36
      // And an 6 decimal token results in 1 * 10^12
      if (chainId === ChainId.XDAI) {
        amountInBN = parseUnits(formatUnits(currencyAmountIn.toExact(), tokenIn.decimals), tokenIn.decimals)
      }

      console.log([currencyAmountIn.toExact(), amountInBN.toString()])

      // Determine if user has sent ETH
      if (etherIn) {
        value = amountInBN.toString()
      }

      // Find all pools that the trade can go through
      const routablePools = getRoutablePools(curvePools, tokenIn as CurveToken, tokenOut as CurveToken, chainId)

      // Exit since no pools have been found
      if (routablePools.length === 0) {
        console.log('CurveTrade: no pools found for trade pair')
        return
      }

      // On Mainnet, try to find a route via Curve's Smart Router

      if (chainId === ChainId.MAINNET) {
        // On mainnet, try using crypto router
        let exchangeRoutingInfo
        exchangeRoutingInfo = await getExchangeRoutingInfo({
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
              .mul(99)
              .div(100)
              .toString()
          ]
          const curveRouterContract = new Contract(MAINNET_CONTRACTS.router, CURVE_ROUTER_ABI, provider)
          const populatedTransaction = await curveRouterContract.populateTransaction.exchange(...params, {
            value
          })

          // Add 30% buffer
          const gasLimitWithBuffer = populatedTransaction.gasLimit?.mul(130).div(100)

          populatedTransaction.gasLimit = gasLimitWithBuffer

          return new CurveTrade(
            currencyAmountIn,
            Currency.isNative(currencyOut)
              ? CurrencyAmount.nativeCurrency(exchangeRoutingInfo.expectedAmountOut.toBigInt(), chainId)
              : new TokenAmount(tokenOut, exchangeRoutingInfo.expectedAmountOut.toBigInt()),
            maximumSlippage,
            TradeType.EXACT_INPUT,
            chainId,
            populatedTransaction
          )
        }
      }

      // The final
      let estimatedAmountOutPerPool: BigNumber[] = []
      // The current multicall library does not support Arbitrum One
      if (chainId == ChainId.ARBITRUM_ONE) {
        // Compile all the output
        estimatedAmountOutPerPool = await Promise.all(
          routablePools.map(async pool => {
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
        // Compile all the output
        // Using Multicall contract
        const bestPoolOutputCalls = routablePools.map(pool => {
          const poolContractMulticall = new MulticallContract(pool.swapAddress, pool.abi as any)
          // Map token address to index
          const tokenInIndex = getTokenIndex(pool, tokenIn.address)
          const tokenOutIndex = getTokenIndex(pool, tokenOut.address)

          // Get expected output from the pool
          // Use underylying signature if the pool is a meta pool
          // A meta pool is a pool composed of an ERC20 pair with the Curve base 3Pool (DAI+USDC+USDT)
          const dyMethodSignature = pool.isMeta ? 'get_dy_underlying' : 'get_dy'

          // Construct the params
          const dyMethodParams = [tokenInIndex.toString(), tokenOutIndex.toString(), amountInBN.toString()]

          // Debug
          console.log('Fetching estimated output', pool.swapAddress, dyMethodSignature, dyMethodParams)

          // Return the call bytes
          return poolContractMulticall[dyMethodSignature](...dyMethodParams)
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

      // Construct the unsigned transaction
      // Default method signature and params
      // This is the most optimistic
      let exchangeSignature = 'exchange'

      if (!(exchangeSignature in poolContract.populateTransaction)) {
        // console.log(`Signature ${exchangeSignature} not found`)
        // console.log(poolContract.functions)
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

      console.log(exchangeSignature, exchangeParams)

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
