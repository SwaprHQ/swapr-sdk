import { ChainId } from '../constants';
import { Price } from './fractions';
import { Token } from './token';
/**
 * Represents an ERC20 token and its price, expressed in any given currency.
 */
export declare class PricedToken extends Token {
    readonly price: Price;
    constructor(chainId: ChainId, address: string, decimals: number, price: Price, symbol?: string, name?: string);
}
