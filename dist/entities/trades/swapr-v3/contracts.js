"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getQuoterContract = exports.getRouterContract = exports.getPoolsContract = void 0;
const contracts_1 = require("@ethersproject/contracts");
const constants_1 = require("../../../constants");
const utils_1 = require("../utils");
const abi_1 = require("./abi");
const constants_2 = require("./constants");
function getPoolsContract(pool_address) {
    return new contracts_1.Contract(pool_address, abi_1.SWAPR_ALGEBRA_POOL_ABI, (0, utils_1.getProvider)(constants_1.ChainId.GNOSIS));
}
exports.getPoolsContract = getPoolsContract;
function getRouterContract() {
    return new contracts_1.Contract(constants_2.SWAPR_ALGEBRA_CONTRACTS.router, abi_1.SWAPR_ALGEBRA_ROUTER_ABI, (0, utils_1.getProvider)(constants_1.ChainId.GNOSIS));
}
exports.getRouterContract = getRouterContract;
function getQuoterContract() {
    return new contracts_1.Contract(constants_2.SWAPR_ALGEBRA_CONTRACTS.quoter, abi_1.SWAPR_ALGEBRA_QUOTER_ABI, (0, utils_1.getProvider)(constants_1.ChainId.GNOSIS));
}
exports.getQuoterContract = getQuoterContract;
//# sourceMappingURL=contracts.js.map