import { ChainId } from '../../../constants';
import { CurvePool } from './pools';
import { CurveToken } from './tokens';
/**
 * Returns the token index of a token in a Curve pool
 * @param pool the Curve pool
 * @param tokenAddress the token address
 */
export declare function getTokenIndex(pool: CurvePool, tokenAddress: string, chainId?: ChainId): number;
/**
 * Given a token address, returns the token information if found
 * @param tokenAddress The token address
 * @param chainId The chain ID. Default is Mainnet
 * @returns The token information or undefined if not found
 */
export declare function getCurveToken(tokenAddress: string, chainId?: ChainId): CurveToken | undefined;
/**
 *
 * @param pools The list of Curve pools
 * @param tokenInAddress Token in address
 * @param tokenOutAddress Token out address
 * @returns List of potential pools at which the trade can be done
 */
export declare function getRoutablePools(pools: CurvePool[], tokenIn: CurveToken, tokenOut: CurveToken, chainId: ChainId): CurvePool[];
