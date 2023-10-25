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
export declare const CURVE_POOLS: Record<ChainId, CurvePool[]>;
