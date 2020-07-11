import { ChainId } from '../constants';
export declare class Token {
    readonly chainId: ChainId;
    readonly address: string;
    readonly decimals: number;
    readonly symbol?: string;
    readonly name?: string;
    static fetchData(chainId: ChainId, address: string, provider?: import("@ethersproject/providers").BaseProvider, symbol?: string, name?: string): Promise<Token>;
    constructor(chainId: ChainId, address: string, decimals: number, symbol?: string, name?: string);
    equals(other: Token): boolean;
    sortsBefore(other: Token): boolean;
}
export declare const WETH: {
    1: Token;
    3: Token;
    4: Token;
    5: Token;
    42: Token;
};
