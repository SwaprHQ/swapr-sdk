import { Token } from '@uniswap/sdk-core';
import { Pool } from './pool';
export declare const setupTokens: (currencyIn: Token, currencyOut: Token) => {
    tokenA: Token;
    tokenB: Token;
};
export declare const getPools: (currencyIn: Token, currencyOut: Token) => Promise<Pool[]>;
