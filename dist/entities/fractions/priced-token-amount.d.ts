import { BigintIsh } from '../../constants';
import { PricedToken } from '../priced-token';
import { CurrencyAmount } from './currencyAmount';
import { TokenAmount } from './tokenAmount';
export declare class PricedTokenAmount extends TokenAmount {
    readonly token: PricedToken;
    constructor(token: PricedToken, amount: BigintIsh);
    get nativeCurrencyAmount(): CurrencyAmount;
}
