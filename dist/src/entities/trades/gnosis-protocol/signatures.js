"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.signOrderCancellation = exports.signOrder = exports.getSigningSchemeLibValue = void 0;
const tslib_1 = require("tslib");
const sign_1 = require("@gnosis.pm/gp-v2-contracts/lib/commonjs/sign");
const signers_1 = require("@gnosis.pm/gp-v2-contracts/lib/commonjs/signers");
const utils_1 = require("./utils");
// For error codes, see:
// - https://eth.wiki/json-rpc/json-rpc-error-codes-improvement-proposal
// - https://www.jsonrpc.org/specification#error_object
const METAMASK_SIGNATURE_ERROR_CODE = -32603;
const METHOD_NOT_FOUND_ERROR_CODE = -32601;
const V4_ERROR_MSG_REGEX = /eth_signTypedData_v4 does not exist/i;
const V3_ERROR_MSG_REGEX = /eth_signTypedData_v3 does not exist/i;
const RPC_REQUEST_FAILED_REGEX = /RPC request failed/i;
const METAMASK_STRING_CHAINID_REGEX = /provided chainid .* must match the active chainid/i;
const mapSigningSchema = new Map([
    [sign_1.SigningScheme.EIP712, { libraryValue: 0, apiValue: 'eip712' }],
    [sign_1.SigningScheme.ETHSIGN, { libraryValue: 1, apiValue: 'ethsign' }],
    [sign_1.SigningScheme.EIP1271, { libraryValue: 2, apiValue: 'eip1271' }],
    [sign_1.SigningScheme.PRESIGN, { libraryValue: 3, apiValue: 'presign' }],
]);
function _getSigningSchemeInfo(ecdaSigningScheme) {
    const value = mapSigningSchema.get(ecdaSigningScheme);
    if (value === undefined) {
        throw new Error('Unknown schema ' + ecdaSigningScheme);
    }
    return value;
}
function getSigningSchemeLibValue(ecdaSigningScheme) {
    return _getSigningSchemeInfo(ecdaSigningScheme).libraryValue;
}
exports.getSigningSchemeLibValue = getSigningSchemeLibValue;
function _signOrder(params) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const { chainId, signer, order, signingScheme } = params;
        const domain = (0, utils_1.getDomain)(chainId);
        console.log('[utils:signature] signOrder', {
            domain,
            order,
            signer,
            signingScheme,
            signingSchemeLibValue: getSigningSchemeLibValue(signingScheme),
        });
        return (0, sign_1.signOrder)(domain, order, signer, getSigningSchemeLibValue(signingScheme));
    });
}
function _signOrderCancellation(params) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const { chainId, signer, signingScheme, orderId } = params;
        const domain = (0, utils_1.getDomain)(chainId);
        console.log('[utils:signature] signOrderCancellation', {
            domain,
            orderId,
            signer,
        });
        return (0, sign_1.signOrderCancellation)(domain, orderId, signer, getSigningSchemeLibValue(signingScheme));
    });
}
function _signPayload(payload, signFn, signer, signingMethod = 'v4') {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const signingScheme = signingMethod === 'eth_sign' ? sign_1.SigningScheme.ETHSIGN : sign_1.SigningScheme.EIP712;
        let signature = null;
        let _signer;
        try {
            switch (signingMethod) {
                case 'v3':
                    _signer = new signers_1.TypedDataV3Signer(signer);
                    break;
                case 'int_v4':
                    _signer = new signers_1.IntChainIdTypedDataV4Signer(signer);
                    break;
                default:
                    _signer = signer;
            }
        }
        catch (e) {
            console.error('Wallet not supported:', e);
            throw new Error('Wallet not supported');
        }
        try {
            signature = (yield signFn(Object.assign(Object.assign({}, payload), { signer: _signer, signingScheme }))); // Only ECDSA signing supported for now
        }
        catch (e) {
            if (e.code === METHOD_NOT_FOUND_ERROR_CODE || RPC_REQUEST_FAILED_REGEX.test(e.message)) {
                // Maybe the wallet returns the proper error code? We can only hope 🤞
                // OR it failed with a generic message, there's no error code set, and we also hope it'll work
                // with other methods...
                switch (signingMethod) {
                    case 'v4':
                        return _signPayload(payload, signFn, signer, 'v3');
                    case 'v3':
                        return _signPayload(payload, signFn, signer, 'eth_sign');
                    default:
                        throw e;
                }
            }
            else if (METAMASK_STRING_CHAINID_REGEX.test(e.message)) {
                // Metamask now enforces chainId to be an integer
                return _signPayload(payload, signFn, signer, 'int_v4');
            }
            else if (e.code === METAMASK_SIGNATURE_ERROR_CODE) {
                // We tried to sign order the nice way.
                // That works fine for regular MM addresses. Does not work for Hardware wallets, though.
                // See https://github.com/MetaMask/metamask-extension/issues/10240#issuecomment-810552020
                // So, when that specific error occurs, we know this is a problem with MM + HW.
                // Then, we fallback to ETHSIGN.
                return _signPayload(payload, signFn, signer, 'eth_sign');
            }
            else if (V4_ERROR_MSG_REGEX.test(e.message)) {
                // Failed with `v4`, and the wallet does not set the proper error code
                return _signPayload(payload, signFn, signer, 'v3');
            }
            else if (V3_ERROR_MSG_REGEX.test(e.message)) {
                // Failed with `v3`, and the wallet does not set the proper error code
                return _signPayload(payload, signFn, signer, 'eth_sign');
            }
            else {
                // Some other error signing. Let it bubble up.
                console.error(e);
                throw e;
            }
        }
        // eslint-disable-next-line
        // @ts-ignore
        return { signature: signature.data.toString(), signingScheme };
    });
}
function signOrder(order, chainId, signer) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        return _signPayload({ order, chainId }, _signOrder, signer);
    });
}
exports.signOrder = signOrder;
function signOrderCancellation(orderId, chainId, signer) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        return _signPayload({ orderId, chainId }, _signOrderCancellation, signer);
    });
}
exports.signOrderCancellation = signOrderCancellation;
//# sourceMappingURL=signatures.js.map