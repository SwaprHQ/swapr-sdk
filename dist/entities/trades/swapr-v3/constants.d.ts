export declare const ROUTER_ADDRESS = "0xfFB643E73f280B97809A8b41f7232AB401a04ee1";
export declare const POOL_DEPLOYER_ADDRESS = "0xC1b576AC6Ec749d5Ace1787bF9Ec6340908ddB47";
export declare const POOL_INIT_CODE_HASH = "0xbce37a54eab2fcd71913a0d40723e04238970e7fc1159bfd58ad5b79531697e7";
export type BaseToken = {
    chainId: number;
    decimals: number;
    symbol: string;
    name: string;
    isNative: boolean;
    isToken: boolean;
    address: string;
};
export declare const baseTokens: BaseToken[];
