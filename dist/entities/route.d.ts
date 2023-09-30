import { ChainId } from '../constants';
import { Currency } from './currency';
import { Price } from './fractions/price';
import { Pair } from './pair';
import { Token } from './token';
export declare class Route {
    readonly pairs: Pair[];
    readonly path: Token[];
    readonly input: Currency;
    readonly output: Currency;
    readonly midPrice: Price;
    constructor(pairs: Pair[], input: Currency, output?: Currency);
    get chainId(): ChainId;
}
