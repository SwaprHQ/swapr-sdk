import { BigintIsh, Rounding } from '../../constants';
import { Token } from '../token';
import { Route } from '../route';
import { Fraction } from './fraction';
import { TokenAmount } from './tokenAmount';
export declare class Price extends Fraction {
    readonly baseToken: Token;
    readonly quoteToken: Token;
    readonly scalar: Fraction;
    static fromRoute(route: Route): Price;
    constructor(baseToken: Token, quoteToken: Token, denominator: BigintIsh, numerator: BigintIsh);
    get raw(): Fraction;
    get adjusted(): Fraction;
    invert(): Price;
    multiply(other: Price): Price;
    quote(tokenAmount: TokenAmount): TokenAmount;
    toSignificant(significantDigits?: number, format?: object, rounding?: Rounding): string;
    toFixed(decimalPlaces?: number, format?: object, rounding?: Rounding): string;
}
