import { BigNumber } from '@ethersproject/bignumber'
import { BaseProvider } from '@ethersproject/providers'
import { UnsignedTransaction } from '@ethersproject/transactions'
import invariant from 'tiny-invariant'

import { ChainId, ONE, TradeType } from '../../../constants'
import { Currency } from '../../currency'
import { CurrencyAmount, Fraction, Percent, Price, TokenAmount } from '../../fractions'
import { maximumSlippage as defaultMaximumSlippage } from '../constants'
import { Trade } from '../interfaces/trade'
import { TradeOptions } from '../interfaces/trade-options'
import { RoutablePlatform } from '../routable-platform'
import { getProvider, tryGetChainId, wrappedCurrency } from '../utils'
import { approveAddressUrl, generateApiRequestUrl, RequestType } from './api'

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
  approveAddress: string
  estimatedGas: BigNumber
}

/**
 * 1Inch trade
 */
export class OneInchTrade extends Trade {
  public constructor({
    maximumSlippage,
    currencyAmountIn,
    currencyAmountOut,
    tradeType,
    chainId,
    approveAddress,
    estimatedGas,
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
      priceImpact: new Percent('0', '100'),
      fee: new Percent('0', '10000'),
      approveAddress,
      estimatedGas,
    })
  }

  static async getQuote(
    { amount, quoteCurrency, tradeType, maximumSlippage = defaultMaximumSlippage }: OneInchQuoteTypes,
    provider?: BaseProvider
  ): Promise<OneInchTrade | null> {
    const chainId = tryGetChainId(amount, quoteCurrency)

    if (!chainId) {
      throw new Error('getQuote: chainId is required')
    }

    provider = provider || getProvider(chainId)

    // Ensure the provider's chainId matches the provided currencies
    invariant(
      (await provider.getNetwork()).chainId == chainId,
      `OneInch.getQuote: currencies chainId does not match provider's chainId`
    )

    const currencyIn = amount.currency
    const currencyOut = quoteCurrency

    // Ensure that the currencies are present
    invariant(currencyIn.address && currencyOut.address, `getQuote: Currency address is required`)
    let gas

    try {
      //Fetch approve address
      const { address: approveAddress } = await (await fetch(approveAddressUrl(chainId))).json()

      // Prepare the query parameters for the API request
      const queryParams = {
        fromTokenAddress: currencyIn.address,
        toTokenAddress: currencyOut.address,
        amount: amount.raw.toString(),
      }

      // Fetch the quote from the API
      const { fromTokenAmount, toTokenAmount, estimatedGas } = await (
        await fetch(generateApiRequestUrl({ methodName: RequestType.QUOTE, queryParams, chainId }))
      ).json()
      gas = estimatedGas
      let fromTokenAmountApi = fromTokenAmount
      let toTokenAmountApi = toTokenAmount

      if (tradeType === TradeType.EXACT_OUTPUT) {
        // Prepare the query parameters for the API request

        const queryParams = {
          fromTokenAddress: currencyOut.address,
          toTokenAddress: currencyIn.address,
          amount: toTokenAmount.toString(),
        }

        const {
          toTokenAmount: toTokenAmountOutput,
          fromTokenAmount,
          estimatedGas,
        } = await (await fetch(generateApiRequestUrl({ methodName: RequestType.QUOTE, queryParams, chainId }))).json()

        fromTokenAmountApi = fromTokenAmount
        toTokenAmountApi = toTokenAmountOutput
        gas = estimatedGas
      }

      const currencyInType = tradeType === TradeType.EXACT_INPUT ? currencyIn : currencyOut
      const currencyOutType = tradeType === TradeType.EXACT_INPUT ? currencyOut : currencyIn
      const currencyAmountIn = Currency.isNative(currencyInType)
        ? CurrencyAmount.nativeCurrency(fromTokenAmountApi, chainId)
        : new TokenAmount(wrappedCurrency(currencyInType, chainId), fromTokenAmountApi)

      const currencyAmountOut = Currency.isNative(currencyOutType)
        ? CurrencyAmount.nativeCurrency(toTokenAmountApi, chainId)
        : new TokenAmount(wrappedCurrency(currencyOutType, chainId), toTokenAmountApi)

      return new OneInchTrade({
        maximumSlippage,
        currencyAmountIn,
        currencyAmountOut,
        tradeType,
        chainId,
        approveAddress,
        estimatedGas: BigNumber.from(gas),
      })
    } catch (error) {
      console.error('OneInch.getQuote: Error fetching the quote:', error.message)
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
  public async swapTransaction(options: ExtentendedTradeOptions): Promise<UnsignedTransaction> {
    invariant(
      this.inputAmount.currency.address && this.outputAmount.currency.address,
      'OneInchTrade: Currency address is required'
    )

    const queryParams = {
      fromTokenAddress: this.inputAmount.currency.address,
      toTokenAddress: this.outputAmount.currency.address,
      amount: this.inputAmount.raw.toString(),
      fromAddress: options.account,
      slippage: this.maximumSlippage.toSignificant(2),
      destReciever: options.recipient,
    }

    try {
      // Fetch the unsigned transaction from the API
      const { tx } = await (
        await fetch(generateApiRequestUrl({ methodName: RequestType.SWAP, queryParams, chainId: this.chainId }))
      ).json()
      if (!tx) {
        throw new Error('OneInch.swapTransaction: Error fetching the swap data')
      }
      return {
        data: tx.data,
        to: tx.to,
        value: tx.value,
      }
    } catch (e) {
      throw new Error(`OneInch.swapTransaction: Error fetching the swap data: ${e.message}`)
    }
  }
}
