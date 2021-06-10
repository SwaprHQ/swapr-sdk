import JSBI from 'jsbi'
import MULTICALL_ABI from './abis/multicall.json'
import STAKING_REWARDS_FACTORY_ABI from './abis/staking-rewards-distribution-factory.json'
import STAKING_REWARDS_DISTRIBUTION_ABI from './abis/staking-rewards-distribution.json'
import {
  rinkeby as coreRinkeby,
  mainnet as coreMainnet,
  arbitrum as coreArbitrum,
  xdai as coreXDai
} from 'dxswap-core/.contracts.json'
import {
  rinkeby as peripheryRinkeby,
  mainnet as peripheryMainnet,
  arbitrum as peripheryArbitrum,
  xdai as peripheryXDai
} from 'dxswap-periphery/.contracts.json'

// exports for external consumption
export type BigintIsh = JSBI | bigint | string

export enum ChainId {
  MAINNET = 1,
  RINKEBY = 4,
  XDAI = 100,
  ARBITRUM = 42161
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
  [ChainId.ARBITRUM]: coreArbitrum.factory,
  [ChainId.XDAI]: coreXDai.factory
}

export const ROUTER_ADDRESS: { [chainId in ChainId]?: string } = {
  [ChainId.RINKEBY]: peripheryRinkeby.router,
  [ChainId.MAINNET]: peripheryMainnet.router,
  [ChainId.XDAI]: peripheryXDai.router,
  [ChainId.ARBITRUM]: peripheryArbitrum.router
}

export const STAKING_REWARDS_FACTORY_ADDRESS: { [chainId: number]: string } = {
  [ChainId.MAINNET]: '0x0000000000000000000000000000000000001234',
  [ChainId.RINKEBY]: '0x163a3640Ce993A0b4c11885a6D4dAc16DFC188e1',
  [ChainId.XDAI]: '0xCD2A45F36464FdB1065160e03A2353996Ea8Ff57',
  [ChainId.ARBITRUM]: '0x0000000000000000000000000000000000001234'
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

const MULTICALL_ADDRESS: { [chainId: number]: string } = {
  [ChainId.MAINNET]: '0x5ba1e12693dc8f9c48aad8770482f4739beed696',
  [ChainId.RINKEBY]: '0x5ba1e12693dc8f9c48aad8770482f4739beed696',
  [ChainId.ARBITRUM]: '0xF718F2bd590E5621e53f7b89398e52f7Acced8ca',
  [ChainId.XDAI]: '0x5ba1e12693dc8f9c48aad8770482f4739beed696'
}

export { MULTICALL_ABI, MULTICALL_ADDRESS, STAKING_REWARDS_FACTORY_ABI, STAKING_REWARDS_DISTRIBUTION_ABI }
