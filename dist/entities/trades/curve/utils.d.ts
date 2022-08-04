import { ChainId } from '../../../constants';
import { Token } from '../../token';
import { CurvePool, CurveToken, TokenType } from './tokens';
/**
 * Returns the token index of a token in a Curve pool
 * @param pool the Curve pool
 * @param tokenAddress the token address
 */
export declare function getTokenIndex(pool: CurvePool, tokenAddress: string, chainId?: ChainId): number;
/**
 * Given a token, returns the token information if found otherwise returns token passed
 * @param token The token
 * @param chainId The chain ID. Default is Mainnet
 * @returns The token information or undefined if not found
 */
export declare function getCurveToken(token: Token, chainId?: ChainId): CurveToken;
/**
 *
 * @param pools The list of Curve pools
 * @param tokenInAddress Token in address
 * @param tokenOutAddress Token out address
 * @returns List of potential pools at which the trade can be done
 */
export declare function getRoutablePools(pools: CurvePool[], tokenIn: CurveToken, tokenOut: CurveToken, chainId: ChainId): Promise<CurvePool[]>;
/**
 * Returns tokenType based on token symbol
 * @param symbol symbol of curve token
 * @returns token type of given symbol
 */
export declare function determineTokeType(symbol: string): TokenType;
