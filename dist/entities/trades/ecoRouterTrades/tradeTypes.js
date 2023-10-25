"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getExactOut = exports.getExactIn = void 0;
const tslib_1 = require("tslib");
const constants_1 = require("@ethersproject/constants");
const constants_2 = require("../../../constants");
const _0x_1 = require("../0x");
const curve_1 = require("../curve");
const gnosis_protocol_1 = require("../gnosis-protocol");
const routable_platform_1 = require("../routable-platform");
const uniswap_1 = require("../uniswap");
const uniswap_v2_1 = require("../uniswap-v2");
const utils_1 = require("./utils");
/**
 * Low-level function to fetch from Eco Router sources
 * @returns {Promise<EcoRouterResults>} List of unsorted trade sources
 */
function getExactIn({ currencyAmountIn, currencyOut, maximumSlippage, receiver = constants_1.AddressZero, user }, { uniswapV2 }, provider) {
    var _a;
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        // Error list
        const errors = [];
        // Derive the chainId from the token in or out
        const chainId = (_a = currencyAmountIn.currency.chainId) !== null && _a !== void 0 ? _a : currencyOut.chainId;
        if (!chainId) {
            return {
                errors: [new Error('Unsupported chain')],
                trades: [],
            };
        }
        // Uniswap V2
        // Get the list of Uniswap V2 platform that support current chain
        const uniswapV2PlatformList = (0, utils_1.getUniswapV2PlatformList)(chainId);
        const uniswapV2TradesList = uniswapV2PlatformList.map((platform) => tslib_1.__awaiter(this, void 0, void 0, function* () {
            var _b;
            try {
                const getAllCommonUniswapV2PairsParams = {
                    currencyA: currencyAmountIn.currency,
                    currencyB: currencyOut,
                    platform,
                    provider,
                };
                const pairs = yield (0, uniswap_v2_1.getAllCommonUniswapV2Pairs)(getAllCommonUniswapV2PairsParams);
                return ((_b = uniswap_v2_1.UniswapV2Trade.computeTradesExactIn({
                    currencyAmountIn,
                    currencyOut,
                    maximumSlippage,
                    maxHops: {
                        maxHops: uniswapV2.useMultihops ? 3 : 1,
                        maxNumResults: 1,
                    },
                    pairs,
                })[0]) !== null && _b !== void 0 ? _b : undefined);
            }
            catch (error) {
                errors.push(error);
                return undefined;
            }
        }));
        const uniswapTrade = new Promise((resolve) => {
            if (!routable_platform_1.RoutablePlatform.UNISWAP.supportsChain(chainId)) {
                return resolve(undefined);
            }
            uniswap_1.UniswapTrade.getQuote({
                quoteCurrency: currencyOut,
                amount: currencyAmountIn,
                maximumSlippage,
                recipient: receiver,
                tradeType: constants_2.TradeType.EXACT_INPUT,
            })
                .then((res) => resolve(res ? res : undefined))
                .catch((error) => {
                console.error(error);
                errors.push(error);
                resolve(undefined);
            });
        });
        // Curve
        const curveTrade = new Promise((resolve) => tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (!routable_platform_1.RoutablePlatform.CURVE.supportsChain(chainId)) {
                return resolve(undefined);
            }
            curve_1.CurveTrade.bestTradeExactIn({
                currencyAmountIn,
                currencyOut,
                maximumSlippage,
                receiver,
            })
                .then(resolve)
                .catch((error) => {
                errors.push(error);
                resolve(undefined);
            });
        }));
        // ZeroX
        const zeroXTrade = new Promise((resolve) => tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (!routable_platform_1.RoutablePlatform.ZEROX.supportsChain(chainId)) {
                return resolve(undefined);
            }
            _0x_1.ZeroXTrade.bestTradeExactIn(currencyAmountIn, currencyOut, maximumSlippage)
                .then(resolve)
                .catch((error) => {
                errors.push(error);
                resolve(undefined);
                console.error(error);
            });
        }));
        // Gnosis Protocol V2
        const gnosisProtocolTrade = new Promise((resolve) => tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (!routable_platform_1.RoutablePlatform.COW.supportsChain(chainId)) {
                return resolve(undefined);
            }
            gnosis_protocol_1.CoWTrade.bestTradeExactIn({
                currencyAmountIn,
                currencyOut,
                maximumSlippage,
                receiver,
                user,
            })
                .then(resolve)
                .catch((error) => {
                resolve(undefined);
                console.error(error);
            });
        }));
        // Wait for all promises to resolve, and
        // remove undefined values
        const unsortedTradesWithUndefined = yield Promise.all([
            ...uniswapV2TradesList,
            curveTrade,
            gnosisProtocolTrade,
            uniswapTrade,
            zeroXTrade,
        ]);
        const unsortedTrades = unsortedTradesWithUndefined.filter((trade) => !!trade);
        // Return the list of sorted trades
        return {
            errors,
            trades: (0, utils_1.sortTradesByExecutionPrice)(unsortedTrades),
        };
    });
}
exports.getExactIn = getExactIn;
/**
 * Low-level function to fetch from Eco Router sources
 * @returns {Promise<EcoRouterResults>} List of unsorted trade sources
 */
