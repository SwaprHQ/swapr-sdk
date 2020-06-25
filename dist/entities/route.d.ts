import { Token } from './token';
import { Pair } from './pair';
import { Price } from './fractions/price';
export declare class Route {
    readonly pairs: Pair[];
    readonly path: Token[];
    readonly midPrice: Price;
    constructor(pairs: Pair[], input: Token);
    get input(): Token;
    get output(): Token;
}
