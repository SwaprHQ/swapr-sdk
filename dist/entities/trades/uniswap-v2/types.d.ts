import type { BytesLike } from '@ethersproject/bytes';
import type { Currency } from '../../currency';
import type { CurrencyAmount } from '../../fractions/currencyAmount';
import type { Percent } from '../../fractions/percent';
import type { Pair } from '../../pair';
import { UniswapV2RoutablePlatform } from '../routable-platform';
import type { UniswapV2Trade } from './UniswapV2';
export type Multicall2TryAggregateResult = {
    success: boolean;
    returnData: BytesLike;
};
export interface BestTradeOptions {
    maxNumResults?: number;
    maxHops?: number;
}
/**
 * Base interface
 */
export interface UniswapV2TradeBestTradeExactCommonParams {
    maxHops?: BestTradeOptions;
    maximumSlippage: Percent;
    platform: UniswapV2RoutablePlatform;
}
export interface UniswapV2TradeBestTradeExactInParams extends UniswapV2TradeBestTradeExactCommonParams {
    currencyAmountIn: CurrencyAmount;
    currencyOut: Currency;
}
export interface UniswapV2TradeBestTradeExactOutParams extends UniswapV2TradeBestTradeExactCommonParams {
    currencyIn: Currency;
    currencyAmountOut: CurrencyAmount;
}
/**
 * Common params for computing trade routes
 */
export interface UniswapV2TradeComputeTradeCommonParams {
    pairs: Pair[];
    currentPairs?: Pair[];
    bestTrades?: UniswapV2Trade[];
}
export type UniswapV2TradeComputeTradesExactInParams = UniswapV2TradeComputeTradeCommonParams & Omit<UniswapV2TradeBestTradeExactInParams, 'platform'> & {
    originalAmountIn?: CurrencyAmount;
};
export type UniswapV2TradeComputeTradesExactOutParams = UniswapV2TradeComputeTradeCommonParams & Omit<UniswapV2TradeBestTradeExactOutParams, 'platform'> & {
    originalAmountOut?: CurrencyAmount;
};
