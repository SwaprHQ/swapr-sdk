// ABIs

import { ContractInterface } from '@ethersproject/contracts'
import { poolMethods } from './common'

// 3pool ABI which has USDC, USDT and WXDAI
export const CURVE_3POOL_ABI: ContractInterface = [
  poolMethods['view']['fee'],
  poolMethods['view']['get_dy(int128,int128,uint256)'],
  poolMethods['nonpayable']['exchange(int128,int128,uint256,uint256)'],
]

// 3pool ABI which has USDC, USDT and WXDAI
export const CURVE_EURSPOOL_ABI: ContractInterface = [
  poolMethods['view']['fee'],
  poolMethods['view']['get_dy(uint256,uint256,uint256)'],
  poolMethods['nonpayable']['exchange(int128,int128,uint256,uint256)'],
]

export const CURVE_CRYPTO_SWAP_ABI = [
  poolMethods['view']['fee'],
  poolMethods['view']['get_dy_underlying(uint256,uint256,uint256)'],
  poolMethods['nonpayable']['exchange_underlying(uint256,uint256,uint256,uint256)'],
  poolMethods['nonpayable']['exchange_underlying(uint256,uint256,uint256,uint256,address)'],
]

export const CURVE_WETH_ERC20_POOL_ABI: ContractInterface = [
  poolMethods['view']['fee'],
  poolMethods['view']['get_dy(uint256,uint256,uint256)'],
  poolMethods['payable']['exchange(uint256,uint256,uint256,uint256)'],
  poolMethods['payable']['exchange(uint256,uint256,uint256,uint256,bool)'],
  poolMethods['payable']['exchange(uint256,uint256,uint256,uint256,bool,address)'],
  poolMethods['payable']['exchange_underlying(uint256,uint256,uint256,uint256)'],
  poolMethods['payable']['exchange_underlying(uint256,uint256,uint256,uint256,address)'],
]

export const CURVE_ETHXERC20_ABI: ContractInterface = [
  poolMethods['view']['fee'],
  poolMethods['view']['get_dy(int128,int128,uint256)'],
  poolMethods['payable']['exchange(int128,int128,uint256,uint256)'],
]

export const CURVE_ETHXERC20_256_ABI: ContractInterface = [
  poolMethods['view']['fee'],
  poolMethods['view']['get_dy(uint256,uint256,uint256)'],
  poolMethods['payable']['exchange(uint256,uint256,uint256,uint256)'],
  poolMethods['payable']['exchange(uint256,uint256,uint256,uint256,bool)'],
  poolMethods['payable']['exchange_underlying(uint256,uint256,uint256,uint256)'],
]
