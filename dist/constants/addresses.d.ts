import { ChainId } from './chains';
/**
 * List of the Swapr Factory contract address for each chain
 */
export declare const FACTORY_ADDRESS: Record<ChainId, string>;
/**
 * List of the Swapr Router contract address for each chain
 */
export declare const ROUTER_ADDRESS: Record<ChainId, string>;
/**
 * List of the Swapr Staking Factory contract address for each chain
 */
export declare const STAKING_REWARDS_FACTORY_ADDRESS: Record<ChainId, string>;
/**
 * List of the Swapr Staking Factory contract address for each chain
 */
export declare const SWPR_CLAIMER_ADDRESS: Record<ChainId, string>;
/**
 * The Swapr Converter contract address, available on Arbritrum One
 */
export declare const SWPR_CONVERTER_ADDRESS: Record<ChainId, string>;
/**
 * Multicall2 contract address
 * NOTE: this is an external repository not maintained by any entity funded or directed by MakerDAO governance.
 * @see https://github.com/mds1/multicall/blob/main/deployments.json to check
 * MakerDAO's fork from https://github.com/makerdao/multicall
 */
export declare const MULTICALL2_ADDRESS: Record<ChainId, string>;
