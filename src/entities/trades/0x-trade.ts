import invariant from 'tiny-invariant'

import { ChainId, ONE, TradeType } from '../../constants'
import { Currency } from '../currency'
import { CurrencyAmount } from '../fractions/currencyAmount'
import { Fraction } from '../fractions/fraction'
import { Percent } from '../fractions/percent'
import { Price } from '../fractions/price'
import { TokenAmount } from '../fractions/tokenAmount'
import { currencyEquals, Token } from '../token'
import { Trade } from './interfaces/trade'
import { UnsignedTransaction } from '@ethersproject/transactions'
import { Breakdown, Platform } from '../platforms-breakdown'
import { RoutablePlatform } from './routable-platform/routable-platform'
import fetch from 'node-fetch'
import { BigNumber } from '@ethersproject/bignumber'
import { Decimal } from 'decimal.js-light'

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

const decodePlatformName = (apiName: string): string => {
  switch (apiName) {
    case 'Uniswap_V2':
      return 'Uniswap v2'
    case 'Liquidity provider':
      return 'LP'
    case 'Balancer_V2':
      return 'Balancer v2'
    case 'DODO_V2':
      return 'Dodo v2'
    case 'Uniswap_V3':
      return 'Uniswap v3'
    case 'PancakeSwap_V2': // shouldn't be used since it's on BSC, but added to be extra sure
      return 'PancakeSwap v2'
    default:
      return apiName
  }
}

const platformsFromSources = (sources: ApiSource[]): Platform[] => {
  return sources
    .map(source => {
      const proportion = new Decimal(source.proportion)
      const denominator = new Decimal('10').pow(proportion.decimalPlaces())
      const numerator = proportion.times(denominator)
      return {
        name: decodePlatformName(source.name),
        percentage: new Percent(numerator.toString(), denominator.toString())
      }
    })
    .filter(platform => platform.percentage.greaterThan('0'))
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

/**
 * Represents a trade executed against a list of pairs.
 * Does not account for slippage, i.e. trades that front run this trade and move the price.
 */
export class ZeroXTrade extends Trade {
  private readonly to: string
  private readonly callData: string
  private readonly value: string

  public constructor(
    breakdown: Breakdown,
    input: CurrencyAmount,
    output: CurrencyAmount,
    maximumSlippage: Percent,
    tradeType: TradeType,
    to: string,
    callData: string,
    value: string
  ) {
    invariant(!currencyEquals(input.currency, output.currency), 'CURRENCY')
    const chainId = breakdown.chainId
    super(
      breakdown,
      tradeType,
      input,
      output,
      new Price(input.currency, output.currency, input.raw, output.raw),
      maximumSlippage,
      new Percent('0', '100'),
      chainId,
      RoutablePlatform.ZEROX
    )
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
      const slippageAdjustedAmountIn = new Fraction(ONE).add(this.maximumSlippage).multiply(this.inputAmount.raw)
        .quotient
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
    const chainId: ChainId | undefined =
      currencyAmountIn instanceof TokenAmount
        ? currencyAmountIn.token.chainId
        : currencyOut instanceof Token
        ? currencyOut.chainId
        : undefined
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
        new Price(tokenIn, tokenOut, amountIn.raw, json.buyAmount)
      )
      bestTrade = new ZeroXTrade(
        breakdown,
        currencyAmountIn,
        Currency.isNative(currencyOut)
          ? CurrencyAmount.nativeCurrency(json.buyAmount, chainId)
          : new TokenAmount(tokenOut, json.buyAmount),
        maximumSlippage,
        TradeType.EXACT_INPUT,
        json.to,
        json.data,
        json.value
      )
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
    const chainId: ChainId | undefined =
      currencyAmountOut instanceof TokenAmount
        ? currencyAmountOut.token.chainId
        : currencyIn instanceof Token
        ? currencyIn.chainId
        : undefined
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
        new Price(tokenOut, tokenIn, amountOut.raw, json.buyAmount)
      )
      bestTrade = new ZeroXTrade(
        breakdown,
        Currency.isNative(currencyIn)
          ? CurrencyAmount.nativeCurrency(json.buyAmount, chainId)
          : new TokenAmount(tokenIn, json.buyAmount),
        currencyAmountOut,
        maximumSlippage,
        TradeType.EXACT_OUTPUT,
        json.to,
        json.data,
        json.value
      )
    } catch (error) {
      console.error('could not fetch 0x trade', error)
    }

    return bestTrade
  }

  public async swapTransaction(): Promise<UnsignedTransaction> {
    return {
      to: this.to,
      data: this.callData,
      value: BigNumber.from(this.value)
    }
  }
}
