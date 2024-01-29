import { Currency } from '@uniswap/sdk-core';
import { Pool } from './entities/pool';
import { Route } from './entities/route';
export declare function computeAllRoutes(pools: Pool[], chainId: number, currentPath?: Pool[], allPaths?: Route<Currency, Currency>[], maxHops?: number): Route<Currency, Currency>[];
export declare function getRoutes(currencyIn: any, currencyOut: any, chainId: number): Promise<Route<Currency, Currency>[]>;
