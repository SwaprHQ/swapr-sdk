import { AddressZero } from '@ethersproject/constants'
import { BaseProvider } from '@ethersproject/providers'
import { formatUnits } from '@ethersproject/units'

import debug from 'debug'
import { Contract } from '@ethersproject/contracts'
import type { UnsignedTransaction } from '@ethersproject/transactions'
import invariant from 'tiny-invariant'

import { ONE, TradeType } from '../../../constants'
import { validateAndParseAddress } from '../../../utils'
import { Currency } from '../../currency'
import { CurrencyAmount, Fraction, Percent, Price, TokenAmount } from '../../fractions'

import { maximumSlippage as defaultMaximumSlippage } from '../constants'
import { Trade } from '../interfaces/trade'
import { TradeOptions } from '../interfaces/trade-options'
import { RoutablePlatform } from '../routable-platform'
import { toHex, ZERO_HEX } from '../uniswap-v2/utilts'
import { getProvider, tryGetChainId, wrappedCurrency } from '../utils'
import { LIBRARY_ABI, ROUTER_ABI } from './abi'
import { LIBRARY_ADDRESS, ROUTER_ADDRESS } from './contants'
import { getBestRoute } from './utils'

export interface VelodromeQuoteTypes {
  amount: CurrencyAmount
  quoteCurrency: Currency
  tradeType: TradeType
  maximumSlippage?: Percent
  recipient?: string
}

// Debuging logger. See documentation to enable logging.
const debugVelodromeGetQuote = debug('ecoRouter:velodrome:getQuote')

/**
 * UniswapTrade uses the AutoRouter to find best trade across V2 and V3 pools
 */
