import { BigNumber } from '@ethersproject/bignumber'
import { AddressZero } from '@ethersproject/constants'
import { Contract } from '@ethersproject/contracts'
import { Provider } from '@ethersproject/providers'
import type { UnsignedTransaction } from '@ethersproject/transactions'
import { parseUnits } from '@ethersproject/units'
import debug from 'debug'
import Decimal from 'decimal.js-light'
import invariant from 'tiny-invariant'

import { ChainId, ONE, TradeType } from '../../../constants'
import { Currency } from '../../currency'
import { CurrencyAmount } from '../../fractions/currencyAmount'
import { Fraction } from '../../fractions/fraction'
import { Percent } from '../../fractions/percent'
import { Price } from '../../fractions/price'
import { TokenAmount } from '../../fractions/tokenAmount'
import { currencyEquals, Token } from '../../token'
import { Trade } from '../interfaces/trade'
import { RoutablePlatform } from '../routable-platform'
import { tryGetChainId, wrappedCurrency } from '../utils'
import { getProvider } from '../utils'
// Curve imports
import { getBestCurvePoolAndOutput, getCurveDAIExchangeContract, getExchangeRoutingInfo, getRouter } from './contracts'
import { CURVE_POOLS } from './pools'
import type { CurvePool } from './tokens/types'
import {
  CurveTradeBestTradeExactInParams,
  CurveTradeBestTradeExactOutParams,
  CurveTradeConstructorParams,
  CurveTradeGetQuoteParams,
  CurveTradeQuote,
} from './types'
import { getCurveToken, getRoutablePools, getTokenIndex } from './utils'

interface QuoteFromPool {
  estimatedAmountOut: BigNumber
  poolContract: Contract
  pool: CurvePool
  error?: Error
}

// Debuging logger. See documentation to enable logging.
const debugCurveGetQuote = debug('ecoRouter:curve:getQuote')

/**
 * Represents a trade executed against a list of pairs.
 * Does not account for slippage, i.e. trades that front run this trade and move the price.
 */
export class CurveTrade extends Trade {
  /**
   * The Unsigned transaction
   */
  public readonly transactionRequest: UnsignedTransaction
  /**
   * The contract instance through which the trade go through
   */
  public readonly contract: Contract

