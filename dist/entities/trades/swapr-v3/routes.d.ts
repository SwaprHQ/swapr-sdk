import { Currency, Token } from '@uniswap/sdk-core';
import { Pool } from './pool';
import { Route } from './route';
export declare function computeAllRoutes(pools: Pool[], chainId: number, currentPath?: Pool[], allPaths?: Route<Currency, Currency>[], maxHops?: number): Route<Currency, Currency>[];
export declare function getRoutes(currencyIn: Token, currencyOut: Token, chainId: number): Promise<Route<Currency, Currency>[]>;
