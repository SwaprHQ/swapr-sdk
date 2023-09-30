import { ChainId } from '../../../../constants';
import { CurvePool } from '../tokens';
/**
 * xDAI pools
 */
export declare const POOLS_XDAI: CurvePool[];
export declare const POOLS_ARBITRUM_ONE: CurvePool[];
export declare const POOLS_MAINNET: CurvePool[];
export declare const CURVE_FACTORY_SUPPORTED_APIS: {
    [chainId in ChainId]: string;
};
/**
 * @TODO add missing Optimisn and Polygon pools.
 * TBD in https://linear.app/swaprdev/issue/SWA-61/add-curve-pools-and-tokens-for-polygon-and-optimism-in-the-sdk
 */
export declare const CURVE_POOLS: Record<ChainId, CurvePool[]>;
