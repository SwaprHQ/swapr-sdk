import { BaseRoutablePlatform } from './BaseRoutablePlatform';
/**
 * A platform to which Swapr can route through.
 */
export declare class RoutablePlatform extends BaseRoutablePlatform {
    static readonly ZEROX: RoutablePlatform;
    static readonly ONE_INCH: RoutablePlatform;
    static readonly COW: RoutablePlatform;
    static readonly CURVE: RoutablePlatform;
    /**
     * @deprecated Use {@link RoutablePlatform.COW} instead.
     */
    static readonly GNOSIS_PROTOCOL: RoutablePlatform;
    static readonly UNISWAP: RoutablePlatform;
    static readonly VELODROME: RoutablePlatform;
    static readonly SWAPR_V3: RoutablePlatform;
    static readonly SUSHISWAP: RoutablePlatform;
}
