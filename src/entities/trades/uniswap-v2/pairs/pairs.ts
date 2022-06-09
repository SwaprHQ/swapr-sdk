import { Interface } from '@ethersproject/abi'
import { Contract } from '@ethersproject/contracts'
import { parseUnits } from '@ethersproject/units'
import { abi as UNISWAPR_PAIR_ABI } from '@swapr/core/build/IDXswapPair.json'
import { GraphQLClient } from 'graphql-request'
import flatMap from 'lodash.flatmap'

import MULTICALL2_ABI from '../../../../abis/source/multicall2.json'
import { MULTICALL2_ADDRESS } from '../../../../constants'
import { getSdk } from '../../../../generated/graphql'
import { TokenAmount } from '../../../fractions'
import { Pair } from '../../../pair'
import { Token } from '../../../token'
import { getProvider, wrappedCurrency } from '../../utils'
import { BASES_TO_CHECK_TRADES_AGAINST } from '../constants'
import type { Multicall2TryAggregateResult } from '../types'
import { getUniswapV2PairSwapFee } from './fees'
import { GetAllCommonUniswapV2Pairs, GetAllCommonUniswapV2PairsFromSubgraphParams } from './types'

/**
 * Fetches all pairs through which the given tokens can be traded. Use `getAllCommonPairsFromSubgraph` for better results.
 * @returns the pair list
 */
export async function getAllCommonUniswapV2Pairs({
  currencyA,
  currencyB,
  platform,
  provider,
}: GetAllCommonUniswapV2Pairs): Promise<Pair[]> {
  const chainId = (currencyA as Token).chainId ?? (currencyB as Token).chainId
  // Get a provider if one isn't provided
  provider = provider ?? getProvider(chainId)

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
  const multicallContract = new Contract(MULTICALL2_ADDRESS[chainId], MULTICALL2_ABI, provider)

  const uniswapPairInterface = new Interface(UNISWAPR_PAIR_ABI)

  const callData = uniswapPairInterface.encodeFunctionData('getReserves', [])

  const getReservesCallResults = (await multicallContract.callStatic.tryAggregate(
    false,
    pairAddressList.map((target) => ({ target, callData }))
  )) as Multicall2TryAggregateResult[]

  // Get the fees
  const pairSwapFeeList = await getUniswapV2PairSwapFee({
    pairAddressList,
    chainId,
  })

  const pairList = await Promise.all(
    getReservesCallResults.map(async ({ success, returnData }, i) => {
      if (!success) return undefined

      let pair: Pair | undefined

      try {
        const pairAddress = pairAddressList[i]
        // decode the return data
        const reserves = uniswapPairInterface.decodeFunctionResult('getReserves', returnData)

        const [tokenA, tokenB] = allPairCombinations[i]
        const [token0, token1] = tokenA.sortsBefore(tokenB) ? [tokenA, tokenB] : [tokenB, tokenA]
        const { reserve0, reserve1 } = reserves

        // fetch the swap fee
        const swapFee =
          pairSwapFeeList.find((p) => p.pairAddress.toLowerCase() === pairAddress.toLowerCase())?.swapFee ||
          platform.defaultSwapFee

        pair = new Pair(
          new TokenAmount(token0, reserve0.toString()),
          new TokenAmount(token1, reserve1.toString()),
          swapFee?.toString() || platform.defaultSwapFee,
          BigInt(0),
          platform
        )
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

/**
 *
 */
export async function getAllCommonUniswapV2PairsFromSubgraph({
  currencyA,
  currencyB,
  platform,
}: GetAllCommonUniswapV2PairsFromSubgraphParams): Promise<Pair[]> {
  const chainId = (currencyA as Token).chainId ?? (currencyB as Token).chainId
  const subgraphEndpoint = platform.subgraphEndpoint[chainId]

  if (!subgraphEndpoint) {
    throw new Error(`No subgraph endpoint for chainId ${chainId}`)
  }

  const results = await getSdk(new GraphQLClient(subgraphEndpoint)).GetAllCommonPairsBetweenTokenAAndTokenB({
    tokenA: currencyA.address?.toLowerCase() as string,
    tokenB: currencyB.address?.toLowerCase() as string,
  })

  const pairListWithDuplicates = [...results.pairsWithTokenA, ...results.pairsWithTokenB]

  // Remove duplicate pairs
  const pairList = pairListWithDuplicates.filter((pair, index, self) => {
    return self.findIndex((p) => p.id.toLowerCase() === pair.id.toLowerCase()) === index
  })

  // Fetch the swap fees for all pairs from the chain
  const pairSwapFeeList = await getUniswapV2PairSwapFee({
    pairAddressList: pairList.map((pair) => pair.id),
    chainId,
  })

  return pairList.map((pair) => {
    const token0 = new Token(chainId, pair.token0.id, pair.token0.decimals, pair.token0.symbol, pair.token0.name)
    const token1 = new Token(chainId, pair.token1.id, pair.token1.decimals, pair.token1.symbol, pair.token1.name)
    const swapFee =
      pairSwapFeeList.find(({ pairAddress }) => pairAddress.toLowerCase() === pair.id.toLowerCase())?.swapFee ||
      platform.defaultSwapFee

    return new Pair(
      new TokenAmount(token0, parseUnits(pair.reserve0, token0.decimals).toString()),
      new TokenAmount(token1, parseUnits(pair.reserve1, token1.decimals).toString()),
      swapFee.toString(),
      BigInt(0),
      platform
    )
  })
}
