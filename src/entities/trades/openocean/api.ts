import { ChainId } from '../../../constants'

export const OO_API_BASE_URL = 'https://open-api.openocean.finance/v3'

export enum OO_API_ENDPOINTS {
  GET_GAS = '/gasPrice',
  QUOTE = '/quote',
  SWAP_QUOTE = '/swap_quote',
}

export type MainnetChainIds = Exclude<
  ChainId,
  | ChainId.ARBITRUM_GOERLI
  | ChainId.ARBITRUM_RINKEBY
  | ChainId.BSC_TESTNET
  | ChainId.GOERLI
  | ChainId.OPTIMISM_GOERLI
  | ChainId.ZK_SYNC_ERA_TESTNET
  | ChainId.RINKEBY
>

/**
 * @see https://docs.openocean.finance/dev/supported-chains
 */
const OO_API_CHAIN_CODE = {
  [ChainId.ARBITRUM_ONE]: 'arbitrum',
  [ChainId.BSC_MAINNET]: 'bsc',
  [ChainId.GNOSIS]: 'xdai',
  [ChainId.MAINNET]: 'eth',
  [ChainId.OPTIMISM_MAINNET]: 'optimism',
  [ChainId.POLYGON]: 'polygon',
  [ChainId.SCROLL_MAINNET]: 'scroll',
  [ChainId.ZK_SYNC_ERA_MAINNET]: 'zksync',
}

export const getApiChainCode = (chainId: MainnetChainIds) => OO_API_CHAIN_CODE[chainId]
