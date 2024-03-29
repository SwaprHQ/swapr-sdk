import { ChainId } from '../../../constants/chains'

/**
 * For API endpoints reference,
 * @see https://0x.org/docs/introduction/0x-cheat-sheet
 */
export const ZEROX_API_URL: Record<ChainId, string> = {
  [ChainId.ARBITRUM_GOERLI]: '',
  [ChainId.ARBITRUM_ONE]: 'https://arbitrum.api.0x.org/',
  [ChainId.ARBITRUM_RINKEBY]: '',
  [ChainId.BSC_MAINNET]: 'https://bsc.api.0x.org/',
  [ChainId.BSC_TESTNET]: '',
  [ChainId.GOERLI]: 'https://goerli.api.0x.org/',
  [ChainId.MAINNET]: 'https://api.0x.org/',
  [ChainId.OPTIMISM_GOERLI]: '',
  [ChainId.OPTIMISM_MAINNET]: 'https://optimism.api.0x.org/',
  [ChainId.POLYGON]: 'https://polygon.api.0x.org/',
  [ChainId.RINKEBY]: '',
  [ChainId.SCROLL_MAINNET]: '',
  [ChainId.XDAI]: '',
  [ChainId.ZK_SYNC_ERA_MAINNET]: '',
  [ChainId.ZK_SYNC_ERA_TESTNET]: '',
}

//buyTOkenPercetageFee value
export const ZERO_OX_REFFERER_FEE = '0' //MIN-> 0. MAX-> 1 percent
