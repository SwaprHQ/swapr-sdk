import { Interface } from '@ethersproject/abi'
import { Contract } from '@ethersproject/contracts'
import { abi as UNISWAPR_PAIR_ABI } from '@swapr/core/build/IDXswapPair.json'

import MULTICALL2_ABI from '../../../../abis/source/multicall2.json'
import { ChainId, MULTICALL2_ADDRESS } from '../../../../constants'
import { getProvider } from '../../utils'
import { createCacheList } from '../cache'
import type { Multicall2TryAggregateResult } from '../types'
import { GetUniswapV2PairSwapFeeParams, UniswapV2PairSwapFee } from './types'

/**
 * Cache for the UniswapV2 pair fee
 */
export const uniswapV2PairFeeCache = createCacheList<{
  expiresAt: number
  data: number
}>()

/**
 * Fetches the pair fee from the contract or cache if it's already been fetched.
 * @param pairAddress the address of the pair
 * @param chainId the chain id of the pair
 * @param expiresIn the time in seconds until the cache expires
 * @returns the pair fee in basis points
 */
export async function getUniswapV2PairSwapFeeWithCache(
  pairAddress: string,
  chainId: ChainId,
  expiresIn = 3600
): Promise<number> {
  // Return the fee from the cache if it exists
  const swapFeeFromCache = uniswapV2PairFeeCache[chainId].get(pairAddress)

  // If the fee is in the cache, return it
  if (swapFeeFromCache && swapFeeFromCache.expiresAt < Date.now()) {
    return swapFeeFromCache.data
  }

  const pairContract = new Contract(pairAddress, UNISWAPR_PAIR_ABI, getProvider(chainId))
  const swapFee = (await pairContract.swapFee()) as number

  // Cache and return the fee
  uniswapV2PairFeeCache[chainId].set(pairAddress, {
    expiresAt: Date.now() + expiresIn * 1000,
    data: swapFee,
  })

  return swapFee
}

/**
 * Given a list of UniswapV2 pair address, it fetches pair fee from the contract via multicall contract
 * @returns the list of pair fee in basis points
 */
export async function getUniswapV2PairSwapFee({
  pairAddressList,
  chainId,
  provider,
}: GetUniswapV2PairSwapFeeParams): Promise<UniswapV2PairSwapFee[]> {
  provider = provider || getProvider(chainId)

  // Fetch the pair reserves via multicall
  const multicallContract = new Contract(MULTICALL2_ADDRESS[chainId], MULTICALL2_ABI, provider)

  const uniswapPairInterface = new Interface(UNISWAPR_PAIR_ABI)

  const callData = uniswapPairInterface.encodeFunctionData('swapFee', [])

  const getReservesCallResults = (await multicallContract.callStatic.tryAggregate(
    false,
    pairAddressList.map((target) => ({ target, callData }))
  )) as Multicall2TryAggregateResult[]

  // Map the call results to the pair addresses
  return pairAddressList.reduce<UniswapV2PairSwapFee[]>((acc, pairAddress, index) => {
    const { returnData, success } = getReservesCallResults[index]

    // Push only the successful call results
    if (success) {
      const { swapFee } = uniswapPairInterface.decodeFunctionResult('swapFee', returnData)
      // Cache and return the fee
      acc.push({
        pairAddress,
        swapFee,
      })
    }

    return acc
  }, [])
}