export class VelodromeTrade extends Trade {
  public constructor({
    maximumSlippage,
    currencyAmountIn,
    currencyAmountOut,
    tradeType,
    chainId,
    routes,
    priceImpact,
  }: any) {
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
      routes,
      priceImpact,
      fee: new Percent('2', '10000'),
      approveAddress: ROUTER_ADDRESS,
    })
  }

  static async getQuote(
    { amount, quoteCurrency, tradeType, maximumSlippage, recipient }: VelodromeQuoteTypes,
    provider?: BaseProvider
  ): Promise<VelodromeTrade | null> {
    const chainId = tryGetChainId(amount, quoteCurrency)
    invariant(chainId, 'VelodromeQuote.getQuote: chainId is required')

    // Defaults
    recipient = recipient || AddressZero
    maximumSlippage = maximumSlippage || defaultMaximumSlippage

    provider = provider || getProvider(chainId)

    // Must match the currencies provided
    invariant(
      (await provider.getNetwork()).chainId == chainId,
      `UniswapTrade.getQuote: currencies chainId does not match provider's chainId`
    )

    const currencyIn = amount.currency
    const currencyOut = quoteCurrency

    const wrappedCurrencyIn = wrappedCurrency(currencyIn, chainId)
    const wrappedCurrencyOut = wrappedCurrency(currencyOut, chainId)

    debugVelodromeGetQuote({
      amount,
      quoteCurrency,
      currencyIn,
      currencyOut,
      tradeType,
      recipient,
      maximumSlippage,
    })

    let bestAmountOut
    let finalValue
    try {
      const bestAmount = await getBestRoute({
        currencyIn: wrappedCurrencyIn,
        currencyOut: wrappedCurrencyOut,
        amount,
        provider,
        chainId,
      })
      bestAmountOut = bestAmount
      finalValue = bestAmount?.finalValue.toString()
      if (!bestAmount) {
        return null
      }
      if (tradeType === TradeType.EXACT_OUTPUT) {
        const bestAmountForOutput = await getBestRoute({
          currencyIn: wrappedCurrencyOut,
          currencyOut: wrappedCurrencyIn,
          amount: new TokenAmount(wrappedCurrencyOut, bestAmount.finalValue.toString()),
          provider,
          chainId,
        })
        bestAmountOut = bestAmountForOutput
      }
      if (!finalValue || !bestAmountOut) {
        return null
      }

      const libraryContract = new Contract(LIBRARY_ADDRESS, LIBRARY_ABI, provider)
      let totalRatio = 1

      for (let i = 0; i < bestAmountOut.routes.length; i++) {
        const amountIn = bestAmountOut.receiveAmounts[i]

        const res = await libraryContract['getTradeDiff(uint256,address,address,bool)'](
          amountIn,
          bestAmountOut.routes[i].from,
          bestAmountOut.routes[i].to,
          bestAmountOut.routes[i].stable
        )

        const decimals = tradeType === TradeType.EXACT_INPUT ? quoteCurrency.decimals : amount.currency.decimals
        const numberA = formatUnits(res.a, decimals)
        const numberB = formatUnits(res.b, decimals)

        const ratio = parseFloat(numberB) / parseFloat(numberA)

        totalRatio = totalRatio * ratio
      }

      const calculation = Math.round((1 - totalRatio) * 1000)

      const priceImpact = new Percent(calculation.toString(), '1000')

      const convertToNative = (amount: string, currency: Currency, chainId: number) => {
        if (Currency.isNative(currency)) return CurrencyAmount.nativeCurrency(amount, chainId)
        return new TokenAmount(wrappedCurrency(currency, chainId), amount)
      }

      const currencyAmountIn =
        TradeType.EXACT_INPUT === tradeType ? amount : convertToNative(finalValue.toString(), currencyOut, chainId)
      const currencyAmountOut =
        TradeType.EXACT_INPUT === tradeType
          ? convertToNative(bestAmountOut.finalValue.toString(), currencyOut, chainId)
          : convertToNative(bestAmountOut.finalValue.toString(), currencyIn, chainId)

      return new VelodromeTrade({
        maximumSlippage,
        currencyAmountIn,
        currencyAmountOut,
        tradeType,
        chainId,
        routes: bestAmountOut.routes,
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

  /**
   * Returns unsigned transaction for the trade
   * @returns the unsigned transaction
   */
  public async swapTransaction(options: TradeOptions): Promise<UnsignedTransaction> {
    const nativeCurrency = Currency.getNative(this.chainId)
    const etherIn = this.inputAmount.currency === nativeCurrency
    const etherOut = this.outputAmount.currency === nativeCurrency
    // the router does not support both ether in and out
    invariant(this.routes, 'No Avaliable routes')
    invariant(!(etherIn && etherOut), 'ETHER_IN_OUT')
    invariant(options.ttl && options.ttl > 0, 'TTL')
    invariant(this.inputAmount.currency.address && this.outputAmount.currency.address, 'No currency')

    const to: string = validateAndParseAddress(options.recipient)
    const amountIn: string = toHex(this.maximumAmountIn())
    const amountOut: string = toHex(this.minimumAmountOut())

    const deadline = `0x${(Math.floor(new Date().getTime() / 1000) + options.ttl).toString(16)}`

    let methodName: string
    let args: any
    let value: string = ZERO_HEX
    switch (this.tradeType) {
      case TradeType.EXACT_INPUT:
        if (etherIn) {
          methodName = 'swapExactETHForTokens'
          // (uint amountOutMin, address[] calldata path, address to, uint deadline)
          args = [amountOut, this.routes, to, deadline]
          value = amountIn
        } else if (etherOut) {
          methodName = 'swapExactTokensForETH'
          // (uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline)
          args = [amountIn, amountOut, this.routes, to, deadline]
          value = ZERO_HEX
        } else {
          methodName = 'swapExactTokensForTokens'
          // (uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline)
          args = [amountIn, amountOut, this.routes, to, deadline]
          value = ZERO_HEX
        }
        break
      case TradeType.EXACT_OUTPUT:
        if (etherIn) {
          methodName = 'swapETHForExactTokens'
          // (uint amountOut, address[] calldata path, address to, uint deadline)
          args = [amountOut, this.routes, to, deadline]
          value = amountIn
        } else if (etherOut) {
          methodName = 'swapTokensForExactETH'
          // (uint amountOut, uint amountInMax, address[] calldata path, address to, uint deadline)
          args = [amountOut, amountIn, this.routes, to, deadline]
          value = ZERO_HEX
        } else {
          methodName = 'swapTokensForExactTokens'
          // (uint amountOut, uint amountInMax, address[] calldata path, address to, uint deadline)
          args = [amountOut, amountIn, this.routes, to, deadline]
          value = ZERO_HEX
        }
        break
    }

    return new Contract(ROUTER_ADDRESS, ROUTER_ABI).populateTransaction[methodName](...args, { value })
  }
}
