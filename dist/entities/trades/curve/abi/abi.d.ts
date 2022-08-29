import { ContractInterface } from '@ethersproject/contracts';
export declare const CURVE_3POOL_ABI: ContractInterface;
export declare const CURVE_3POOL_UNDERLYING_ABI: ContractInterface;
export declare const CURVE_EURSPOOL_ABI: ContractInterface;
export declare const CURVE_CRYPTO_SWAP_ABI: {
    stateMutability: string;
    type: string;
    name: string;
    inputs: {
        type: string;
        name: string;
    }[];
    outputs: {
        type: string;
        name: string;
    }[];
}[];
export declare const CURVE_WETH_ERC20_POOL_ABI: ContractInterface;
export declare const CURVE_ETHXERC20_ABI: ContractInterface;
export declare const CURVE_ETHXERC20_256_ABI: ContractInterface;
/**
 * A custom contract to trade on the Curve between xDAI (native token on Gnosis Chain) and USDT and USDC
 */
export declare const CURVE_DAI_EXCHANGE_ABI: ContractInterface;
