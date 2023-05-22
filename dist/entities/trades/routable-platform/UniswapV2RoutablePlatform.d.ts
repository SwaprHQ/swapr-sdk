import { BigintIsh, ChainId } from '../../../constants';
import { BaseRoutablePlatform } from './BaseRoutablePlatform';
export interface UniswapV2RoutablePlatformParams {
    /**
     * The chainIds this platform supports
     */
    chainIds: ChainId[];
    /**
     * The name of the platform.
     */
    name: string;
    /**
     * List of factory addresses, one for each chainId.
     */
    factoryAddress: {
        [supportedChainId in ChainId]?: string;
    };
    /**
     * List of router addresses, one for each chainId.
     */
    routerAddress: {
        [supportedChainId in ChainId]?: string;
    };
    /**
     * List of subgraph endpoints, one for each chainId.
     */
    subgraphEndpoint?: {
        [supportedChainId in ChainId]?: string;
    };
    /**
     * Initial code hash
     */
    initCodeHash: string;
    /**
     * The default swap fee for this platform.
     */
    defaultSwapFee: BigintIsh;
}
/**
 * A Uniswap V2 platform to which Swapr can route through.
 */
export declare class UniswapV2RoutablePlatform extends BaseRoutablePlatform {
    readonly factoryAddress: {
        [supportedChainId in ChainId]?: string;
    };
    readonly routerAddress: {
        [supportedChainId in ChainId]?: string;
    };
    readonly subgraphEndpoint: {
        [supportedChainId in ChainId]?: string;
    };
    readonly initCodeHash: string;
    readonly defaultSwapFee: BigintIsh;
    static readonly BAOSWAP: UniswapV2RoutablePlatform;
    /**
     * @see https://docs.biswap.org/biswap/general-information/biswap-smart-contracts for smart contract info
     * @see https://bscscan.com/address/0x858E3312ed3A876947EA49d572A7C42DE08af7EE#readContract (Factor address) for INIT_CODE_HASH
     * @see https://github.com/biswap-org/core/blob/78a67b2bf9dccc551adf91b0529aec6df9eb9b27/contracts/BiswapPair.sol#L29 for swapFee default value
     * @see https://thegraph.com/hosted-service/subgraph/unchase/biswap for Subraph Endpoint
     */
    static readonly BISWAP: UniswapV2RoutablePlatform;
    static readonly DFYN: UniswapV2RoutablePlatform;
    static readonly HONEYSWAP: UniswapV2RoutablePlatform;
    static readonly LEVINSWAP: UniswapV2RoutablePlatform;
    static readonly PANCAKESWAP: UniswapV2RoutablePlatform;
    static readonly QUICKSWAP: UniswapV2RoutablePlatform;
    static readonly SUSHISWAP: UniswapV2RoutablePlatform;
    static readonly SWAPR: UniswapV2RoutablePlatform;
    static readonly UNISWAP: UniswapV2RoutablePlatform;
    /**
     * Create a new UniswapV2RoutablePlatform instance.
     */
    constructor({ chainIds, name, factoryAddress, routerAddress, initCodeHash, defaultSwapFee, subgraphEndpoint, }: UniswapV2RoutablePlatformParams);
    /**
     * Check if the platform supports the given chain
     * @param chainId The chainId of the desired platform
     * @returns Whether the platform supports the given chain
     */
    supportsChain(chainId: ChainId): boolean;
}
