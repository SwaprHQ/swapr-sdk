import type { UnsignedTransaction } from '@ethersproject/transactions'
import type { Breakdown } from '../../platforms-breakdown'
import type { ChainId, TradeType } from '../../../constants'
import type { CurrencyAmount } from '../../fractions/currencyAmount'
import { Percent } from '../../fractions/percent'
import type { Price } from '../../fractions/price'
import type { RoutablePlatform } from '../routable-platform/routable-platform'
import type { Route } from '../../route'
import type { TradeOptions } from './trade-options'

export type Details = Route | Breakdown | undefined

export interface TradeConstructorParams {
  details: Details
  type: TradeType
  inputAmount: CurrencyAmount
  outputAmount: CurrencyAmount
  executionPrice: Price
  maximumSlippage: Percent
  priceImpact: Percent
  chainId: ChainId
  platform: RoutablePlatform
  fee?: Percent
}

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

  /**
   * The protocol fee
   */
  public readonly fee: Percent

  protected constructor({
    details,
    type,
    inputAmount,
    outputAmount,
    executionPrice,
    maximumSlippage,
    priceImpact,
    chainId,
    platform,
    fee = new Percent('0'),
  }: TradeConstructorParams) {
    this.details = details
    this.tradeType = type
    this.inputAmount = inputAmount
    this.maximumSlippage = maximumSlippage
    this.outputAmount = outputAmount
    this.executionPrice = executionPrice
    this.priceImpact = priceImpact
    this.chainId = chainId
    this.platform = platform
    this.fee = fee
  }

  /**
   * Get the minimum amount that must be received from this trade for the given slippage tolerance
   */
  public abstract minimumAmountOut(): CurrencyAmount

  /**
   * Get the maximum amount in that can be spent via this trade for the given slippage tolerance
   */
  public abstract maximumAmountIn(): CurrencyAmount

  public abstract swapTransaction(options: TradeOptions): Promise<UnsignedTransaction>
}
