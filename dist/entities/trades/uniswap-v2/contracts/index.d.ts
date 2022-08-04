import { Provider } from '@ethersproject/providers';
import { ChainId } from '../../../../constants';
import type { Currency } from '../../../currency';
import { Pair } from '../../../pair';
import { UniswapV2RoutablePlatform } from '../../routable-platform/uniswap-v2-routable-platform';
/**
 * Cache for the UniswapV2 pair fee
 */
export declare const uniswapV2PairFeeCache: import("../cache").GeneralCacheList<{
    expiresAt: number;
    data: number;
}>;
/**
 * Fetches the pair fee from the contract or cache if it's already been fetched.
 * @param pairAddress the address of the pair
 * @param chainId the chain id of the pair
 * @param expiresIn the time in seconds until the cache expires
 * @returns the pair fee in basis points
 */
export declare function getUniswapPairSwapFee(pairAddress: string, chainId: ChainId, expiresIn?: number): Promise<number>;
interface GetAllCommonPairsParams {
    currencyA: Currency;
    currencyB: Currency;
    platform: UniswapV2RoutablePlatform;
    provider?: Provider;
}
/**
 * Fetches all pairs through which the given tokens can be traded.
 * @param currencyA The first currency
 * @param currencyB The second currency
 * @param platform The platform to use
 * @returns
 */
export declare function getAllCommonPairs({ currencyA, currencyB, platform, provider, }: GetAllCommonPairsParams): Promise<Pair[]>;
export {};
