import { ChainId } from '../../../constants/chains'

export const ZEROX_API_URL: Record<ChainId, string> = {
  [ChainId.MAINNET]: 'https://api.0x.org/',
  [ChainId.RINKEBY]: '',
  [ChainId.ARBITRUM_ONE]: 'https://arbitrum.api.0x.org/',
  [ChainId.ARBITRUM_RINKEBY]: '',
  [ChainId.ARBITRUM_GOERLI]: '',
  [ChainId.XDAI]: '',
  [ChainId.POLYGON]: 'https://polygon.api.0x.org/',
  [ChainId.GOERLI]: '',
  [ChainId.OPTIMISM_MAINNET]: 'https://optimism.api.0x.org/',
  [ChainId.OPTIMISM_GOERLI]: '',
  [ChainId.BSC_MAINNET]: 'https://bsc.api.0x.org/',
  [ChainId.BSC_TESTNET]: '',
}
