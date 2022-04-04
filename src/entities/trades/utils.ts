import { JsonRpcProvider } from '@ethersproject/providers'
import invariant from 'tiny-invariant'

import { CurrencyAmount } from '../fractions/currencyAmount'
import { TokenAmount } from '../fractions/tokenAmount'
import { ChainId } from '../../constants'
import { Currency } from '../currency'
import { Token } from '../token'

export function wrappedAmount(currencyAmount: CurrencyAmount, chainId: ChainId): TokenAmount {
  if (currencyAmount instanceof TokenAmount) return currencyAmount
  if (Currency.isNative(currencyAmount.currency))
    return new TokenAmount(Token.getNativeWrapper(chainId), currencyAmount.raw)
  invariant(false, 'CURRENCY')
}

export function wrappedCurrency(currency: Currency, chainId: ChainId): Token {
  if (currency instanceof Token) return currency
  if (Currency.isNative(currency)) return Token.getNativeWrapper(chainId)
  invariant(false, 'CURRENCY')
}

export function tryGetChainId(currencyAmount: CurrencyAmount, currency: Currency) {
  return currencyAmount instanceof TokenAmount
    ? currencyAmount.token.chainId
    : currency instanceof Token
    ? currency.chainId
    : undefined
}

/**
 *
 */
export const RPC_PROVIDER_LIST = {
  [ChainId.MAINNET as ChainId]: 'https://mainnet.infura.io/v3/e1a3bfc40093494ca4f36b286ab36f2d',
  [ChainId.XDAI as ChainId]: 'https://rpc.xdaichain.com/',
  [ChainId.RINKEBY as ChainId]: 'https://rinkeby.infura.io/v3/e1a3bfc40093494ca4f36b286ab36f2d',
  [ChainId.ARBITRUM_ONE as ChainId]: 'https://arb1.arbitrum.io/rpc',
  [ChainId.ARBITRUM_RINKEBY as ChainId]: 'https://rinkeby.arbitrum.io/rpc',
}

/**
 * Returns a RPC provider for the given chainId.
 * @param chainId The chainId
 * @returns The RPC provider
 */
export function getProvider(chainId: ChainId) {
  const host = RPC_PROVIDER_LIST[chainId]
  return new JsonRpcProvider(host)
}
