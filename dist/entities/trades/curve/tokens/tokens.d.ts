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
type CurveTokenList = {
    [chainId in ChainId]: Record<string, CurveToken>;
};
/**
 * @TODO add missing Optimisn and Polygon tokens.
 * TBD in https://linear.app/swaprdev/issue/SWA-61/add-curve-pools-and-tokens-for-polygon-and-optimism-in-the-sdk
 */
export declare const CURVE_TOKENS: CurveTokenList;
export {};
