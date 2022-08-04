"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.determineTokeType = exports.getRoutablePools = exports.getCurveToken = exports.getTokenIndex = void 0;
const tslib_1 = require("tslib");
const constants_1 = require("../../../constants");
const fetcher_1 = require("../../../fetcher");
const tokens_1 = require("./tokens");
/**
 * Returns the token index of a token in a Curve pool
 * @param pool the Curve pool
 * @param tokenAddress the token address
 */
function getTokenIndex(pool, tokenAddress, chainId = constants_1.ChainId.MAINNET) {
    // Combine all tokens without 3CRV
    const tokenWithout2CRVand3CRV = pool.tokens.filter((token) => token.symbol.toLowerCase() !== '3crv' && token.symbol.toLowerCase() !== '2crv');
    // Use main tokens
    let tokenList = pool.tokens;
    // Append underlying tokens
    if (pool.underlyingTokens) {
        tokenList = [...tokenWithout2CRVand3CRV, ...pool.underlyingTokens];
    }
    // Append meta tokens
    else if (pool.isMeta && pool.metaTokens) {
        tokenList = [...tokenWithout2CRVand3CRV, ...pool.metaTokens];
    }
    // Search for WETH in the pool
    const poolHasWETH = tokenList.find(({ address }) => { var _a, _b, _c; return ((_c = (_b = (_a = tokens_1.CURVE_TOKENS[chainId]) === null || _a === void 0 ? void 0 : _a.weth) === null || _b === void 0 ? void 0 : _b.address) === null || _c === void 0 ? void 0 : _c.toLowerCase()) === address.toLowerCase(); });
    // Search for the main/underlying token
    let tokenIndex = tokenList.findIndex(({ address }) => address.toLowerCase() == tokenAddress.toLowerCase());
    // ETH is always at 0 all pools
    if (tokenIndex < 0 && poolHasWETH) {
        tokenIndex = 0;
    }
    return tokenIndex;
}
exports.getTokenIndex = getTokenIndex;
/**
 * Given a token, returns the token information if found otherwise returns token passed
 * @param token The token
 * @param chainId The chain ID. Default is Mainnet
 * @returns The token information or undefined if not found
 */
function getCurveToken(token, chainId = constants_1.ChainId.MAINNET) {
    const tokenList = tokens_1.CURVE_TOKENS[chainId];
    return (Object.values(tokenList).find(({ address }) => { var _a; return address.toLowerCase() === ((_a = token.address) === null || _a === void 0 ? void 0 : _a.toLowerCase()); }) ||
        Object.assign(Object.assign({}, token), { type: 'other' }));
}
exports.getCurveToken = getCurveToken;
/**
 *
 * @param pools The list of Curve pools
 * @param tokenInAddress Token in address
 * @param tokenOutAddress Token out address
 * @returns List of potential pools at which the trade can be done
 */
function getRoutablePools(pools, tokenIn, tokenOut, chainId) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const factoryPools = yield fetcher_1.Fetcher.fetchCurveFactoryPools(chainId);
        const allPools = pools.concat(factoryPools);
        return allPools.filter(({ tokens, metaTokens, underlyingTokens, allowsTradingETH }) => {
            let tokenInAddress = tokenIn.address;
            let tokenOutAddress = tokenOut.address;
            // For mainnet, account for ETH/WETH
            if (chainId === constants_1.ChainId.MAINNET) {
                const isTokenInEther = tokenIn.address.toLowerCase() === tokens_1.TOKENS_MAINNET.eth.address.toLowerCase();
                const isTokenOutEther = tokenOut.address.toLowerCase() === tokens_1.TOKENS_MAINNET.eth.address.toLowerCase();
                tokenInAddress = allowsTradingETH === true && isTokenInEther ? tokens_1.TOKENS_MAINNET.weth.address : tokenIn.address;
                tokenOutAddress = allowsTradingETH === true && isTokenOutEther ? tokens_1.TOKENS_MAINNET.weth.address : tokenOut.address;
            }
            // main tokens
            const hasTokenIn = tokens.some((token) => token.address.toLowerCase() === tokenInAddress.toLowerCase());
            const hasTokenOut = tokens.some((token) => token.address.toLowerCase() === tokenOutAddress.toLowerCase());
            // Meta tokens in MetaPools [ERC20, [...3PoolTokens]]
            const hasMetaTokenIn = metaTokens === null || metaTokens === void 0 ? void 0 : metaTokens.some((token) => token.address.toLowerCase() === tokenInAddress.toLowerCase());
            const hasMetaTokenOut = metaTokens === null || metaTokens === void 0 ? void 0 : metaTokens.some((token) => token.address.toLowerCase() === tokenOutAddress.toLowerCase());
            // Underlying tokens, similar to meta tokens
            const hasUnderlyingTokenIn = underlyingTokens === null || underlyingTokens === void 0 ? void 0 : underlyingTokens.some((token) => token.address.toLowerCase() === tokenInAddress.toLowerCase());
            const hasUnderlyingTokenOut = underlyingTokens === null || underlyingTokens === void 0 ? void 0 : underlyingTokens.some((token) => token.address.toLowerCase() === tokenOutAddress.toLowerCase());
            return ((hasTokenIn || hasUnderlyingTokenIn || hasMetaTokenIn) &&
                (hasTokenOut || hasUnderlyingTokenOut || hasMetaTokenOut));
        });
    });
}
exports.getRoutablePools = getRoutablePools;
const usd = [
    'dai',
    'jpy',
    'aud',
    'dei',
    'home',
    'fiat',
    'alcx',
    'cad',
    'usx',
    'fei',
    'crv',
    'ust',
    'vst',
    'fxs',
    'fox',
    'cvx',
    'angle',
    'gamma',
    'apw',
    'usd',
    'mim',
    'frax',
    'apv',
    'rai',
    'eur',
    'gbp',
    'chf',
    'dola',
    'krw',
];
const btc = ['btc'];
const eth = ['eth'];
/**
 * Returns tokenType based on token symbol
 * @param symbol symbol of curve token
 * @returns token type of given symbol
 */
function determineTokeType(symbol) {
    const symbolLowercased = symbol.toLocaleLowerCase();
    if (eth.includes(symbolLowercased))
        return tokens_1.TokenType.ETH;
    if (btc.includes(symbolLowercased))
        return tokens_1.TokenType.BTC;
    if (usd.includes(symbolLowercased))
        return tokens_1.TokenType.USD;
    else
        return tokens_1.TokenType.OTHER;
}
exports.determineTokeType = determineTokeType;
//# sourceMappingURL=utils.js.map