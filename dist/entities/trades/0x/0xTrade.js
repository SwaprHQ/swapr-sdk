"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ZeroXTrade = void 0;
const tslib_1 = require("tslib");
const bignumber_1 = require("@ethersproject/bignumber");
const debug_1 = tslib_1.__importDefault(require("debug"));
const node_fetch_1 = tslib_1.__importDefault(require("node-fetch"));
const tiny_invariant_1 = tslib_1.__importDefault(require("tiny-invariant"));
const constants_1 = require("../../../constants");
const currency_1 = require("../../currency");
const currencyAmount_1 = require("../../fractions/currencyAmount");
const fraction_1 = require("../../fractions/fraction");
const price_1 = require("../../fractions/price");
const tokenAmount_1 = require("../../fractions/tokenAmount");
const platforms_breakdown_1 = require("../../platforms-breakdown");
const token_1 = require("../../token");
const trade_1 = require("../interfaces/trade");
const routable_platform_1 = require("../routable-platform");
const utils_1 = require("../utils");
const constants_2 = require("./constants");
const utils_2 = require("./utils");
// Debuging logger. See documentation to enable logging.
const debug0X = (0, debug_1.default)('ecoRouter:0x');
/**
 * Represents a trade executed against a list of pairs.
 * Does not account for slippage, i.e. trades that front run this trade and move the price.
 */
