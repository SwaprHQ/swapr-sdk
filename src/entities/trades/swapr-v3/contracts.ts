import { Contract } from 'ethers'
import { SWAPR_ALGEBRA_POOL_ABI, SWAPR_ALGEBRA_QUOTER_ABI, SWAPR_ALGEBRA_ROUTER_ABI } from './abi'
import { getProvider } from '../utils'
import { SWAPR_ALGEBRA_CONTRACTS } from './constants'

export function getPoolsContract(pool_address: string) {
  return new Contract(pool_address, SWAPR_ALGEBRA_POOL_ABI, getProvider(100))
}

export function getRouterContract() {
  return new Contract(SWAPR_ALGEBRA_CONTRACTS.router, SWAPR_ALGEBRA_ROUTER_ABI, getProvider(100))
}

export function getQuoterContract() {
  return new Contract(SWAPR_ALGEBRA_CONTRACTS.quoter, SWAPR_ALGEBRA_QUOTER_ABI, getProvider(100))
}
