import { BigNumber } from '@ethersproject/bignumber'
import type { BaseProvider } from '@ethersproject/providers'
import { UnsignedTransaction } from '@ethersproject/transactions'
import { parseUnits } from '@ethersproject/units'
import { Currency as UniswapCurrency, Token as UniswapToken, validateAndParseAddress } from '@uniswap/sdk-core'
import dayjs from 'dayjs'
import JSBI from 'jsbi'
import invariant from 'tiny-invariant'

import { ChainId, ONE, TradeType } from '../../../constants'
import { Currency } from '../../currency'
import { CurrencyAmount, Fraction, Percent, Price, TokenAmount } from '../../fractions'
import { Token, WXDAI } from '../../token'
import { maximumSlippage as defaultMaximumSlippage } from '../constants'
import { TradeWithSwapTransaction } from '../interfaces/trade'
import { TradeOptions } from '../interfaces/trade-options'
import { RoutablePlatform } from '../routable-platform'
import { getProvider, tryGetChainId } from '../utils'
import { SWAPR_ALGEBRA_CONTRACTS } from './constants'
import { getQuoterContract, getRouterContract } from './contracts'
import { Route } from './entities/route'
import { getRoutes } from './routes'
import { encodeRouteToPath } from './utils/encodeRouteToPath'
import { singleContractMultipleData } from './utils/singleContractMultipleData'

type BestRoute = Route<UniswapCurrency, UniswapCurrency> | undefined
interface SwaprV3ConstructorParams {
  maximumSlippage: Percent
  inputAmount: CurrencyAmount
  outputAmount: CurrencyAmount
  tradeType: TradeType
  chainId: number
  priceImpact: Percent
  fee: Percent
  bestRoute?: BestRoute
}

export interface SwaprV3GetQuoteParams {
  amount: CurrencyAmount
  quoteCurrency: Currency
  tradeType: TradeType
  maximumSlippage?: Percent
  recipient?: string
}

type BestCurrentRoute = { bestRoute: BestRoute | null; amount: BigNumber | null }

const ALGEBRA_FEE_PARTS_PER_MILLION = JSBI.BigInt(1_000_000)

export class SwaprV3Trade extends TradeWithSwapTransaction {
  bestRoute: BestRoute

  public constructor({
    inputAmount,
    outputAmount,
    maximumSlippage,
    priceImpact,
    tradeType,
    chainId,
    fee,
    bestRoute,
  }: SwaprV3ConstructorParams) {
    super({
      details: undefined,
      type: tradeType,
      inputAmount,
      outputAmount,
      maximumSlippage,
      platform: RoutablePlatform.SWAPR_V3,
      chainId,
      executionPrice: new Price({
        baseCurrency: inputAmount.currency,
        quoteCurrency: outputAmount.currency,
        denominator: inputAmount.raw,
        numerator: outputAmount.raw,
      }),
      priceImpact,
      fee,
      approveAddress: SWAPR_ALGEBRA_CONTRACTS['router'],
    })
    this.bestRoute = bestRoute
  }

