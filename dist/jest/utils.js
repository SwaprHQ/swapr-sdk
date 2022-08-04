"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ERC20_ABI = exports.unlockEVMAccount = exports.addEVMAccount = exports.getGanacheRPCProvider = exports.execAsync = void 0;
const tslib_1 = require("tslib");
const providers_1 = require("@ethersproject/providers");
const address_1 = require("@ethersproject/address");
const child_process_1 = require("child_process");
/**
 * Wraps `child_process.exec` in a promise
 * @param command
 */
function execAsync(command) {
    return new Promise((resolve, reject) => {
        return (0, child_process_1.exec)(command, (err, stdut) => {
            if (err) {
                return reject(err);
            }
            return resolve(stdut);
        });
    });
}
exports.execAsync = execAsync;
/**
 * Returns the RPC provider from ganache once it is available.
 */
function getGanacheRPCProvider(timeout = 10000) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        let retryCt = 0;
        let provider = undefined;
        while (retryCt * 100 < timeout) {
            try {
                provider = new providers_1.JsonRpcProvider();
                const isReady = yield provider.ready;
                const blockNumber = yield provider.getBlockNumber();
                if (isReady) {
                    console.log(`Provider ready @ block #${blockNumber}`);
                    break;
                }
            }
            catch (e) {
                console.log(e);
            }
            retryCt++;
        }
        return provider;
    });
}
exports.getGanacheRPCProvider = getGanacheRPCProvider;
/**
 * Unlocks a EVM wallet in Ganache
 */
function addEVMAccount(provider, account) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        return provider.send('evm_addAccount', [account, '']);
    });
}
exports.addEVMAccount = addEVMAccount;
/**
 * Unlocks a EVM wallet in Ganache
 */
