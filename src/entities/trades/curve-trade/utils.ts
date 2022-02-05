import { BigNumber } from '@ethersproject/bignumber'
import { utils } from 'ethers'
import { ChainId } from '../../../constants'
import { CurvePool, CurveToken, CURVE_TOKENS, TOKENS_MAINNET } from './constants'

export const toBN = (n: BigNumber, decimals = 18): BigNumber => {
  // @ts-ignore
  return BigNumber.from(utils.formatUnits(n, decimals)).mul(decimals)
}

export const toLowerCase = (str: string) => str.toLocaleLowerCase()
/**
 * Returns the token index of a token in a Curve pool
 * @param pool the Curve pool
 * @param tokenAddress the token address
 */
export function getTokenIndex(pool: CurvePool, tokenAddress: string, chainId: ChainId = ChainId.MAINNET) {
  // Use main tokens
  let tokenList = pool.tokens
  // Combine tokens + meta tokens
  if (pool.isMeta && pool.metaTokens) {
    // Combine all tokens without 3CRV
    const tokenWithout3CRV = pool.tokens.filter(token => token.symbol.toLowerCase() !== '3crv')

    tokenList = [...tokenWithout3CRV, ...(pool.metaTokens as CurveToken[])]
  }

  if (
    pool.allowsTradingETH === true &&
    chainId === ChainId.MAINNET &&
    tokenAddress.toLowerCase() === TOKENS_MAINNET.eth.address.toLowerCase()
  ) {
    tokenAddress = TOKENS_MAINNET.weth.address
  }

  return tokenList.findIndex(({ address }) => address.toLowerCase() == tokenAddress.toLowerCase())
}

export function getCurveToken(tokenAddress: string, chainId: ChainId = ChainId.MAINNET) {
  const tokenList = CURVE_TOKENS[chainId as keyof typeof CURVE_TOKENS]

  return Object.values(tokenList).find(token => token.address.toLowerCase() === tokenAddress?.toLowerCase())
}

/**
 *
 * @param pools The list of Curve pools
 * @param tokenInAddress Token in address
 * @param tokenOutAddress Token out address
 * @returns List of potential pools at which the trade can be done
 */
export function getRoutablePools(pools: CurvePool[], tokenIn: CurveToken, tokenOut: CurveToken, chainId: ChainId) {
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
    const hasTokenIn = tokens.some(token => token.address.toLowerCase() === tokenInAddress.toLowerCase())
    const hasTokenOut = tokens.some(token => token.address.toLowerCase() === tokenOutAddress.toLowerCase())

    // Meta tokens in MetaPools [ERC20, [...3PoolTokens]]
    const hasMetaTokenIn = metaTokens?.some(token => token.address.toLowerCase() === tokenInAddress.toLowerCase())
    const hasMetaTokenOut = metaTokens?.some(token => token.address.toLowerCase() === tokenOutAddress.toLowerCase())

    // Underlying tokens, similar to meta tokens
    const hasUnderlyingTokenIn = underlyingTokens?.some(
      token => token.address.toLowerCase() === tokenInAddress.toLowerCase()
    )
    const hasUnderlyingTokenOut = underlyingTokens?.some(
      token => token.address.toLowerCase() === tokenOutAddress.toLowerCase()
    )

    return (
      (hasTokenIn || hasUnderlyingTokenIn || hasMetaTokenIn) &&
      (hasTokenOut || hasUnderlyingTokenOut || hasMetaTokenOut)
    )
  })
}
