import JSBI from 'jsbi';
import { BigintIsh, Rounding } from '../../constants';
import { Currency } from '../currency';
import { Fraction } from './fraction';
export declare class CurrencyAmount extends Fraction {
    readonly currency: Currency;
    /**
     * Helper that calls the constructor with the ETHER currency
     * @param amount ether amount in wei
     */
    static nativeCurrency(amount: BigintIsh, chainId: number): CurrencyAmount;
    /**
     * Helper that calls the constructor with the USD currency
     * @param amount amount of usd experessed in wei (with 18 decimals resolution)
     */
    static usd(amount: BigintIsh): CurrencyAmount;
    protected constructor(currency: Currency, amount: BigintIsh);
    get raw(): JSBI;
    add(other: CurrencyAmount): CurrencyAmount;
    subtract(other: CurrencyAmount): CurrencyAmount;
    toSignificant(significantDigits?: number, format?: object, rounding?: Rounding): string;
    toFixed(decimalPlaces?: number, format?: object, rounding?: Rounding): string;
    toExact(format?: object): string;
}
