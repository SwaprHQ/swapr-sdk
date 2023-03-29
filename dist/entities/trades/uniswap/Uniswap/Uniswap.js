"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UniswapTrade = void 0;
const tslib_1 = require("tslib");
const bignumber_1 = require("@ethersproject/bignumber");
const constants_1 = require("@ethersproject/constants");
const units_1 = require("@ethersproject/units");
const router_sdk_1 = require("@uniswap/router-sdk");
const sdk_core_1 = require("@uniswap/sdk-core");
const smart_order_router_1 = require("@uniswap/smart-order-router");
const v2_sdk_1 = require("@uniswap/v2-sdk");
const dayjs_1 = tslib_1.__importDefault(require("dayjs"));
const debug_1 = tslib_1.__importDefault(require("debug"));
const jsbi_1 = tslib_1.__importDefault(require("jsbi"));
const tiny_invariant_1 = tslib_1.__importDefault(require("tiny-invariant"));
const constants_2 = require("../../../../constants");
const currency_1 = require("../../../currency");
const fractions_1 = require("../../../fractions");
const constants_3 = require("../../constants");
const trade_1 = require("../../interfaces/trade");
const routable_platform_1 = require("../../routable-platform");
const utils_1 = require("../../utils");
const utils_2 = require("../utils");
// Debuging logger. See documentation to enable logging.
const debugUniswapTradeGetQuote = (0, debug_1.default)('ecoRouter:uniswap:getQuote');
/**
 * UniswapTrade uses the AutoRouter to find best trade across V2 and V3 pools
 */
class UniswapTrade extends trade_1.TradeWithSwapTransaction {
    constructor({ maximumSlippage, swapRoute }) {
        const chainId = swapRoute.trade.inputAmount.currency.chainId;
        // Require chainId
        (0, tiny_invariant_1.default)(chainId, 'UniswapTrade.constructor: chainId is required');
        const inputCurrency = swapRoute.trade.inputAmount.currency;
        const outpuCurrency = swapRoute.trade.outputAmount.currency;
        const inputAmountBN = (0, units_1.parseUnits)(swapRoute.trade.inputAmount.toSignificant(), inputCurrency.decimals);
        const outputAmountBN = (0, units_1.parseUnits)(swapRoute.trade.outputAmount.toSignificant(), outpuCurrency.decimals);
        // Make the Uniswap SDK types compatible with the Trade types
        const inputAmount = inputCurrency.isNative
            ? fractions_1.CurrencyAmount.nativeCurrency(inputAmountBN.toBigInt(), chainId)
            : new fractions_1.TokenAmount(inputCurrency, inputAmountBN.toBigInt());
        const outputAmount = outpuCurrency.isNative
            ? fractions_1.CurrencyAmount.nativeCurrency(outputAmountBN.toBigInt(), chainId)
            : new fractions_1.TokenAmount(outpuCurrency, outputAmountBN.toBigInt());
        const executionPrice = new fractions_1.Price({
            baseCurrency: swapRoute.trade.executionPrice.baseCurrency,
            quoteCurrency: swapRoute.trade.executionPrice.quoteCurrency,
            denominator: swapRoute.trade.executionPrice.denominator,
            numerator: swapRoute.trade.executionPrice.numerator,
        });
        const priceImpact = new fractions_1.Percent(swapRoute.trade.priceImpact.numerator, swapRoute.trade.priceImpact.denominator);
        // Calculate the total fee percentage as basis point by summing all v3 and v2 pools from the AutoRouter routes
        // Then, divide by 100 because Uniswap uses hundredths of basis points
        const fee = swapRoute.trade.swaps.reduce((acc, { route: { pools } }) => {
            for (let i = 0; i < pools.length; i++) {
                const nextPool = pools[i];
                acc = acc + (nextPool instanceof v2_sdk_1.Pair ? 3000 : nextPool.fee); // default V2 fee is 0.3% while v3 can be 0.01% to 1%
            }
            return acc;
        }, 0) / 100;
        super({
            details: undefined,
            type: swapRoute.trade.tradeType,
            inputAmount,
            outputAmount,
            maximumSlippage,
            platform: routable_platform_1.RoutablePlatform.UNISWAP,
            chainId,
            executionPrice,
            priceImpact,
            fee: new fractions_1.Percent(jsbi_1.default.BigInt(fee), '10000'),
            // Uniswap V3 Router v2 address
            approveAddress: '0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45',
            estimatedGas: swapRoute.estimatedGasUsed,
        });
        this.swapRoute = swapRoute;
    }
    static getQuote({ amount, quoteCurrency, tradeType, recipient, maximumSlippage }, provider) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const chainId = (0, utils_1.tryGetChainId)(amount, quoteCurrency);
            (0, tiny_invariant_1.default)(chainId, 'UniswapV3Trade.getQuote: chainId is required');
            // Defaults
            recipient = recipient || constants_1.AddressZero;
            maximumSlippage = maximumSlippage || constants_3.maximumSlippage;
            provider = provider || (0, utils_1.getProvider)(chainId);
            // Must match the currencies provided
            (0, tiny_invariant_1.default)((yield provider.getNetwork()).chainId == chainId, `UniswapTrade.getQuote: currencies chainId does not match provider's chainId`);
            const alphaRouter = new smart_order_router_1.AlphaRouter({ chainId: chainId, provider });
            // Map the current currencies to compatible types from the Uniswap SDK
            const amountV3 = sdk_core_1.CurrencyAmount.fromRawAmount(currency_1.Currency.isNative(amount.currency)
                ? (0, utils_2.getUniswapNativeCurrency)(chainId)
                : new sdk_core_1.Token(chainId, amount.currency.address, amount.currency.decimals, amount.currency.symbol, amount.currency.name), amount.raw);
            const quoteCurrencyV3 = currency_1.Currency.isNative(quoteCurrency)
                ? (0, utils_2.getUniswapNativeCurrency)(chainId)
                : new sdk_core_1.Token(chainId, quoteCurrency.address, quoteCurrency.decimals, quoteCurrency.symbol, quoteCurrency.name);
            debugUniswapTradeGetQuote({
                amountV3,
                quoteCurrencyV3,
                tradeType,
                recipient,
                maximumSlippage,
                alphaRouter,
            });
            const routeResponse = yield alphaRouter.route(amountV3, quoteCurrencyV3, tradeType, {
                recipient,
                slippageTolerance: new sdk_core_1.Percent(maximumSlippage.numerator, maximumSlippage.denominator),
                deadline: (0, dayjs_1.default)().add(30, 'm').unix(),
            }, {
                protocols: [router_sdk_1.Protocol.V2, router_sdk_1.Protocol.V3],
            });
            // Debug
            debugUniswapTradeGetQuote(routeResponse);
            if (routeResponse) {
                return new UniswapTrade({ maximumSlippage, swapRoute: routeResponse });
            }
            return null;
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
    swapTransaction(options) {
        var _a, _b, _c;
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const callData = (0, utils_2.encodeRecipient)(this.tradeType, options.recipient, (_a = this.swapRoute.methodParameters) === null || _a === void 0 ? void 0 : _a.calldata);
            return {
                value: ((_b = this.swapRoute.methodParameters) === null || _b === void 0 ? void 0 : _b.value)
                    ? bignumber_1.BigNumber.from((_c = this.swapRoute.methodParameters) === null || _c === void 0 ? void 0 : _c.value)
                    : undefined,
                data: callData,
                to: this.approveAddress,
            };
        });
    }
}
exports.UniswapTrade = UniswapTrade;
//# sourceMappingURL=Uniswap.js.map