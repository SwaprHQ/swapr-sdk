import { ChainId } from '../../../../constants';
export declare type GeneralCacheList<T = any> = Record<ChainId, Map<string, T>>;
/**
 * Creates a cache list for a given type.
 */
export declare function createCacheList<T = any>(): GeneralCacheList<T>;
