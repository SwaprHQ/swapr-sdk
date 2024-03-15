import { Currency, Price, Token } from '@uniswap/sdk-core';
import { Pool } from './pool';
/**
 * Represents a list of pools through which a swap can occur
 * @template TInput The input token
 * @template TOutput The output token
 */
export declare class Route<TInput extends Currency, TOutput extends Currency> {
    readonly pools: Pool[];
    readonly tokenPath: Token[];
    readonly input: TInput;
    readonly output: TOutput;
    /**
     * Creates an instance of route.
     * @param pools An array of `Pool` objects, ordered by the route the swap will take
     * @param input The input token
     * @param output The output token
     */
    constructor(pools: Pool[], input: TInput, output: TOutput);
    private _midPrice;
    /**
     * Returns the mid price of the route
     */
    get midPrice(): Price<TInput, TOutput>;
    get chainId(): number;
}
