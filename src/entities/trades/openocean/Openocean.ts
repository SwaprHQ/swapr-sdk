import { BaseProvider } from '@ethersproject/providers'
import { UnsignedTransaction } from '@ethersproject/transactions'
import { parseUnits } from '@ethersproject/units'
import fetch from 'node-fetch'
import invariant from 'tiny-invariant'

import { ChainId, ONE, TradeType } from '../../../constants'
import { Currency } from '../../currency'
import { CurrencyAmount, Fraction, Percent, Price, TokenAmount } from '../../fractions'
import { maximumSlippage as defaultMaximumSlippage } from '../constants'
import { Trade } from '../interfaces/trade'
import { TradeOptions } from '../interfaces/trade-options'
import { RoutablePlatform } from '../routable-platform'
import { getProvider, tryGetChainId, wrappedCurrency } from '../utils'
import { getBaseUrlWithChainCode, MainnetChainIds, OO_API_ENDPOINTS, OO_API_SWAPR_REFERRER } from './api'
import { OO_CONTRACT_ADDRESS_BY_CHAIN } from './constants'

export interface OpenoceanQuoteTypes {
  amount: CurrencyAmount
  quoteCurrency: Currency
  tradeType: TradeType
  maximumSlippage?: Percent
  recipient?: string
}

interface OpenoceanConstructorParams {
  maximumSlippage: Percent
  inputAmount: CurrencyAmount
  outputAmount: CurrencyAmount
  tradeType: TradeType
  chainId: ChainId
  approveAddress: string
  priceImpact: Percent
}

export class OpenoceanTrade extends Trade {
  public constructor({
    maximumSlippage,
    inputAmount,
    outputAmount,
    tradeType,
    chainId,
    approveAddress,
    priceImpact,
  }: OpenoceanConstructorParams) {
    super({
      details: undefined,
      type: tradeType,
      inputAmount,
      outputAmount,
      maximumSlippage,
      platform: RoutablePlatform.OPENOCEAN,
      chainId,
      executionPrice: new Price({
        baseCurrency: inputAmount.currency,
        quoteCurrency: outputAmount.currency,
        denominator: inputAmount.raw,
        numerator: outputAmount.raw,
      }),
      priceImpact,
      approveAddress,
    })
  }

  private static async getGas(chainId: MainnetChainIds) {
    const baseUrl = getBaseUrlWithChainCode(chainId)
    const gasResponse = await fetch(`${baseUrl}/${OO_API_ENDPOINTS.GET_GAS}`)

    if (!gasResponse.ok) throw new Error(`OpenoceanTrade.getQuote: failed to get gasPrice`)

    const gasData = await gasResponse.json()

    return gasData.without_decimals.standard
  }

