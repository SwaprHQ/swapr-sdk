"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VelodromeTrade = void 0;
const tslib_1 = require("tslib");
const constants_1 = require("@ethersproject/constants");
const contracts_1 = require("@ethersproject/contracts");
const units_1 = require("@ethersproject/units");
const debug_1 = tslib_1.__importDefault(require("debug"));
const tiny_invariant_1 = tslib_1.__importDefault(require("tiny-invariant"));
const constants_2 = require("../../../constants");
const utils_1 = require("../../../utils");
const currency_1 = require("../../currency");
const fractions_1 = require("../../fractions");
const constants_3 = require("../constants");
const trade_1 = require("../interfaces/trade");
const routable_platform_1 = require("../routable-platform");
const utilts_1 = require("../uniswap-v2/utilts");
const utils_2 = require("../utils");
const abi_1 = require("./abi");
const contants_1 = require("./contants");
const utils_3 = require("./utils");
// Debuging logger. See documentation to enable logging.
const debugVelodromeGetQuote = (0, debug_1.default)('ecoRouter:velodrome:getQuote');
/**
 * UniswapTrade uses the AutoRouter to find best trade across V2 and V3 pools
 */
class VelodromeTrade extends trade_1.Trade {
    constructor({ maximumSlippage, currencyAmountIn, currencyAmountOut, tradeType, chainId, routes, priceImpact, }) {
        super({
            details: undefined,
            type: tradeType,
            inputAmount: currencyAmountIn,
            outputAmount: currencyAmountOut,
            maximumSlippage,
            platform: routable_platform_1.RoutablePlatform.VELODROME,
            chainId,
            executionPrice: new fractions_1.Price({
                baseCurrency: currencyAmountIn.currency,
                quoteCurrency: currencyAmountOut.currency,
                denominator: currencyAmountIn.raw,
                numerator: currencyAmountOut.raw,
            }),
            routes,
            priceImpact,
            fee: new fractions_1.Percent('2', '10000'),
            approveAddress: contants_1.ROUTER_ADDRESS,
        });
    }
    static getQuote({ amount, quoteCurrency, tradeType, maximumSlippage, recipient }, provider) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const chainId = (0, utils_2.tryGetChainId)(amount, quoteCurrency);
            (0, tiny_invariant_1.default)(chainId, 'VelodromeQuote.getQuote: chainId is required');
            // Defaults
            recipient = recipient || constants_1.AddressZero;
            maximumSlippage = maximumSlippage || constants_3.maximumSlippage;
            provider = provider || (0, utils_2.getProvider)(chainId);
            // Must match the currencies provided
            (0, tiny_invariant_1.default)((yield provider.getNetwork()).chainId == chainId, `UniswapTrade.getQuote: currencies chainId does not match provider's chainId`);
            const currencyIn = amount.currency;
            const currencyOut = quoteCurrency;
            const wrappedCurrencyIn = (0, utils_2.wrappedCurrency)(currencyIn, chainId);
            const wrappedCurrencyOut = (0, utils_2.wrappedCurrency)(currencyOut, chainId);
            debugVelodromeGetQuote({
                amount,
                quoteCurrency,
                currencyIn,
                currencyOut,
                tradeType,
                recipient,
                maximumSlippage,
            });
            let bestAmountOut;
            let finalValue;
            try {
                const bestAmount = yield (0, utils_3.getBestRoute)({
                    currencyIn: wrappedCurrencyIn,
                    currencyOut: wrappedCurrencyOut,
                    amount,
                    provider,
                    chainId,
                });
                bestAmountOut = bestAmount;
                finalValue = bestAmount === null || bestAmount === void 0 ? void 0 : bestAmount.finalValue.toString();
                if (!bestAmount) {
                    return null;
                }
                if (tradeType === constants_2.TradeType.EXACT_OUTPUT) {
                    const bestAmountForOutput = yield (0, utils_3.getBestRoute)({
                        currencyIn: wrappedCurrencyOut,
                        currencyOut: wrappedCurrencyIn,
                        amount: new fractions_1.TokenAmount(wrappedCurrencyOut, bestAmount.finalValue.toString()),
                        provider,
                        chainId,
                    });
                    bestAmountOut = bestAmountForOutput;
                }
                if (!finalValue || !bestAmountOut) {
                    return null;
                }
                const libraryContract = new contracts_1.Contract(contants_1.LIBRARY_ADDRESS, abi_1.LIBRARY_ABI, provider);
                let totalRatio = 1;
                for (let i = 0; i < bestAmountOut.routes.length; i++) {
                    const amountIn = bestAmountOut.receiveAmounts[i];
                    const res = yield libraryContract['getTradeDiff(uint256,address,address,bool)'](amountIn, bestAmountOut.routes[i].from, bestAmountOut.routes[i].to, bestAmountOut.routes[i].stable);
                    const decimals = tradeType === constants_2.TradeType.EXACT_INPUT ? quoteCurrency.decimals : amount.currency.decimals;
                    const numberA = (0, units_1.formatUnits)(res.a, decimals);
                    const numberB = (0, units_1.formatUnits)(res.b, decimals);
                    const ratio = parseFloat(numberB) / parseFloat(numberA);
                    totalRatio = totalRatio * ratio;
                }
                const calculation = Math.round((1 - totalRatio) * 1000);
                const priceImpact = new fractions_1.Percent(calculation.toString(), '1000');
                const convertToNative = (amount, currency, chainId) => {
                    if (currency_1.Currency.isNative(currency))
                        return fractions_1.CurrencyAmount.nativeCurrency(amount, chainId);
                    return new fractions_1.TokenAmount((0, utils_2.wrappedCurrency)(currency, chainId), amount);
                };
                const currencyAmountIn = constants_2.TradeType.EXACT_INPUT === tradeType ? amount : convertToNative(finalValue.toString(), currencyOut, chainId);
                const currencyAmountOut = constants_2.TradeType.EXACT_INPUT === tradeType
                    ? convertToNative(bestAmountOut.finalValue.toString(), currencyOut, chainId)
                    : convertToNative(bestAmountOut.finalValue.toString(), currencyIn, chainId);
                return new VelodromeTrade({
                    maximumSlippage,
                    currencyAmountIn,
                    currencyAmountOut,
                    tradeType,
                    chainId,
                    routes: bestAmountOut.routes,
                    priceImpact,
                });
            }
            catch (ex) {
                console.error(ex);
                return null;
            }
        });
    }
    minimumAmountOut() {
        if (this.tradeType === constants_2.TradeType.EXACT_OUTPUT) {
            return this.outputAmount;
        }
        else {
            const slippageAdjustedAmountOut = new fractions_1.Fraction(constants_2.ONE)
                .add(this.maximumSlippage)
                .invert()
                .multiply(this.outputAmount.raw).quotient;
            return this.outputAmount instanceof fractions_1.TokenAmount
                ? new fractions_1.TokenAmount(this.outputAmount.token, slippageAdjustedAmountOut)
                : fractions_1.CurrencyAmount.nativeCurrency(slippageAdjustedAmountOut, this.chainId);
        }
    }
    maximumAmountIn() {
        if (this.tradeType === constants_2.TradeType.EXACT_INPUT) {
            return this.inputAmount;
        }
        else {
            const slippageAdjustedAmountIn = new fractions_1.Fraction(constants_2.ONE)
                .add(this.maximumSlippage)
                .multiply(this.inputAmount.raw).quotient;
            return this.inputAmount instanceof fractions_1.TokenAmount
                ? new fractions_1.TokenAmount(this.inputAmount.token, slippageAdjustedAmountIn)
                : fractions_1.CurrencyAmount.nativeCurrency(slippageAdjustedAmountIn, this.chainId);
        }
    }
    /**
     * Returns unsigned transaction for the trade
     * @returns the unsigned transaction
     */
    swapTransaction(options) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const nativeCurrency = currency_1.Currency.getNative(this.chainId);
            const etherIn = this.inputAmount.currency === nativeCurrency;
            const etherOut = this.outputAmount.currency === nativeCurrency;
            // the router does not support both ether in and out
            (0, tiny_invariant_1.default)(this.routes, 'No Avaliable routes');
            (0, tiny_invariant_1.default)(!(etherIn && etherOut), 'ETHER_IN_OUT');
            (0, tiny_invariant_1.default)(options.ttl && options.ttl > 0, 'TTL');
            (0, tiny_invariant_1.default)(this.inputAmount.currency.address && this.outputAmount.currency.address, 'No currency');
            const to = (0, utils_1.validateAndParseAddress)(options.recipient);
            const amountIn = (0, utilts_1.toHex)(this.maximumAmountIn());
            const amountOut = (0, utilts_1.toHex)(this.minimumAmountOut());
            const deadline = `0x${(Math.floor(new Date().getTime() / 1000) + options.ttl).toString(16)}`;
            let methodName;
            let args;
            let value = utilts_1.ZERO_HEX;
            switch (this.tradeType) {
                case constants_2.TradeType.EXACT_INPUT:
                    if (etherIn) {
                        methodName = 'swapExactETHForTokens';
                        // (uint amountOutMin, address[] calldata path, address to, uint deadline)
                        args = [amountOut, this.routes, to, deadline];
                        value = amountIn;
                    }
                    else if (etherOut) {
                        methodName = 'swapExactTokensForETH';
                        // (uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline)
                        args = [amountIn, amountOut, this.routes, to, deadline];
                        value = utilts_1.ZERO_HEX;
                    }
                    else {
                        methodName = 'swapExactTokensForTokens';
                        // (uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline)
                        args = [amountIn, amountOut, this.routes, to, deadline];
                        value = utilts_1.ZERO_HEX;
                    }
                    break;
                case constants_2.TradeType.EXACT_OUTPUT:
                    if (etherIn) {
                        methodName = 'swapETHForExactTokens';
                        // (uint amountOut, address[] calldata path, address to, uint deadline)
                        args = [amountOut, this.routes, to, deadline];
                        value = amountIn;
                    }
                    else if (etherOut) {
                        methodName = 'swapTokensForExactETH';
                        // (uint amountOut, uint amountInMax, address[] calldata path, address to, uint deadline)
                        args = [amountOut, amountIn, this.routes, to, deadline];
                        value = utilts_1.ZERO_HEX;
                    }
                    else {
                        methodName = 'swapTokensForExactTokens';
                        // (uint amountOut, uint amountInMax, address[] calldata path, address to, uint deadline)
                        args = [amountOut, amountIn, this.routes, to, deadline];
                        value = utilts_1.ZERO_HEX;
                    }
                    break;
            }
            return new contracts_1.Contract(contants_1.ROUTER_ADDRESS, abi_1.ROUTER_ABI).populateTransaction[methodName](...args, { value });
        });
    }
}
exports.VelodromeTrade = VelodromeTrade;
//# sourceMappingURL=Velodrome.js.map