function unlockEVMAccount(provider, account) {
    return provider.send('personal_unlockAccount', [account, '', 0]);
}
exports.unlockEVMAccount = unlockEVMAccount;
expect.extend({
    toBeAddress(received) {
        const pass = (0, address_1.isAddress)(received);
        if (pass) {
            return {
                message: () => `expected ${received} not to be EVM address`,
                pass: true,
            };
        }
        else {
            return {
                message: () => `expected ${received} to be EVM address`,
                pass: false,
            };
        }
    },
});
exports.ERC20_ABI = [
    {
        constant: true,
        inputs: [],
        name: 'name',
        outputs: [{ name: '', type: 'string' }],
        payable: false,
        stateMutability: 'view',
        type: 'function',
    },
    {
        constant: false,
        inputs: [{ name: '_upgradedAddress', type: 'address' }],
        name: 'deprecate',
        outputs: [],
        payable: false,
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        constant: false,
        inputs: [
            { name: '_spender', type: 'address' },
            { name: '_value', type: 'uint256' },
        ],
        name: 'approve',
        outputs: [],
        payable: false,
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        constant: true,
        inputs: [],
        name: 'deprecated',
        outputs: [{ name: '', type: 'bool' }],
        payable: false,
        stateMutability: 'view',
        type: 'function',
    },
    {
        constant: false,
        inputs: [{ name: '_evilUser', type: 'address' }],
        name: 'addBlackList',
        outputs: [],
        payable: false,
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        constant: true,
        inputs: [],
        name: 'totalSupply',
        outputs: [{ name: '', type: 'uint256' }],
        payable: false,
        stateMutability: 'view',
        type: 'function',
    },
    {
        constant: false,
        inputs: [
            { name: '_from', type: 'address' },
            { name: '_to', type: 'address' },
            { name: '_value', type: 'uint256' },
        ],
        name: 'transferFrom',
        outputs: [],
        payable: false,
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        constant: true,
        inputs: [],
        name: 'upgradedAddress',
        outputs: [{ name: '', type: 'address' }],
        payable: false,
        stateMutability: 'view',
        type: 'function',
    },
    {
        constant: true,
        inputs: [{ name: '', type: 'address' }],
        name: 'balances',
        outputs: [{ name: '', type: 'uint256' }],
        payable: false,
        stateMutability: 'view',
        type: 'function',
    },
    {
        constant: true,
        inputs: [],
        name: 'decimals',
        outputs: [{ name: '', type: 'uint256' }],
        payable: false,
        stateMutability: 'view',
        type: 'function',
    },
    {
        constant: true,
        inputs: [],
        name: 'maximumFee',
        outputs: [{ name: '', type: 'uint256' }],
        payable: false,
        stateMutability: 'view',
        type: 'function',
    },
    {
        constant: true,
        inputs: [],
        name: '_totalSupply',
        outputs: [{ name: '', type: 'uint256' }],
        payable: false,
        stateMutability: 'view',
        type: 'function',
    },
    {
        constant: false,
        inputs: [],
        name: 'unpause',
        outputs: [],
        payable: false,
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        constant: true,
        inputs: [{ name: '_maker', type: 'address' }],
        name: 'getBlackListStatus',
        outputs: [{ name: '', type: 'bool' }],
        payable: false,
        stateMutability: 'view',
        type: 'function',
    },
    {
        constant: true,
        inputs: [
            { name: '', type: 'address' },
            { name: '', type: 'address' },
        ],
        name: 'allowed',
        outputs: [{ name: '', type: 'uint256' }],
        payable: false,
        stateMutability: 'view',
        type: 'function',
    },
    {
        constant: true,
        inputs: [],
        name: 'paused',
        outputs: [{ name: '', type: 'bool' }],
        payable: false,
        stateMutability: 'view',
        type: 'function',
    },
    {
        constant: true,
        inputs: [{ name: 'who', type: 'address' }],
        name: 'balanceOf',
        outputs: [{ name: '', type: 'uint256' }],
        payable: false,
        stateMutability: 'view',
        type: 'function',
    },
    {
        constant: false,
        inputs: [],
        name: 'pause',
        outputs: [],
        payable: false,
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        constant: true,
        inputs: [],
        name: 'getOwner',
        outputs: [{ name: '', type: 'address' }],
        payable: false,
        stateMutability: 'view',
        type: 'function',
    },
    {
        constant: true,
        inputs: [],
        name: 'owner',
        outputs: [{ name: '', type: 'address' }],
        payable: false,
        stateMutability: 'view',
        type: 'function',
    },
    {
        constant: true,
        inputs: [],
        name: 'symbol',
        outputs: [{ name: '', type: 'string' }],
        payable: false,
        stateMutability: 'view',
        type: 'function',
    },
    {
        constant: false,
        inputs: [
            { name: '_to', type: 'address' },
            { name: '_value', type: 'uint256' },
        ],
        name: 'transfer',
        outputs: [],
        payable: false,
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        constant: false,
        inputs: [
            { name: 'newBasisPoints', type: 'uint256' },
            { name: 'newMaxFee', type: 'uint256' },
        ],
        name: 'setParams',
        outputs: [],
        payable: false,
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        constant: false,
        inputs: [{ name: 'amount', type: 'uint256' }],
        name: 'issue',
        outputs: [],
        payable: false,
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        constant: false,
        inputs: [{ name: 'amount', type: 'uint256' }],
        name: 'redeem',
        outputs: [],
        payable: false,
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        constant: true,
        inputs: [
            { name: '_owner', type: 'address' },
            { name: '_spender', type: 'address' },
        ],
        name: 'allowance',
        outputs: [{ name: 'remaining', type: 'uint256' }],
        payable: false,
        stateMutability: 'view',
        type: 'function',
    },
    {
        constant: true,
        inputs: [],
        name: 'basisPointsRate',
        outputs: [{ name: '', type: 'uint256' }],
        payable: false,
        stateMutability: 'view',
        type: 'function',
    },
    {
        constant: true,
        inputs: [{ name: '', type: 'address' }],
        name: 'isBlackListed',
        outputs: [{ name: '', type: 'bool' }],
        payable: false,
        stateMutability: 'view',
        type: 'function',
    },
    {
        constant: false,
        inputs: [{ name: '_clearedUser', type: 'address' }],
        name: 'removeBlackList',
        outputs: [],
        payable: false,
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        constant: true,
        inputs: [],
        name: 'MAX_UINT',
        outputs: [{ name: '', type: 'uint256' }],
        payable: false,
        stateMutability: 'view',
        type: 'function',
    },
    {
        constant: false,
        inputs: [{ name: 'newOwner', type: 'address' }],
        name: 'transferOwnership',
        outputs: [],
        payable: false,
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        constant: false,
        inputs: [{ name: '_blackListedUser', type: 'address' }],
        name: 'destroyBlackFunds',
        outputs: [],
        payable: false,
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [
            { name: '_initialSupply', type: 'uint256' },
            { name: '_name', type: 'string' },
            { name: '_symbol', type: 'string' },
            { name: '_decimals', type: 'uint256' },
        ],
        payable: false,
        stateMutability: 'nonpayable',
        type: 'constructor',
    },
    {
        anonymous: false,
        inputs: [{ indexed: false, name: 'amount', type: 'uint256' }],
        name: 'Issue',
        type: 'event',
    },
    {
        anonymous: false,
        inputs: [{ indexed: false, name: 'amount', type: 'uint256' }],
        name: 'Redeem',
        type: 'event',
    },
    {
        anonymous: false,
        inputs: [{ indexed: false, name: 'newAddress', type: 'address' }],
        name: 'Deprecate',
        type: 'event',
    },
    {
        anonymous: false,
        inputs: [
            { indexed: false, name: 'feeBasisPoints', type: 'uint256' },
            { indexed: false, name: 'maxFee', type: 'uint256' },
        ],
        name: 'Params',
        type: 'event',
    },
    {
        anonymous: false,
        inputs: [
            { indexed: false, name: '_blackListedUser', type: 'address' },
            { indexed: false, name: '_balance', type: 'uint256' },
        ],
        name: 'DestroyedBlackFunds',
        type: 'event',
    },
    {
        anonymous: false,
        inputs: [{ indexed: false, name: '_user', type: 'address' }],
        name: 'AddedBlackList',
        type: 'event',
    },
    {
        anonymous: false,
        inputs: [{ indexed: false, name: '_user', type: 'address' }],
        name: 'RemovedBlackList',
        type: 'event',
    },
    {
        anonymous: false,
        inputs: [
            { indexed: true, name: 'owner', type: 'address' },
            { indexed: true, name: 'spender', type: 'address' },
            { indexed: false, name: 'value', type: 'uint256' },
        ],
        name: 'Approval',
        type: 'event',
    },
    {
        anonymous: false,
        inputs: [
            { indexed: true, name: 'from', type: 'address' },
            { indexed: true, name: 'to', type: 'address' },
            { indexed: false, name: 'value', type: 'uint256' },
        ],
        name: 'Transfer',
        type: 'event',
    },
    { anonymous: false, inputs: [], name: 'Pause', type: 'event' },
    { anonymous: false, inputs: [], name: 'Unpause', type: 'event' },
];
//# sourceMappingURL=utils.js.map