  static async getQuote(
    { amount, quoteCurrency, tradeType, maximumSlippage }: SwaprV3GetQuoteParams,
    provider?: BaseProvider,
  ): Promise<SwaprV3Trade | null> {
    const isTradeExactInput = tradeType === TradeType.EXACT_INPUT
    const chainId = tryGetChainId(amount, quoteCurrency)
    invariant(chainId, 'SwaprV3Trade.getQuote: chainId is required')

    maximumSlippage = maximumSlippage ?? defaultMaximumSlippage
    provider = provider ?? getProvider(chainId)

    invariant(
      (await provider.getNetwork()).chainId == chainId,
      `SwaprV3Trade.getQuote: currencies chainId does not match provider's chainId`,
    )

    invariant(amount.currency.address, `SwaprV3Trade.getQuote: amount.currency.address is required`)
    const setToken = Currency.isNative(amount.currency)
      ? WXDAI[ChainId.GNOSIS]
      : new Token(
          ChainId.GNOSIS,
          amount.currency.address,
          amount.currency.decimals,
          amount.currency.symbol,
          amount.currency.name,
        )

    invariant(quoteCurrency.address, `SwaprV3Trade.getQuote: quoteCurrency.address is required`)
    const quoteToken = Currency.isNative(quoteCurrency)
      ? WXDAI[ChainId.GNOSIS]
      : new Token(
          ChainId.GNOSIS,
          quoteCurrency.address,
          quoteCurrency.decimals,
          quoteCurrency.symbol,
          quoteCurrency.name,
        )

    const routes = isTradeExactInput
      ? await getRoutes(setToken as UniswapToken, quoteToken as UniswapToken, chainId)
      : await getRoutes(quoteToken as UniswapToken, setToken as UniswapToken, chainId)

    const quoteParams = routes.map((route) => [
      encodeRouteToPath(route, !isTradeExactInput),
      `0x${amount.raw.toString(16)}`,
    ])
    const DEFAULT_GAS_QUOTE = 2_000_000
    const methodName = isTradeExactInput ? 'quoteExactInput' : 'quoteExactOutput'
    const quotesResults = await singleContractMultipleData(methodName, quoteParams, {
      gasRequired: DEFAULT_GAS_QUOTE,
    })

    const { bestRoute, amount: routeAmount } = quotesResults.reduce(
      (currentBest: BestCurrentRoute, { result }, index) => {
        if (!result) return currentBest
        const resultAmountKey = isTradeExactInput ? 'amountOut' : 'amountIn'
        if (currentBest.amount === null) {
          return {
            bestRoute: routes[index],
            amount: result[resultAmountKey],
          }
        } else if (isTradeExactInput) {
          if (currentBest.amount.lt(result[resultAmountKey])) {
            return {
              bestRoute: routes[index],
              amount: result[resultAmountKey],
            }
          }
        } else {
          if (currentBest.amount.gt(result[resultAmountKey])) {
            return {
              bestRoute: routes[index],
              amount: result[resultAmountKey],
            }
          }
        }

        return currentBest
      },
      {
        bestRoute: null,
        amount: null,
      },
    )

    const fee =
      routes?.length > 0 && routes[0].pools.length > 0
        ? new Percent(routes[0].pools[0].fee.toString(), ALGEBRA_FEE_PARTS_PER_MILLION)
        : new Percent('0', '1')

    const parsedAmount = parseUnits(amount.toSignificant(), amount.currency.decimals)

    if (!bestRoute) return null

    const singleHop = bestRoute.pools.length === 1

    if (singleHop) {
      if (isTradeExactInput) {
        const quotedAmountOut = await getQuoterContract()
          .callStatic.quoteExactInputSingle(setToken.address, quoteToken.address, parsedAmount, 0)
          .catch((error) => {
            console.error(`Error sending quoteExactInputSingle transaction: ${error}`)
            return null
          })

        if (quotedAmountOut) {
          return new SwaprV3Trade({
            maximumSlippage,
            inputAmount: amount,
            outputAmount: new TokenAmount(quoteToken, quotedAmountOut),
            tradeType,
            chainId,
            priceImpact: new Percent('0', '100'),
            fee,
          })
        }
      } else {
        const quotedAmountIn = await getQuoterContract()
          .callStatic.quoteExactOutputSingle(quoteToken.address, setToken.address, parsedAmount, 0)
          .catch((error) => {
            console.error(`Error sending quoteExactOutputSingle transaction: ${error}`)
            return null
          })

        if (quotedAmountIn) {
          return new SwaprV3Trade({
            maximumSlippage,
            inputAmount: new TokenAmount(quoteToken, quotedAmountIn),
            outputAmount: amount,
            tradeType,
            chainId,
            priceImpact: new Percent('0', '100'),
            fee,
          })
        }
      }
    } else {
      if (isTradeExactInput) {
        if (routeAmount) {
          return new SwaprV3Trade({
            maximumSlippage,
            inputAmount: amount,
            outputAmount: new TokenAmount(quoteToken, routeAmount.toString()),
            tradeType,
            chainId,
            priceImpact: new Percent('0', '100'),
            fee,
            bestRoute,
          })
        }
      } else {
        if (routeAmount) {
          return new SwaprV3Trade({
            maximumSlippage,
            inputAmount: new TokenAmount(quoteToken, routeAmount.toString()),
            outputAmount: amount,
            tradeType,
            chainId,
            priceImpact: new Percent('0', '100'),
            fee,
            bestRoute,
          })
        }
      }
    }

    return null
  }

