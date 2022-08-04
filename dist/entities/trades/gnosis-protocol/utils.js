"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDomain = void 0;
const networks_json_1 = require("@gnosis.pm/gp-v2-contracts/networks.json");
/**
 * Return the Gnosis Protocol v2 domain used for signing.
 * [Source](https://github.com/gnosis/gp-v2-contracts/blob/da33a66662ab46e573da6f194144bace18526db9/src/ts/index.ts#L3-L21)
 * @param chainId The EIP-155 chain ID.
 * signature.
 * @return An EIP-712 compatible typed domain data.
 */
function getDomain(chainId) {
    // Get settlement contract address
    const verifyingContract = networks_json_1.GPv2Settlement[chainId].address;
    if (!verifyingContract) {
        throw new Error('Unsupported network. Settlement contract is not deployed');
    }
    return {
        name: 'Gnosis Protocol',
        version: 'v2',
        chainId,
        verifyingContract,
    };
}
exports.getDomain = getDomain;
//# sourceMappingURL=utils.js.map