import { BaseRoutablePlatform } from './BaseRoutablePlatform';
/**
 * A platform to which Swapr can route through.
 */
export declare class RoutablePlatform extends BaseRoutablePlatform {
    static readonly ZEROX: RoutablePlatform;
    static readonly CURVE: RoutablePlatform;
    static readonly GNOSIS_PROTOCOL: RoutablePlatform;
    static readonly UNISWAP: RoutablePlatform;
}
