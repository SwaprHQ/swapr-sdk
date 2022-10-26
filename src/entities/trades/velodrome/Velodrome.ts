import { AddressZero } from '@ethersproject/constants'
import { BaseProvider } from '@ethersproject/providers'
import { parseUnits } from '@ethersproject/units'
import debug from 'debug'
import invariant from 'tiny-invariant'

import { ONE, TradeType } from '../../../constants'
import { Currency } from '../../currency'
import { CurrencyAmount, Fraction, Percent, Price, TokenAmount } from '../../fractions'

import { maximumSlippage as defaultMaximumSlippage } from '../constants'
import { Trade } from '../interfaces/trade'
import { RoutablePlatform } from '../routable-platform'
import { getProvider, tryGetChainId, wrappedCurrency } from '../utils'
import { getVelodromeRoutes } from './contracts'

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
  public constructor({ maximumSlippage, currencyAmountIn, currencyAmountOut, poolAddress, tradeType, chainId }: any) {
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
      priceImpact: new Percent('0', '100'),
      fee: new Percent('5', '10000'),
      // Uniswap V3 Router v2 address
      approveAddress: poolAddress,
    })
  }

  static async getQuote(
    { amount, quoteCurrency, tradeType, maximumSlippage, recipient }: VelodromeQuoteTypes,
    provider?: BaseProvider
  ): Promise<VelodromeTrade | null> {
    console.log('getQuoteVelodrome')
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

    const currencyIn = tradeType === TradeType.EXACT_INPUT ? amount.currency : quoteCurrency
    const currencyOut = tradeType === TradeType.EXACT_INPUT ? quoteCurrency : amount.currency

    debugVelodromeGetQuote({
      amount,
      quoteCurrency,
      currencyIn,
      currencyOut,
      tradeType,
      recipient,
      maximumSlippage,
    })

    const { amount: amountOut, poolAddress } = await getVelodromeRoutes({
      amount,
      currencyIn: currencyIn.address,
      currencyOut: currencyOut.address,
      chainId,
    })

    const wrappedQuote = wrappedCurrency(quoteCurrency, chainId)
    console.log('bigNumbner', amountOut.toNumber())
    const parsedAmount = parseUnits(amountOut.toString(), quoteCurrency.decimals).toString()
    console.log('parsedAmount', parsedAmount)
    const currencyAmountIn = tradeType === TradeType.EXACT_INPUT ? amount : new TokenAmount(wrappedQuote, parsedAmount)
    const currencyAmountOut = tradeType === TradeType.EXACT_INPUT ? new TokenAmount(wrappedQuote, parsedAmount) : amount
    console.log('newSheat', amountOut)

    // Debug
    debugVelodromeGetQuote(amountOut, poolAddress)

    if (amountOut && poolAddress) {
      return new VelodromeTrade({ maximumSlippage, currencyAmountIn, currencyAmountOut, poolAddress, tradeType })
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
}
