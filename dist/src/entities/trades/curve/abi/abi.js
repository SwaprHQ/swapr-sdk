"use strict";
// ABIs
Object.defineProperty(exports, "__esModule", { value: true });
exports.CURVE_DAI_EXCHANGE_ABI = exports.CURVE_POOL_ABI_MAP = exports.CURVE_METABTC_ABI = exports.CURVE_PLAIN_ABI = exports.CURVE_METAUSD_ABI = exports.CURVE_ETHXERC20_256_ABI = exports.CURVE_ETHXERC20_ABI = exports.CURVE_WETH_ERC20_POOL_ABI = exports.CURVE_CRYPTO_SWAP_ABI = exports.CURVE_EURSPOOL_ABI = exports.CURVE_3POOL_UNDERLYING_ABI = exports.CURVE_3POOL_ABI = void 0;
const common_1 = require("./common");
// 3pool ABI which has USDC, USDT and WXDAI
exports.CURVE_3POOL_ABI = [
    common_1.poolMethods['view']['fee'],
    common_1.poolMethods['view']['get_dy(int128,int128,uint256)'],
    common_1.poolMethods['nonpayable']['exchange(int128,int128,uint256,uint256)'],
    common_1.poolMethods['nonpayable']['exchange_underlying(uint256,uint256,uint256,uint256,address)'],
];
// 3pool ABI which has USDC, USDT and WXDAI
exports.CURVE_3POOL_UNDERLYING_ABI = [
    common_1.poolMethods['view']['fee'],
    common_1.poolMethods['view']['get_dy(int128,int128,uint256)'],
    common_1.poolMethods['nonpayable']['exchange(int128,int128,uint256,uint256)'],
    common_1.poolMethods['nonpayable']['exchange_underlying(int128,int128,uint256,uint256)'],
];
// 3pool ABI which has USDC, USDT and WXDAI
exports.CURVE_EURSPOOL_ABI = [
    common_1.poolMethods['view']['fee'],
    common_1.poolMethods['view']['get_dy(uint256,uint256,uint256)'],
    common_1.poolMethods['nonpayable']['exchange(int128,int128,uint256,uint256)'],
];
exports.CURVE_CRYPTO_SWAP_ABI = [
    common_1.poolMethods['view']['fee'],
    common_1.poolMethods['view']['get_dy_underlying(uint256,uint256,uint256)'],
    common_1.poolMethods['nonpayable']['exchange_underlying(uint256,uint256,uint256,uint256)'],
    common_1.poolMethods['nonpayable']['exchange_underlying(uint256,uint256,uint256,uint256,address)'],
];
exports.CURVE_WETH_ERC20_POOL_ABI = [
    common_1.poolMethods['view']['fee'],
    common_1.poolMethods['view']['get_dy(uint256,uint256,uint256)'],
    common_1.poolMethods['payable']['exchange(uint256,uint256,uint256,uint256)'],
    common_1.poolMethods['payable']['exchange(uint256,uint256,uint256,uint256,bool)'],
    common_1.poolMethods['payable']['exchange(uint256,uint256,uint256,uint256,bool,address)'],
    common_1.poolMethods['payable']['exchange_underlying(uint256,uint256,uint256,uint256)'],
    common_1.poolMethods['payable']['exchange_underlying(uint256,uint256,uint256,uint256,address)'],
];
exports.CURVE_ETHXERC20_ABI = [
    common_1.poolMethods['view']['fee'],
    common_1.poolMethods['view']['get_dy(int128,int128,uint256)'],
    common_1.poolMethods['payable']['exchange(int128,int128,uint256,uint256)'],
];
exports.CURVE_ETHXERC20_256_ABI = [
    common_1.poolMethods['view']['fee'],
    common_1.poolMethods['view']['get_dy(uint256,uint256,uint256)'],
    common_1.poolMethods['payable']['exchange(uint256,uint256,uint256,uint256)'],
    common_1.poolMethods['payable']['exchange(uint256,uint256,uint256,uint256,bool)'],
    common_1.poolMethods['payable']['exchange_underlying(uint256,uint256,uint256,uint256)'],
];
exports.CURVE_METAUSD_ABI = [
    common_1.poolMethods['view']['fee'],
    common_1.poolMethods['view']['get_dy(int128,int128,uint256)'],
    common_1.poolMethods['nonpayable']['exchange(int128,int128,uint256,uint256)'],
    common_1.poolMethods['nonpayable']['exchange(int128,int128,int256,int256,address)'],
    common_1.poolMethods['nonpayable']['exchange_underlying(int128,int128,uint256,uint256)'],
    common_1.poolMethods['nonpayable']['exchange_underlying(int128,int128,uint256,uint256,address)'],
];
exports.CURVE_PLAIN_ABI = [
    common_1.poolMethods['view']['fee'],
    common_1.poolMethods['view']['get_dy(int128,int128,uint256)'],
    common_1.poolMethods['nonpayable']['exchange(int128,int128,uint256,uint256)'],
    common_1.poolMethods['nonpayable']['exchange(int128,int128,int256,int256,address)'],
];
exports.CURVE_METABTC_ABI = [
    common_1.poolMethods['view']['fee'],
    common_1.poolMethods['view']['get_dy(int128,int128,uint256)'],
    common_1.poolMethods['nonpayable']['exchange(int128,int128,uint256,uint256)'],
    common_1.poolMethods['nonpayable']['exchange(int128,int128,int256,int256,address)'],
    common_1.poolMethods['nonpayable']['exchange_underlying(int128,int128,uint256,uint256)'],
    common_1.poolMethods['nonpayable']['exchange_underlying(int128,int128,uint256,uint256,address)'],
];
exports.CURVE_POOL_ABI_MAP = {
    ['metabtc']: exports.CURVE_METABTC_ABI,
    ['metabtcbalances']: exports.CURVE_METABTC_ABI,
    ['metausd']: exports.CURVE_METAUSD_ABI,
    ['metausdbalances']: exports.CURVE_METAUSD_ABI,
    ['plain2balances']: exports.CURVE_PLAIN_ABI,
    ['plain2basic']: exports.CURVE_PLAIN_ABI,
    ['plain2eth']: exports.CURVE_PLAIN_ABI,
    ['plain2optimized']: exports.CURVE_PLAIN_ABI,
    ['plain3balances']: exports.CURVE_PLAIN_ABI,
    ['plain3basic']: exports.CURVE_PLAIN_ABI,
    ['plain3eth']: exports.CURVE_PLAIN_ABI,
    ['plain3optimized']: exports.CURVE_PLAIN_ABI,
    ['plain4balances']: exports.CURVE_PLAIN_ABI,
    ['plain4basic']: exports.CURVE_PLAIN_ABI,
    ['plain4eth']: exports.CURVE_PLAIN_ABI,
    ['plain4optimized']: exports.CURVE_PLAIN_ABI,
};
/**
 * A custom contract to trade on the Curve between xDAI (native token on Gnosis Chain) and USDT and USDC
 */
