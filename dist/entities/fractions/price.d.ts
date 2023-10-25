import { BigintIsh, Rounding } from '../../constants';
import { Currency } from '../currency';
import { Route } from '../route';
import { CurrencyAmount } from './currencyAmount';
import { Fraction } from './fraction';
export interface PriceConstructorParams {
    baseCurrency: Currency;
    quoteCurrency: Currency;
    denominator: BigintIsh;
    numerator: BigintIsh;
}
export declare class Price extends Fraction {
    readonly baseCurrency: Currency;
    readonly quoteCurrency: Currency;
    readonly scalar: Fraction;
    static fromRoute(route: Route): Price;
    constructor({ baseCurrency, quoteCurrency, denominator, numerator }: PriceConstructorParams);
    get raw(): Fraction;
    get adjusted(): Fraction;
    invert(): Price;
    multiply(other: Price): Price;
    quote(currencyAmount: CurrencyAmount): CurrencyAmount;
    toSignificant(significantDigits?: number, format?: object, rounding?: Rounding): string;
    toFixed(decimalPlaces?: number, format?: object, rounding?: Rounding): string;
}
