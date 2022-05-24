import { BigNumber } from '@ethersproject/bignumber'
import type { UnsignedTransaction } from '@ethersproject/transactions'
import { Decimal } from 'decimal.js-light'
import fetch from 'node-fetch'
import invariant from 'tiny-invariant'

import { ChainId, ONE, TradeType } from '../../constants'
import { Currency } from '../currency'
import { CurrencyAmount } from '../fractions/currencyAmount'
import { Fraction } from '../fractions/fraction'
import { Percent } from '../fractions/percent'
import { Price } from '../fractions/price'
import { TokenAmount } from '../fractions/tokenAmount'
import { Breakdown, Platform } from '../platforms-breakdown'
import { currencyEquals, Token } from '../token'
import { TradeWithSwapTransaction } from './interfaces/trade'
import { RoutablePlatform } from './routable-platform/routable-platform'
import { tryGetChainId } from './utils'

interface ApiSource {
  name: string
  proportion: string
}

interface ApiResponse {
  price: string
  guaranteedPrice: string
  to: string
  data: string
  value: string
  gas: string
  estimatedGas: string
  gasPrice: string
  protocolFee: string
  minimumProtocolFee: string
  buyTokenAddress: string
  sellTokenAddress: string
  buyAmount: string
  sellAmount: string
  estimatedGasTokenRefund: string
  sources: ApiSource[]
}

const CODE_TO_PLATFORM_NAME: { [apiName: string]: string } = {
  Uniswap_V2: 'Uniswap v2',
  'Liquidity provider': 'LP',
  Balancer_V2: 'Balancer v2',
  DODO_V2: 'Dodo v2',
  Uniswap_V3: 'Uniswap v3',
  PancakeSwap_V2: 'PancakeSwap v2', // shouldn't be used since it's on BSC, but added to be extra sure
}

const decodePlatformName = (apiName: string): string => CODE_TO_PLATFORM_NAME[apiName] || apiName

const platformsFromSources = (sources: ApiSource[]): Platform[] => {
  return sources
    .map((source) => {
      const proportion = new Decimal(source.proportion)
      const denominator = new Decimal('10').pow(proportion.decimalPlaces())
      const numerator = proportion.times(denominator)
      return {
        name: decodePlatformName(source.name),
        percentage: new Percent(numerator.toString(), denominator.toString()),
      }
    })
    .filter((platform) => platform.percentage.greaterThan('0'))
    .sort((a, b) => (a.percentage.greaterThan(b.percentage) ? -1 : a.percentage.equalTo(b.percentage) ? 0 : 1))
}

function wrappedAmount(currencyAmount: CurrencyAmount, chainId: ChainId): TokenAmount {
  if (currencyAmount instanceof TokenAmount) return currencyAmount
  if (Currency.isNative(currencyAmount.currency))
    return new TokenAmount(Token.getNativeWrapper(chainId), currencyAmount.raw)
  invariant(false, 'CURRENCY')
}

function wrappedCurrency(currency: Currency, chainId: ChainId): Token {
  if (currency instanceof Token) return currency
  if (Currency.isNative(currency)) return Token.getNativeWrapper(chainId)
  invariant(false, 'CURRENCY')
}

export interface ZeroXTradeConstructorParams {
  breakdown: Breakdown
  input: CurrencyAmount
  output: CurrencyAmount
  maximumSlippage: Percent
  tradeType: TradeType
  to: string
  callData: string
  value: string
}

/**
 * Represents a trade executed against a list of pairs.
 * Does not account for slippage, i.e. trades that front run this trade and move the price.
 */
export class ZeroXTrade extends TradeWithSwapTransaction {
  private readonly to: string
  private readonly callData: string
  private readonly value: string

