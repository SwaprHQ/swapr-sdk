import type { CurrencyAmount } from '../../fractions/currencyAmount';
import { Percent } from '../../fractions/percent';
import type { Price } from '../../fractions/price';
export type { UniswapV2Trade } from './UniswapV2';
export declare function toHex(currencyAmount: CurrencyAmount): string;
export declare const ZERO_HEX = "0x0";
/**
 * Returns the percent difference between the mid price and the execution price, i.e. price impact.
 * @param midPrice mid price before the trade
 * @param inputAmount the input amount of the trade
 * @param outputAmount the output amount of the trade
 */
export declare function computePriceImpact(midPrice: Price, inputAmount: CurrencyAmount, outputAmount: CurrencyAmount): Percent;
interface InputOutput {
    readonly inputAmount: CurrencyAmount;
    readonly outputAmount: CurrencyAmount;
}
export declare function inputOutputComparator(a: InputOutput, b: InputOutput): number;
