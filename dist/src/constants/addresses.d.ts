import { ChainId } from './chains';
/**
 * List of the Swapr Factory contract address for each chain
 */
export declare const FACTORY_ADDRESS: {
    [chainId in ChainId]: string;
};
/**
 * List of the Swapr Router contract address for each chain
 */
export declare const ROUTER_ADDRESS: {
    [chainId in ChainId]: string;
};
/**
 * List of the Swapr Staking Factory contract address for each chain
 */
export declare const STAKING_REWARDS_FACTORY_ADDRESS: {
    [chainId in ChainId]: string;
};
/**
 * List of the Swapr Staking Factory contract address for each chain
 */
export declare const SWPR_CLAIMER_ADDRESS: {
    [chainId in ChainId]: string;
};
/**
 * The Swapr Converter contract address, available on Arbritrum One
 */
export declare const SWPR_CONVERTER_ADDRESS: {
    [chainId in ChainId]: string;
};
/**
 * Multicall2 contract address
 */
export declare const MULTICALL2_ADDRESS: {
    [chainId in ChainId]: string;
};
