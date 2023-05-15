import { GetUniswapV2PairSwapFeeParams } from './types';
/**
 * Given a list of UniswapV2 pair address, it fetches pair fee from the contract via multicall contract
 * @returns the list of pair fee in basis points
 */
export declare function getUniswapV2PairSwapFee({ pairAddressList, chainId, provider, }: GetUniswapV2PairSwapFeeParams): Promise<Record<string, number>>;
