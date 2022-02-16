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