  /**
   *
   * @param {Object} obj Curve trade options.
   * @param {CurrencyAmount} obj.inputAmount - Input token
   * @param {CurrencyAmount} obj.outputAmount - Output token
   * @param {Percent} obj.maximumSlippage - Maximum slippage indicated by the user
   * @param {TradeType} obj.tradeType - Trade type
   * @param {string} obj.transactionRequest - Address to to which transaction is send
   * @param {Percent} obj.fee - Trade fee
   * @param {string} obj.approveAddress - Approve address, defaults to `to`
   */
  public constructor({
    inputAmount,
    outputAmount,
    maximumSlippage,
    tradeType,
    chainId,
    transactionRequest,
    approveAddress,
    fee,
    contract,
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
        numerator: outputAmount.raw,
      }),
      maximumSlippage,
      priceImpact: new Percent('0', '100'),
      chainId,
      platform: RoutablePlatform.CURVE,
      fee,
      approveAddress: approveAddress || (transactionRequest.to as string),
    })
    this.transactionRequest = transactionRequest
    this.contract = contract
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
      const slippageAdjustedAmountIn = new Fraction(ONE)
        .add(this.maximumSlippage)
        .multiply(this.inputAmount.raw).quotient
      return this.inputAmount instanceof TokenAmount
        ? new TokenAmount(this.inputAmount.token, slippageAdjustedAmountIn)
        : CurrencyAmount.nativeCurrency(slippageAdjustedAmountIn, this.chainId)
    }
  }

  /**
   * Checks if two tokens can be routed between on Curve Finance pools.
   * This method returns accurate results only on Ethereum since the Curve Router is available there.
   * @param {string} tokenIn
   * @param {string} tokenOut
   * @returns a `boolean` whether the tokens can be exchanged on Curve Finance pools
   */
  public static async canRoute(tokenIn: Token, tokenOut: Token): Promise<boolean> {
    return getRouter().can_route(tokenIn.address, tokenOut.address)
  }

  /**
   * Given an a sell token and a buy token, and amount of sell token, returns a
   * quote from Curve's pools with best pool, and unsigned transactions data
   * @param {object} obj options
   * @param {CurrencyAmount} obj.currencyAmountIn the amount of curreny in - sell token
   * @param {Currency} obj.currencyOut the currency in - buy token
   * @param {Percent} obj.maximumSlippage Maximum slippage
   * @param {Provider} provider an optional provider, the router defaults public providers
   * @returns the best trade if found
   */
  public static async getQuote(
    { currencyAmountIn, currencyOut, maximumSlippage, receiver = AddressZero }: CurveTradeGetQuoteParams,
    provider?: Provider
  ): Promise<CurveTradeQuote | undefined> {
    // Try to extract the chain ID from the tokens
    const chainId = tryGetChainId(currencyAmountIn, currencyOut)
    // Require the chain ID
    invariant(chainId !== undefined, 'CHAIN_ID')

    if (!RoutablePlatform.CURVE.supportsChain(chainId)) {
      return undefined
    }

    const wrappedTokenIn = wrappedCurrency(currencyAmountIn.currency, chainId)
    const wrappedtokenOut = wrappedCurrency(currencyOut, chainId)
    // Get the token's data from Curve
    const tokenIn = getCurveToken(wrappedTokenIn, chainId)
    const tokenOut = getCurveToken(wrappedtokenOut, chainId)
    // Get the native address
    const nativeCurrency = Currency.getNative(chainId)

    // Determine if the currency sent is native
    // First using address
    // then, using symbol/name
    const isNativeAssetIn =
      currencyAmountIn.currency?.address?.toLocaleLowerCase() === nativeCurrency.address?.toLowerCase()
        ? true
        : currencyAmountIn.currency === nativeCurrency

    const isNativeAssetOut =
      tokenOut?.address.toLowerCase() == nativeCurrency.address?.toLowerCase()
        ? true
        : currencyOut.name?.toLowerCase() === nativeCurrency.name?.toLowerCase()
        ? true
        : currencyOut === nativeCurrency

    // Validations
    invariant(tokenIn != undefined, 'NO_TOKEN_IN')
    invariant(tokenOut != undefined, 'NO_TOKEN_OUT')
    invariant(tokenIn.address.toLowerCase() != tokenOut.address.toLowerCase(), 'SAME_TOKEN')

    // const etherOut = this.outputAmount.currency === nativeCurrency
    // // the router does not support both ether in and out
    provider = getProvider(chainId)

    let value = '0x0' // With Curve, most value exchanged is ERC20
    // Get the Router contract to populate the unsigned transaction
    // Get all Curve pools for the chain
    const curvePools = CURVE_POOLS[chainId]

    // Baisc trade information
    const amountInBN = parseUnits(currencyAmountIn.toSignificant(), tokenIn.decimals)
    if (isNativeAssetIn) {
      value = amountInBN.toString()
    }
    // Majority of Curve pools
    // have 4bps fee of which 50% goes to Curve
    const FEE_DECIMAL = 0.0004
    let fee = new Percent('4', '10000')

    // Exchange fee
    const exchangeRateWithoutFee = 1
    const exchangeRate = 1 - FEE_DECIMAL

    debugCurveGetQuote({
      isNativeAssetIn,
      isNativeAssetOut,
    })

    // Use Custom contract for native xDAI<>USDT and xDAI<>USDC trades on Gnosis Chain
    if (chainId === ChainId.XDAI && (isNativeAssetIn || isNativeAssetOut)) {
      const poolContract = getCurveDAIExchangeContract()

      const tokenInAddress =
        isNativeAssetIn && nativeCurrency.address != undefined ? nativeCurrency.address : tokenIn.address
      const tokenOutAddress =
        isNativeAssetOut && nativeCurrency.address != undefined ? nativeCurrency.address : tokenOut.address

      const estimatedAmountOutParams = [tokenInAddress, tokenOutAddress, amountInBN.toString()]

      const estimatedAmountOut = await poolContract.getEstimatedAmountOut(...estimatedAmountOutParams)

      // Prepapre signature and params for Curve3PoolExchange
      let exchangeSignature = 'exchangeExactNativeTokenForERC20'
      let exchangeParams = [tokenOut.address, estimatedAmountOut, receiver]

      if (isNativeAssetOut) {
        exchangeSignature = 'exchangeExactERC20ForNativeToken'
        exchangeParams = [tokenInAddress, amountInBN.toString(), estimatedAmountOut, receiver]
      }

      debugCurveGetQuote('populating transaction ', {
        exchangeSignature,
        exchangeParams,
        value,
      })

      const populatedTransaction = await poolContract.populateTransaction[exchangeSignature](...exchangeParams, {
        value,
      })

      return {
        currencyAmountIn,
        populatedTransaction,
        currencyOut,
        estimatedAmountOut: Currency.isNative(currencyOut)
          ? CurrencyAmount.nativeCurrency(estimatedAmountOut.toBigInt(), chainId)
          : new TokenAmount(wrappedtokenOut, estimatedAmountOut.toBigInt()),
        maximumSlippage,
        fee,
        to: poolContract.address,
        exchangeRateWithoutFee,
        exchangeRate,
        contract: poolContract,
      }
    }

    // Check if the two pairs are of different type
    // When the pair types are different, there is
    // a potential that Curve Smart Router can handle the trade
    const isCryptoSwap = tokenIn.type !== tokenOut.type

    // Find all pools that the trade can go through from both factory and regular pools
    let routablePools = await getRoutablePools(curvePools, tokenIn, tokenOut, chainId)
    // On mainnet, use the exchange info to get the best pool
    const bestPoolAndOutputRes =
      chainId === ChainId.MAINNET
        ? await getBestCurvePoolAndOutput({
            amountIn: amountInBN,
            tokenInAddress: tokenIn.address,
            tokenOutAddress: tokenOut.address,
            chainId,
          })
        : undefined

    // If a pool is found
    // Ignore the manual off-chain search
    if (bestPoolAndOutputRes) {
      debugCurveGetQuote(`Found best pool from Curve registry`, bestPoolAndOutputRes)
      const bestPool = routablePools.filter(
        (pool) => pool.address.toLowerCase() === bestPoolAndOutputRes.poolAddress.toLowerCase()
      )
      if (bestPool.length !== 0) routablePools = bestPool
    }

    debugCurveGetQuote('Routeable pools: ', routablePools)

    // Start finding a possible pool
    // First via Curve's internal best pool finder
    // On Mainnet, try to find a route via Curve's Smart Router
    if (isCryptoSwap && chainId === ChainId.MAINNET) {
      const exchangeRoutingInfo = await getExchangeRoutingInfo({
        amountIn: amountInBN.toString(),
        chainId: ChainId.MAINNET,
        tokenInAddress: tokenIn.address,
        tokenOutAddress: tokenOut.address,
      })

      // If the swap can be handled by the smart router, use it
      if (exchangeRoutingInfo) {
        const params = [
          amountInBN.toString(),
          exchangeRoutingInfo.routes,
          exchangeRoutingInfo.indices,
          exchangeRoutingInfo.expectedAmountOut.mul(98).div(100).toString(),
        ]

        const curveRouterContract = getRouter()

        debugCurveGetQuote(`Found a route via Smart Router at ${curveRouterContract.address}`, params)

        const populatedTransaction = await curveRouterContract.populateTransaction.exchange(...params, {
          value,
        })

        // Add 30% gas buffer
        populatedTransaction.gasLimit = populatedTransaction.gasLimit?.mul(13).div(10)

        return {
          fee,
          estimatedAmountOut: new TokenAmount(currencyOut as Token, exchangeRoutingInfo.expectedAmountOut.toBigInt()),
          currencyAmountIn,
          currencyOut,
          maximumSlippage,
          populatedTransaction,
          to: curveRouterContract.address,
          exchangeRateWithoutFee,
          exchangeRate,
          contract: curveRouterContract,
        }
      }
    }

    // Continue using pool-by-pool cases
    // Exit since no pools have been found
    if (routablePools.length === 0) {
      console.error('CurveTrade: no pools found for trade pair')
      return
    }

    // The final step
    // Compile all the output
    // Using Multicall contract
    const quoteFromPoolList: QuoteFromPool[] = await Promise.all(
      routablePools.map(async (pool) => {
        console.log({ pool })
        const poolContract = new Contract(pool.address, pool.abi as any, provider)
        // Map token address to index
        const tokenInIndex = getTokenIndex(pool, tokenIn.address)
        const tokenOutIndex = getTokenIndex(pool, tokenOut.address)
        // Skip pool that return -1
        if (tokenInIndex < 0 || tokenOutIndex < 0) {
          console.error(`Curve: pool does not have one of tokens: ${tokenIn.symbol}, ${tokenOut.symbol}`)
        }
        // Get expected output from the pool
        // Use underylying signature if the pool is a meta pool
        // A meta pool is a pool composed of an ERC20 pair with the Curve base 3Pool (DAI+USDC+USDT)
        const dyMethodSignature = pool.isMeta ? 'get_dy_underlying' : 'get_dy'

        // Construct the params
        const dyMethodParams = [tokenInIndex.toString(), tokenOutIndex.toString(), currencyAmountIn.raw.toString()]

        debugCurveGetQuote(`Fetching estimated output from ${pool.address}`, {
          dyMethodSignature,
          dyMethodParams,
        })

        try {
          const estimatedAmountOut = (await poolContract[dyMethodSignature](...dyMethodParams)) as BigNumber
          // Return the call bytes
          return {
            pool,
            estimatedAmountOut,
            poolContract,
          }
        } catch (error) {
          console.error(`CurveTrade error: failed to fetch estimated out from `, {
            address: pool.address,
            dyMethodSignature,
            dyMethodParams,
            error,
          })
          return {
            pool,
            estimatedAmountOut: BigNumber.from(0),
            poolContract,
            error,
          }
        }
      })
    )
    // Sort the pool by best output
    const estimatedAmountOutPerPoolSorted = quoteFromPoolList
      .filter((pool) => {
        return pool.estimatedAmountOut.gt(0) && pool.error == undefined
      })
      .sort((poolA, poolB) =>
        poolA.estimatedAmountOut.gt(poolB.estimatedAmountOut)
          ? -1
          : poolA.estimatedAmountOut.eq(poolB.estimatedAmountOut)
          ? 0
          : 1
      )

    if (estimatedAmountOutPerPoolSorted.length === 0) {
      throw new Error('CurveTrade: zero pools returned an quote')
    }

    // Select the best (first) pool
    // among the sorted pools
    const { pool, estimatedAmountOut, poolContract } = estimatedAmountOutPerPoolSorted[0]

    // Try to fetch the fee from the contract the newest
    // If the call fails, the fee defaults back to 4bps
    try {
      const feeFromContract = (await poolContract.fee()) as BigNumber
      fee = new Percent(feeFromContract.toString(), '10000000000')
    } catch (e) {
      debug(e)
    }

    // Map token address to index
    const tokenInIndex = getTokenIndex(pool, tokenIn.address, chainId)
    const tokenOutIndex = getTokenIndex(pool, tokenOut.address, chainId)

    // Construct the unsigned transaction
    // Default method signature and params
    // This is the most optimistic
    let exchangeSignature =
      Object.keys(poolContract.functions).find((signature) => {
        return signature.startsWith('exchange(')
      }) || 'exchange'

    // If the pool has meta coins
    // Exit to avoid issues
    if (pool.isMeta || pool?.underlyingTokens) {
      // Try uint256
      exchangeSignature = 'exchange_underlying(uint256,uint256,uint256,uint256)'
      if (!(exchangeSignature in poolContract.functions)) {
        exchangeSignature = 'exchange_underlying(int128,int128,uint256,uint256)'
        if (!(exchangeSignature in poolContract.functions)) {
          // Exit the search
          console.error(`CurveTrade: could not find a signature. Target: ${exchangeSignature}`)
          return
        }
      }
    }

    // Reduce by 0.1% to cover fees
    const dyMinimumReceived = estimatedAmountOut.mul(9999).div(10000)

    const exchangeParams: (string | string[] | boolean | boolean[])[] = [
      tokenInIndex.toString(),
      tokenOutIndex.toString(),
      amountInBN.toString(),
      dyMinimumReceived.toString(),
    ]

    // Some pools allow trading ETH
    // Use the correct method signature for swaps that involve ETH
    if (pool.allowsTradingETH) {
      exchangeSignature = 'exchange(uint256,uint256,uint256,uint256,bool)'

      if (
        !(exchangeSignature in poolContract.functions) ||
        !poolContract.interface.getFunction(exchangeSignature).payable
      ) {
        // Exit the search
        console.error(`CurveTrade: could not find a signature. Target: ${exchangeSignature}`)
        return
      }
      // Native currency ETH parameter: eth_in
      exchangeParams.push(isNativeAssetIn)
    }

    debugCurveGetQuote('Final pool', {
      address: poolContract.address,
      exchangeSignature,
      exchangeParams,
    })

    const populatedTransaction = await poolContract.populateTransaction[exchangeSignature](...exchangeParams, {
      value,
    })

    return {
      currencyAmountIn,
      populatedTransaction,
      currencyOut,
      estimatedAmountOut: Currency.isNative(currencyOut)
        ? CurrencyAmount.nativeCurrency(estimatedAmountOut.toBigInt(), chainId)
        : new TokenAmount(wrappedtokenOut, estimatedAmountOut.toBigInt()),
      maximumSlippage,
      fee,
      to: poolContract.address,
      exchangeRateWithoutFee,
      exchangeRate,
      contract: poolContract,
    }
  }

  /**
   * Computes and returns the best trade from Curve pools
   * by comparing all the Curve pools on target chain
   * @param {object} obj options
   * @param {CurrencyAmount} obj.currencyAmountIn the amount of curreny in - sell token
   * @param {Currency} obj.currencyOut the currency out - buy token
   * @param {Percent} obj.maximumSlippage Maximum slippage
   * @param {Provider} provider an optional provider, the router defaults public providers
   * @returns the best trade if found
   */
  public static async bestTradeExactIn(
    { currencyAmountIn, currencyOut, maximumSlippage, receiver }: CurveTradeBestTradeExactInParams,
    provider?: Provider
  ): Promise<CurveTrade | undefined> {
    // Try to extract the chain ID from the tokens
    const chainId = tryGetChainId(currencyAmountIn, currencyOut)
    // Require the chain ID
    invariant(chainId !== undefined && RoutablePlatform.CURVE.supportsChain(chainId), 'CHAIN_ID')

    try {
      const quote = await CurveTrade.getQuote(
        {
          currencyAmountIn,
          currencyOut,
          maximumSlippage,
          receiver,
        },
        provider
      )

      if (quote) {
        const { currencyAmountIn, estimatedAmountOut, fee, maximumSlippage, populatedTransaction, to, contract } = quote
        // Return the CurveTrade
        return new CurveTrade({
          fee,
          maximumSlippage,
          tradeType: TradeType.EXACT_INPUT,
          chainId,
          transactionRequest: populatedTransaction,
          inputAmount: currencyAmountIn,
          outputAmount: estimatedAmountOut,
          approveAddress: to,
          contract,
        })
      }
    } catch (error) {
      console.error('could not fetch Curve trade', error)
    }

    return
  }

  /**
   * Computes and returns the best trade from Curve pools using output as target.
   * Avoid usig this method. It uses some optimistic math estimate right input.
   * @param {object} obj options
   * @param {CurrencyAmount} obj.currencyAmountOut the amount of curreny in - buy token
   * @param {Currency} obj.currencyIn the currency in - sell token
   * @param {Percent} obj.maximumSlippage Maximum slippage
   * @param {Provider} provider an optional provider, the router defaults public providers
   * @returns the best trade if found
   */
  public static async bestTradeExactOut(
    { currencyAmountOut, currencyIn, maximumSlippage, receiver }: CurveTradeBestTradeExactOutParams,
    provider?: Provider
  ): Promise<CurveTrade | undefined> {
    // Try to extract the chain ID from the tokens
    const chainId = tryGetChainId(currencyAmountOut, currencyIn)
    // Require the chain ID
    invariant(chainId !== undefined && RoutablePlatform.CURVE.supportsChain(chainId), 'CHAIN_ID')

    try {
      // Get quote for original amounts in
      const baseQuote = (await CurveTrade.getQuote(
        {
          currencyAmountIn: currencyAmountOut,
          currencyOut: currencyIn,
          maximumSlippage,
          receiver,
        },
        provider
      )) as CurveTradeQuote

      const currencyOut = currencyAmountOut.currency
      const rawInputToOutputExchangeRate = new Decimal(baseQuote.exchangeRate).pow(-currencyOut.decimals)
      const outputToInputExchangeRate = new Decimal(rawInputToOutputExchangeRate).pow(-1)
      const amountOut = new Decimal(currencyAmountOut.toFixed(currencyOut.decimals))
      const estimatedAmountIn = amountOut.times(outputToInputExchangeRate).dividedBy('0.9996')
      const currencyAmountIn = new TokenAmount(
        currencyIn as Token,
        parseUnits(estimatedAmountIn.toFixed(currencyIn.decimals), currencyIn.decimals).toString()
      )

      const quote = await CurveTrade.getQuote(
        {
          currencyAmountIn,
          currencyOut,
          maximumSlippage,
          receiver,
        },
        provider
      )

      if (quote) {
        const { currencyAmountIn, estimatedAmountOut, fee, maximumSlippage, populatedTransaction, to, contract } = quote
        // Return the CurveTrade
        return new CurveTrade({
          fee,
          maximumSlippage,
          tradeType: TradeType.EXACT_OUTPUT,
          chainId,
          transactionRequest: populatedTransaction,
          inputAmount: currencyAmountIn,
          outputAmount: estimatedAmountOut,
          approveAddress: to,
          contract,
        })
      }
    } catch (error) {
      console.error('could not fetch Curve trade', error)
    }

    return
  }

  /**
   * Returns unsigned transaction for the trade
   * @returns the unsigned transaction
   */
  public async swapTransaction(): Promise<UnsignedTransaction> {
    return {
      ...this.transactionRequest,
      gasLimit: this.transactionRequest.gasLimit ? BigNumber.from(this.transactionRequest.gasLimit) : undefined,
      value: this.transactionRequest.value ? this.transactionRequest.value : BigNumber.from(0),
    }
  }
}
