import { BigintIsh } from '../../constants';
import { Token } from '../token';
import { CurrencyAmount } from './currencyAmount';
export declare class TokenAmount extends CurrencyAmount {
    readonly token: Token;
    constructor(token: Token, amount: BigintIsh);
    add(other: TokenAmount): TokenAmount;
    subtract(other: TokenAmount): TokenAmount;
}
