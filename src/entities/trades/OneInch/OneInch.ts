import { AddressZero } from '@ethersproject/constants'
import { BaseProvider } from '@ethersproject/providers'
import debug from 'debug'
import invariant from 'tiny-invariant'

import { ChainId, ONE, ROUTER_ADDRESS, TradeType } from '../../../constants'
import { Currency } from '../../currency'
import { CurrencyAmount, Fraction, Percent, Price, TokenAmount } from '../../fractions'
import { maximumSlippage as defaultMaximumSlippage } from '../constants'
import { Trade } from '../interfaces/trade'
import { RoutablePlatform } from '../routable-platform'
import { getProvider, tryGetChainId, wrappedCurrency } from '../utils'
import { apiRequestUrl, RequestType } from './api'

export interface VelodromeQuoteTypes {
  amount: CurrencyAmount
  quoteCurrency: Currency
  tradeType: TradeType
  maximumSlippage?: Percent
  recipient?: string
}

interface VelodromConstructorParams {
  maximumSlippage: Percent
  currencyAmountIn: CurrencyAmount
  currencyAmountOut: CurrencyAmount
  tradeType: TradeType
  chainId: ChainId
  routes: { from: string; to: string; stable: boolean }[]
  priceImpact: Percent
}

// Debuging logger. See documentation to enable logging.
const debugVelodromeGetQuote = debug('ecoRouter:velodrome:getQuote')

/**
 * UniswapTrade uses the AutoRouter to find best trade across V2 and V3 pools
 */
export class InchTrade extends Trade {
  public constructor({
    maximumSlippage,
    currencyAmountIn,
    currencyAmountOut,
    tradeType,
    chainId,
    priceImpact,
  }: VelodromConstructorParams) {
    super({
      details: undefined,
      type: tradeType,
      inputAmount: currencyAmountIn,
      outputAmount: currencyAmountOut,
      maximumSlippage,
      platform: RoutablePlatform.VELODROME,
      chainId,
      executionPrice: new Price({
        baseCurrency: currencyAmountIn.currency,
        quoteCurrency: currencyAmountOut.currency,
        denominator: currencyAmountIn.raw,
        numerator: currencyAmountOut.raw,
      }),
      priceImpact,
      fee: new Percent('2', '10000'),
      approveAddress: ROUTER_ADDRESS,
    })
  }

  static async getQuote(
    { amount, quoteCurrency, tradeType, maximumSlippage, recipient }: VelodromeQuoteTypes,
    provider?: BaseProvider
  ): Promise<InchTrade | null> {
    const chainId = tryGetChainId(amount, quoteCurrency)
    invariant(chainId, 'VelodromeQuote.getQuote: chainId is required')

    // Defaults
    recipient = recipient || AddressZero
    maximumSlippage = maximumSlippage || defaultMaximumSlippage

    provider = provider || getProvider(chainId)

    // Must match the currencies provided
    invariant(
      (await provider.getNetwork()).chainId == chainId,
      `VelodromTrade.getQuote: currencies chainId does not match provider's chainId`
    )

    const currencyIn = amount.currency
    const currencyOut = quoteCurrency

    const wrappedCurrencyIn = wrappedCurrency(currencyIn, chainId)
    const wrappedCurrencyOut = wrappedCurrency(currencyOut, chainId)

    try {
      const queryParams = {
        fromTokenAddress: wrappedCurrencyIn.address,
        toTokenAddress: wrappedCurrencyOut.address,
        amount: amount.raw.toString(),
      }
      const getQuote = await fetch(apiRequestUrl({ methodName: RequestType.QUOTE, queryParams, chainId }))

      return new InchTrade({
        maximumSlippage,
        currencyAmountIn,
        currencyAmountOut,
        tradeType,
        chainId,
        priceImpact,
      })
    } catch (ex) {
      console.error(ex)
      return null
    }
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
  //TODO
  //   /**
  //    * Returns unsigned transaction for the trade
  //    * @returns the unsigned transaction
  //    */
  //   public async swapTransaction(options: TradeOptions): Promise<UnsignedTransaction> {

  //   }
}
