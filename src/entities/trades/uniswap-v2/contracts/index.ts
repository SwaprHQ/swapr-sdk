import { abi as UNISWAPR_PAIR_ABI } from '@swapr/core/build/IDXswapPair.json'
import { Contract } from '@ethersproject/contracts'
import flatMap from 'lodash.flatmap'

import type { Currency } from '../../../currency'
import { wrappedCurrency } from '../../utils'
import { Pair } from '../../../pair'
import { ChainId, MULTICALL2_ABI, MULTICALL2_ADDRESS } from '../../../../constants'
import { UniswapV2RoutablePlatform } from '../../routable-platform/uniswap-v2-routable-platform'
import { Interface } from '@ethersproject/abi'
import { getProvider } from '../../curve/contracts/utils'
import { Token } from '../../../../entities/token'
import { TokenAmount } from '../../../../entities/fractions'
import { BASES_TO_CHECK_TRADES_AGAINST } from '../constants'

import type { Multicall2TryAggregateResult } from '../types'
import { createCacheList } from '../cache'

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
export async function getUniswapPairSwapFee(pairAddress: string, chainId: ChainId, expiresIn = 3600): Promise<number> {
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
 * Fetches all pairs through which the given tokens can be traded.
 * @param currencyA The first currency
 * @param currencyB The second currency
 * @param platform The platform to use
 * @returns
 */
export async function getAllCommonPairs(
  currencyA: Currency,
  currencyB: Currency,
  platform: UniswapV2RoutablePlatform = UniswapV2RoutablePlatform.SWAPR
): Promise<Pair[]> {
  const chainId = (currencyA as Token).chainId ?? (currencyB as Token).chainId
  const bases: Token[] = BASES_TO_CHECK_TRADES_AGAINST[chainId] ?? []

  const [tokenA, tokenB] = [wrappedCurrency(currencyA, chainId), wrappedCurrency(currencyB, chainId)]

  const basePairs: [Token, Token][] = flatMap(bases, (base): [Token, Token][] =>
    bases.map((otherBase) => [base, otherBase])
  ).filter(([t0, t1]) => t0.address !== t1.address)

  const allPairCombinations: [Token, Token][] = [
    // the direct pair
    [tokenA, tokenB],
    // token A against all bases
    ...bases.map((base): [Token, Token] => [tokenA, base]),
    // token B against all bases
    ...bases.map((base): [Token, Token] => [tokenB, base]),
    // each base against all bases
    ...basePairs,
  ]
    .filter((tokens): tokens is [Token, Token] => Boolean(tokens[0] && tokens[1]))
    .filter(([t0, t1]) => t0.address !== t1.address)

  // Compute the pair addresses
  const pairAddressList = allPairCombinations.reduce<string[]>((list, [tokenA, tokenB]) => {
    if (tokenA && tokenB && !tokenA.equals(tokenB) && chainId && platform.supportsChain(chainId)) {
      list.push(Pair.getAddress(tokenA, tokenB, platform))
    }
    return list
  }, [])

  // Fetch the pair reserves via multicall
  const multicallContract = new Contract(MULTICALL2_ADDRESS[chainId], MULTICALL2_ABI, getProvider(chainId))

  const uniswapPairInterface = new Interface(UNISWAPR_PAIR_ABI)

  const callData = uniswapPairInterface.encodeFunctionData('getReserves', [])

  const getReservesCallResults = (await multicallContract.callStatic.tryAggregate(
    false,
    pairAddressList.map((target) => ({ target, callData }))
  )) as Multicall2TryAggregateResult[]

  const pairList = await Promise.all(
    getReservesCallResults.map(async ({ success, returnData }, i) => {
      if (!success) return undefined

      let pair: Pair | undefined

      try {
        // decode the return data
        const reserves = uniswapPairInterface.decodeFunctionResult('getReserves', returnData)

        const [tokenA, tokenB] = allPairCombinations[i]
        const [token0, token1] = tokenA.sortsBefore(tokenB) ? [tokenA, tokenB] : [tokenB, tokenA]
        const { reserve0, reserve1 } = reserves

        // fetch the swap fee
        const swapFee = await getUniswapPairSwapFee(pairAddressList[i], chainId).catch(() => undefined)

        pair = new Pair(
          new TokenAmount(token0, reserve0.toString()),
          new TokenAmount(token1, reserve1.toString()),
          swapFee?.toString() || platform.defaultSwapFee,
          BigInt(0),
          platform
        )

        pair.liquidityToken
      } catch (error) {
        // ignore errors
      }

      return pair
    })
  )

  return pairList.reduce<Pair[]>((list, pair) => {
    // Remove undefined and duplicate pairs
    if (pair !== undefined && !list.some((p) => p.equals(pair))) {
      list.push(pair)
    }

    return list
  }, [])
}