  public minimumAmountOut(): CurrencyAmount {
    if (this.tradeType === TradeType.EXACT_OUTPUT) {
      return this.outputAmount
    } else {
      const slippageAdjustedAmountOut = new Fraction(ONE)
        .add(this.maximumSlippage as Fraction)
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
        .add(this.maximumSlippage as Fraction)
        .multiply(this.inputAmount.raw).quotient
      return this.inputAmount instanceof TokenAmount
        ? new TokenAmount(this.inputAmount.token, slippageAdjustedAmountIn)
        : CurrencyAmount.nativeCurrency(slippageAdjustedAmountIn, this.chainId)
    }
  }

  public async swapTransaction(options: TradeOptions): Promise<UnsignedTransaction> {
    const isNativeIn = Currency.isNative(this.inputAmount.currency)
    const isNativeOut = Currency.isNative(this.outputAmount.currency)
    invariant(
      !(isNativeIn && isNativeOut),
      'SwaprV3Trade.swapTransaction: the router does not support both native in and out',
    )
    if (this.bestRoute) {
      return this.multiSwapTransaction({ ...options, route: this.bestRoute })
    }

    const recipient = validateAndParseAddress(options.recipient)
    const amountIn = `0x${this.maximumAmountIn().raw.toString(16)}`
    const amountOut = `0x${this.minimumAmountOut().raw.toString(16)}`

    const isTradeExactInput = this.tradeType === TradeType.EXACT_INPUT

    // Swapr Algebra Contract fee param is uint24 type
    const algebraFee = this.fee.multiply(ALGEBRA_FEE_PARTS_PER_MILLION).toSignificant(1)
    const baseParams = {
      tokenIn: isNativeIn ? WXDAI[ChainId.GNOSIS].address : this.inputAmount.currency.address,
      tokenOut: isNativeOut ? WXDAI[ChainId.GNOSIS].address : this.outputAmount.currency.address,
      recipient,
      deadline: dayjs().add(30, 'm').unix(),
      sqrtPriceLimitX96: 0,
      fee: algebraFee,
    }

    const value = isNativeIn ? amountIn : undefined

    const exactInputSingleParams = {
      ...baseParams,
      amountIn,
      amountOutMinimum: amountOut,
    }

    const exactOutputSingleParams = {
      ...baseParams,
      amountOut,
      amountInMaximum: amountIn,
    }

    const methodName = isTradeExactInput ? 'exactInputSingle' : 'exactOutputSingle'
    const params = isTradeExactInput ? exactInputSingleParams : exactOutputSingleParams
    const populatedTransaction = await getRouterContract().populateTransaction[methodName](params, { value })

    return populatedTransaction
  }

  public async multiSwapTransaction(
    options: TradeOptions & { route: Route<UniswapCurrency, UniswapCurrency> },
  ): Promise<UnsignedTransaction> {
    const isNativeIn = Currency.isNative(this.inputAmount.currency)

    const recipient = validateAndParseAddress(options.recipient)
    const amountIn = `0x${this.maximumAmountIn().raw.toString(16)}`
    const amountOut = `0x${this.minimumAmountOut().raw.toString(16)}`

    const isTradeExactInput = this.tradeType === TradeType.EXACT_INPUT

    const path: string = encodeRouteToPath(options.route, !isTradeExactInput)

    // Swapr Algebra Contract fee param is uint24 type
    const algebraFee = this.fee.multiply(ALGEBRA_FEE_PARTS_PER_MILLION).toSignificant(1)
    const baseParams = {
      path,
      recipient,
      deadline: dayjs().add(30, 'm').unix(),
      fee: algebraFee,
    }

    const value = isNativeIn ? amountIn : undefined

    const exactInputParams = {
      ...baseParams,
      amountIn,
      amountOutMinimum: amountOut,
    }

    const exactOutputParams = {
      ...baseParams,
      amountOut,
      amountInMaximum: amountIn,
    }

    const methodName = isTradeExactInput ? 'exactInput' : 'exactOutput'
    const params = isTradeExactInput ? exactInputParams : exactOutputParams
    const populatedTransaction = await getRouterContract().populateTransaction[methodName](params, { value })

    return populatedTransaction
  }
}
