"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.determineTokeType = exports.getRoutablePools = exports.fetchCurveFactoryPools = exports.getCurveToken = exports.getTokenIndex = void 0;
const tslib_1 = require("tslib");
const node_fetch_1 = tslib_1.__importDefault(require("node-fetch"));
const constants_1 = require("../../../constants");
const token_1 = require("../../token");
const abi_1 = require("./abi");
const pools_1 = require("./pools");
const tokens_1 = require("./tokens");
/**
 * Returns the token index of a token in a Curve pool
 * @param pool the Curve pool
 * @param tokenAddress the token address
 */
function getTokenIndex(pool, tokenAddress, chainId = constants_1.ChainId.MAINNET) {
    var _a;
    // Combine all tokens without lpTokens
    const tokensWithoutLpToken = pool.tokens.filter((token) => token.isLPToken);
    // Use main tokens
    let tokenList = pool.tokens;
    // Append underlying tokens
    const underlyingTokens = pool.underlyingTokens && pool.underlyingTokens;
    if (underlyingTokens) {
        tokenList = [...tokensWithoutLpToken, ...underlyingTokens];
    }
    // Append meta tokens
    else if (pool.isMeta && pool.metaTokens) {
        tokenList = [...tokensWithoutLpToken, ...pool.metaTokens];
    }
    // Search for WETH in the pool
    const poolHasWETH = tokenList.find(({ address }) => { var _a, _b, _c; return ((_c = (_b = (_a = tokens_1.CURVE_TOKENS[chainId]) === null || _a === void 0 ? void 0 : _a.weth) === null || _b === void 0 ? void 0 : _b.address) === null || _c === void 0 ? void 0 : _c.toLowerCase()) === address.toLowerCase(); });
    let tokenIndex;
    // Case where both pool tokens and underlying tokens can be routed through
    if (underlyingTokens && ((_a = pool.underlyingTokens) === null || _a === void 0 ? void 0 : _a.length) === pool.tokens.length) {
        tokenIndex = pool.tokens.findIndex((item, index) => item.address.toLowerCase() == tokenAddress.toLowerCase() ||
            underlyingTokens[index].address.toLowerCase() == tokenAddress.toLowerCase());
    }
    else {
        // Search for the main/underlying token
        tokenIndex = tokenList.findIndex(({ address }) => address.toLowerCase() == tokenAddress.toLowerCase());
    }
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
 * Fetches user created factory pools for curve protocol
 */
function fetchCurveFactoryPools(chainId) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        if (pools_1.CURVE_FACTORY_SUPPORTED_APIS[chainId] === '')
            return [];
        const response = yield (0, node_fetch_1.default)(`https://api.curve.fi/api/getPools/${pools_1.CURVE_FACTORY_SUPPORTED_APIS[chainId]}/factory`);
        if (!response.ok)
            throw new Error('response not ok');
        const allPoolsArray = (yield response.json());
        //filter for low liquidty pool
        const filteredLowLiquidityPools = allPoolsArray.data.poolData.filter((item) => item.usdTotal > 100000);
        //restructures pools so they fit into curvePool type
        const pooList = filteredLowLiquidityPools.map(({ symbol, name, coins, address, implementation, isMetaPool }) => {
            var _a, _b;
            const tokens = coins.map((token) => {
                let currentToken = new token_1.Token(chainId, token.address, parseInt(token.decimals), token.symbol, token.name);
                //wraps token if its Native so that it can be matched
                if (token.address === '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE')
                    currentToken = token_1.Token.getNativeWrapper(chainId);
                const symbol = currentToken.symbol ? currentToken.symbol : token.symbol;
                return {
                    symbol,
                    name: symbol,
                    address: currentToken.address,
                    decimals: currentToken.decimals,
                    type: determineTokeType(symbol),
                    isLPToken: token.isBasePoolLpToken,
                };
            });
            const isMeta = isMetaPool || implementation.includes('meta');
            const curvePoolObject = {
                id: symbol,
                name,
                address,
                abi: abi_1.CURVE_POOL_ABI_MAP[implementation],
                isMeta,
                tokens,
            };
            //tries to find meta pool tokens
            const findPoolTokens = tokens[1] && ((_b = (_a = tokens_1.CURVE_TOKENS[chainId][tokens[1].symbol.toLocaleLowerCase()]) === null || _a === void 0 ? void 0 : _a.poolTokens) === null || _b === void 0 ? void 0 : _b.call(_a));
            //if its meta pool puts token under metaTokens else under underlying tokens
            if (findPoolTokens) {
                if (isMeta)
                    curvePoolObject.metaTokens = findPoolTokens;
                else
                    curvePoolObject.underlyingTokens = findPoolTokens;
            }
            return curvePoolObject;
        });
        return pooList;
    });
}
exports.fetchCurveFactoryPools = fetchCurveFactoryPools;
/**
 *
 * @param pools The list of Curve pools
 * @param tokenInAddress Token in address
 * @param tokenOutAddress Token out address
 * @returns List of potential pools at which the trade can be done
 */
function getRoutablePools(pools, tokenIn, tokenOut, chainId) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        return pools.filter(({ tokens, metaTokens, underlyingTokens, allowsTradingETH }) => {
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