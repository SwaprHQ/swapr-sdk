import { Token } from 'entities/token';
import { TradeType } from '../constants';
import { TokenAmount } from './fractions';
import { Percent } from './fractions/percent';
import { Price } from './fractions/price';
import { Pair } from './pair';
import { Route } from './route';
interface InputOutput {
    readonly inputAmount?: TokenAmount;
    readonly outputAmount?: TokenAmount;
}
export declare function inputOutputComparator(a: InputOutput, b: InputOutput): number;
export declare function tradeComparator(a: Trade, b: Trade): number;
export interface BestTradeOptions {
    maxNumResults?: number;
    maxHops?: number;
}
export declare class Trade {
    route?: Route;
    tradeType?: TradeType;
    amount?: TokenAmount;
    inputAmount?: TokenAmount;
    outputAmount?: TokenAmount;
    executionPrice?: Price;
    nextMidPrice?: Price;
    slippage?: Percent;
    create: (route: Route, amount: TokenAmount, tradeType: TradeType) => Promise<Trade>;
    minimumAmountOut(slippageTolerance: Percent): TokenAmount | undefined;
    maximumAmountIn(slippageTolerance: Percent): TokenAmount | undefined;
    static bestTradeExactIn(pairs: Pair[], amountIn: TokenAmount, tokenOut: Token, { maxNumResults, maxHops }?: BestTradeOptions, currentPairs?: Pair[], originalAmountIn?: TokenAmount, bestTrades?: Trade[]): Promise<Trade[]>;
    static bestTradeExactOut(pairs: Pair[], tokenIn: Token, amountOut: TokenAmount, { maxNumResults, maxHops }?: BestTradeOptions, currentPairs?: Pair[], originalAmountOut?: TokenAmount, bestTrades?: Trade[]): Promise<Trade[]>;
}
export {};
