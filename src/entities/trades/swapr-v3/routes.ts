import { Currency, Token } from '@uniswap/sdk-core'
import { Pool } from './pool'
import { Route } from './route'
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
  pools: Pool[],
  chainId: number,
  currentPath: Pool[] = [],
  allPaths: Route<Currency, Currency>[] = [],
  maxHops = 2,
): Route<Currency, Currency>[] {
  for (const pool of pools) {
    if (!pool.involvesToken(pool.token0) || currentPath.some((pathPool) => poolEquals(pool, pathPool))) continue

    const outputToken = pool.token0.equals(pool.token0) ? pool.token1 : pool.token0
    if (outputToken.equals(pool.token1)) {
      allPaths.push(new Route([...currentPath, pool], pool.token0, pool.token1))
    } else if (maxHops > 1) {
      computeAllRoutes(pools, chainId, [...currentPath, pool], allPaths, maxHops - 1)
    }
  }

  return allPaths
}

export async function getRoutes(
  currencyIn: Token,
  currencyOut: Token,
  chainId: number,
): Promise<Route<Currency, Currency>[]> {
  const pools = await getPools(currencyIn, currencyOut)
  console.log('pools size', pools.length)
  return computeAllRoutes(pools, chainId, [], [], 3)
}
