import { ChainId } from '../../../constants'
import { Fetcher } from '../../../fetcher'
import { Token } from '../../token'
import { CURVE_TOKENS, CurvePool, CurveToken, TOKENS_MAINNET, TokenType } from './tokens'

/**
 * Returns the token index of a token in a Curve pool
 * @param pool the Curve pool
 * @param tokenAddress the token address
 */
export function getTokenIndex(pool: CurvePool, tokenAddress: string, chainId: ChainId = ChainId.MAINNET) {
  // Combine all tokens without 3CRV
  const tokenWithout2CRVand3CRV = pool.tokens.filter(
    (token) => token.symbol.toLowerCase() !== '3crv' && token.symbol.toLowerCase() !== '2crv'
  )
  console.log('poolSZSZSyalc p', pool)
  console.log('address', tokenAddress)

  // Use main tokens
  let tokenList = pool.tokens
  // Append underlying tokens
  const underlyingTokens = pool.underlyingTokens && (pool.underlyingTokens as CurveToken[])
  if (pool.underlyingTokens) {
    tokenList = [...tokenWithout2CRVand3CRV, ...(pool.underlyingTokens as CurveToken[])]
  }
  // Append meta tokens
  else if (pool.isMeta && pool.metaTokens) {
    tokenList = [...tokenWithout2CRVand3CRV, ...(pool.metaTokens as CurveToken[])]
  }
  // Search for WETH in the pool
  const poolHasWETH = tokenList.find(
    ({ address }) => CURVE_TOKENS[chainId]?.weth?.address?.toLowerCase() === address.toLowerCase()
  )
  let tokenIndex
  console.log('Umderlying', underlyingTokens)
  console.log('PoolTokens', pool.tokens)
  if (underlyingTokens && pool.underlyingTokens?.length === pool.tokens.length) {
    console.log('inside')
    tokenIndex = pool.tokens.findIndex(
      (item, index) =>
        item.address.toLowerCase() == tokenAddress.toLowerCase() ||
        underlyingTokens[index].address.toLowerCase() == tokenAddress.toLowerCase()
    )
    console.log('finish')
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
  chainId: ChainId
) {
  const factoryPools = await Fetcher.fetchCurveFactoryPools(chainId)
  const allPools = pools.concat(factoryPools)
  return allPools.filter(({ tokens, metaTokens, underlyingTokens, allowsTradingETH }) => {
    let tokenInAddress = tokenIn.address
    let tokenOutAddress = tokenOut.address

    // For mainnet, account for ETH/WETH
    if (chainId === ChainId.MAINNET) {
      console.log('mainnet', tokenInAddress)
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
      (token) => token.address.toLowerCase() === tokenInAddress.toLowerCase()
    )
    const hasUnderlyingTokenOut = underlyingTokens?.some(
      (token) => token.address.toLowerCase() === tokenOutAddress.toLowerCase()
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
