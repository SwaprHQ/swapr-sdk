"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MULTICALL2_ADDRESS = exports.SWPR_CONVERTER_ADDRESS = exports.SWPR_CLAIMER_ADDRESS = exports.STAKING_REWARDS_FACTORY_ADDRESS = exports.ROUTER_ADDRESS = exports.FACTORY_ADDRESS = void 0;
const constants_1 = require("@ethersproject/constants");
const _contracts_json_1 = require("@swapr/core/.contracts.json");
const _contracts_json_2 = require("@swapr/periphery/.contracts.json");
const chains_1 = require("./chains");
const emptyAddressList = {
    [chains_1.ChainId.MAINNET]: constants_1.AddressZero,
    [chains_1.ChainId.RINKEBY]: constants_1.AddressZero,
    [chains_1.ChainId.ARBITRUM_ONE]: constants_1.AddressZero,
    [chains_1.ChainId.ARBITRUM_RINKEBY]: constants_1.AddressZero,
    [chains_1.ChainId.ARBITRUM_GOERLI]: constants_1.AddressZero,
    [chains_1.ChainId.XDAI]: constants_1.AddressZero,
    [chains_1.ChainId.POLYGON]: constants_1.AddressZero,
    [chains_1.ChainId.GOERLI]: constants_1.AddressZero,
    [chains_1.ChainId.OPTIMISM_MAINNET]: constants_1.AddressZero,
    [chains_1.ChainId.OPTIMISM_GOERLI]: constants_1.AddressZero,
    [chains_1.ChainId.BSC_MAINNET]: constants_1.AddressZero,
    [chains_1.ChainId.BSC_TESTNET]: constants_1.AddressZero,
    [chains_1.ChainId.ZK_SYNC_ERA_MAINNET]: constants_1.AddressZero,
    [chains_1.ChainId.ZK_SYNC_ERA_TESTNET]: constants_1.AddressZero,
};
/**
 * List of the Swapr Factory contract address for each chain
 */
exports.FACTORY_ADDRESS = Object.assign(Object.assign({}, emptyAddressList), { [chains_1.ChainId.MAINNET]: _contracts_json_1.mainnet.factory, [chains_1.ChainId.RINKEBY]: _contracts_json_1.rinkeby.factory, [chains_1.ChainId.ARBITRUM_ONE]: _contracts_json_1.arbitrumOne.factory, [chains_1.ChainId.ARBITRUM_RINKEBY]: _contracts_json_1.arbitrumRinkebyTestnet.factory, [chains_1.ChainId.ARBITRUM_GOERLI]: _contracts_json_1.arbitrumGoerliTestnet.factory, [chains_1.ChainId.XDAI]: _contracts_json_1.xdai.factory, [chains_1.ChainId.GOERLI]: _contracts_json_1.goerli.factory });
/**
 * List of the Swapr Router contract address for each chain
 */
exports.ROUTER_ADDRESS = Object.assign(Object.assign({}, emptyAddressList), { [chains_1.ChainId.RINKEBY]: _contracts_json_2.rinkeby.router, [chains_1.ChainId.MAINNET]: _contracts_json_2.mainnet.router, [chains_1.ChainId.XDAI]: _contracts_json_2.xdai.router, [chains_1.ChainId.ARBITRUM_ONE]: _contracts_json_2.arbitrumOne.router, [chains_1.ChainId.ARBITRUM_RINKEBY]: _contracts_json_2.arbitrumRinkebyTestnet.router, [chains_1.ChainId.ARBITRUM_GOERLI]: _contracts_json_2.arbitrumGoerliTestnet.router, [chains_1.ChainId.GOERLI]: _contracts_json_2.goerli.router });
/**
 * List of the Swapr Staking Factory contract address for each chain
 */
