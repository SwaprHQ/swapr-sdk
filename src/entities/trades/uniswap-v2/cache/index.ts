import { ChainId } from '../../../../constants'

export type GeneralCacheList<T = any> = Record<ChainId, Map<string, T>>

/**
 * Creates a cache list for a given type.
 */
export function createCacheList<T = any>(): GeneralCacheList<T> {
  return {
    [ChainId.MAINNET]: new Map(),
    [ChainId.ARBITRUM_ONE]: new Map(),
    [ChainId.XDAI]: new Map(),
    [ChainId.RINKEBY]: new Map(),
    [ChainId.ARBITRUM_RINKEBY]: new Map(),
    [ChainId.ARBITRUM_GOERLI]: new Map(),
    [ChainId.POLYGON]: new Map(),
    [ChainId.GOERLI]: new Map(),
    [ChainId.OPTIMISM_MAINNET]: new Map(),
    [ChainId.OPTIMISM_GOERLI]: new Map(),
  }
}
