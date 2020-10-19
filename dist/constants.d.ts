import JSBI from 'jsbi';
import PERMISSIVE_MULTICALL_ABI from './abis/PermissiveMulticall.json';
import TOKEN_REGISTRY_ABI from './abis/token-registry.json';
export declare type BigintIsh = JSBI | bigint | string;
export declare enum ChainId {
    MAINNET = 1,
    ROPSTEN = 3,
    RINKEBY = 4,
    GÖRLI = 5,
    KOVAN = 42
}
export declare enum TradeType {
    EXACT_INPUT = 0,
    EXACT_OUTPUT = 1
}
export declare enum Rounding {
    ROUND_DOWN = 0,
    ROUND_HALF_UP = 1,
    ROUND_UP = 2
}
export declare const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
export declare const FACTORY_ADDRESS: {
    [chainId: number]: string;
};
export declare const TOKEN_REGISTRY_ADDRESS: {
    [chainId: number]: string;
};
export declare const DXSWAP_TOKEN_LIST_ID = 1;
export declare const INIT_CODE_HASH = "0x4e9705def664ab284f8d926dd36c91628cc804185ca7ea83ac2c65d79f51524a";
export declare const MINIMUM_LIQUIDITY: JSBI;
export declare const ZERO: JSBI;
export declare const ONE: JSBI;
export declare const TWO: JSBI;
export declare const THREE: JSBI;
export declare const FIVE: JSBI;
export declare const TEN: JSBI;
export declare const _30: JSBI;
export declare const _100: JSBI;
export declare const _1000: JSBI;
export declare const _10000: JSBI;
export declare const defaultSwapFee: JSBI;
export declare const defaultProtocolFeeDenominator: JSBI;
export declare enum SolidityType {
    uint8 = "uint8",
    uint256 = "uint256"
}
export declare const SOLIDITY_TYPE_MAXIMA: {
    uint8: JSBI;
    uint256: JSBI;
};
declare const PERMISSIVE_MULTICALL_ADDRESS: {
    [chainId: number]: string;
};
export { PERMISSIVE_MULTICALL_ABI, TOKEN_REGISTRY_ABI, PERMISSIVE_MULTICALL_ADDRESS };
