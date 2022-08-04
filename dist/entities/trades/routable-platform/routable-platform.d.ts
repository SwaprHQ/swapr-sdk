import { ChainId } from '../../../constants';
/**
 * A platform to which Swapr can route through.
 */
export declare class RoutablePlatform {
    static readonly ZEROX: RoutablePlatform;
    static readonly CURVE: RoutablePlatform;
    static readonly GNOSIS_PROTOCOL: RoutablePlatform;
    static readonly UNISWAP: RoutablePlatform;
    readonly chainIds: ChainId[];
    readonly name: string;
    constructor(chainIds: ChainId[], name: string);
    supportsChain(chainId: ChainId): boolean;
}
