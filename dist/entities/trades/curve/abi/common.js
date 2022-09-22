"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.poolMethods = exports.poolMethodsSignatures = void 0;
exports.poolMethodsSignatures = {
    'fee()': 'fee()',
    'get_dy(uint256,uint256,uint256)': 'get_dy(uint256,uint256,uint256)',
    'exchange(uint256,uint256,uint256,uint256)': 'exchange(uint256,uint256,uint256,uint256)',
};
exports.poolMethods = {
    view: {
        fee: {
            stateMutability: 'view',
            type: 'function',
            name: 'fee',
            outputs: [{ type: 'uint256', name: '' }],
            inputs: [],
        },
        coins: {
            stateMutability: 'view',
            type: 'function',
            name: 'coins',
            outputs: [{ type: 'address', name: '' }],
            inputs: [{ type: 'int128', name: '_coin' }],
        },
        underlying_coins: {
            stateMutability: 'view',
            type: 'function',
            name: 'underlying_coins',
            outputs: [{ type: 'address', name: '' }],
            inputs: [{ type: 'int128', name: '_coin' }],
        },
        'get_dy(uint256,uint256,uint256)': {
            stateMutability: 'view',
            type: 'function',
            name: 'get_dy',
            inputs: [
                { type: 'uint256', name: 'i' },
                { type: 'uint256', name: 'j' },
                { type: 'uint256', name: 'dx' },
            ],
            outputs: [{ type: 'uint256', name: '' }],
        },
        'get_dy(int128,int128,uint256)': {
            stateMutability: 'view',
            type: 'function',
            name: 'get_dy',
            inputs: [
                { type: 'int128', name: 'i' },
                { type: 'int128', name: 'j' },
                { type: 'uint256', name: 'dx' },
            ],
            outputs: [{ type: 'uint256', name: '' }],
        },
        'get_dy_underlying(uint256,uint256,uint256)': {
            stateMutability: 'view',
            type: 'function',
            name: 'get_dy_underlying',
            inputs: [
                { type: 'uint256', name: 'i' },
                { type: 'uint256', name: 'j' },
                { type: 'uint256', name: '_dx' },
            ],
            outputs: [{ type: 'uint256', name: '' }],
        },
    },
    nonpayable: {
        'exchange(int128,int128,uint256,uint256)': {
            stateMutability: 'nonpayable',
            type: 'function',
            name: 'exchange',
            inputs: [
                { type: 'int128', name: 'i' },
                { type: 'int128', name: 'j' },
                { type: 'uint256', name: '_dx' },
                { type: 'uint256', name: '_min_dy' },
            ],
            outputs: [{ type: 'uint256', name: '' }],
            gas: '5499133',
        },
        /**
         * Exchange methods
         */
        'exchange_underlying(uint256,uint256,uint256,uint256,address)': {
            stateMutability: 'nonpayable',
            type: 'function',
            name: 'exchange_underlying',
            inputs: [
                { type: 'uint256', name: 'i' },
                { type: 'uint256', name: 'j' },
                { type: 'uint256', name: '_dx' },
                { type: 'uint256', name: '_min_dy' },
                { type: 'address', name: '_receiver' },
            ],
            outputs: [{ type: 'uint256', name: '' }],
            gas: '900000',
        },
        'exchange_underlying(uint256,uint256,uint256,uint256)': {
            stateMutability: 'nonpayable',
            type: 'function',
            name: 'exchange_underlying',
            inputs: [
                { type: 'uint256', name: 'i' },
                { type: 'uint256', name: 'j' },
                { type: 'uint256', name: '_dx' },
                { type: 'uint256', name: '_min_dy' },
            ],
            outputs: [{ type: 'uint256', name: '' }],
            gas: '57522',
        },
        'exchange_underlying(int128,int128,uint256,uint256)': {
            stateMutability: 'nonpayable',
            type: 'function',
            name: 'exchange_underlying',
            inputs: [
                { type: 'int128', name: 'i' },
                { type: 'int128', name: 'j' },
                { type: 'uint256', name: 'dx' },
                { type: 'uint256', name: 'min_dy' },
            ],
            outputs: [{ type: 'uint256', name: '' }],
            gas: '6125699',
        },
    },
    payable: {
        'exchange(int128,int128,uint256,uint256)': {
            stateMutability: 'payable',
            type: 'function',
            name: 'exchange',
            inputs: [
                { type: 'int128', name: 'i' },
                { type: 'int128', name: 'j' },
                { type: 'uint256', name: 'dx' },
                { type: 'uint256', name: 'min_dy' },
            ],
            outputs: [{ type: 'uint256', name: '' }],
            gas: '2810134',
        },
        'exchange(uint256,uint256,uint256,uint256)': {
            stateMutability: 'payable',
            type: 'function',
            name: 'exchange',
            inputs: [
                { type: 'uint256', name: 'i' },
                { type: 'uint256', name: 'j' },
                { type: 'uint256', name: 'dx' },
                { type: 'uint256', name: 'min_dy' },
            ],
            outputs: [{ name: '', type: 'uint256' }],
            gas: '16775598',
        },
        'exchange(uint256,uint256,uint256,uint256,bool)': {
            stateMutability: 'payable',
            type: 'function',
            name: 'exchange',
            inputs: [
                { type: 'uint256', name: 'i' },
                { type: 'uint256', name: 'j' },
                { type: 'uint256', name: 'dx' },
                { type: 'uint256', name: 'min_dy' },
                { type: 'bool', name: 'use_eth' },
            ],
            outputs: [{ name: '', type: 'uint256' }],
            gas: '16775598',
        },
        'exchange(uint256,uint256,uint256,uint256,bool,address)': {
            stateMutability: 'payable',
            type: 'function',
            name: 'exchange',
            inputs: [
                { type: 'uint256', name: 'i' },
                { type: 'uint256', name: 'j' },
                { type: 'uint256', name: 'dx' },
                { type: 'uint256', name: 'min_dy' },
                { type: 'bool', name: 'use_eth' },
                { type: 'address', name: 'receiver' },
            ],
            outputs: [{ name: '', type: 'uint256' }],
            gas: '16775598',
        },
        'exchange_underlying(uint256,uint256,uint256,uint256)': {
            stateMutability: 'payable',
            type: 'function',
            name: 'exchange_underlying',
            inputs: [
                { type: 'uint256', name: 'i' },
                { type: 'uint256', name: 'j' },
                { type: 'uint256', name: 'dx' },
                { type: 'uint256', name: 'min_dy' },
            ],
            outputs: [{ name: '', type: 'uint256' }],
            gas: '16775396',
        },
        'exchange_underlying(uint256,uint256,uint256,uint256,address)': {
            stateMutability: 'payable',
            type: 'function',
            name: 'exchange_underlying',
            inputs: [
                { type: 'uint256', name: 'i' },
                { type: 'uint256', name: 'j' },
                { type: 'uint256', name: 'dx' },
                { type: 'uint256', name: 'min_dy' },
                { type: 'address', name: 'receiver' },
            ],
            outputs: [{ name: '', type: 'uint256' }],
            gas: '16775396',
        },
    },
};
//# sourceMappingURL=common.js.map