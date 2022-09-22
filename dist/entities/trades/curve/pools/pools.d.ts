import type { ContractInterface } from '@ethersproject/contracts';
import { ChainId } from '../../../../constants';
import { CurveToken } from '../tokens/types';
export interface CurvePool {
    id: string;
    name: string;
    address: string;
    abi: ContractInterface;
    approveAddress?: string;
    tokens: CurveToken[];
    underlyingTokens?: CurveToken[];
    metaTokens?: CurveToken[];
    riskLevel?: number;
    isMeta?: boolean;
    allowsTradingETH?: boolean;
}
/**
 * xDAI pools
 */
export declare const POOLS_XDAI: CurvePool[];
export declare const POOLS_ARBITRUM_ONE: CurvePool[];
export declare const POOLS_MAINNET: CurvePool[];
export declare const CURVE_POOLS: Record<ChainId, CurvePool[]>;
