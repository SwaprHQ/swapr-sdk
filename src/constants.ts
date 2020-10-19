import JSBI from 'jsbi'
import { proxies as kovanProxies } from 'dxswap-core/.openzeppelin/kovan.json'
import PERMISSIVE_MULTICALL_ABI from './abis/PermissiveMulticall.json'
import TOKEN_REGISTRY_ABI from './abis/token-registry.json'

// exports for external consumption
export type BigintIsh = JSBI | bigint | string

export enum ChainId {
  MAINNET = 1,
  ROPSTEN = 3,
  RINKEBY = 4,
  GÖRLI = 5,
  KOVAN = 42
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
  [ChainId.MAINNET]: '0x0000000000000000000000000000000000000001',
  [ChainId.ROPSTEN]: '0x0000000000000000000000000000000000000003',
  [ChainId.RINKEBY]: '0x0000000000000000000000000000000000000004',
  [ChainId.GÖRLI]: '0x0000000000000000000000000000000000000005',
  [ChainId.KOVAN]: kovanProxies['dxswap-core/DXswapFactory'][0].address
}

// FIXME: what about other networks?
export const TOKEN_REGISTRY_ADDRESS: { [chainId: number]: string } = {
  [ChainId.MAINNET]: '0x93DB90445B76329e9ed96ECd74e76D8fbf2590d8',
  [ChainId.RINKEBY]: '0x03165DF66d9448E45c2f5137486af3E7e752a352'
}

export const DXSWAP_TOKEN_LIST_ID = 5

export const INIT_CODE_HASH = '0x4e9705def664ab284f8d926dd36c91628cc804185ca7ea83ac2c65d79f51524a'

export const MINIMUM_LIQUIDITY = JSBI.BigInt(1000)

// exports for internal consumption
export const ZERO = JSBI.BigInt(0)
export const ONE = JSBI.BigInt(1)
export const TWO = JSBI.BigInt(2)
export const THREE = JSBI.BigInt(3)
export const FIVE = JSBI.BigInt(5)
export const TEN = JSBI.BigInt(10)
export const _30 = JSBI.BigInt(30)
export const _100 = JSBI.BigInt(100)
export const _1000 = JSBI.BigInt(1000)
export const _10000 = JSBI.BigInt(10000)

export const defaultSwapFee = _30
export const defaultProtocolFeeDenominator = FIVE

export enum SolidityType {
  uint8 = 'uint8',
  uint256 = 'uint256'
}

export const SOLIDITY_TYPE_MAXIMA = {
  [SolidityType.uint8]: JSBI.BigInt('0xff'),
  [SolidityType.uint256]: JSBI.BigInt('0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff')
}

// TODO: add other networks' addresses
const PERMISSIVE_MULTICALL_ADDRESS: { [chainId: number]: string } = {
  [ChainId.MAINNET]: '0x0946f567d0ed891e6566c1da8e5093517f43571d',
  [ChainId.RINKEBY]: '0x798d8ced4dff8f054a5153762187e84751a73344'
}

export { PERMISSIVE_MULTICALL_ABI, TOKEN_REGISTRY_ABI, PERMISSIVE_MULTICALL_ADDRESS }
