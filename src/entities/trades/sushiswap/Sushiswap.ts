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
import { SUSHISWAP_ROUTER_PROCESSOR_3_ABI } from './abi'
import { getApiVersion, SWAP_BASE_URL } from './api'

export interface SushiswapQuoteTypes {
  amount: CurrencyAmount
  quoteCurrency: Currency
  tradeType: TradeType
  maximumSlippage?: Percent
  recipient?: string
}

interface SushiswapRoute {
  poolFee: number
  share: number
}
interface SushiswapV3ConstructorParams {
  maximumSlippage: Percent
  inputAmount: CurrencyAmount
  outputAmount: CurrencyAmount
  tradeType: TradeType
  chainId: ChainId
  approveAddress: string
  priceImpact: Percent
  routeCode: string
  fee: Percent
}

export class SushiswapTrade extends Trade {
  public readonly routeCode: string

  public constructor({
    maximumSlippage,
    inputAmount,
    outputAmount,
    tradeType,
    chainId,
    approveAddress,
    routeCode,
    priceImpact,
    fee,
  }: SushiswapV3ConstructorParams) {
    super({
      details: undefined,
      type: tradeType,
      inputAmount,
      outputAmount,
      maximumSlippage,
      platform: RoutablePlatform.SUSHISWAP,
      chainId,
      executionPrice: new Price({
        baseCurrency: inputAmount.currency,
        quoteCurrency: outputAmount.currency,
        denominator: inputAmount.raw,
        numerator: outputAmount.raw,
      }),
      priceImpact,
      fee,
      approveAddress,
    })
    this.routeCode = routeCode
  }

  static async getQuote(
    { amount, quoteCurrency, tradeType, maximumSlippage = defaultMaximumSlippage, recipient }: SushiswapQuoteTypes,
    provider?: BaseProvider,
  ): Promise<SushiswapTrade | null> {
    const chainId = tryGetChainId(amount, quoteCurrency)

    if (!chainId) {
      throw new Error('SushiswapTrade.getQuote: chainId is required')
    }

    provider = provider || getProvider(chainId)

    // Ensure the provider's chainId matches the provided currencies
    invariant(
      (await provider.getNetwork()).chainId == chainId,
      `SushiswapTrade.getQuote: currencies chainId does not match provider's chainId`,
    )

    invariant(tradeType === TradeType.EXACT_INPUT, `getQuote: Only supports exact input`)

    const currencyIn = amount.currency
    const currencyOut = quoteCurrency

    // Ensure that the currencies are present
    invariant(currencyIn.address && currencyOut.address, `getQuote: Currency address is required`)

    try {
      const params = new URL(SWAP_BASE_URL + getApiVersion(chainId))

      params.searchParams.set('chainId', `${chainId}`)
      params.searchParams.set(
        'tokenIn',
        `${Currency.isNative(currencyIn) ? '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE' : currencyIn.address}`,
      )
      params.searchParams.set(
        'tokenOut',
        `${Currency.isNative(currencyOut) ? '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE' : currencyOut.address}`,
      )
      params.searchParams.set('amount', `${parseUnits(amount.toSignificant(), amount.currency.decimals).toString()}`)
      params.searchParams.set(
        'maxPriceImpact',
        `${new Fraction(maximumSlippage.numerator, maximumSlippage.denominator).toSignificant(5)}`,
      )
      params.searchParams.set('to', `${recipient}`)
      params.searchParams.set('preferSushi', 'true')

      const res = await fetch(params.toString())
      const data = await res.json()

      if (data && amount && data.route) {
        const approveAddress = data.routeProcessorAddr
        const currencyAmountIn = Currency.isNative(currencyIn)
          ? CurrencyAmount.nativeCurrency(data.routeProcessorArgs.amountIn, chainId)
          : new TokenAmount(wrappedCurrency(currencyIn, chainId), data.routeProcessorArgs.amountIn)

        const currencyAmountOut = Currency.isNative(currencyOut)
          ? CurrencyAmount.nativeCurrency(data.routeProcessorArgs.amountOutMin, chainId)
          : new TokenAmount(wrappedCurrency(currencyOut, chainId), data.routeProcessorArgs.amountOutMin)
        const routeCode = data.routeProcessorArgs.routeCode

        const poolsFees = data.route.reduce((accumulator: number, route: SushiswapRoute) => {
          return accumulator + route.poolFee * route.share
        }, 0)

        const fee = new Percent(Math.trunc(poolsFees * 10000).toString(), _10000)

        const priceImpact = new Percent(Math.trunc(Math.abs(data.priceImpact) * 10000).toString(), _10000)

        return new SushiswapTrade({
          maximumSlippage,
          inputAmount: currencyAmountIn,
          outputAmount: currencyAmountOut,
          tradeType,
          chainId,
          approveAddress,
          priceImpact,
          routeCode,
          fee,
        })
      }
    } catch (error) {
      console.error('SushiswapTrade.getQuote: Error fetching the quote:', error.message)
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
    invariant(options, 'SushiswapTrade.swapTransaction: Currency address is required')

    const params = [
      this.inputAmount.currency.address,
      this.inputAmount.raw.toString(),
      this.outputAmount.currency.address,
      this.outputAmount.raw.toString(),
      options.recipient,
      this.routeCode,
    ]

    const value = Currency.isNative(this.inputAmount.currency) ? params[1] : undefined

    return new Contract(this.approveAddress, SUSHISWAP_ROUTER_PROCESSOR_3_ABI).populateTransaction['processRoute'](
      ...params,
      { value },
    )
  }
}
