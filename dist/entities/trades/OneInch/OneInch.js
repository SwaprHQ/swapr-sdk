"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OneInchTrade = void 0;
const tslib_1 = require("tslib");
const tiny_invariant_1 = tslib_1.__importDefault(require("tiny-invariant"));
const constants_1 = require("../../../constants");
const currency_1 = require("../../currency");
const fractions_1 = require("../../fractions");
const constants_2 = require("../constants");
const trade_1 = require("../interfaces/trade");
const routable_platform_1 = require("../routable-platform");
const utils_1 = require("../utils");
const api_1 = require("./api");
/**
 * 1Inch trade
 */
class OneInchTrade extends trade_1.Trade {
    constructor({ maximumSlippage, currencyAmountIn, currencyAmountOut, tradeType, chainId, approveAddress, }) {
        super({
            details: undefined,
            type: tradeType,
            inputAmount: currencyAmountIn,
            outputAmount: currencyAmountOut,
            maximumSlippage,
            platform: routable_platform_1.RoutablePlatform.ONE_INCH,
            chainId,
            executionPrice: new fractions_1.Price({
                baseCurrency: currencyAmountIn.currency,
                quoteCurrency: currencyAmountOut.currency,
                denominator: currencyAmountIn.raw,
                numerator: currencyAmountOut.raw,
            }),
            priceImpact: new fractions_1.Percent('0', '100'),
            fee: new fractions_1.Percent('0', '10000'),
            approveAddress,
        });
    }
    static getQuote({ amount, quoteCurrency, tradeType, maximumSlippage = constants_2.maximumSlippage }, provider) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const chainId = (0, utils_1.tryGetChainId)(amount, quoteCurrency);
            if (!chainId) {
                throw new Error('getQuote: chainId is required');
            }
            provider = provider || (0, utils_1.getProvider)(chainId);
            // Ensure the provider's chainId matches the provided currencies
            (0, tiny_invariant_1.default)((yield provider.getNetwork()).chainId == chainId, `OneInch.getQuote: currencies chainId does not match provider's chainId`);
            const currencyIn = amount.currency;
            const currencyOut = quoteCurrency;
            // Ensure that the currencies are present
            (0, tiny_invariant_1.default)(currencyIn.address && currencyOut.address, `getQuote: Currency address is required`);
            try {
                //Fetch approve address
                const { address: approveAddress } = yield (yield fetch((0, api_1.approveAddressUrl)(chainId))).json();
                // Prepare the query parameters for the API request
                const queryParams = {
                    fromTokenAddress: currencyIn.address,
                    toTokenAddress: currencyOut.address,
                    amount: amount.raw.toString(),
                };
                const { toAmount } = yield (yield fetch((0, api_1.generateApiRequestUrl)({ methodName: api_1.RequestType.QUOTE, queryParams, chainId }))).json();
                let toTokenAmountApi = toAmount;
                let fromTokenAmountApi = amount.raw.toString();
                if (tradeType === constants_1.TradeType.EXACT_OUTPUT) {
                    // Prepare the query parameters for the API request
                    const queryParams = {
                        fromTokenAddress: currencyOut.address,
                        toTokenAddress: currencyIn.address,
                        amount: toAmount.toString(),
                    };
                    const { toAmount: toTokenAmountOutput } = yield (yield fetch((0, api_1.generateApiRequestUrl)({ methodName: api_1.RequestType.QUOTE, queryParams, chainId }))).json();
                    toTokenAmountApi = toTokenAmountOutput;
                }
                const currencyInType = tradeType === constants_1.TradeType.EXACT_INPUT ? currencyIn : currencyOut;
                const currencyOutType = tradeType === constants_1.TradeType.EXACT_INPUT ? currencyOut : currencyIn;
                const currencyAmountIn = currency_1.Currency.isNative(currencyInType)
                    ? fractions_1.CurrencyAmount.nativeCurrency(fromTokenAmountApi, chainId)
                    : new fractions_1.TokenAmount((0, utils_1.wrappedCurrency)(currencyInType, chainId), fromTokenAmountApi);
                const currencyAmountOut = currency_1.Currency.isNative(currencyOutType)
                    ? fractions_1.CurrencyAmount.nativeCurrency(toTokenAmountApi, chainId)
                    : new fractions_1.TokenAmount((0, utils_1.wrappedCurrency)(currencyOutType, chainId), toTokenAmountApi);
                return new OneInchTrade({
                    maximumSlippage,
                    currencyAmountIn,
                    currencyAmountOut,
                    tradeType,
                    chainId,
                    approveAddress,
                });
            }
            catch (error) {
                console.error('OneInch.getQuote: Error fetching the quote:', error.message);
                return null;
            }
        });
    }
    minimumAmountOut() {
        if (this.tradeType === constants_1.TradeType.EXACT_OUTPUT) {
            return this.outputAmount;
        }
        else {
            const slippageAdjustedAmountOut = new fractions_1.Fraction(constants_1.ONE)
                .add(this.maximumSlippage)
                .invert()
                .multiply(this.outputAmount.raw).quotient;
            return this.outputAmount instanceof fractions_1.TokenAmount
                ? new fractions_1.TokenAmount(this.outputAmount.token, slippageAdjustedAmountOut)
                : fractions_1.CurrencyAmount.nativeCurrency(slippageAdjustedAmountOut, this.chainId);
        }
    }
    maximumAmountIn() {
        if (this.tradeType === constants_1.TradeType.EXACT_INPUT) {
            return this.inputAmount;
        }
        else {
            const slippageAdjustedAmountIn = new fractions_1.Fraction(constants_1.ONE)
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
            (0, tiny_invariant_1.default)(this.inputAmount.currency.address && this.outputAmount.currency.address, 'OneInchTrade: Currency address is required');
            const queryParams = {
                fromTokenAddress: this.inputAmount.currency.address,
                toTokenAddress: this.outputAmount.currency.address,
                amount: this.inputAmount.raw.toString(),
                fromAddress: options.account,
                slippage: this.maximumSlippage.toSignificant(2),
                destReciever: options.recipient,
            };
            try {
                // Fetch the unsigned transaction from the API
                const { tx } = yield (yield fetch((0, api_1.generateApiRequestUrl)({ methodName: api_1.RequestType.SWAP, queryParams, chainId: this.chainId }))).json();
                return {
                    data: tx.data,
                    to: tx.to,
                    value: tx.value,
                };
            }
            catch (e) {
                throw new Error(`OneInch.swapTransaction: Error fetching the swap data: ${e.message}`);
            }
        });
    }
}
exports.OneInchTrade = OneInchTrade;
//# sourceMappingURL=OneInch.js.map