"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProvider = exports.RPC_PROVIDER_LIST = exports.tryGetChainId = exports.wrappedCurrency = exports.wrappedAmount = void 0;
const tslib_1 = require("tslib");
const providers_1 = require("@ethersproject/providers");
const tiny_invariant_1 = tslib_1.__importDefault(require("tiny-invariant"));
const constants_1 = require("../../constants");
const currency_1 = require("../currency");
const tokenAmount_1 = require("../fractions/tokenAmount");
const token_1 = require("../token");
/**
 * Same as `wrappedCurrency` util functiom, but for `TokenAmount`
 * @param currencyAmount The currency amount to wrap
 * @param chainId The chain ID
 * @returns The wrapped currency amount if it is native, otherwise the currency itself
 * @throws an error
 */
function wrappedAmount(currencyAmount, chainId) {
    if (currencyAmount instanceof tokenAmount_1.TokenAmount)
        return currencyAmount;
    if (currency_1.Currency.isNative(currencyAmount.currency))
        return new tokenAmount_1.TokenAmount(token_1.Token.getNativeWrapper(chainId), currencyAmount.raw);
    (0, tiny_invariant_1.default)(false, 'CURRENCY');
}
exports.wrappedAmount = wrappedAmount;
/**
 * Returns the wrapped currency for the given currency if it is native
 * @param currency The currency to wrap
 * @param chainId The chain ID
 * @returns The wrapped currency if it is native, otherwise the currency itself
 * @throws an error
 */
function wrappedCurrency(currency, chainId) {
    if (currency instanceof token_1.Token)
        return currency;
    if (currency_1.Currency.isNative(currency))
        return token_1.Token.getNativeWrapper(chainId);
    (0, tiny_invariant_1.default)(false, 'CURRENCY');
}
exports.wrappedCurrency = wrappedCurrency;
/**
 * Attempts to find the chain ID of the given currencies
 * @param currencyAmount The currency amount to find the chain ID for
 * @param currency The currency to find the chain ID for
 * @returns
 */
function tryGetChainId(currencyAmount, currency) {
    return currencyAmount instanceof tokenAmount_1.TokenAmount
        ? currencyAmount.token.chainId
        : currency instanceof token_1.Token
            ? currency.chainId
            : undefined;
}
exports.tryGetChainId = tryGetChainId;
/**
 * List of RPC provider URLs for different chains.
 */
exports.RPC_PROVIDER_LIST = {
    [constants_1.ChainId.MAINNET]: 'https://mainnet.infura.io/v3/e1a3bfc40093494ca4f36b286ab36f2d',
    [constants_1.ChainId.XDAI]: 'https://poa-xdai.gateway.pokt.network/v1/lb/627cd67433e8770039fe3dba',
    [constants_1.ChainId.RINKEBY]: 'https://rinkeby.infura.io/v3/e1a3bfc40093494ca4f36b286ab36f2d',
    [constants_1.ChainId.ARBITRUM_ONE]: 'https://arb1.arbitrum.io/rpc',
    [constants_1.ChainId.ARBITRUM_RINKEBY]: 'https://rinkeby.arbitrum.io/rpc',
    [constants_1.ChainId.ARBITRUM_GOERLI]: 'https://goerli-rollup.arbitrum.io/rpc',
    [constants_1.ChainId.POLYGON]: 'https://polygon-rpc.com',
    [constants_1.ChainId.GOERLI]: 'https://goerli.infura.io/v3/e1a3bfc40093494ca4f36b286ab36f2d',
    [constants_1.ChainId.OPTIMISM_MAINNET]: 'https://mainnet.optimism.io',
    [constants_1.ChainId.OPTIMISM_GOERLI]: 'https://goerli.optimism.io',
    [constants_1.ChainId.BSC_MAINNET]: 'https://bsc-dataseed1.binance.org/',
    [constants_1.ChainId.BSC_TESTNET]: 'https://data-seed-prebsc-1-s1.binance.org:8545/',
};
/**
 * Returns a RPC provider for the given chainId.
 * @param chainId The chainId
 * @returns The RPC provider
 */
function getProvider(chainId) {
    const host = exports.RPC_PROVIDER_LIST[chainId];
    return new providers_1.JsonRpcProvider(host);
}
exports.getProvider = getProvider;
//# sourceMappingURL=utils.js.map