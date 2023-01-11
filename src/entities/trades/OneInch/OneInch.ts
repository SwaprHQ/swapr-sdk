import { AddressZero } from '@ethersproject/constants'
import { BaseProvider } from '@ethersproject/providers'
import { UnsignedTransaction } from '@ethersproject/transactions'
import invariant from 'tiny-invariant'

import { ChainId, ONE, TradeType } from '../../../constants'
import { Currency } from '../../currency'
import { CurrencyAmount, Fraction, Percent, Price, TokenAmount } from '../../fractions'
import { Token } from '../../token'
import { maximumSlippage as defaultMaximumSlippage } from '../constants'
import { Trade } from '../interfaces/trade'
import { TradeOptions } from '../interfaces/trade-options'
import { RoutablePlatform } from '../routable-platform'
import { getProvider, tryGetChainId } from '../utils'
import { apiRequestUrl, RequestType } from './api'

export interface OneInchQuoteTypes {
  amount: CurrencyAmount
  quoteCurrency: Currency
  tradeType: TradeType
  maximumSlippage?: Percent
  recipient?: string
}

interface ExtentendedTradeOptions extends TradeOptions {
  account: string
}

interface OneInchConstructorParams {
  maximumSlippage: Percent
  currencyAmountIn: CurrencyAmount
  currencyAmountOut: CurrencyAmount
  tradeType: TradeType
  chainId: ChainId
  priceImpact: Percent
}

/**
 * One inch mofos
 */
export class OneInchTrade extends Trade {
  public constructor({
    maximumSlippage,
    currencyAmountIn,
    currencyAmountOut,
    tradeType,
    chainId,
    priceImpact,
  }: OneInchConstructorParams) {
    super({
      details: undefined,
      type: tradeType,
      inputAmount: currencyAmountIn,
      outputAmount: currencyAmountOut,
      maximumSlippage,
      platform: RoutablePlatform.ONE_INCH,
      chainId,
      executionPrice: new Price({
        baseCurrency: currencyAmountIn.currency,
        quoteCurrency: currencyAmountOut.currency,
        denominator: currencyAmountIn.raw,
        numerator: currencyAmountOut.raw,
      }),
      priceImpact,
      fee: new Percent('2', '10000'),
      approveAddress: 'some s',
    })
  }

  static async getQuote(
    {
      amount,
      quoteCurrency,
      tradeType,
      maximumSlippage = defaultMaximumSlippage,
      recipient = AddressZero,
    }: OneInchQuoteTypes,
    provider?: BaseProvider
  ): Promise<OneInchTrade | null> {
    // Validate that chainId is present
    const chainId = tryGetChainId(amount, quoteCurrency)
    if (!chainId) {
      throw new Error('getQuote: chainId is required')
    }
    console.log('recipient', recipient)
    // Ensure the provider's chainId matches the provided currencies
    provider = provider || getProvider(chainId)
    // Must match the currencies provided
    invariant(
      (await provider.getNetwork()).chainId == chainId,
      `OneInch.getQuote: currencies chainId does not match provider's chainId`
    )

    // Determine the input and output currencies based on the trade type
    const currencyIn = tradeType === TradeType.EXACT_INPUT ? amount.currency : quoteCurrency
    const currencyOut = tradeType === TradeType.EXACT_INPUT ? quoteCurrency : amount.currency

    // Ensure that the currencies are valid
    invariant(currencyIn.address && currencyOut.address, `getQuote: Currency address is required`)

    try {
      // Prepare the query parameters for the API request
      const queryParams = {
        fromTokenAddress: currencyIn.address,
        toTokenAddress: currencyOut.address,
        amount: amount.raw.toString(),
      }

      // Fetch the quote from the API
      const getQuote = await fetch(apiRequestUrl({ methodName: RequestType.QUOTE, queryParams, chainId }))
      const quote = await getQuote.json()

      // Create the OneInchTrade object
      const amountIn = new TokenAmount(quote.fromToken as Token, quote.fromTokenAmount)
      const amountOut = new TokenAmount(quote.toToken as Token, quote.toTokenAmount)

      return new OneInchTrade({
        maximumSlippage,
        currencyAmountIn: amountIn,
        currencyAmountOut: amountOut,
        tradeType,
        chainId,
        priceImpact: new Percent('2', '10000'),
      })
    } catch (ex) {
      console.error('OneInch.getQuote: Error fetching the quote:', ex.message)
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

  /**
   * Returns unsigned transaction for the trade
   * @returns the unsigned transaction
   */
  public async swapTransaction(options: ExtentendedTradeOptions): Promise<UnsignedTransaction | null> {
    if (!this.inputAmount.currency.address || !this.outputAmount.currency.address) {
      return null
    }
    console.log('maximumSlippage', this.maximumSlippage.toSignificant(2))

    const queryParams = {
      fromTokenAddress: this.inputAmount.currency.address,
      toTokenAddress: this.outputAmount.currency.address,
      amount: this.inputAmount.raw.toString(),
      fromAddress: options.account,
      slippage: this.maximumSlippage.toSignificant(2),
      destReciever: options.recipient,
    }
    try {
      const swapData = await fetch(apiRequestUrl({ methodName: RequestType.SWAP, queryParams, chainId: this.chainId }))
      const swap = await swapData.json()
      return {
        ...swap.tx,
      }
    } catch (e) {
      console.error(e)
      return null
    }
  }
}
