import { ChainId } from '../../../../constants';
import { CurveToken } from './types';
/**
 * Gnosis Chain
 */
export declare const TOKENS_XDAI: Record<string, CurveToken>;
/**
 * Arbitrum
 */
export declare const TOKENS_ARBITRUM_ONE: Record<string, CurveToken>;
/**
 * Ethereum
 */
export declare const TOKENS_MAINNET: Record<string, CurveToken>;
declare type CurveTokenList = {
    [chainId in ChainId]: Record<string, CurveToken>;
};
export declare const CURVE_TOKENS: CurveTokenList;
export {};
