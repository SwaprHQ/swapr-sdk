import type { UnsignedTransaction } from '@ethersproject/transactions';
import { TradeType } from '../../../constants';
import { CurrencyAmount } from '../../fractions/currencyAmount';
import { Percent } from '../../fractions/percent';
import { Route } from '../../route';
import { TradeWithSwapTransaction } from '../interfaces/trade';
import { TradeOptions } from '../interfaces/trade-options';
import { UniswapV2TradeBestTradeExactInParams, UniswapV2TradeBestTradeExactOutParams, UniswapV2TradeComputeTradesExactInParams, UniswapV2TradeComputeTradesExactOutParams } from './types';
/**
 * Represents a trade executed against a list of pairs.
 * Does not account for slippage, i.e. trades that front run this trade and move the price.
 */
export declare class UniswapV2Trade extends TradeWithSwapTransaction {
    constructor(route: Route, amount: CurrencyAmount, maximumSlippage: Percent, tradeType: TradeType);
    minimumAmountOut(): CurrencyAmount;
    maximumAmountIn(): CurrencyAmount;
    /**
     * Computes the best trade for the given input and output amounts.
     * @param {UniswapV2TradeBestTradeExactInParams} params the pairs to consider in finding the best trade
     */
    static bestTradeExactIn({ currencyAmountIn, currencyOut, maximumSlippage, maxHops: { maxNumResults, maxHops }, platform, }: UniswapV2TradeBestTradeExactInParams): Promise<UniswapV2Trade | undefined>;
    /**
     * similar to the `bestTradeExactIn` method, but instead targets a fixed output amount
     * given a list of pairs, and a fixed amount out, returns the top `maxNumResults` trades that go from an input token
     * to an output token amount, making at most `maxHops` hops
     * note this does not consider aggregation, as routes are linear. it's possible a better route exists by splitting
     * the amount in among multiple routes.
     * @param {UniswapV2TradeBestTradeExactOutParams} params the parameters to use
     */
    static bestTradeExactOut({ currencyIn, currencyAmountOut, maximumSlippage, maxHops: { maxNumResults, maxHops }, platform, }: UniswapV2TradeBestTradeExactOutParams): Promise<UniswapV2Trade | undefined>;
    /**
     * Given a list of pairs, and a fixed amount in, returns the top `maxNumResults` trades that go from an input token
     * amount to an output token, making at most `maxHops` hops.
     * Note this does not consider aggregation, as routes are linear. It's possible a better route exists by splitting
     * the amount in among multiple routes.
     * @param {UniswapV2TradeComputeTradesExactInParams} param0
     * @returns list of trades that go from an input token amount to an output token, making at most `maxHops` hops
     */
    static computeTradesExactIn({ currencyAmountIn, currencyOut, maximumSlippage, pairs, maxHops: { maxNumResults, maxHops }, currentPairs, originalAmountIn, bestTrades, }: UniswapV2TradeComputeTradesExactInParams): UniswapV2Trade[];
    /**
     * similar to the above method but instead targets a fixed output amount
     * given a list of pairs, and a fixed amount out, returns the top `maxNumResults` trades that go from an input token
     * to an output token amount, making at most `maxHops` hops
     * note this does not consider aggregation, as routes are linear. it's possible a better route exists by splitting
     * the amount in among multiple routes.
     * @param {UniswapV2TradeBestTradeExactOutParams} params the parameters to use
     * @returns list of trades that go from an input token to an output token amount, making at most `maxHops` hops
     */
    static computeTradesExactOut({ currencyAmountOut, currencyIn, maximumSlippage, pairs, maxHops: { maxNumResults, maxHops }, currentPairs, originalAmountOut, bestTrades, }: UniswapV2TradeComputeTradesExactOutParams): UniswapV2Trade[];
    swapTransaction(options: TradeOptions): Promise<UnsignedTransaction>;
    get route(): Route;
    static tradeComparator(a: UniswapV2Trade, b: UniswapV2Trade): number;
}
