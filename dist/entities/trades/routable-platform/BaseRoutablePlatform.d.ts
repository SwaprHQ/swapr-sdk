import { ChainId } from '../../../constants';
export interface IBaseRoutablePlatform {
    chainIds: ChainId[];
    name: string;
}
/**
 * `BaseRoutablePlatform` should be used new platforms through which Swapr can route trades.
 * @implements IBaseRoutablePlatform
 */
export declare abstract class BaseRoutablePlatform implements IBaseRoutablePlatform {
    /**
     * @returns List of chainIds supported by the platform
     */
    readonly chainIds: ChainId[];
    /**
     * @property The name of the platform.
     */
    readonly name: string;
    /**
     * Create a new instance of the platform.
     * @param chainIds list of chainIds to check
     * @param name name of the platform
     */
    constructor(chainIds: ChainId[], name: string);
    /**
     * Checks if the platform is compatible with the given chainId.
     * @param chainId The chainId to check
     * @returns whether the platform supports the given chainId
     */
    supportsChain(chainId: ChainId): boolean;
}
