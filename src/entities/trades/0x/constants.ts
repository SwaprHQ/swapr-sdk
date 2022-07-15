import { ChainId } from '../../../constants/chains'

/**
 * Platforms names
 */
export const CODE_TO_PLATFORM_NAME: { [apiName: string]: string } = {
  Uniswap_V2: 'Uniswap v2',
  'Liquidity provider': 'LP',
  Balancer_V2: 'Balancer v2',
  DODO_V2: 'Dodo v2',
  Uniswap_V3: 'Uniswap v3',
  PancakeSwap_V2: 'PancakeSwap v2', // shouldn't be used since it's on BSC, but added to be extra sure
}

export const ZEROX_API_URL: Record<ChainId, string> = {
  [ChainId.MAINNET]: 'https://api.0x.org/',
  [ChainId.RINKEBY]: '',
  [ChainId.ARBITRUM_ONE]: '',
  [ChainId.ARBITRUM_RINKEBY]: '',
  [ChainId.XDAI]: '',
  [ChainId.POLYGON]: 'https://polygon.api.0x.org/',
  [ChainId.GOERLI]: '',
}
