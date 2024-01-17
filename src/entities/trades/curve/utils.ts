import fetch from 'node-fetch'

import { ChainId } from '../../../constants'
import { Token } from '../../token'
import { CURVE_POOL_ABI_MAP } from './abi'
import { CURVE_FACTORY_SUPPORTED_APIS } from './pools'
import { CURVE_TOKENS, CurvePool, CurveToken, TOKENS_MAINNET, TokenType } from './tokens'
import { FactoryPoolsApiResponse } from './types'

/**
 * Returns the token index of a token in a Curve pool
 * @param pool the Curve pool
 * @param tokenAddress the token address
 */
export function getTokenIndex(pool: CurvePool, tokenAddress: string, chainId: ChainId = ChainId.MAINNET) {
  // Combine all tokens without lpTokens
  const tokensWithoutLpToken = pool.tokens.filter((token) => token.isLPToken)

  // Use main tokens
  let tokenList = pool.tokens
  // Append underlying tokens
  const underlyingTokens = pool.underlyingTokens && (pool.underlyingTokens as CurveToken[])
  if (underlyingTokens) {
    tokenList = [...tokensWithoutLpToken, ...underlyingTokens]
  }
  // Append meta tokens
  else if (pool.isMeta && pool.metaTokens) {
    tokenList = [...tokensWithoutLpToken, ...(pool.metaTokens as CurveToken[])]
  }
  // Search for WETH in the pool
  const poolHasWETH = tokenList.find(
    ({ address }) => CURVE_TOKENS[chainId]?.weth?.address?.toLowerCase() === address.toLowerCase(),
  )
  let tokenIndex

  // Case where both pool tokens and underlying tokens can be routed through
  if (underlyingTokens && pool.underlyingTokens?.length === pool.tokens.length) {
    tokenIndex = pool.tokens.findIndex(
      (item, index) =>
        item.address.toLowerCase() == tokenAddress.toLowerCase() ||
        underlyingTokens[index].address.toLowerCase() == tokenAddress.toLowerCase(),
    )
  } else {
    // Search for the main/underlying token
    tokenIndex = tokenList.findIndex(({ address }) => address.toLowerCase() == tokenAddress.toLowerCase())
  }

  // ETH is always at 0 all pools
  if (tokenIndex < 0 && poolHasWETH) {
    tokenIndex = 0
  }

  return tokenIndex
}

/**
 * Given a token, returns the token information if found otherwise returns token passed
 * @param token The token
 * @param chainId The chain ID. Default is Mainnet
 * @returns The token information or undefined if not found
 */
export function getCurveToken(token: Token, chainId: ChainId = ChainId.MAINNET) {
  const tokenList = CURVE_TOKENS[chainId as keyof typeof CURVE_TOKENS]

  return (
    Object.values(tokenList).find(({ address }) => address.toLowerCase() === token.address?.toLowerCase()) ||
    ({ ...token, type: 'other' } as CurveToken)
  )
}
/**
 * Fetches user created factory pools for curve protocol
 */

export async function fetchCurveFactoryPools(chainId: ChainId): Promise<CurvePool[]> {
  if (CURVE_FACTORY_SUPPORTED_APIS[chainId] === '') return []

  const response = await fetch(`https://api.curve.fi/api/getPools/${CURVE_FACTORY_SUPPORTED_APIS[chainId]}/factory`)

  if (!response.ok) throw new Error('response not ok')
  const allPoolsArray = (await response.json()) as FactoryPoolsApiResponse
  //filter for low liquidty pool
  const filteredLowLiquidityPools = allPoolsArray.data.poolData.filter((item) => item.usdTotal > 100000)
  //restructures pools so they fit into curvePool type
  const pooList: CurvePool[] = filteredLowLiquidityPools.map(
    ({ symbol, name, coins, address, implementation, isMetaPool }) => {
      const tokens: CurveToken[] = coins.map((token) => {
        let currentToken = new Token(chainId, token.address, parseInt(token.decimals), token.symbol, token.name)

        //wraps token if its Native so that it can be matched
        if (token.address === '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE')
          currentToken = Token.getNativeWrapper(chainId)

        const symbol = currentToken.symbol ? currentToken.symbol : token.symbol

        return {
          symbol,
          name: symbol,
          address: currentToken.address,
          decimals: currentToken.decimals,
          type: determineTokeType(symbol),
          isLPToken: token.isBasePoolLpToken,
        }
      })

      const isMeta = isMetaPool || implementation.includes('meta')

      const curvePoolObject: CurvePool = {
        id: symbol,
        name,
        address,
        abi: CURVE_POOL_ABI_MAP[implementation],
        isMeta,
        tokens,
      }

      //tries to find meta pool tokens
      const findPoolTokens = tokens[1] && CURVE_TOKENS[chainId][tokens[1].symbol.toLocaleLowerCase()]?.poolTokens?.()
      //if its meta pool puts token under metaTokens else under underlying tokens
      if (findPoolTokens) {
        if (isMeta) curvePoolObject.metaTokens = findPoolTokens
        else curvePoolObject.underlyingTokens = findPoolTokens
      }

      return curvePoolObject
    },
  )
  return pooList
}

