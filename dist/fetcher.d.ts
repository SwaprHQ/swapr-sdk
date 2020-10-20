import { Pair } from './entities/pair';
import { ChainId, BigintIsh } from './constants';
import { Token } from './entities/token';
/**
 * Contains methods for constructing instances of pairs and tokens from on-chain data.
 */
export declare abstract class Fetcher {
    /**
     * Cannot be constructed.
     */
    private constructor();
    /**
     * Fetch information for a given token on the given chain, using the given ethers provider.
     * @param chainId chain of the token
     * @param address address of the token on the chain
     * @param provider provider used to fetch the token
     * @param symbol optional symbol of the token
     * @param name optional name of the token
     */
    static fetchTokenData(chainId: ChainId, address: string, provider?: import("@ethersproject/providers").BaseProvider, symbol?: string, name?: string): Promise<Token>;
    /**
     * Fetches information about a pair and constructs a pair from the given two tokens.
     * @param tokenA first token
     * @param tokenB second token
     * @param provider the provider to use to fetch the data
     */
    static fetchPairData(tokenA: Token, tokenB: Token, provider?: import("@ethersproject/providers").BaseProvider): Promise<Pair>;
    /**
     * Fetches swap fee information from a liquidity token of a token pair
     * @param liquidityToken the liquidity token from which the swap fee info will be fetched
     * @param provider the provider to use to fetch the data
     */
    static fetchSwapFee(liquidityToken: Token, provider?: import("@ethersproject/providers").BaseProvider): Promise<{
        fee: BigintIsh;
        owner: string;
    }>;
    /**
     * Fetches swap fee information from liquidity tokens of token pairs
     * @param liquidityToken the liquidity tokens from which the swap fee info will be fetched
     * @param provider the provider to use to fetch the data
     */
    static fetchSwapFees(liquidityTokens: Token[], provider?: import("@ethersproject/providers").BaseProvider): Promise<{
        fee: BigintIsh;
        owner: string;
    }[]>;
    /**
     * Fetches swap fee information of all registered token pairs from factory
     * @param chainId the chainId of the network to fecth the swap fees
     * @param swapFeesCache a cache of already fetched fees to be skiped
     * @param provider the provider to use to fetch the data
     */
    static fetchAllSwapFees(chainId: ChainId, swapFeesCache?: {
        [key: string]: {
            fee: BigintIsh;
            owner: string;
        };
    }, provider?: import("@ethersproject/providers").BaseProvider): Promise<{
        [key: string]: {
            fee: BigintIsh;
            owner: string;
        };
    }>;
    /**
     * Fetches protocol fee information from the token pair factory
     * @param chainId the chainId of the network to fecth the protocol fee
     * @param provider the provider to use to fetch the data
     */
    static fetchProtocolFee(chainId: ChainId, provider?: import("@ethersproject/providers").BaseProvider): Promise<{
        feeDenominator: BigintIsh;
        feeReceiver: string;
    }>;
}
