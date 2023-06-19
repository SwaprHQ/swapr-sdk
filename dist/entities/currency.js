"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BNB = exports.MATIC = exports.XDAI = exports.ETHER = exports.USD = exports.Currency = void 0;
const tslib_1 = require("tslib");
const jsbi_1 = tslib_1.__importDefault(require("jsbi"));
const constants_1 = require("../constants");
const utils_1 = require("../utils");
const NULL_ADDRESS = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE';
/**
 * A currency is any fungible financial instrument on the target chain.
 *
 * The only instances of the base class `Currency` are native currencies such as Ether for Ethereum and xDAI for xDAI.
 */
class Currency {
    /**
     * Constructs an instance of the base class `Currency`. The only instance of the base class `Currency` is `Currency.ETHER`.
     * @param decimals decimals of the currency
     * @param symbol symbol of the currency
     * @param name of the currency
     */
    constructor(decimals, symbol, name, address) {
        (0, utils_1.validateSolidityTypeInstance)(jsbi_1.default.BigInt(decimals), constants_1.SolidityType.uint8);
        this.decimals = decimals;
        this.symbol = symbol;
        this.name = name;
        this.address = address;
    }
    static isNative(currency) {
        return Object.values(Currency.NATIVE_CURRENCY).indexOf(currency) >= 0;
    }
    static getNative(chainId) {
        return Currency.NATIVE_CURRENCY[chainId];
    }
}
exports.Currency = Currency;
// fiat currencies used to represent countervalues
Currency.USD = new Currency(18, 'USD', 'US dollar');
/**
 * Ethereum and Ethereum testnets native currency.
 */
Currency.ETHER = new Currency(18, 'ETH', 'Ether', NULL_ADDRESS);
Currency.OPTIMISM_ETHER = new Currency(18, 'ETH', 'Ether', '0xDeadDeAddeAddEAddeadDEaDDEAdDeaDDeAD0000');
Currency.ZK_SYNC_ERA_ETHER = new Currency(18, 'ETH', 'Ether', '0x0000000000000000000000000000000000000000');
/**
 * Gnosis Chain native currency
 */
Currency.XDAI = new Currency(18, 'XDAI', 'xDAI', NULL_ADDRESS);
/**
 * Polygon PoS native currency
 */
Currency.MATIC = new Currency(18, 'MATIC', 'Matic', NULL_ADDRESS);
/**
 * BSC native currency
 */
Currency.BNB = new Currency(18, 'BNB', 'Binance Coin', NULL_ADDRESS);
Currency.NATIVE_CURRENCY = {
    [constants_1.ChainId.MAINNET]: Currency.ETHER,
    [constants_1.ChainId.RINKEBY]: Currency.ETHER,
    [constants_1.ChainId.ARBITRUM_ONE]: Currency.ETHER,
    [constants_1.ChainId.ARBITRUM_RINKEBY]: Currency.ETHER,
    [constants_1.ChainId.ARBITRUM_GOERLI]: Currency.ETHER,
    [constants_1.ChainId.XDAI]: Currency.XDAI,
    [constants_1.ChainId.POLYGON]: Currency.MATIC,
    [constants_1.ChainId.GOERLI]: Currency.ETHER,
    [constants_1.ChainId.OPTIMISM_MAINNET]: Currency.OPTIMISM_ETHER,
    [constants_1.ChainId.OPTIMISM_GOERLI]: Currency.OPTIMISM_ETHER,
    [constants_1.ChainId.BSC_MAINNET]: Currency.BNB,
    [constants_1.ChainId.BSC_TESTNET]: Currency.BNB,
    [constants_1.ChainId.ZK_SYNC_ERA_MAINNET]: Currency.ZK_SYNC_ERA_ETHER,
    [constants_1.ChainId.ZK_SYNC_ERA_TESTNET]: Currency.ZK_SYNC_ERA_ETHER,
};
exports.USD = Currency.USD;
exports.ETHER = Currency.ETHER;
exports.XDAI = Currency.XDAI;
exports.MATIC = Currency.MATIC;
exports.BNB = Currency.BNB;
//# sourceMappingURL=currency.js.map