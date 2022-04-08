import { Contract } from '@ethersproject/contracts'
import { ChainId } from '../../../../constants'
import { poolMethods } from '../abi/common'
import { getProvider } from '../../utils'

interface PoolToken {
  index: number
  address: string
  isUnderlying?: boolean
}

interface GetPoolTokenListResults {
  allTokens: PoolToken[]
  mainTokens: PoolToken[]
  underlyingTokens: PoolToken[]
}

const getPoolTokenListCache = new Map<string, GetPoolTokenListResults>()

/**
 * Fetches and returns tokens from given pool address
 */
export async function getPoolTokenList(poolAddress: string, chainId: ChainId): Promise<GetPoolTokenListResults> {
  const cacheKey = `${chainId}-${poolAddress}`
  const tokensFromCache = getPoolTokenListCache.get(cacheKey)
  if (tokensFromCache) {
    return tokensFromCache
  }

  const provider = getProvider(chainId)
  // const multicallProvider = new MulticallProvider(provider, chainId)
  // // // UniswapV3 multicall contract
  // const multicall2Contract = new Contract('0x5ba1e12693dc8f9c48aad8770482f4739beed696', MULTICALL2_ABI, provider)

  const poolContract = new Contract(
    poolAddress,
    [poolMethods['view']['coins'], poolMethods['view']['underlying_coins']],
    provider
  )

  const indexList = [0, 1, 2, 3]

  const mainTokenResult: (PoolToken | undefined)[] = await Promise.all(
    indexList.map(async (index) => {
      try {
        return {
          address: await poolContract.coins(index),
          index,
        }
        // eslint-disable-next-line
      } catch (error) {}

      return
    })
  )

  const underlyingTokenResult: (PoolToken | undefined)[] = await Promise.all(
    indexList.map(async (index) => {
      try {
        return {
          address: await poolContract.underlying_coins(index),
          isUnderlying: true,
          index,
        }
        // eslint-disable-next-line
      } catch (error) {}

      return
    })
  )

  const mainTokens = mainTokenResult.filter((token) => token !== undefined) as PoolToken[]
  const underlyingTokens = underlyingTokenResult.filter((token) => token !== undefined) as PoolToken[]
  const allTokens = [...mainTokens, ...underlyingTokens].map((token, index) => ({
    ...token,
    index,
  }))

  const cacheContent = {
    mainTokens,
    underlyingTokens,
    allTokens,
  }

  cacheContent

  return cacheContent
}
