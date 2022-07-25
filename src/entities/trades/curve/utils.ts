import { ChainId } from '../../../constants'
import { Fetcher } from '../../../fetcher'
import { checkIfStringExists } from '../../../utils'
import { CurvePool } from './pools'
import { CURVE_TOKENS, CurveToken, TOKENS_MAINNET, TokenType } from './tokens'

/**
 * Returns the token index of a token in a Curve pool
 * @param pool the Curve pool
 * @param tokenAddress the token address
 */
export function getTokenIndex(pool: CurvePool, tokenAddress: string, chainId: ChainId = ChainId.MAINNET) {
  // Combine all tokens without 3CRV
  // const tokenWithout3CRV = pool.tokens.filter((token) => token.symbol.toLowerCase() !== '3crv')
  const tokenWithout3CRV = pool.tokens.filter(
    (token) => token.symbol.toLowerCase() !== '3crv' && token.symbol.toLowerCase() !== '2crv'
  )
  // Use main tokens
  let tokenList = pool.tokens
  // Append underlying tokens
  if (pool.underlyingTokens) {
    tokenList = [...tokenWithout3CRV, ...(pool.underlyingTokens as CurveToken[])]
  }
  // Append meta tokens
  else if (pool.isMeta && pool.metaTokens) {
    tokenList = [...tokenWithout3CRV, ...(pool.metaTokens as CurveToken[])]
  }
  // Search for WETH in the pool
  const poolHasWETH = tokenList.find(
    ({ address }) => CURVE_TOKENS[chainId]?.weth?.address?.toLowerCase() === address.toLowerCase()
  )

  // Search for the main/underlying token
  let tokenIndex = tokenList.findIndex(({ address }) => address.toLowerCase() == tokenAddress.toLowerCase())
  console.log('tokenList', tokenList)
  console.log('tokenIndex', tokenIndex)
  // ETH is always at 0 all pools
  if (tokenIndex < 0 && poolHasWETH) {
    tokenIndex = 0
  }

  return tokenIndex
}

/**
 * Given a token address, returns the token information if found
 * @param tokenAddress The token address
 * @param chainId The chain ID. Default is Mainnet
 * @returns The token information or undefined if not found
 */
export function getCurveToken(tokenAddress: string, chainId: ChainId = ChainId.MAINNET) {
  const tokenList = CURVE_TOKENS[chainId as keyof typeof CURVE_TOKENS]
  const tokenItself = Object.values(tokenList).find(
    (token) => token.address.toLowerCase() === tokenAddress?.toLowerCase()
  )

  return tokenItself
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
  return allPools.filter(({ tokens, metaTokens, underlyingTokens, allowsTradingETH, name }) => {
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
      (token) => token.address.toLowerCase() === tokenInAddress.toLowerCase()
    )
    const hasUnderlyingTokenOut = underlyingTokens?.some(
      (token) => token.address.toLowerCase() === tokenOutAddress.toLowerCase()
    )
    if (name === 'Curve.fi Factory USD Metapool: MIM') {
      console.log('info', tokenIn)
      console.log('infot2', tokenOut)
      console.log('tokens', tokens)
      console.log('metatokens', metaTokens)
      console.log('underlying', underlyingTokens)
      console.log('eval1', hasTokenIn || hasUnderlyingTokenIn || hasMetaTokenIn)
      console.log('eval2', hasTokenOut || hasUnderlyingTokenOut || hasMetaTokenOut)
    }

    return (
      (hasTokenIn || hasUnderlyingTokenIn || hasMetaTokenIn) &&
      (hasTokenOut || hasUnderlyingTokenOut || hasMetaTokenOut)
    )
  })
}

/**
 * Returns tokenType based on token symbol
 * @param symbol symbol of curve token
 * @returns token type of given symbol
 */
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

export function determineTokeType(symbol: string): TokenType {
  if (checkIfStringExists(symbol, eth)) return TokenType.ETH
  if (checkIfStringExists(symbol, btc)) return TokenType.BTC
  if (checkIfStringExists(symbol, usd)) return TokenType.USD
  else return TokenType.OTHER
}
