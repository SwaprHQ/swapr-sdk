import { Interface } from '@ethersproject/abi'
import { Contract } from '@ethersproject/contracts'
import { abi as UNISWAPR_PAIR_ABI } from '@swapr/core/build/IDXswapPair.json'

import MULTICALL2_ABI from '../../../../abis/source/multicall2.json'
import { MULTICALL2_ADDRESS } from '../../../../constants'
import { getProvider } from '../../utils'
import type { Multicall2TryAggregateResult } from '../types'
import { GetUniswapV2PairSwapFeeParams, UniswapV2PairSwapFee } from './types'

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
