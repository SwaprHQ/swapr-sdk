"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpenoceanTrade = void 0;
const tslib_1 = require("tslib");
const units_1 = require("@ethersproject/units");
const node_fetch_1 = tslib_1.__importDefault(require("node-fetch"));
const tiny_invariant_1 = tslib_1.__importDefault(require("tiny-invariant"));
const constants_1 = require("../../../constants");
const currency_1 = require("../../currency");
const fractions_1 = require("../../fractions");
const constants_2 = require("../constants");
const trade_1 = require("../interfaces/trade");
const routable_platform_1 = require("../routable-platform");
const utils_1 = require("../utils");
const api_1 = require("./api");
const constants_3 = require("./constants");
class OpenoceanTrade extends trade_1.Trade {
    constructor({ maximumSlippage, inputAmount, outputAmount, tradeType, chainId, approveAddress, priceImpact, }) {
        super({
            details: undefined,
            type: tradeType,
            inputAmount,
            outputAmount,
            maximumSlippage,
            platform: routable_platform_1.RoutablePlatform.OPENOCEAN,
            chainId,
            executionPrice: new fractions_1.Price({
                baseCurrency: inputAmount.currency,
                quoteCurrency: outputAmount.currency,
                denominator: inputAmount.raw,
                numerator: outputAmount.raw,
            }),
            priceImpact,
            approveAddress,
        });
    }
    static getGas(chainId) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const baseUrl = (0, api_1.getBaseUrlWithChainCode)(chainId);
            const gasResponse = yield (0, node_fetch_1.default)(`${baseUrl}/${api_1.OO_API_ENDPOINTS.GET_GAS}`);
            if (!gasResponse.ok)
                throw new Error(`OpenoceanTrade.getQuote: failed to get gasPrice`);
            const gasData = yield gasResponse.json();
            return gasData.without_decimals.standard;
        });
    }
    static getQuote({ amount, quoteCurrency, maximumSlippage = constants_2.maximumSlippage, tradeType }, provider) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const chainId = (0, utils_1.tryGetChainId)(amount, quoteCurrency);
            if (!chainId) {
                throw new Error('OpenoceanTrade.getQuote: chainId is required');
            }
            provider = provider || (0, utils_1.getProvider)(chainId);
            // Ensure the provider's chainId matches the provided currencies
            (0, tiny_invariant_1.default)((yield provider.getNetwork()).chainId == chainId, `OpenoceanTrade.getQuote: currencies chainId does not match provider's chainId`);
            const currencyIn = amount.currency;
            const currencyOut = quoteCurrency;
            // Ensure that the currencies are present
            (0, tiny_invariant_1.default)(currencyIn.address && currencyOut.address, `getQuote: Currency address is required`);
            try {
                const baseUrl = (0, api_1.getBaseUrlWithChainCode)(chainId);
                const gasPrice = yield this.getGas(chainId);
                const params = new URL(`${baseUrl}/${api_1.OO_API_ENDPOINTS.QUOTE}`);
                params.searchParams.set('inTokenAddress', `${currency_1.Currency.isNative(currencyIn) ? '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE' : currencyIn.address}`);
                params.searchParams.set('outTokenAddress', `${currency_1.Currency.isNative(currencyOut) ? '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE' : currencyOut.address}`);
                params.searchParams.set('amount', `${(0, units_1.parseUnits)(amount.toSignificant(), 0).toString()}`);
                params.searchParams.set('gasPrice', chainId === constants_1.ChainId.MAINNET ? gasPrice.maxFeePerGas : gasPrice);
                params.searchParams.set('slippage', `${new fractions_1.Fraction(maximumSlippage.numerator, maximumSlippage.denominator).toSignificant(1)}`);
                const res = yield (0, node_fetch_1.default)(params.toString());
                const data = yield res.json();
                if (data && amount) {
                    const approveAddress = constants_3.OO_CONTRACT_ADDRESS_BY_CHAIN[chainId];
                    const currencyAmountIn = currency_1.Currency.isNative(currencyIn)
                        ? fractions_1.CurrencyAmount.nativeCurrency(data.data.inAmount, chainId)
                        : new fractions_1.TokenAmount((0, utils_1.wrappedCurrency)(currencyIn, chainId), data.data.inAmount);
                    const currencyAmountOut = currency_1.Currency.isNative(currencyOut)
                        ? fractions_1.CurrencyAmount.nativeCurrency(data.data.outAmount, chainId)
                        : new fractions_1.TokenAmount((0, utils_1.wrappedCurrency)(currencyOut, chainId), data.data.outAmount);
                    return new OpenoceanTrade({
                        maximumSlippage,
                        inputAmount: currencyAmountIn,
                        outputAmount: currencyAmountOut,
                        tradeType,
                        chainId,
                        approveAddress,
                        priceImpact: new fractions_1.Percent('0', '100'),
                    });
                }
            }
            catch (error) {
                console.error('Openocean.getQuote: Error fetching the quote:', error.message);
                return null;
            }
            return null;
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
            (0, tiny_invariant_1.default)(options, 'OpenoceanTrade.swapTransaction: Currency address is required');
            /**
             * @see https://docs.openocean.finance/dev/aggregator-api-and-sdk/aggregator-api/best-practice
             */
            const inToken = this.inputAmount.currency;
            const outToken = this.outputAmount.currency;
            const amount = this.inputAmount;
            const maximumSlippage = this.maximumSlippage;
            try {
                // Ensure that the currencies are present
                (0, tiny_invariant_1.default)(inToken.address && outToken.address, `getQuote: Currency address is required`);
                const baseUrl = (0, api_1.getBaseUrlWithChainCode)(this.chainId);
                const quoteGasPrice = yield OpenoceanTrade.getGas(this.chainId);
                const params = new URL(`${baseUrl}/${api_1.OO_API_ENDPOINTS.SWAP_QUOTE}`);
                params.searchParams.set('inTokenSymbol', `${inToken.symbol === 'USDC.e' ? 'USDC' : inToken.symbol}`);
                params.searchParams.set('inTokenAddress', `${currency_1.Currency.isNative(inToken) ? '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE' : inToken.address}`);
                params.searchParams.set('outTokenSymbol', `${outToken.symbol === 'USDC.e' ? 'USDC' : outToken.symbol}`);
                params.searchParams.set('outTokenAddress', `${currency_1.Currency.isNative(outToken) ? '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE' : outToken.address}`);
                params.searchParams.set('amount', `${(0, units_1.parseUnits)(amount.toSignificant(), 0).toString()}`);
                params.searchParams.set('gasPrice', this.chainId === constants_1.ChainId.MAINNET ? quoteGasPrice.maxFeePerGas : quoteGasPrice);
                params.searchParams.set('slippage', `${new fractions_1.Fraction(maximumSlippage.numerator, maximumSlippage.denominator).toSignificant(1)}`);
                const res = yield (0, node_fetch_1.default)(params.toString());
                const swapQuoteData = yield res.json();
                const { data, gasPrice, to, value } = swapQuoteData;
                return {
                    to,
                    gasPrice,
                    data,
                    value,
                };
            }
            catch (error) {
                throw new Error(`Openocean.getQuote: Error fetching the trade: ${error.message}`);
            }
        });
    }
}
exports.OpenoceanTrade = OpenoceanTrade;
//# sourceMappingURL=Openocean.js.map