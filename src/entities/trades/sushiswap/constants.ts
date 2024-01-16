import { ChainId } from '../../../constants'

// v3
export const ROUTE_PROCESSOR_3_SUPPORTED_CHAIN_IDS = [
  ChainId.ARBITRUM_ONE,
  ChainId.BSC_MAINNET,
  ChainId.GNOSIS,
  ChainId.MAINNET,
  ChainId.OPTIMISM_MAINNET,
  ChainId.POLYGON,
] as const
export type RouteProcessor3ChainId = (typeof ROUTE_PROCESSOR_3_SUPPORTED_CHAIN_IDS)[number]
export const ROUTE_PROCESSOR_3_ADDRESS: Record<RouteProcessor3ChainId, `0x${string}`> = {
  [ChainId.ARBITRUM_ONE]: '0xfc506AaA1340b4dedFfd88bE278bEe058952D674',
  [ChainId.BSC_MAINNET]: '0x400d75dAb26bBc18D163AEA3e83D9Ea68F6c1804',
  [ChainId.GNOSIS]: '0xBBDe1d67297329148Fe1ED5e6B00114842728e65',
  [ChainId.MAINNET]: '0x827179dD56d07A7eeA32e3873493835da2866976',
  [ChainId.OPTIMISM_MAINNET]: '0x4C5D5234f232BD2D76B96aA33F5AE4FCF0E4BFAb',
  [ChainId.POLYGON]: '0x0a6e511Fe663827b9cA7e2D2542b20B37fC217A6',
} as const
export const isRouteProcessor3ChainId = (chainId: ChainId): chainId is RouteProcessor3ChainId =>
  ROUTE_PROCESSOR_3_SUPPORTED_CHAIN_IDS.includes(chainId as RouteProcessor3ChainId)

// v3.1
export const ROUTE_PROCESSOR_3_1_SUPPORTED_CHAIN_IDS = [ChainId.ARBITRUM_ONE, ChainId.MAINNET, ChainId.POLYGON] as const
export type RouteProcessor3_1ChainId = (typeof ROUTE_PROCESSOR_3_1_SUPPORTED_CHAIN_IDS)[number]
export const ROUTE_PROCESSOR_3_1_ADDRESS: Record<RouteProcessor3_1ChainId, `0x${string}`> = {
  [ChainId.ARBITRUM_ONE]: '0x3c1fBA3bCEE7CE410B155a8C71F9fF1312852C82',
  [ChainId.MAINNET]: '0x8516944E89f296eb6473d79aED1Ba12088016c9e',
  [ChainId.POLYGON]: '0x9cfEAdcC38377283aDB944205c5238d04d4dD8A1',
} as const
export const isRouteProcessor3_1ChainId = (chainId: ChainId): chainId is RouteProcessor3_1ChainId =>
  ROUTE_PROCESSOR_3_1_SUPPORTED_CHAIN_IDS.includes(chainId as RouteProcessor3_1ChainId)

// v3.2
export const ROUTE_PROCESSOR_3_2_SUPPORTED_CHAIN_IDS = [
  ChainId.ARBITRUM_ONE,
  ChainId.BSC_MAINNET,
  ChainId.GNOSIS,
  ChainId.MAINNET,
  ChainId.OPTIMISM_MAINNET,
  ChainId.POLYGON,
] as const

export type RouteProcessor3_2ChainId = (typeof ROUTE_PROCESSOR_3_2_SUPPORTED_CHAIN_IDS)[number]

export const ROUTE_PROCESSOR_3_2_ADDRESS: Record<RouteProcessor3_2ChainId, `0x${string}`> = {
  [ChainId.ARBITRUM_ONE]: '0x09bD2A33c47746fF03b86BCe4E885D03C74a8E8C',
  [ChainId.BSC_MAINNET]: '0xd36990D74b947eC4Ad9f52Fe3D49d14AdDB51E44',
  [ChainId.GNOSIS]: '0x7A4af156379f512DE147ed3b96393047226d923F',
  [ChainId.MAINNET]: '0x5550D13389bB70F45fCeF58f19f6b6e87F6e747d',
  [ChainId.OPTIMISM_MAINNET]: '0xEb94EcA012eC0bbB254722FdDa2CE7475875A52B',
  [ChainId.POLYGON]: '0xE7eb31f23A5BefEEFf76dbD2ED6AdC822568a5d2',
} as const

export const isRouteProcessor3_2ChainId = (chainId: ChainId): chainId is RouteProcessor3_2ChainId =>
  ROUTE_PROCESSOR_3_2_SUPPORTED_CHAIN_IDS.includes(chainId as RouteProcessor3_2ChainId)