exports.STAKING_REWARDS_FACTORY_ADDRESS = Object.assign(Object.assign({}, emptyAddressList), { [chains_1.ChainId.MAINNET]: '0x156F0568a6cE827e5d39F6768A5D24B694e1EA7b', [chains_1.ChainId.RINKEBY]: '0x0f9E49d473B813abe33F1BAB11fa9E16eE850EBa', [chains_1.ChainId.XDAI]: '0xa039793Af0bb060c597362E8155a0327d9b8BEE8', [chains_1.ChainId.ARBITRUM_ONE]: '0xecA7F78d59D16812948849663b26FE10E320f80C', [chains_1.ChainId.ARBITRUM_RINKEBY]: '0x41e657cAdE74f45b7E2F0F4a5AeE0239f2fB4E1F', [chains_1.ChainId.ARBITRUM_GOERLI]: '0x95Bf186929194099899139Ff79998cC147290F28' });
/**
 * List of the Swapr Staking Factory contract address for each chain
 */
exports.SWPR_CLAIMER_ADDRESS = Object.assign(Object.assign({}, emptyAddressList), { [chains_1.ChainId.RINKEBY]: '0x6D525E4115d339aD4e336bCF4C85A1Fb8f4a594C', [chains_1.ChainId.ARBITRUM_RINKEBY]: '0x99583f330814E04de96C0288FBF82B5E35A009dc', [chains_1.ChainId.ARBITRUM_ONE]: '0xe54942077Df7b8EEf8D4e6bCe2f7B58B0082b0cd' });
/**
 * The Swapr Converter contract address, available on Arbritrum One
 */
exports.SWPR_CONVERTER_ADDRESS = Object.assign(Object.assign({}, emptyAddressList), { [chains_1.ChainId.ARBITRUM_ONE]: '0x2b058af96175A847Bf3E5457B3A702F807daDdFd' });
/**
 * Multicall2 contract address
 * NOTE: this is an external repository not maintained by any entity funded or directed by MakerDAO governance.
 * @see https://github.com/mds1/multicall/blob/main/deployments.json to check
 * MakerDAO's fork from https://github.com/makerdao/multicall
 */
exports.MULTICALL2_ADDRESS = {
    [chains_1.ChainId.MAINNET]: '0x5ba1e12693dc8f9c48aad8770482f4739beed696',
    [chains_1.ChainId.RINKEBY]: '0x5ba1e12693dc8f9c48aad8770482f4739beed696',
    [chains_1.ChainId.ARBITRUM_ONE]: '0x80c7dd17b01855a6d2347444a0fcc36136a314de',
    [chains_1.ChainId.XDAI]: '0xFAa296891cA6CECAF2D86eF5F7590316d0A17dA0',
    [chains_1.ChainId.ARBITRUM_RINKEBY]: '0x309e61A4c36a4a9f131f8844eA521F6384B6C9E3',
    [chains_1.ChainId.ARBITRUM_GOERLI]: '0xBbB06b25484AB9E23FEe8Ee321Af8e253ea7A76a',
    [chains_1.ChainId.POLYGON]: '0x275617327c958bD06b5D6b871E7f491D76113dd8',
    [chains_1.ChainId.GOERLI]: '0x5BA1e12693Dc8F9c48aAD8770482f4739bEeD696',
    [chains_1.ChainId.OPTIMISM_MAINNET]: '0xca11bde05977b3631167028862be2a173976ca11',
    [chains_1.ChainId.OPTIMISM_GOERLI]: '0xca11bde05977b3631167028862be2a173976ca11',
    [chains_1.ChainId.BSC_MAINNET]: '0xca11bde05977b3631167028862be2a173976ca11',
    [chains_1.ChainId.BSC_TESTNET]: '0xca11bde05977b3631167028862be2a173976ca11',
    [chains_1.ChainId.ZK_SYNC_ERA_MAINNET]: '0xF9cda624FBC7e059355ce98a31693d299FACd963',
    [chains_1.ChainId.ZK_SYNC_ERA_TESTNET]: '0xF9cda624FBC7e059355ce98a31693d299FACd963',
};
//# sourceMappingURL=addresses.js.map