exports.CURVE_DAI_EXCHANGE_ABI = [
    {
        inputs: [],
        stateMutability: 'nonpayable',
        type: 'constructor',
    },
    {
        inputs: [],
        name: 'AlreadyInitialized',
        type: 'error',
    },
    {
        inputs: [],
        name: 'FailedToTransferFromWXDAI',
        type: 'error',
    },
    {
        inputs: [],
        name: 'Initialization',
        type: 'error',
    },
    {
        inputs: [],
        name: 'NotWXDAIContract',
        type: 'error',
    },
    {
        inputs: [],
        name: 'Transfer',
        type: 'error',
    },
    {
        anonymous: false,
        inputs: [],
        name: 'Initialized',
        type: 'event',
    },
    {
        inputs: [],
        name: 'USDC',
        outputs: [
            {
                internalType: 'address',
                name: '',
                type: 'address',
            },
        ],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [],
        name: 'USDT',
        outputs: [
            {
                internalType: 'address',
                name: '',
                type: 'address',
            },
        ],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [],
        name: 'WXDAI',
        outputs: [
            {
                internalType: 'address',
                name: '',
                type: 'address',
            },
        ],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [
            {
                internalType: 'address',
                name: '_tokenIn',
                type: 'address',
            },
            {
                internalType: 'uint256',
                name: '_amountIn',
                type: 'uint256',
            },
            {
                internalType: 'uint256',
                name: '_minimumAmountOut',
                type: 'uint256',
            },
            {
                internalType: 'address',
                name: '_receiver',
                type: 'address',
            },
        ],
        name: 'exchangeExactERC20ForNativeToken',
        outputs: [
            {
                internalType: 'uint256',
                name: '',
                type: 'uint256',
            },
        ],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [
            {
                internalType: 'address',
                name: '_tokenOut',
                type: 'address',
            },
            {
                internalType: 'uint256',
                name: '_minimumAmountOut',
                type: 'uint256',
            },
            {
                internalType: 'address',
                name: '_receiver',
                type: 'address',
            },
        ],
        name: 'exchangeExactNativeTokenForERC20',
        outputs: [
            {
                internalType: 'uint256',
                name: '',
                type: 'uint256',
            },
        ],
        stateMutability: 'payable',
        type: 'function',
    },
    {
        inputs: [
            {
                internalType: 'address',
                name: '_tokenIn',
                type: 'address',
            },
            {
                internalType: 'address',
                name: '_tokenOut',
                type: 'address',
            },
            {
                internalType: 'uint256',
                name: '_amountIn',
                type: 'uint256',
            },
        ],
        name: 'getEstimatedAmountOut',
        outputs: [
            {
                internalType: 'uint256',
                name: '',
                type: 'uint256',
            },
        ],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [],
        name: 'getFee',
        outputs: [
            {
                internalType: 'uint256',
                name: '',
                type: 'uint256',
            },
        ],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [
            {
                internalType: 'int128',
                name: '',
                type: 'int128',
            },
        ],
        name: 'getTokenAddress',
        outputs: [
            {
                internalType: 'address',
                name: '',
                type: 'address',
            },
        ],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [
            {
                internalType: 'address',
                name: '',
                type: 'address',
            },
        ],
        name: 'getTokenIndex',
        outputs: [
            {
                internalType: 'int128',
                name: '',
                type: 'int128',
            },
        ],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [],
        name: 'initialize',
        outputs: [
            {
                internalType: 'bool',
                name: '',
                type: 'bool',
            },
        ],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [],
        name: 'initialized',
        outputs: [
            {
                internalType: 'bool',
                name: '',
                type: 'bool',
            },
        ],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [],
        name: 'pool3crv',
        outputs: [
            {
                internalType: 'address',
                name: '',
                type: 'address',
            },
        ],
        stateMutability: 'view',
        type: 'function',
    },
    {
        stateMutability: 'payable',
        type: 'receive',
    },
];
//# sourceMappingURL=abi.js.map