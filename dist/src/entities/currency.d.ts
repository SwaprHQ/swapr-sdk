import { ChainId } from '../constants';
/**
 * A currency is any fungible financial instrument on the target chain.
 *
 * The only instances of the base class `Currency` are native currencies such as Ether for Ethereum and xDAI for xDAI.
 */
export declare class Currency {
    readonly decimals: number;
    readonly symbol?: string;
    readonly name?: string;
    readonly address?: string;
    static readonly USD: Currency;
    static readonly ETHER: Currency;
    static readonly XDAI: Currency;
    static readonly MATIC: Currency;
    private static readonly NATIVE_CURRENCY;
    /**
     * Constructs an instance of the base class `Currency`. The only instance of the base class `Currency` is `Currency.ETHER`.
     * @param decimals decimals of the currency
     * @param symbol symbol of the currency
     * @param name of the currency
     */
    protected constructor(decimals: number, symbol?: string, name?: string, address?: string);
    static isNative(currency: Currency): boolean;
    static getNative(chainId: ChainId): Currency;
}
export declare const USD: Currency;
export declare const ETHER: Currency;
export declare const XDAI: Currency;
export declare const MATIC: Currency;
