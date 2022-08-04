import { BigintIsh, ChainId } from '../../../constants';
import { RoutablePlatform } from './routable-platform';
export interface UniswapV2RoutablePlatformConstructorParams {
    chainIds: ChainId[];
    name: string;
    factoryAddress: {
        [supportedChainId in ChainId]?: string;
    };
    routerAddress: {
        [supportedChainId in ChainId]?: string;
    };
    initCodeHash: string;
    defaultSwapFee: BigintIsh;
}
/**
 * A platform to which Swapr can route through.
 */
export declare class UniswapV2RoutablePlatform extends RoutablePlatform {
    readonly factoryAddress: {
        [supportedChainId in ChainId]?: string;
    };
    readonly routerAddress: {
        [supportedChainId in ChainId]?: string;
    };
    readonly initCodeHash: string;
    readonly defaultSwapFee: BigintIsh;
    static readonly SWAPR: UniswapV2RoutablePlatform;
    static readonly UNISWAP: UniswapV2RoutablePlatform;
    static readonly SUSHISWAP: UniswapV2RoutablePlatform;
    static readonly HONEYSWAP: UniswapV2RoutablePlatform;
    static readonly BAOSWAP: UniswapV2RoutablePlatform;
    static readonly LEVINSWAP: UniswapV2RoutablePlatform;
    static readonly QUICKSWAP: UniswapV2RoutablePlatform;
    static readonly DFYN: UniswapV2RoutablePlatform;
    constructor({ chainIds, name, factoryAddress, routerAddress, initCodeHash, defaultSwapFee, }: UniswapV2RoutablePlatformConstructorParams);
    supportsChain(chainId: ChainId): boolean;
}