  static async getQuote(
    { amount, quoteCurrency, maximumSlippage = defaultMaximumSlippage, tradeType }: OpenoceanQuoteTypes,
    provider?: BaseProvider,
  ): Promise<OpenoceanTrade | null> {
    const chainId = tryGetChainId(amount, quoteCurrency)

    if (!chainId) {
      throw new Error('OpenoceanTrade.getQuote: chainId is required')
    }

    provider = provider || getProvider(chainId)

    // Ensure the provider's chainId matches the provided currencies
    invariant(
      (await provider.getNetwork()).chainId == chainId,
      `OpenoceanTrade.getQuote: currencies chainId does not match provider's chainId`,
    )

    const currencyIn = amount.currency
    const currencyOut = quoteCurrency

    // Ensure that the currencies are present
    invariant(currencyIn.address && currencyOut.address, `getQuote: Currency address is required`)

    try {
      const baseUrl = getBaseUrlWithChainCode(chainId as MainnetChainIds)
      const gasPrice = await this.getGas(chainId as MainnetChainIds)
      const params = new URL(`${baseUrl}/${OO_API_ENDPOINTS.QUOTE}`)

      params.searchParams.set(
        'inTokenAddress',
        `${Currency.isNative(currencyIn) ? '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE' : currencyIn.address}`,
      )
      params.searchParams.set(
        'outTokenAddress',
        `${Currency.isNative(currencyOut) ? '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE' : currencyOut.address}`,
      )
      params.searchParams.set('amount', `${parseUnits(amount.toSignificant(), 0).toString()}`)
      params.searchParams.set('gasPrice', chainId === ChainId.MAINNET ? gasPrice.maxFeePerGas : gasPrice)
      params.searchParams.set(
        'slippage',
        `${new Fraction(maximumSlippage.numerator, maximumSlippage.denominator).toSignificant(1)}`,
      )

      const res = await fetch(params.toString())
      const data = await res.json()

      if (data && amount) {
        const approveAddress = OO_CONTRACT_ADDRESS_BY_CHAIN[chainId as MainnetChainIds]
        const currencyAmountIn = Currency.isNative(currencyIn)
          ? CurrencyAmount.nativeCurrency(data.data.inAmount, chainId)
          : new TokenAmount(wrappedCurrency(currencyIn, chainId), data.data.inAmount)

        const currencyAmountOut = Currency.isNative(currencyOut)
          ? CurrencyAmount.nativeCurrency(data.data.outAmount, chainId)
          : new TokenAmount(wrappedCurrency(currencyOut, chainId), data.data.outAmount)

        return new OpenoceanTrade({
          maximumSlippage,
          inputAmount: currencyAmountIn,
          outputAmount: currencyAmountOut,
          tradeType,
          chainId,
          approveAddress,
          priceImpact: new Percent('0', '100'),
        })
      }
    } catch (error) {
      console.error('Openocean.getQuote: Error fetching the quote:', error.message)
      return null
    }

    return null
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
  public async swapTransaction(options: TradeOptions): Promise<UnsignedTransaction> {
    invariant(options, 'OpenoceanTrade.swapTransaction: Currency address is required')

    /**
     * @see https://docs.openocean.finance/dev/aggregator-api-and-sdk/aggregator-api/best-practice
     */

    const inToken = this.inputAmount.currency
    const outToken = this.outputAmount.currency
    const amount = this.inputAmount
    const maximumSlippage = this.maximumSlippage

    const receivedSlippage = new Fraction(maximumSlippage.numerator, maximumSlippage.denominator).toSignificant(1)
    const slippage = +receivedSlippage < 0.05 ? 0.05 : receivedSlippage

    try {
      // Ensure that the currencies are present
      invariant(inToken.address && outToken.address, `OpenoceanTrade.swapTransaction: Currency address is required`)

      const baseUrl = getBaseUrlWithChainCode(this.chainId as MainnetChainIds)
      const quoteGasPrice = await OpenoceanTrade.getGas(this.chainId as MainnetChainIds)
      const params = new URL(`${baseUrl}/${OO_API_ENDPOINTS.SWAP_QUOTE}`)

      params.searchParams.set(
        'inTokenAddress',
        `${Currency.isNative(inToken) ? '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE' : inToken.address}`,
      )
      params.searchParams.set(
        'outTokenAddress',
        `${Currency.isNative(outToken) ? '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE' : outToken.address}`,
      )
      params.searchParams.set('amount', `${parseUnits(amount.toSignificant(), 0).toString()}`)
      params.searchParams.set('referrer', `${OO_API_SWAPR_REFERRER}`)
      params.searchParams.set('account', options.recipient)
      params.searchParams.set('gasPrice', this.chainId === ChainId.MAINNET ? quoteGasPrice.maxFeePerGas : quoteGasPrice)
      params.searchParams.set('slippage', `${slippage}`)

      const res = await fetch(params.toString())
      const swapQuoteData = await res.json()
      const { data, gasPrice, to, value } = swapQuoteData?.data

      return {
        to,
        gasPrice,
        data,
        value,
      }
    } catch (error) {
      throw new Error(`Openocean.swapTransaction: Error fetching the trade: ${error.message}`)
    }
  }
}