class ZeroXTrade extends trade_1.TradeWithSwapTransaction {
    constructor({ breakdown, input, output, maximumSlippage, tradeType, to, callData, value, priceImpact, }) {
        (0, tiny_invariant_1.default)(!(0, token_1.currencyEquals)(input.currency, output.currency), 'CURRENCY');
        const chainId = breakdown.chainId;
        super({
            details: breakdown,
            type: tradeType,
            inputAmount: input,
            outputAmount: output,
            executionPrice: new price_1.Price({
                baseCurrency: input.currency,
                quoteCurrency: output.currency,
                denominator: input.raw,
                numerator: output.raw,
            }),
            maximumSlippage,
            priceImpact,
            chainId,
            platform: routable_platform_1.RoutablePlatform.ZEROX,
            approveAddress: to,
        });
        this.to = to;
        this.callData = callData;
        this.value = value;
    }
    minimumAmountOut() {
        if (this.tradeType === constants_1.TradeType.EXACT_OUTPUT) {
            return this.outputAmount;
        }
        else {
            const slippageAdjustedAmountOut = new fraction_1.Fraction(constants_1.ONE)
                .add(this.maximumSlippage)
                .invert()
                .multiply(this.outputAmount.raw).quotient;
            return this.outputAmount instanceof tokenAmount_1.TokenAmount
                ? new tokenAmount_1.TokenAmount(this.outputAmount.token, slippageAdjustedAmountOut)
                : currencyAmount_1.CurrencyAmount.nativeCurrency(slippageAdjustedAmountOut, this.chainId);
        }
    }
    maximumAmountIn() {
        if (this.tradeType === constants_1.TradeType.EXACT_INPUT) {
            return this.inputAmount;
        }
        else {
            const slippageAdjustedAmountIn = new fraction_1.Fraction(constants_1.ONE)
                .add(this.maximumSlippage)
                .multiply(this.inputAmount.raw).quotient;
            return this.inputAmount instanceof tokenAmount_1.TokenAmount
                ? new tokenAmount_1.TokenAmount(this.inputAmount.token, slippageAdjustedAmountIn)
                : currencyAmount_1.CurrencyAmount.nativeCurrency(slippageAdjustedAmountIn, this.chainId);
        }
    }
    static bestTradeExactIn(currencyAmountIn, currencyOut, maximumSlippage) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const chainId = (0, utils_1.tryGetChainId)(currencyAmountIn, currencyOut);
            const apiUrl = chainId && constants_2.ZEROX_API_URL[chainId];
            (0, tiny_invariant_1.default)(chainId !== undefined && apiUrl !== undefined && apiUrl.length > 0, 'CHAIN_ID');
            const amountIn = (0, utils_1.wrappedAmount)(currencyAmountIn, chainId);
            const tokenIn = (0, utils_1.wrappedCurrency)(currencyAmountIn.currency, chainId);
            const tokenOut = (0, utils_1.wrappedCurrency)(currencyOut, chainId);
            (0, tiny_invariant_1.default)(!tokenIn.equals(tokenOut), 'CURRENCY');
            let bestTrade;
            try {
                const buyToken = currency_1.Currency.isNative(currencyOut) ? currencyOut.symbol : tokenOut.address;
                const sellToken = currency_1.Currency.isNative(currencyAmountIn.currency)
                    ? currencyAmountIn.currency.symbol
                    : tokenIn.address;
                const apiUrlParams = (0, utils_2.build0xApiUrl)({
                    apiUrl,
                    amount: amountIn,
                    maximumSlippage,
                    chainId,
                    buyToken,
                    sellToken,
                });
                // slippagePercentage for the 0X API needs to be a value between 0 and 1, others have between 0 and 100
                const response = yield (0, node_fetch_1.default)(apiUrlParams);
                if (!response.ok)
                    throw new Error('response not ok');
                const json = (yield response.json());
                const breakdown = new platforms_breakdown_1.Breakdown(chainId, (0, utils_2.platformsFromSources)(json.sources), tokenIn, tokenOut, new price_1.Price({
                    baseCurrency: tokenIn,
                    quoteCurrency: tokenOut,
                    denominator: amountIn.raw,
                    numerator: json.buyAmount,
                }));
                bestTrade = new ZeroXTrade({
                    breakdown,
                    input: currencyAmountIn,
                    output: currency_1.Currency.isNative(currencyOut)
                        ? currencyAmount_1.CurrencyAmount.nativeCurrency(json.buyAmount, chainId)
                        : new tokenAmount_1.TokenAmount(tokenOut, json.buyAmount),
                    maximumSlippage,
                    tradeType: constants_1.TradeType.EXACT_INPUT,
                    to: json.to,
                    callData: json.data,
                    value: json.value,
                    priceImpact: (0, utils_2.decodeStringToPercent)(json.estimatedPriceImpact, true),
                });
            }
            catch (error) {
                console.error('could not fetch 0x trade', error);
            }
            return bestTrade;
        });
    }
    static bestTradeExactOut(currencyIn, currencyAmountOut, maximumSlippage) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const chainId = (0, utils_1.tryGetChainId)(currencyAmountOut, currencyIn);
            const apiUrl = chainId && constants_2.ZEROX_API_URL[chainId];
            (0, tiny_invariant_1.default)(chainId !== undefined && apiUrl !== undefined && apiUrl.length > 0, 'CHAIN_ID');
            const tokenIn = (0, utils_1.wrappedCurrency)(currencyIn, chainId);
            const amountOut = (0, utils_1.wrappedAmount)(currencyAmountOut, chainId);
            const tokenOut = (0, utils_1.wrappedCurrency)(currencyAmountOut.currency, chainId);
            (0, tiny_invariant_1.default)(!tokenIn.equals(tokenOut), 'CURRENCY');
            let bestTrade;
            try {
                const buyToken = currency_1.Currency.isNative(currencyIn) ? currencyIn.symbol : tokenIn.address;
                const sellToken = currency_1.Currency.isNative(currencyAmountOut.currency)
                    ? currencyAmountOut.currency.symbol
                    : tokenOut.address;
                const apiUrlParams = (0, utils_2.build0xApiUrl)({
                    apiUrl,
                    amount: amountOut,
                    maximumSlippage,
                    chainId,
                    buyToken,
                    sellToken,
                });
                // slippagePercentage for the 0X API needs to be a value between 0 and 1, others have between 0 and 100
                const response = yield (0, node_fetch_1.default)(apiUrlParams);
                if (!response.ok)
                    throw new Error('response not ok');
                const json = (yield response.json());
                const breakdown = new platforms_breakdown_1.Breakdown(chainId, (0, utils_2.platformsFromSources)(json.sources), tokenIn, tokenOut, new price_1.Price({
                    baseCurrency: tokenOut,
                    quoteCurrency: tokenIn,
                    denominator: amountOut.raw,
                    numerator: json.buyAmount,
                }));
                bestTrade = new ZeroXTrade({
                    breakdown,
                    input: currency_1.Currency.isNative(currencyIn)
                        ? currencyAmount_1.CurrencyAmount.nativeCurrency(json.buyAmount, chainId)
                        : new tokenAmount_1.TokenAmount(tokenIn, json.buyAmount),
                    output: currencyAmountOut,
                    maximumSlippage,
                    tradeType: constants_1.TradeType.EXACT_OUTPUT,
                    to: json.to,
                    callData: json.data,
                    value: json.value,
                    priceImpact: (0, utils_2.decodeStringToPercent)(json.estimatedPriceImpact, true),
                });
            }
            catch (error) {
                console.error('could not fetch 0x trade', error);
            }
            return bestTrade;
        });
    }
    /**
     * Returns the transaction to execute the trade
     * @param options The options to execute the trade with
     * @returns
     */
    swapTransaction(options) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            debug0X({ options });
            return {
                to: this.to,
                data: this.callData,
                value: bignumber_1.BigNumber.from(this.value),
            };
        });
    }
}
exports.ZeroXTrade = ZeroXTrade;
//# sourceMappingURL=0xTrade.js.map