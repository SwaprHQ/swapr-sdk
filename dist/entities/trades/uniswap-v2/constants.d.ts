import { ChainId } from '../../../constants';
import { Token } from '../../token';
declare type ChainTokenList = {
    readonly [chainId in ChainId]: Token[];
};
export declare const DAI: Token;
export declare const USDC: Record<number, Token>;
export declare const USDT: Record<number, Token>;
export declare const WBTC: Record<number, Token>;
export declare const HONEY: Token;
export declare const STAKE: Token;
export declare const BAO: Token;
export declare const AGAVE: Token;
export declare const GNO: Token;
export declare const BASES_TO_CHECK_TRADES_AGAINST: ChainTokenList;
export {};