function getExactOut({ currencyAmountOut, currencyIn, maximumSlippage, receiver = constants_1.AddressZero, user }, { uniswapV2 }, provider) {
    var _a;
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        // Error list
        const errors = [];
        // Derive the chainId from the token in or out
        const chainId = (_a = currencyAmountOut.currency.chainId) !== null && _a !== void 0 ? _a : currencyIn.chainId;
        if (!chainId) {
            return {
                errors: [new Error('Unsupported chain')],
                trades: [],
            };
        }
        // Uniswap V2
        // Get the list of Uniswap V2 platform that support current chain
        const uniswapV2PlatformList = (0, utils_1.getUniswapV2PlatformList)(chainId);
        const uniswapV2TradesList = uniswapV2PlatformList.map((platform) => tslib_1.__awaiter(this, void 0, void 0, function* () {
            var _b;
            try {
                const getAllCommonUniswapV2PairsParams = {
                    currencyA: currencyAmountOut.currency,
                    currencyB: currencyIn,
                    platform,
                    provider,
                };
                const pairs = yield (0, uniswap_v2_1.getAllCommonUniswapV2Pairs)(getAllCommonUniswapV2PairsParams);
                return ((_b = uniswap_v2_1.UniswapV2Trade.computeTradesExactOut({
                    currencyAmountOut,
                    currencyIn,
                    maximumSlippage,
                    maxHops: {
                        maxHops: uniswapV2.useMultihops ? 3 : 1,
                        maxNumResults: 1,
                    },
                    pairs,
                })[0]) !== null && _b !== void 0 ? _b : undefined);
            }
            catch (error) {
                errors.push(error);
                return undefined;
            }
        }));
        // Uniswap v2 and v3
        const uniswapTrade = new Promise((resolve) => {
            if (!routable_platform_1.RoutablePlatform.UNISWAP.supportsChain(chainId)) {
                return resolve(undefined);
            }
            uniswap_1.UniswapTrade.getQuote({
                quoteCurrency: currencyIn,
                amount: currencyAmountOut,
                maximumSlippage,
                recipient: receiver,
                tradeType: constants_2.TradeType.EXACT_OUTPUT,
            })
                .then((res) => resolve(res ? res : undefined))
                .catch((error) => {
                console.error(error);
                errors.push(error);
                resolve(undefined);
            });
        });
        // Curve
        const curveTrade = new Promise((resolve) => tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (!routable_platform_1.RoutablePlatform.CURVE.supportsChain(chainId)) {
                return resolve(undefined);
            }
            curve_1.CurveTrade.bestTradeExactOut({
                currencyAmountOut,
                currencyIn,
                maximumSlippage,
                receiver,
            })
                .then(resolve)
                .catch((error) => {
                errors.push(error);
                resolve(undefined);
            });
        }));
        // ZeroX
        const zeroXTrade = new Promise((resolve) => tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (!routable_platform_1.RoutablePlatform.ZEROX.supportsChain(chainId)) {
                return resolve(undefined);
            }
            _0x_1.ZeroXTrade.bestTradeExactOut(currencyIn, currencyAmountOut, maximumSlippage)
                .then(resolve)
                .catch((error) => {
                errors.push(error);
                resolve(undefined);
                console.error(error);
            });
        }));
        // Gnosis Protocol V2
        const gnosisProtocolTrade = new Promise((resolve) => tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (!routable_platform_1.RoutablePlatform.GNOSIS_PROTOCOL.supportsChain(chainId)) {
                return resolve(undefined);
            }
            gnosis_protocol_1.CoWTrade.bestTradeExactOut({
                currencyAmountOut,
                currencyIn,
                maximumSlippage,
                receiver,
                user,
            })
                .then(resolve)
                .catch((error) => {
                resolve(undefined);
                console.error(error);
            });
        }));
        // Wait for all promises to resolve, and
        // remove undefined values
        const unsortedTradesWithUndefined = yield Promise.all([
            ...uniswapV2TradesList,
            curveTrade,
            gnosisProtocolTrade,
            uniswapTrade,
            zeroXTrade,
        ]);
        const unsortedTrades = unsortedTradesWithUndefined.filter((trade) => !!trade);
        // Return the list of sorted trades
        return {
            errors,
            trades: (0, utils_1.sortTradesByExecutionPrice)(unsortedTrades),
        };
    });
}
exports.getExactOut = getExactOut;
//# sourceMappingURL=tradeTypes.js.map