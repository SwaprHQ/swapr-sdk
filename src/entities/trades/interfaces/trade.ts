import { ChainId, TradeType } from '../../../constants'
import { Currency } from '../../currency'
import { CurrencyAmount } from '../../fractions/currencyAmount'
import { Percent } from '../../fractions/percent'
import { Price } from '../../fractions/price'
import { Pair } from '../../pair'
import { RoutablePlatform } from '../../routable-platform'
import { Route } from '../../route'
import { BestTradeOptions } from '../uniswap-v2-trade'
import { CallParameters } from './call-parameters'
import { TradeOptions } from './trade-options'

/**
 * Represents a trade executed against a list of pairs.
 * Does not account for slippage, i.e. trades that front run this trade and move the price.
 */
export abstract class Trade {
  /**
   * The route of the trade, i.e. which pairs the trade goes through.
   */
  public readonly route: Route

  /**
   * The type of the trade, either exact in or exact out.
   */
  public readonly tradeType: TradeType

  /**
   * The input amount for the trade assuming no slippage.
   */
  public readonly inputAmount: CurrencyAmount

  /**
   * The output amount for the trade assuming no slippage.
   */
  public readonly outputAmount: CurrencyAmount

  /**
   * The price expressed in terms of output amount/input amount.
   */
  public readonly executionPrice: Price

  /**
   * The percent difference between the mid price before the trade and the trade execution price.
   */
  public readonly priceImpact: Percent

  /**
   * The unique identifier of the chain on which the swap is being performed (used to correctly handle the native currency).
   */
  public readonly chainId: ChainId

  /**
   * The swap platform this trade will execute on
   */
  public readonly platform: RoutablePlatform

  protected constructor(
    route: Route,
    type: TradeType,
    inputAmount: CurrencyAmount,
    outputAmount: CurrencyAmount,
    executionPrice: Price,
    priceImpact: Percent,
    chainId: ChainId,
    platform: RoutablePlatform
  ) {
    this.route = route
    this.tradeType = type
    this.inputAmount = inputAmount
    this.outputAmount = outputAmount
    this.executionPrice = executionPrice
    this.priceImpact = priceImpact
    this.chainId = chainId
    this.platform = platform
  }

  /**
   * Get the minimum amount that must be received from this trade for the given slippage tolerance
   * @param slippageTolerance tolerance of unfavorable slippage from the execution price of this trade
   */
  public abstract minimumAmountOut(slippageTolerance: Percent): CurrencyAmount

  /**
   * Get the maximum amount in that can be spent via this trade for the given slippage tolerance
   * @param slippageTolerance tolerance of unfavorable slippage from the execution price of this trade
   */
  public abstract maximumAmountIn(slippageTolerance: Percent): CurrencyAmount

  public abstract swapCallParameters(options: TradeOptions): CallParameters

  public static async bestTradeExactIn(
    _pairs: Pair[],
    currencyAmountIn: CurrencyAmount,
    _currencyOut: Currency,
    _options: BestTradeOptions = {},
    // used in recursion.
    _currentPairs: Pair[] = [],
    _originalAmountIn: CurrencyAmount = currencyAmountIn,
    _bestTrades: Trade[] = []
  ): Promise<Trade[]> {
    return []
  }

  public static async bestTradeExactOut(
    _pairs: Pair[],
    _currencyIn: Currency,
    currencyAmountOut: CurrencyAmount,
    _options: BestTradeOptions = {},
    // used in recursion.
    _currentPairs: Pair[] = [],
    _originalAmountOut: CurrencyAmount = currencyAmountOut,
    _bestTrades: Trade[] = []
  ): Promise<Trade[]> {
    return []
  }
}
