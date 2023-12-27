// @ts-nocheck
import { Token } from '@uniswap/sdk-core'
import { POOL_DEPLOYER_ADDRESS, baseTokens } from './constants'
import { computePoolAddress } from './utils/computePoolAddress'
import { getPoolsContract } from './SwaprV3'
import { Pool } from './entities/pool'

const GNOSIS_CHAIN_ID = 100

const getBaseTokens: Token[] = baseTokens.map(
  ({ address, decimals, symbol, name }) => new Token(GNOSIS_CHAIN_ID, address, decimals, symbol, name)
)

export const setupTokens = (currencyIn: Token, currencyOut: Token) => {
  const tokenIn = new Token(
    GNOSIS_CHAIN_ID,
    currencyIn.address,
    currencyIn.decimals,
    currencyIn.symbol,
    currencyIn.name
  )

  const tokenOut = new Token(
    GNOSIS_CHAIN_ID,
    currencyOut.address,
    currencyOut.decimals,
    currencyOut.symbol,
    currencyOut.name
  )

  const [tokenA, tokenB] = [tokenIn?.wrapped, tokenOut?.wrapped]

  return { tokenA, tokenB }
}

const pairsDiffCombinations = (tokenA: Token, tokenB: Token) => {
  const basePairs: [Token, Token][] = getBaseTokens
    .flatMap((base): [Token, Token][] => getBaseTokens.map((otherBase) => [base, otherBase]))
    .filter(([t0, t1]) => !t0.equals(t1))

  return (
    [
      // the direct pair
      [tokenA, tokenB] as [Token, Token],
      // token A against all bases
      ...getBaseTokens.map((base): [Token, Token] => [tokenA, base]),
      // token B against all bases
      ...getBaseTokens.map((base): [Token, Token] => [tokenB, base]),
      // each base against all bases
      ...basePairs,
    ] // filter out invalid pairs comprised of the same asset (e.g. WETH<>WETH)
      .filter(([t0, t1]) => !t0.equals(t1))
      // filter out duplicate pairs
      .filter(([t0, t1], i, otherPairs) => {
        // find the first index in the array at which there are the same 2 tokens as the current
        const firstIndexInOtherPairs = otherPairs.findIndex(([t0Other, t1Other]) => {
          return (t0.equals(t0Other) && t1.equals(t1Other)) || (t0.equals(t1Other) && t1.equals(t0Other))
        })
        // only accept the first occurrence of the same 2 tokens
        return firstIndexInOtherPairs === i
      })
  )
}

export const getPools = async (currencyIn: Token, currencyOut: Token) => {
  const { tokenA, tokenB } = setupTokens(currencyIn, currencyOut)
  const pairsCombinations = pairsDiffCombinations(tokenA, tokenB)

  const sortedPairs = pairsCombinations.map(([currencyA, currencyB]) => {
    const [token0, token1] = currencyA.sortsBefore(currencyB) ? [currencyA, currencyB] : [currencyB, currencyA]
    return [token0, token1]
  })

  const poolAddresses = sortedPairs.map((value) => {
    return computePoolAddress({
      poolDeployer: POOL_DEPLOYER_ADDRESS,
      tokenA: value[0],
      tokenB: value[1],
    })
  })

  const poolsGlobalSpace = () =>
    Promise.allSettled(poolAddresses.map((poolAddress) => fetchPoolGlobalState(poolAddress))).then((results) =>
      results
        .map((result, index) => {
          if (result.status === 'fulfilled') {
            return { value: result.value, poolAddress: poolAddresses[index] }
          }
        })
        .filter((result) => result)
    )

  const poolsLiquidity = () =>
    Promise.allSettled(poolAddresses.map((poolAddress) => fetchPoolLiquidity(poolAddress))).then((results) =>
      results
        .map((result, index) => {
          if (result.status === 'fulfilled') {
            return { value: result.value, poolAddress: poolAddresses[index] }
          }
        })
        .filter((result) => result)
    )

  const getPoolsGlobalSpaceResults = async () => {
    try {
      const results = await poolsGlobalSpace()
      return results
    } catch (error) {
      console.error('Error fetching pool globalSpace results:', error)
    }
  }

  const getPoolsLiquiditiesResults = async () => {
    try {
      const results = await poolsLiquidity()
      return results
    } catch (error) {
      console.error('Error fetching pool liquidity results:', error)
    }
  }

  const [liquidityResults, globalSpaceResults] = await Promise.all([
    await getPoolsLiquiditiesResults(),
    await getPoolsGlobalSpaceResults(),
  ])

  const combinedResults = poolAddresses.flatMap((poolAddress) => {
    const liquidityResult = liquidityResults.find(
      ({ poolAddress: liquidityPoolAddress }) => liquidityPoolAddress === poolAddress
    )

    const globalSpaceResult = globalSpaceResults.find(
      ({ poolAddress: globalSpacePoolAddress }) => globalSpacePoolAddress === poolAddress
    )

    if (globalSpaceResult && liquidityResult) {
      return new Pool(
        tokenA,
        tokenB,
        globalSpaceResult.value.fee,
        globalSpaceResult.value.price,
        liquidityResult ? liquidityResult.value : null,
        globalSpaceResult.value.tick
      )
    }

    return []
  })

  return combinedResults
}

const fetchPoolGlobalState = async (poolAddress: string) => {
  return getPoolsContract(poolAddress).globalState()
}

const fetchPoolLiquidity = async (poolAddress: string) => {
  return getPoolsContract(poolAddress).liquidity()
}