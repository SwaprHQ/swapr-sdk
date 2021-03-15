import { BigintIsh } from '../../constants'
import { PricedToken } from '../priced-token'
import { CurrencyAmount } from './currencyAmount'

export class PricedTokenAmount extends CurrencyAmount {
  public readonly token: PricedToken

  // amount _must_ be raw, i.e. in the native representation
  public constructor(token: PricedToken, amount: BigintIsh) {
    super(token, amount)
    this.token = token
  }

  public get nativeCurrencyAmount(): CurrencyAmount {
    return new CurrencyAmount(this.token.price.quoteCurrency, this.raw)
  }
}
