import { Pair } from '../../../pair';
import { GetAllCommonUniswapV2Pairs, GetAllCommonUniswapV2PairsFromSubgraphParams } from './types';
/**
 * Fetches all pairs through which the given tokens can be traded. Use `getAllCommonPairsFromSubgraph` for better results.
 * @returns the pair list
 */
export declare function getAllCommonUniswapV2Pairs({ currencyA, currencyB, platform, provider, }: GetAllCommonUniswapV2Pairs): Promise<Pair[]>;
/**
 *
 */
export declare function getAllCommonUniswapV2PairsFromSubgraph({ currencyA, currencyB, platform, }: GetAllCommonUniswapV2PairsFromSubgraphParams): Promise<Pair[]>;