/**
 *
 * @param pools The list of Curve pools
 * @param tokenInAddress Token in address
 * @param tokenOutAddress Token out address
 * @returns List of potential pools at which the trade can be done
 */
export async function getRoutablePools(
  pools: CurvePool[],
  tokenIn: CurveToken,
  tokenOut: CurveToken,
  chainId: ChainId,
) {
  return pools.filter(({ tokens, metaTokens, underlyingTokens, allowsTradingETH }) => {
    let tokenInAddress = tokenIn.address
    let tokenOutAddress = tokenOut.address

    // For mainnet, account for ETH/WETH
    if (chainId === ChainId.MAINNET) {
      const isTokenInEther = tokenIn.address.toLowerCase() === TOKENS_MAINNET.eth.address.toLowerCase()
      const isTokenOutEther = tokenOut.address.toLowerCase() === TOKENS_MAINNET.eth.address.toLowerCase()

      tokenInAddress = allowsTradingETH === true && isTokenInEther ? TOKENS_MAINNET.weth.address : tokenIn.address

      tokenOutAddress = allowsTradingETH === true && isTokenOutEther ? TOKENS_MAINNET.weth.address : tokenOut.address
    }

    // main tokens
    const hasTokenIn = tokens.some((token) => token.address.toLowerCase() === tokenInAddress.toLowerCase())

    const hasTokenOut = tokens.some((token) => token.address.toLowerCase() === tokenOutAddress.toLowerCase())

    // Meta tokens in MetaPools [ERC20, [...3PoolTokens]]
    const hasMetaTokenIn = metaTokens?.some((token) => token.address.toLowerCase() === tokenInAddress.toLowerCase())
    const hasMetaTokenOut = metaTokens?.some((token) => token.address.toLowerCase() === tokenOutAddress.toLowerCase())

    // Underlying tokens, similar to meta tokens
    const hasUnderlyingTokenIn = underlyingTokens?.some(
      (token) => token.address.toLowerCase() === tokenInAddress.toLowerCase(),
    )
    const hasUnderlyingTokenOut = underlyingTokens?.some(
      (token) => token.address.toLowerCase() === tokenOutAddress.toLowerCase(),
    )

    return (
      (hasTokenIn || hasUnderlyingTokenIn || hasMetaTokenIn) &&
      (hasTokenOut || hasUnderlyingTokenOut || hasMetaTokenOut)
    )
  })
}

const usd = [
  'dai',
  'jpy',
  'aud',
  'dei',
  'home',
  'fiat',
  'alcx',
  'cad',
  'usx',
  'fei',
  'crv',
  'ust',
  'vst',
  'fxs',
  'fox',
  'cvx',
  'angle',
  'gamma',
  'apw',
  'usd',
  'mim',
  'frax',
  'apv',
  'rai',
  'eur',
  'gbp',
  'chf',
  'dola',
  'krw',
]
const btc = ['btc']
const eth = ['eth']

/**
 * Returns tokenType based on token symbol
 * @param symbol symbol of curve token
 * @returns token type of given symbol
 */

export function determineTokeType(symbol: string): TokenType {
  const symbolLowercased = symbol.toLocaleLowerCase()
  if (eth.includes(symbolLowercased)) return TokenType.ETH
  if (btc.includes(symbolLowercased)) return TokenType.BTC
  if (usd.includes(symbolLowercased)) return TokenType.USD
  else return TokenType.OTHER
}
