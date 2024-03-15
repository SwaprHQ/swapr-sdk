"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SushiswapTrade = void 0;
const tslib_1 = require("tslib");
const contracts_1 = require("@ethersproject/contracts");
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
const abi_1 = require("./abi");
const api_1 = require("./api");
class SushiswapTrade extends trade_1.Trade {
    constructor({ maximumSlippage, inputAmount, outputAmount, tradeType, chainId, approveAddress, routeCode, priceImpact, fee, }) {
        super({
            details: undefined,
            type: tradeType,
            inputAmount,
            outputAmount,
            maximumSlippage,
            platform: routable_platform_1.RoutablePlatform.SUSHISWAP,
            chainId,
            executionPrice: new fractions_1.Price({
                baseCurrency: inputAmount.currency,
                quoteCurrency: outputAmount.currency,
                denominator: inputAmount.raw,
                numerator: outputAmount.raw,
            }),
            priceImpact,
            fee,
            approveAddress,
        });
        this.routeCode = routeCode;
    }
    static getQuote({ amount, quoteCurrency, tradeType, maximumSlippage = constants_2.maximumSlippage, recipient }, provider) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const chainId = (0, utils_1.tryGetChainId)(amount, quoteCurrency);
            if (!chainId) {
                throw new Error('SushiswapTrade.getQuote: chainId is required');
            }
            provider = provider || (0, utils_1.getProvider)(chainId);
            // Ensure the provider's chainId matches the provided currencies
            (0, tiny_invariant_1.default)((yield provider.getNetwork()).chainId == chainId, `SushiswapTrade.getQuote: currencies chainId does not match provider's chainId`);
            (0, tiny_invariant_1.default)(tradeType === constants_1.TradeType.EXACT_INPUT, `getQuote: Only supports exact input`);
            const currencyIn = amount.currency;
            const currencyOut = quoteCurrency;
            // Ensure that the currencies are present
            (0, tiny_invariant_1.default)(currencyIn.address && currencyOut.address, `getQuote: Currency address is required`);
            try {
                const params = new URL(api_1.SWAP_BASE_URL + (0, api_1.getApiVersion)(chainId));
                params.searchParams.set('chainId', `${chainId}`);
                params.searchParams.set('tokenIn', `${currency_1.Currency.isNative(currencyIn) ? '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE' : currencyIn.address}`);
                params.searchParams.set('tokenOut', `${currency_1.Currency.isNative(currencyOut) ? '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE' : currencyOut.address}`);
                params.searchParams.set('amount', `${(0, units_1.parseUnits)(amount.toSignificant(), amount.currency.decimals).toString()}`);
                params.searchParams.set('maxPriceImpact', `${new fractions_1.Fraction(maximumSlippage.numerator, maximumSlippage.denominator).toSignificant(5)}`);
                params.searchParams.set('to', `${recipient}`);
                params.searchParams.set('preferSushi', 'true');
                const res = yield (0, node_fetch_1.default)(params.toString());
                const data = yield res.json();
                if (data && amount && data.route) {
                    const approveAddress = data.routeProcessorAddr;
                    const currencyAmountIn = currency_1.Currency.isNative(currencyIn)
                        ? fractions_1.CurrencyAmount.nativeCurrency(data.routeProcessorArgs.amountIn, chainId)
                        : new fractions_1.TokenAmount((0, utils_1.wrappedCurrency)(currencyIn, chainId), data.routeProcessorArgs.amountIn);
                    const currencyAmountOut = currency_1.Currency.isNative(currencyOut)
                        ? fractions_1.CurrencyAmount.nativeCurrency(data.routeProcessorArgs.amountOutMin, chainId)
                        : new fractions_1.TokenAmount((0, utils_1.wrappedCurrency)(currencyOut, chainId), data.routeProcessorArgs.amountOutMin);
                    const routeCode = data.routeProcessorArgs.routeCode;
                    const poolsFees = data.route.reduce((accumulator, route) => {
                        return accumulator + route.poolFee * route.share;
                    }, 0);
                    const fee = new fractions_1.Percent(Math.trunc(poolsFees * 10000).toString(), constants_1._10000);
                    const priceImpact = new fractions_1.Percent(Math.trunc(Math.abs(data.priceImpact) * 10000).toString(), constants_1._10000);
                    return new SushiswapTrade({
                        maximumSlippage,
                        inputAmount: currencyAmountIn,
                        outputAmount: currencyAmountOut,
                        tradeType,
                        chainId,
                        approveAddress,
                        priceImpact,
                        routeCode,
                        fee,
                    });
                }
            }
            catch (error) {
                console.error('SushiswapTrade.getQuote: Error fetching the quote:', error.message);
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
            (0, tiny_invariant_1.default)(options, 'SushiswapTrade.swapTransaction: Currency address is required');
            const params = [
                this.inputAmount.currency.address,
                this.inputAmount.raw.toString(),
                this.outputAmount.currency.address,
                this.outputAmount.raw.toString(),
                options.recipient,
                this.routeCode,
            ];
            const value = currency_1.Currency.isNative(this.inputAmount.currency) ? params[1] : undefined;
            return new contracts_1.Contract(this.approveAddress, abi_1.SUSHISWAP_ROUTER_PROCESSOR_3_ABI).populateTransaction['processRoute'](...params, { value });
        });
    }
}
exports.SushiswapTrade = SushiswapTrade;
//# sourceMappingURL=Sushiswap.js.map