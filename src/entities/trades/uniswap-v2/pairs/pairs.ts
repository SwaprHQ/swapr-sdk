import { Interface } from '@ethersproject/abi'
import { Contract } from '@ethersproject/contracts'
import { parseUnits } from '@ethersproject/units'
import { abi as UNISWAPR_PAIR_ABI } from '@swapr/core/build/IDXswapPair.json'
import debug from 'debug'
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

const getAllCommonUniswapV2PairsDebug = debug('ecoRouter:uniswap:getAllCommonUniswapV2Pairs')

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
  // Return value
  const pairList: Pair[] = []

  // Extract the chain Id from the currencies
  const chainId = (currencyA as Token).chainId ?? (currencyB as Token).chainId

  // Get a provider if one isn't provided
  provider = provider || getProvider(chainId)

  // Create list of all possible pairs for the given currencies
  const bases: Token[] = BASES_TO_CHECK_TRADES_AGAINST[chainId] ?? []

  const [tokenA, tokenB] = [wrappedCurrency(currencyA, chainId), wrappedCurrency(currencyB, chainId)]

  const basePairs: [Token, Token][] = flatMap(bases, (base): [Token, Token][] =>
    bases.map((otherBase) => [base, otherBase])
  ).filter(([t0, t1]) => t0.address !== t1.address)

  const allPairCombinations: [Token, Token][] = [
    // the direct pair
    [tokenA, tokenB],
    // token A against all bases
    ...bases.map((base) => [tokenA, base]),
    // token B against all bases
    ...bases.map((base) => [tokenB, base]),
    // each base against all bases
    ...basePairs,
  ]
    .filter((tokens): tokens is [Token, Token] => Boolean(tokens[0] && tokens[1]))
    .filter(([t0, t1]) => t0.address !== t1.address)

  // Compute the pair addresses along with token0 and token1, sorted
  const pairTokenList = allPairCombinations.reduce<Record<string, [Token, Token]>>((list, [tokenA, tokenB]) => {
    if (tokenA && tokenB && !tokenA.equals(tokenB) && chainId && platform.supportsChain(chainId)) {
      const pairAddress = Pair.getAddress(tokenA, tokenB, platform)
      list[pairAddress] = tokenA.sortsBefore(tokenB) ? [tokenA, tokenB] : [tokenB, tokenA]
    }
    return list
  }, {})

  const pairAddressList = Object.keys(pairTokenList)

  // Fetch the pair reserves via multicall
  const multicallContract = new Contract(MULTICALL2_ADDRESS[chainId], MULTICALL2_ABI, provider)

  const uniswapPairInterface = new Interface(UNISWAPR_PAIR_ABI)

  const getReservesCallData = uniswapPairInterface.encodeFunctionData('getReserves', [])
  const swapFeeCallData = uniswapPairInterface.encodeFunctionData('swapFee', [])
  const multicall2CallData: { target: string; callData: string }[] = []

  for (const pairAddress of pairAddressList) {
    multicall2CallData.push({
      target: pairAddress,
      callData: getReservesCallData,
    })
    multicall2CallData.push({
      target: pairAddress,
      callData: swapFeeCallData,
    })
  }

  const getReservesAndSwapFeeCallResults = (await multicallContract.callStatic.tryAggregate(
    false,
    multicall2CallData
  )) as Multicall2TryAggregateResult[]

  for (let i = 0; i < getReservesAndSwapFeeCallResults.length; i += 2) {
    const pairAddressIndex = i / 2
    const pairAddress = pairAddressList[pairAddressIndex]
    const getReservesResults = getReservesAndSwapFeeCallResults[i]
    const swapFeeResults = getReservesAndSwapFeeCallResults[i + 1]

    // Skip failed getReserves calls
    if (!getReservesResults.success || !pairAddress) {
      continue
    }

    try {
      // Decode reserves and swap fee from the results
      const { reserve0, reserve1 } = uniswapPairInterface.decodeFunctionResult(
        'getReserves',
        getReservesResults.returnData
      )

      // Swap fee is only available in Swapr's extended UniswapV2Pair contract
      // For any other fork, we use the default swap fee
      const swapFee = swapFeeResults?.success
        ? uniswapPairInterface.decodeFunctionResult('swapFee', swapFeeResults.returnData)
        : platform.defaultSwapFee

      const [token0, token1] = pairTokenList[pairAddress]

      pairList.push(
        new Pair(
          new TokenAmount(token0, reserve0.toString()),
          new TokenAmount(token1, reserve1.toString()),
          swapFee.toString(),
          BigInt(0),
          platform
        )
      )
    } catch (e) {
      getAllCommonUniswapV2PairsDebug(e)
    }
  }

  return pairList
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

  const wrappedCurrencyA = wrappedCurrency(currencyA, chainId)
  const wrappedCurrencyB = wrappedCurrency(currencyB, chainId)

  const results = await getSdk(new GraphQLClient(subgraphEndpoint)).GetAllCommonPairsBetweenTokenAAndTokenB({
    tokenA: wrappedCurrencyA.address.toLowerCase() as string,
    tokenB: wrappedCurrencyB.address.toLowerCase() as string,
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
    const swapFee = pairSwapFeeList[pair.id.toLowerCase()] || platform.defaultSwapFee

    return new Pair(
      new TokenAmount(token0, parseUnits(pair.reserve0, token0.decimals).toString()),
      new TokenAmount(token1, parseUnits(pair.reserve1, token1.decimals).toString()),
      swapFee.toString(),
      BigInt(0),
      platform
    )
  })
}
