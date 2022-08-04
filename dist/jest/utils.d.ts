import { JsonRpcProvider } from '@ethersproject/providers';
/**
 * Wraps `child_process.exec` in a promise
 * @param command
 */
export declare function execAsync(command: string): Promise<string>;
/**
 * Returns the RPC provider from ganache once it is available.
 */
export declare function getGanacheRPCProvider(timeout?: number): Promise<JsonRpcProvider>;
/**
 * Unlocks a EVM wallet in Ganache
 */
export declare function addEVMAccount(provider: JsonRpcProvider, account: string): Promise<any>;
/**
 * Unlocks a EVM wallet in Ganache
 */
export declare function unlockEVMAccount(provider: JsonRpcProvider, account: string): Promise<any>;
export declare const ERC20_ABI: ({
    constant: boolean;
    inputs: {
        name: string;
        type: string;
    }[];
    name: string;
    outputs: {
        name: string;
        type: string;
    }[];
    payable: boolean;
    stateMutability: string;
    type: string;
    anonymous?: undefined;
} | {
    inputs: {
        name: string;
        type: string;
    }[];
    payable: boolean;
    stateMutability: string;
    type: string;
    constant?: undefined;
    name?: undefined;
    outputs?: undefined;
    anonymous?: undefined;
} | {
    anonymous: boolean;
    inputs: {
        indexed: boolean;
        name: string;
        type: string;
    }[];
    name: string;
    type: string;
    constant?: undefined;
    outputs?: undefined;
    payable?: undefined;
    stateMutability?: undefined;
})[];
