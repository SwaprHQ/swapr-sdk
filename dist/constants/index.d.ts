import JSBI from 'jsbi';
export * from './addresses';
export * from './chains';
export * from './solidity';
export type BigintIsh = JSBI | bigint | string;
export declare enum TradeType {
    EXACT_INPUT = 0,
    EXACT_OUTPUT = 1
}
export declare enum Rounding {
    ROUND_DOWN = 0,
    ROUND_HALF_UP = 1,
    ROUND_UP = 2
}
export declare const SWPR_WHITELIST_IPFS_HASH = "QmcjTAvDJZU339jrc9Ky2pXKR68R1SjnwdyGSQjt1kad9r";
export declare const INIT_CODE_HASH = "0xd306a548755b9295ee49cc729e13ca4a45e00199bbd890fa146da43a50571776";
export declare const MINIMUM_LIQUIDITY: JSBI;
export declare const ZERO: JSBI;
export declare const ONE: JSBI;
export declare const TWO: JSBI;
export declare const THREE: JSBI;
export declare const FIVE: JSBI;
export declare const TEN: JSBI;
export declare const _25: JSBI;
export declare const SECONDS_IN_YEAR: JSBI;
export declare const _30: JSBI;
export declare const _100: JSBI;
export declare const _1000: JSBI;
export declare const _10000: JSBI;
export declare const defaultSwapFee: JSBI;
export declare const defaultProtocolFeeDenominator: JSBI;
