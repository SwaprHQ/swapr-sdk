export declare const poolMethodsSignatures: {
    'fee()': string;
    'get_dy(uint256,uint256,uint256)': string;
    'exchange(uint256,uint256,uint256,uint256)': string;
};
export declare const poolMethods: {
    view: {
        fee: {
            stateMutability: string;
            type: string;
            name: string;
            outputs: {
                type: string;
                name: string;
            }[];
            inputs: never[];
        };
        coins: {
            stateMutability: string;
            type: string;
            name: string;
            outputs: {
                type: string;
                name: string;
            }[];
            inputs: {
                type: string;
                name: string;
            }[];
        };
        underlying_coins: {
            stateMutability: string;
            type: string;
            name: string;
            outputs: {
                type: string;
                name: string;
            }[];
            inputs: {
                type: string;
                name: string;
            }[];
        };
        'get_dy(uint256,uint256,uint256)': {
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
        };
        'get_dy(int128,int128,uint256)': {
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
        };
        'get_dy_underlying(uint256,uint256,uint256)': {
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
        };
    };
    nonpayable: {
        'exchange(int128,int128,uint256,uint256)': {
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
            gas: string;
        };
        /**
         * Exchange methods
         */
        'exchange_underlying(uint256,uint256,uint256,uint256,address)': {
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
            gas: string;
        };
        'exchange_underlying(uint256,uint256,uint256,uint256)': {
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
            gas: string;
        };
        'exchange_underlying(int128,int128,uint256,uint256)': {
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
            gas: string;
        };
    };
    payable: {
        'exchange(int128,int128,uint256,uint256)': {
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
            gas: string;
        };
        'exchange(uint256,uint256,uint256,uint256)': {
            stateMutability: string;
            type: string;
            name: string;
            inputs: {
                type: string;
                name: string;
            }[];
            outputs: {
                name: string;
                type: string;
            }[];
            gas: string;
        };
        'exchange(uint256,uint256,uint256,uint256,bool)': {
            stateMutability: string;
            type: string;
            name: string;
            inputs: {
                type: string;
                name: string;
            }[];
            outputs: {
                name: string;
                type: string;
            }[];
            gas: string;
        };
        'exchange(uint256,uint256,uint256,uint256,bool,address)': {
            stateMutability: string;
            type: string;
            name: string;
            inputs: {
                type: string;
                name: string;
            }[];
            outputs: {
                name: string;
                type: string;
            }[];
            gas: string;
        };
        'exchange_underlying(uint256,uint256,uint256,uint256)': {
            stateMutability: string;
            type: string;
            name: string;
            inputs: {
                type: string;
                name: string;
            }[];
            outputs: {
                name: string;
                type: string;
            }[];
            gas: string;
        };
        'exchange_underlying(uint256,uint256,uint256,uint256,address)': {
            stateMutability: string;
            type: string;
            name: string;
            inputs: {
                type: string;
                name: string;
            }[];
            outputs: {
                name: string;
                type: string;
            }[];
            gas: string;
        };
    };
};
