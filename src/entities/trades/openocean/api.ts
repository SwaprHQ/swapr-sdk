import { ChainId } from '../../../constants'

export const OO_API_BASE_URL = 'https://open-api.openocean.finance/v3'
// export const OO_API_BASE_URL = 'https://ethapi.openocean.finance/v2'

export enum OO_API_ENDPOINTS {
  GET_GAS = 'gasPrice',
  GAS_PRICE = 'gas-price',
  QUOTE = 'quote',
  SWAP_QUOTE = 'swap_quote',
  SWAP = 'swap',
}

export type TestChainIds =
  | ChainId.ARBITRUM_GOERLI
  | ChainId.ARBITRUM_RINKEBY
  | ChainId.BSC_TESTNET
  | ChainId.GOERLI
  | ChainId.OPTIMISM_GOERLI
  | ChainId.ZK_SYNC_ERA_TESTNET
  | ChainId.RINKEBY

export type MainnetChainIds = Exclude<ChainId, TestChainIds>

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

export const getBaseUrlWithChainCode = (chainId: MainnetChainIds) => {
  const API_CHAIN_CODE = OO_API_CHAIN_CODE[chainId]
  // return `${OO_API_BASE_URL}/${chainId}`

  return `${OO_API_BASE_URL}/${API_CHAIN_CODE}`
}
