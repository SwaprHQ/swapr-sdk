import JSBI from 'jsbi'
import PERMISSIVE_MULTICALL_ABI from './abis/PermissiveMulticall.json'
import STAKING_REWARDS_FACTORY_ABI from './abis/staking-rewards-distribution-factory.json'
import STAKING_REWARDS_DISTRIBUTION_ABI from './abis/staking-rewards-distribution.json'
import TOKEN_REGISTRY_ABI from './abis/token-registry.json'
import {
  rinkeby as coreRinkeby,
  mainnet as coreMainnet,
  arbitrumTestnetV3 as coreArbitrumTestnetV3,
  sokol as coreSokol,
  xdai as coreXDai
} from 'dxswap-core/.contracts.json'
import {
  rinkeby as peripheryRinkeby,
  mainnet as peripheryMainnet,
  arbitrumTestnetV3 as peripheryArbitrumTestnetV3,
  sokol as peripherySokol,
  xdai as peripheryXDai
} from 'dxswap-periphery/.contracts.json'

// exports for external consumption
export type BigintIsh = JSBI | bigint | string

export enum ChainId {
  MAINNET = 1,
  RINKEBY = 4,
  ARBITRUM_TESTNET_V3 = 79377087078960,
  SOKOL = 77,
  XDAI = 100
}

export enum TradeType {
  EXACT_INPUT,
  EXACT_OUTPUT
}

export enum Rounding {
  ROUND_DOWN,
  ROUND_HALF_UP,
  ROUND_UP
}

export const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'

export const FACTORY_ADDRESS: { [chainId: number]: string } = {
  [ChainId.MAINNET]: coreMainnet.factory,
  [ChainId.RINKEBY]: coreRinkeby.factory,
  [ChainId.ARBITRUM_TESTNET_V3]: coreArbitrumTestnetV3.factory,
  [ChainId.SOKOL]: coreSokol.factory,
  [ChainId.XDAI]: coreXDai.factory
}

export const ROUTER_ADDRESS: { [chainId in ChainId]?: string } = {
  [ChainId.RINKEBY]: peripheryRinkeby.router,
  [ChainId.MAINNET]: peripheryMainnet.router,
  [ChainId.ARBITRUM_TESTNET_V3]: peripheryArbitrumTestnetV3.router,
  [ChainId.SOKOL]: peripherySokol.router,
  [ChainId.XDAI]: peripheryXDai.router
}

export const STAKING_REWARDS_FACTORY_ADDRESS: { [chainId: number]: string } = {
  [ChainId.MAINNET]: '0x0000000000000000000000000000000000001234',
  [ChainId.RINKEBY]: '0x6384c36BB2661b40E92996d07447e04F6c393233',
  [ChainId.ARBITRUM_TESTNET_V3]: '0xB95Ad562EDE8DD78BBFC287fA18150e802b09D9F',
  [ChainId.SOKOL]: '0xD436e756Cf41318ADeC62E8dCbEF2608753Ae068',
  [ChainId.XDAI]: '0xCD2A45F36464FdB1065160e03A2353996Ea8Ff57'
}

export const TOKEN_REGISTRY_ADDRESS: { [chainId: number]: string } = {
  [ChainId.MAINNET]: '0x93DB90445B76329e9ed96ECd74e76D8fbf2590d8',
  [ChainId.RINKEBY]: '0x815d1b18f6baaeb3853b0f637475a5c2b28e2253',
  [ChainId.ARBITRUM_TESTNET_V3]: '0x9d6f6d86b81289e40e07fcda805c06f6e9b8f629',
  [ChainId.SOKOL]: '0x681c3836a5589b933062ACA4fd846c1287a2865F',
  [ChainId.XDAI]: '0x85E001DfFF16F388Bc32Cd18009ceDF8F9b62C9E'
}

export const DXSWAP_TOKEN_LIST_ID: { [chainId: number]: number } = {
  [ChainId.MAINNET]: 1,
  [ChainId.RINKEBY]: 1,
  [ChainId.ARBITRUM_TESTNET_V3]: 1,
  [ChainId.SOKOL]: 1,
  [ChainId.XDAI]: 5
}

export const INIT_CODE_HASH = '0xd306a548755b9295ee49cc729e13ca4a45e00199bbd890fa146da43a50571776'

export const MINIMUM_LIQUIDITY = JSBI.BigInt(1000)

// exports for internal consumption
export const ZERO = JSBI.BigInt(0)
export const ONE = JSBI.BigInt(1)
export const TWO = JSBI.BigInt(2)
export const THREE = JSBI.BigInt(3)
export const FIVE = JSBI.BigInt(5)
export const TEN = JSBI.BigInt(10)
export const _25 = JSBI.BigInt(25)
export const SECONDS_IN_YEAR = JSBI.BigInt(31536000)
export const _30 = JSBI.BigInt(30)
export const _100 = JSBI.BigInt(100)
export const _1000 = JSBI.BigInt(1000)
export const _10000 = JSBI.BigInt(10000)

export const defaultSwapFee = _25
export const defaultProtocolFeeDenominator = FIVE

export enum SolidityType {
  uint8 = 'uint8',
  uint256 = 'uint256'
}

export const SOLIDITY_TYPE_MAXIMA = {
  [SolidityType.uint8]: JSBI.BigInt('0xff'),
  [SolidityType.uint256]: JSBI.BigInt('0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff')
}

const PERMISSIVE_MULTICALL_ADDRESS: { [chainId: number]: string } = {
  [ChainId.MAINNET]: '0x0946f567d0ed891e6566c1da8e5093517f43571d',
  [ChainId.RINKEBY]: '0x798d8ced4dff8f054a5153762187e84751a73344',
  [ChainId.ARBITRUM_TESTNET_V3]: '0x73a08DC74eF4ed2c360199244bb69F1464204E7C',
  [ChainId.SOKOL]: '0x4D97Bd8eFaCf46b33c4438Ed0B7B6AABfa2359FB',
  [ChainId.XDAI]: '0x4E75068ED2338fCa56631E740B0723A6dbc1d5CD'
}

export {
  PERMISSIVE_MULTICALL_ABI,
  TOKEN_REGISTRY_ABI,
  PERMISSIVE_MULTICALL_ADDRESS,
  STAKING_REWARDS_FACTORY_ABI,
  STAKING_REWARDS_DISTRIBUTION_ABI
}
