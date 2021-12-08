import { UnsignedTransaction } from '@ethersproject/transactions'
import { Breakdown } from '../../platforms-breakdown'
import { ChainId, TradeType } from '../../../constants'
import { CurrencyAmount } from '../../fractions/currencyAmount'
import { Percent } from '../../fractions/percent'
import { Price } from '../../fractions/price'
import { RoutablePlatform } from '../routable-platform/routable-platform'
import { Route } from '../../route'
import { TradeOptions } from './trade-options'

type Details = Route | Breakdown

/**
 * Represents a trade executed against a list of pairs.
 * Does not account for slippage, i.e. trades that front run this trade and move the price.
 */
export abstract class Trade {
  public readonly details: Details
  public readonly tradeType: TradeType
  public readonly inputAmount: CurrencyAmount
  public readonly outputAmount: CurrencyAmount
  public readonly maximumSlippage: Percent
  public readonly executionPrice: Price
  public readonly priceImpact: Percent
  public readonly chainId: ChainId
  public readonly platform: RoutablePlatform

  protected constructor(
    details: Details,
    type: TradeType,
    inputAmount: CurrencyAmount,
    outputAmount: CurrencyAmount,
    executionPrice: Price,
    maximumSlippage: Percent,
    priceImpact: Percent,
    chainId: ChainId,
    platform: RoutablePlatform
  ) {
    this.details = details
    this.tradeType = type
    this.inputAmount = inputAmount
    this.maximumSlippage = maximumSlippage
    this.outputAmount = outputAmount
    this.executionPrice = executionPrice
    this.priceImpact = priceImpact
    this.chainId = chainId
    this.platform = platform
  }

  /**
   * Get the minimum amount that must be received from this trade for the given slippage tolerance
   */
  public abstract minimumAmountOut(): CurrencyAmount

  /**
   * Get the maximum amount in that can be spent via this trade for the given slippage tolerance
   */
  public abstract maximumAmountIn(): CurrencyAmount

  public abstract async swapTransaction(options: TradeOptions): Promise<UnsignedTransaction>
}
