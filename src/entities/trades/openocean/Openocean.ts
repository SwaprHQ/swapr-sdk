import { Contract } from '@ethersproject/contracts'
import { BaseProvider } from '@ethersproject/providers'
import { UnsignedTransaction } from '@ethersproject/transactions'
import { parseUnits } from '@ethersproject/units'
import fetch from 'node-fetch'
import invariant from 'tiny-invariant'

import { _10000, ChainId, ONE, TradeType } from '../../../constants'
import { Currency } from '../../currency'
import { CurrencyAmount, Fraction, Percent, Price, TokenAmount } from '../../fractions'
import { maximumSlippage as defaultMaximumSlippage } from '../constants'
import { Trade } from '../interfaces/trade'
import { TradeOptions } from '../interfaces/trade-options'
import { RoutablePlatform } from '../routable-platform'
import { getProvider, tryGetChainId, wrappedCurrency } from '../utils'
import { OO_EXCHANGE_V2_ABI } from './abi'
import { getApiChainCode, MainnetChainIds, OO_API_BASE_URL, OO_API_ENDPOINTS } from './api'

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
      const API_CHAIN_CODE = getApiChainCode(chainId as MainnetChainIds)
      const API_WITH_CHAIN_CODE = `${OO_API_BASE_URL}/${API_CHAIN_CODE}`

      const gasResponse = await fetch(`${API_WITH_CHAIN_CODE}/${OO_API_ENDPOINTS.GET_GAS}`)

      if (!gasResponse.ok) throw new Error(`OpenoceanTrade.getQuote: failed to get gasPrice`)

      const gasData = await gasResponse.json()
      const gasPrice = gasData.without_decimals.standard

      const params = new URL(`${API_WITH_CHAIN_CODE}/${OO_API_ENDPOINTS.QUOTE}`)

      params.searchParams.set(
        'inTokenAddress',
        `${Currency.isNative(currencyIn) ? '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE' : currencyIn.address}`,
      )
      params.searchParams.set(
        'outTokenAddress',
        `${Currency.isNative(currencyOut) ? '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE' : currencyOut.address}`,
      )
      params.searchParams.set('amount', `${parseUnits(amount.toSignificant(), amount.currency.decimals).toString()}`)
      params.searchParams.set('gasPrice', chainId === ChainId.MAINNET ? gasPrice.maxFeePerGas : gasPrice)
      params.searchParams.set('slippage', `${maximumSlippage}`)

      const res = await fetch(params.toString())
      const data = await res.json()

      if (data && amount) {
        const approveAddress = data.routeProcessorAddr
        const currencyAmountIn = Currency.isNative(currencyIn)
          ? CurrencyAmount.nativeCurrency(data.routeProcessorArgs.amountIn, chainId)
          : new TokenAmount(wrappedCurrency(currencyIn, chainId), data.routeProcessorArgs.amountIn)

        const currencyAmountOut = Currency.isNative(currencyOut)
          ? CurrencyAmount.nativeCurrency(data.routeProcessorArgs.amountOutMin, chainId)
          : new TokenAmount(wrappedCurrency(currencyOut, chainId), data.routeProcessorArgs.amountOutMin)

        const priceImpact = new Percent(Math.trunc(Math.abs(data.priceImpact) * 10000).toString(), _10000)

        return new OpenoceanTrade({
          maximumSlippage,
          inputAmount: currencyAmountIn,
          outputAmount: currencyAmountOut,
          tradeType,
          chainId,
          approveAddress,
          priceImpact,
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

    const params = {
      //   chain: "",
      inTokenAddress: this.inputAmount.currency.address,
      outTokenAddress: this.outputAmount.currency.address,
      amount: this.inputAmount.raw.toString(),
      gasPrice: options.recipient,
      slippage: this.maximumSlippage,
    }

    const value = Currency.isNative(this.inputAmount.currency) ? params : undefined

    return new Contract(this.approveAddress, OO_EXCHANGE_V2_ABI).populateTransaction['processRoute'](
      { ...params },
      {
        value,
      },
    )
  }
}
