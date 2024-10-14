import { Currency, Token } from '@uniswap/sdk-core'

import { Pool } from './entities/pool'
import { Route } from './entities/route'
import { getPools } from './pools'

/**
 * Returns true if poolA is equivalent to poolB
 * @param poolA one of the two pools
 * @param poolB the other pool
 */
function poolEquals(poolA: Pool, poolB: Pool): boolean {
  return (
    poolA === poolB ||
    (poolA.token0.equals(poolB.token0) && poolA.token1.equals(poolB.token1) && poolA.fee === poolB.fee)
  )
}

export function computeAllRoutes(
  currencyIn: Token,
  currencyOut: Token,
  pools: Pool[],
  chainId: number,
  currentPath: Pool[] = [],
  allPaths: Route<Currency, Currency>[] = [],
  startCurrencyIn: Token = currencyIn,
  maxHops = 2,
): Route<Currency, Currency>[] {
  const tokenIn = new Token(
    currencyIn.chainId,
    currencyIn.address,
    currencyIn.decimals,
    currencyIn.symbol,
    currencyIn.name,
  )
  const tokenOut = new Token(
    currencyOut.chainId,
    currencyOut.address,
    currencyOut.decimals,
    currencyOut.symbol,
    currencyOut.name,
  )

  const startTokenIn = new Token(
    startCurrencyIn.chainId,
    startCurrencyIn.address,
    startCurrencyIn.decimals,
    startCurrencyIn.symbol,
    startCurrencyIn.name,
  )

  if (!tokenIn || !tokenOut) throw new Error('Missing tokenIn/tokenOut')
  for (const pool of pools) {
    if (!pool.involvesToken(tokenIn) || currentPath.find((pathPool) => poolEquals(pool, pathPool))) continue

    const outputToken = pool.token0.equals(tokenIn) ? pool.token1 : pool.token0
    if (outputToken.equals(tokenOut)) {
      allPaths.push(new Route([...currentPath, pool], startTokenIn, tokenOut))
    } else if (maxHops > 1) {
      computeAllRoutes(
        outputToken,
        currencyOut,
        pools,
        chainId,
        [...currentPath, pool],
        allPaths,
        startTokenIn,
        maxHops - 1,
      )
    }
  }

  return allPaths
}

export async function getRoutes(currencyIn: Token, currencyOut: Token, chainId: number) {
  const pools = await getPools(currencyIn, currencyOut)
  return computeAllRoutes(currencyIn, currencyOut, pools, chainId, [], [], currencyIn, 3)
}
