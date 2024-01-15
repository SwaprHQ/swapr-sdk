import { Currency, Token } from '@uniswap/sdk-core';
import { Pool } from './entities/pool';
export declare const setupTokens: (currencyIn: Currency, currencyOut: Currency) => {
    tokenA: Token;
    tokenB: Token;
};
export declare const getPools: (currencyIn: Currency, currencyOut: Currency) => Promise<Pool[]>;
