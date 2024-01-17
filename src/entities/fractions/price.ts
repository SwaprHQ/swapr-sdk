import JSBI from 'jsbi'
import invariant from 'tiny-invariant'

import { BigintIsh, ChainId, Rounding, TEN } from '../../constants'
import { Currency } from '../currency'
import { Route } from '../route'
import { Token } from '../token'
import { currencyEquals } from '../token'
import { CurrencyAmount } from './currencyAmount'
import { Fraction } from './fraction'
import { TokenAmount } from './tokenAmount'

export interface PriceConstructorParams {
  baseCurrency: Currency
  quoteCurrency: Currency
  denominator: BigintIsh
  numerator: BigintIsh
}

export class Price extends Fraction {
  public readonly baseCurrency: Currency // input i.e. denominator
  public readonly quoteCurrency: Currency // output i.e. numerator
  public readonly scalar: Fraction // used to adjust the raw fraction w/r/t the decimals of the {base,quote}Token

  public static fromRoute(route: Route): Price {
    const prices: Price[] = []
    for (const [i, pair] of route.pairs.entries()) {
      prices.push(
        route.path[i].equals(pair.token0)
          ? new Price({
              baseCurrency: pair.reserve0.currency,
              quoteCurrency: pair.reserve1.currency,
              denominator: pair.reserve0.raw,
              numerator: pair.reserve1.raw,
            })
          : new Price({
              baseCurrency: pair.reserve1.currency,
              quoteCurrency: pair.reserve0.currency,
              denominator: pair.reserve1.raw,
              numerator: pair.reserve0.raw,
            }),
      )
    }
    return prices.slice(1).reduce((accumulator, currentValue) => accumulator.multiply(currentValue), prices[0])
  }

  // denominator and numerator _must_ be raw, i.e. in the native representation
  public constructor({ baseCurrency, quoteCurrency, denominator, numerator }: PriceConstructorParams) {
    super(numerator, denominator)

    this.baseCurrency = baseCurrency
    this.quoteCurrency = quoteCurrency
    this.scalar = new Fraction(
      JSBI.exponentiate(TEN, JSBI.BigInt(baseCurrency.decimals)),
      JSBI.exponentiate(TEN, JSBI.BigInt(quoteCurrency.decimals)),
    )
  }

  public get raw(): Fraction {
    return new Fraction(this.numerator, this.denominator)
  }

  public get adjusted(): Fraction {
    return super.multiply(this.scalar)
  }

  public invert(): Price {
    return new Price({
      baseCurrency: this.quoteCurrency,
      quoteCurrency: this.baseCurrency,
      denominator: this.numerator,
      numerator: this.denominator,
    })
  }

  public multiply(other: Price): Price {
    invariant(currencyEquals(this.quoteCurrency, other.baseCurrency), 'TOKEN')
    const fraction = super.multiply(other)
    return new Price({
      baseCurrency: this.baseCurrency,
      quoteCurrency: other.quoteCurrency,
      denominator: fraction.denominator,
      numerator: fraction.numerator,
    })
  }

  // performs floor division on overflow
  public quote(currencyAmount: CurrencyAmount): CurrencyAmount {
    invariant(currencyEquals(currencyAmount.currency, this.baseCurrency), 'TOKEN')
    if (this.quoteCurrency instanceof Token) {
      return new TokenAmount(this.quoteCurrency, super.multiply(currencyAmount.raw).quotient)
    }
    return CurrencyAmount.nativeCurrency(super.multiply(currencyAmount.raw).quotient, ChainId.MAINNET)
  }

  public toSignificant(significantDigits = 6, format?: object, rounding?: Rounding): string {
    return this.adjusted.toSignificant(significantDigits, format, rounding)
  }

  public toFixed(decimalPlaces = 4, format?: object, rounding?: Rounding): string {
    return this.adjusted.toFixed(decimalPlaces, format, rounding)
  }
}