  public constructor({
    breakdown,
    input,
    output,
    maximumSlippage,
    tradeType,
    to,
    callData,
    value,
  }: ZeroXTradeConstructorParams) {
    invariant(!currencyEquals(input.currency, output.currency), 'CURRENCY')
    const chainId = breakdown.chainId
    super({
      details: breakdown,
      type: tradeType,
      inputAmount: input,
      outputAmount: output,
      executionPrice: new Price({
        baseCurrency: input.currency,
        quoteCurrency: output.currency,
        denominator: input.raw,
        numerator: output.raw,
      }),
      maximumSlippage,
      priceImpact: new Percent('0', '100'),
      chainId,
      platform: RoutablePlatform.ZEROX,
    })
    this.to = to
    this.callData = callData
    this.value = value
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

  public static async bestTradeExactIn(
    currencyAmountIn: CurrencyAmount,
    currencyOut: Currency,
    maximumSlippage: Percent
  ): Promise<ZeroXTrade | undefined> {
    const chainId = tryGetChainId(currencyAmountIn, currencyOut)
    invariant(chainId !== undefined && chainId === ChainId.MAINNET, 'CHAIN_ID') // 0x is only supported in mainnet for now
    const amountIn = wrappedAmount(currencyAmountIn, chainId)
    const tokenIn = wrappedCurrency(currencyAmountIn.currency, chainId)
    const tokenOut = wrappedCurrency(currencyOut, chainId)
    invariant(!tokenIn.equals(tokenOut), 'CURRENCY')

    let bestTrade
    try {
      const buyToken = Currency.isNative(currencyOut) ? currencyOut.symbol : tokenOut.address
      const sellToken = Currency.isNative(currencyAmountIn.currency)
        ? currencyAmountIn.currency.symbol
        : tokenIn.address

      const response = await fetch(
        `https://api.0x.org/swap/v1/quote?buyToken=${buyToken}&sellToken=${sellToken}&sellAmount=${
          amountIn.raw
        }&slippagePercentage=${maximumSlippage.toFixed(3)}`
      )
      if (!response.ok) throw new Error('response not ok')
      const json = (await response.json()) as ApiResponse
      const breakdown = new Breakdown(
        chainId,
        platformsFromSources(json.sources),
        tokenIn,
        tokenOut,
        new Price({
          baseCurrency: tokenIn,
          quoteCurrency: tokenOut,
          denominator: amountIn.raw,
          numerator: json.buyAmount,
        })
      )
      bestTrade = new ZeroXTrade({
        breakdown,
        input: currencyAmountIn,
        output: Currency.isNative(currencyOut)
          ? CurrencyAmount.nativeCurrency(json.buyAmount, chainId)
          : new TokenAmount(tokenOut, json.buyAmount),
        maximumSlippage,
        tradeType: TradeType.EXACT_INPUT,
        to: json.to,
        callData: json.data,
        value: json.value,
      })
    } catch (error) {
      console.error('could not fetch 0x trade', error)
    }
    return bestTrade
  }

  public static async bestTradeExactOut(
    currencyIn: Currency,
    currencyAmountOut: CurrencyAmount,
    maximumSlippage: Percent
  ): Promise<ZeroXTrade | undefined> {
    const chainId = tryGetChainId(currencyAmountOut, currencyIn)
    invariant(chainId !== undefined && chainId === ChainId.MAINNET, 'CHAIN_ID') // 0x is only supported in mainnet for now
    const tokenIn = wrappedCurrency(currencyIn, chainId)
    const amountOut = wrappedAmount(currencyAmountOut, chainId)
    const tokenOut = wrappedCurrency(currencyAmountOut.currency, chainId)
    invariant(!tokenIn.equals(tokenOut), 'CURRENCY')

    let bestTrade
    try {
      const buyToken = Currency.isNative(currencyIn) ? currencyIn.symbol : tokenIn.address
      const sellToken = Currency.isNative(currencyAmountOut.currency)
        ? currencyAmountOut.currency.symbol
        : tokenOut.address
      const response = await fetch(
        `https://api.0x.org/swap/v1/quote?buyToken=${buyToken}&sellToken=${sellToken}&sellAmount=${
          amountOut.raw
        }&slippagePercentage=${maximumSlippage.toFixed(3)}`
      )
      if (!response.ok) throw new Error('response not ok')
      const json = (await response.json()) as ApiResponse
      const breakdown = new Breakdown(
        chainId,
        platformsFromSources(json.sources),
        tokenIn,
        tokenOut,
        new Price({
          baseCurrency: tokenOut,
          quoteCurrency: tokenIn,
          denominator: amountOut.raw,
          numerator: json.buyAmount,
        })
      )
      bestTrade = new ZeroXTrade({
        breakdown,
        input: Currency.isNative(currencyIn)
          ? CurrencyAmount.nativeCurrency(json.buyAmount, chainId)
          : new TokenAmount(tokenIn, json.buyAmount),
        output: currencyAmountOut,
        maximumSlippage,
        tradeType: TradeType.EXACT_OUTPUT,
        to: json.to,
        callData: json.data,
        value: json.value,
      })
    } catch (error) {
      console.error('could not fetch 0x trade', error)
    }

    return bestTrade
  }

  public async swapTransaction(): Promise<UnsignedTransaction> {
    return {
      to: this.to,
      data: this.callData,
      value: BigNumber.from(this.value),
    }
  }
}
