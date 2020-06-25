import { BigintIsh } from '../constants';
import { Token } from './token';
import { TokenAmount } from './fractions/tokenAmount';
export declare class Pair {
    readonly liquidityToken: Token;
    private readonly tokenAmounts;
    static getAddress(tokenA: Token, tokenB: Token): string;
    static fetchData(tokenA: Token, tokenB: Token, provider?: import("@ethersproject/providers").BaseProvider): Promise<Pair>;
    constructor(tokenAmountA: TokenAmount, tokenAmountB: TokenAmount);
    get token0(): Token;
    get token1(): Token;
    get reserve0(): TokenAmount;
    get reserve1(): TokenAmount;
    reserveOf(token: Token): TokenAmount;
    getOutputAmount(inputAmount: TokenAmount): [TokenAmount, Pair];
    getInputAmount(outputAmount: TokenAmount): [TokenAmount, Pair];
    getLiquidityMinted(totalSupply: TokenAmount, tokenAmountA: TokenAmount, tokenAmountB: TokenAmount): TokenAmount;
    getLiquidityValue(token: Token, totalSupply: TokenAmount, liquidity: TokenAmount, feeOn?: boolean, kLast?: BigintIsh): TokenAmount;
}
