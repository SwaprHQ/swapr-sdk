import { defaultAbiCoder } from '@ethersproject/abi'
import { getCreate2Address } from '@ethersproject/address'
import { keccak256 } from '@ethersproject/solidity'
import { Token } from '@uniswap/sdk-core'
import { POOL_INIT_CODE_HASH } from './constants'

export const ADDRESS_ZERO = '0x0000000000000000000000000000000000000000'

/**
 * The default factory enabled fee amounts, denominated in hundredths of bips.
 */
export enum FeeAmount {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
}

/**
 * The default factory tick spacings by fee amount.
 */
export const TICK_SPACINGS: { [amount in FeeAmount]: number } = {
  [FeeAmount.LOW]: 60,
  [FeeAmount.MEDIUM]: 60,
  [FeeAmount.HIGH]: 60,
}

/**
 * This function computes the pool address for a given pair of tokens and a fee tier.
 * It uses the Swapr factory address, the addresses of the two tokens, and the pool initialization code hash.
 * The tokens are sorted before the computation, and the initialization code hash can be manually overridden.
 * @param poolDeployer  This is the address of the factory contract that deploys new pools.
 * @param tokenA The first token of the pair
 * @param tokenB The second token of the pair
 * @param initCodeHashManualOverride Optional manual override for the initialization code hash
 * @returns The computed pool address. This address can then be used to interact with the pool on the blockchain. eg. https://gnosisscan.io/address/0x6a1507579b50abfc7ccc8f9e2b428095b5063538#tokentxns
 */

export function computePoolAddress({
  poolDeployer,
  tokenA,
  tokenB,
  initCodeHashManualOverride,
}: {
  poolDeployer: string
  tokenA: Token
  tokenB: Token
  initCodeHashManualOverride?: string
}): string {
  const [token0, token1] = tokenA.sortsBefore(tokenB) ? [tokenA, tokenB] : [tokenB, tokenA] // does safety checks
  return getCreate2Address(
    poolDeployer,
    keccak256(['bytes'], [defaultAbiCoder.encode(['address', 'address'], [token0.address, token1.address])]),
    initCodeHashManualOverride ?? POOL_INIT_CODE_HASH,
  )
}
