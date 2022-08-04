import type { UnsignedTransaction } from '@ethersproject/transactions';
import type { ChainId, TradeType } from '../../../constants';
import type { CurrencyAmount } from '../../fractions/currencyAmount';
import { Percent } from '../../fractions/percent';
import type { Price } from '../../fractions/price';
import type { Breakdown } from '../../platforms-breakdown';
import type { Route } from '../../route';
import type { RoutablePlatform } from '../routable-platform';
import type { TradeOptions } from './trade-options';
export declare type Details = Route | Breakdown | undefined;
export interface TradeConstructorParams {
    details: Details;
    type: TradeType;
    inputAmount: CurrencyAmount;
    outputAmount: CurrencyAmount;
    executionPrice: Price;
    maximumSlippage: Percent;
    priceImpact: Percent;
    chainId: ChainId;
    platform: RoutablePlatform;
    fee?: Percent;
}
/**
 * Represents a base Trade class.
 * Extend this class to create more trades to the Eco Router
 */
export declare abstract class Trade {
    readonly details: Details;
    readonly tradeType: TradeType;
    readonly inputAmount: CurrencyAmount;
    readonly outputAmount: CurrencyAmount;
    readonly maximumSlippage: Percent;
    readonly executionPrice: Price;
    readonly priceImpact: Percent;
    readonly chainId: ChainId;
    readonly platform: RoutablePlatform;
    /**
     * The protocol fee
     */
    readonly fee: Percent;
    protected constructor({ details, type, inputAmount, outputAmount, executionPrice, maximumSlippage, priceImpact, chainId, platform, fee, }: TradeConstructorParams);
    /**
     * Get the minimum amount that must be received from this trade for the given slippage tolerance
     */
    abstract minimumAmountOut(): CurrencyAmount;
    /**
     * Get the maximum amount in that can be spent via this trade for the given slippage tolerance
     */
    abstract maximumAmountIn(): CurrencyAmount;
}
/**
 * Represents a trade executed against a list of pairs.
 * Does not account for slippage, i.e. trades that front run this trade and move the price.
 */
export declare abstract class TradeWithSwapTransaction extends Trade {
    abstract swapTransaction(options: TradeOptions): Promise<UnsignedTransaction>;
}
