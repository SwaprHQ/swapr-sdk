"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.computePoolAddress = exports.TICK_SPACINGS = exports.FeeAmount = exports.ADDRESS_ZERO = void 0;
const abi_1 = require("@ethersproject/abi");
const address_1 = require("@ethersproject/address");
const solidity_1 = require("@ethersproject/solidity");
const constants_1 = require("./constants");
exports.ADDRESS_ZERO = '0x0000000000000000000000000000000000000000';
/**
 * The default factory enabled fee amounts, denominated in hundredths of bips.
 */
var FeeAmount;
(function (FeeAmount) {
    FeeAmount["LOW"] = "LOW";
    FeeAmount["MEDIUM"] = "MEDIUM";
    FeeAmount["HIGH"] = "HIGH";
})(FeeAmount = exports.FeeAmount || (exports.FeeAmount = {}));
/**
 * The default factory tick spacings by fee amount.
 */
exports.TICK_SPACINGS = {
    [FeeAmount.LOW]: 60,
    [FeeAmount.MEDIUM]: 60,
    [FeeAmount.HIGH]: 60,
};
/**
 * This function computes the pool address for a given pair of tokens and a fee tier.
 * It uses the Swapr factory address, the addresses of the two tokens, and the pool initialization code hash.
 * The tokens are sorted before the computation, and the initialization code hash can be manually overridden.
 * @param poolDeployer  This is the address of the factory contract that deploys new pools.
 * @param tokenA The first token of the pair
 * @param tokenB The second token of the pair
 * @param initCodeHashManualOverride Optional manual override for the initialization code hash
 * @returns The computed pool address. This address can then be used to interact with the pool on the blockchain. eg. https://gnosisscan.io/address/0x6a1507579b50abfc7ccc8f9e2b428095b5063538#tokentxns
 */
function computePoolAddress({ poolDeployer, tokenA, tokenB, initCodeHashManualOverride, }) {
    const [token0, token1] = tokenA.sortsBefore(tokenB) ? [tokenA, tokenB] : [tokenB, tokenA]; // does safety checks
    return (0, address_1.getCreate2Address)(poolDeployer, (0, solidity_1.keccak256)(['bytes'], [abi_1.defaultAbiCoder.encode(['address', 'address'], [token0.address, token1.address])]), initCodeHashManualOverride !== null && initCodeHashManualOverride !== void 0 ? initCodeHashManualOverride : constants_1.POOL_INIT_CODE_HASH);
}
exports.computePoolAddress = computePoolAddress;
//# sourceMappingURL=computePoolAddress.js.map