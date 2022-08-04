"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ZeroXTrade = void 0;
const tslib_1 = require("tslib");
const bignumber_1 = require("@ethersproject/bignumber");
const decimal_js_light_1 = require("decimal.js-light");
const node_fetch_1 = tslib_1.__importDefault(require("node-fetch"));
const tiny_invariant_1 = tslib_1.__importDefault(require("tiny-invariant"));
const constants_1 = require("../../constants");
const currency_1 = require("../currency");
const currencyAmount_1 = require("../fractions/currencyAmount");
const fraction_1 = require("../fractions/fraction");
const percent_1 = require("../fractions/percent");
const price_1 = require("../fractions/price");
const tokenAmount_1 = require("../fractions/tokenAmount");
const platforms_breakdown_1 = require("../platforms-breakdown");
const token_1 = require("../token");
const trade_1 = require("./interfaces/trade");
const routable_platform_1 = require("./routable-platform");
const utils_1 = require("./utils");
const CODE_TO_PLATFORM_NAME = {
    Uniswap_V2: 'Uniswap v2',
    'Liquidity provider': 'LP',
    Balancer_V2: 'Balancer v2',
    DODO_V2: 'Dodo v2',
    Uniswap_V3: 'Uniswap v3',
    PancakeSwap_V2: 'PancakeSwap v2', // shouldn't be used since it's on BSC, but added to be extra sure
};
const decodePlatformName = (apiName) => CODE_TO_PLATFORM_NAME[apiName] || apiName;
const platformsFromSources = (sources) => {
    return sources
        .map((source) => {
        const proportion = new decimal_js_light_1.Decimal(source.proportion);
        const denominator = new decimal_js_light_1.Decimal('10').pow(proportion.decimalPlaces());
        const numerator = proportion.times(denominator);
        return {
            name: decodePlatformName(source.name),
            percentage: new percent_1.Percent(numerator.toString(), denominator.toString()),
        };
    })
        .filter((platform) => platform.percentage.greaterThan('0'))
        .sort((a, b) => (a.percentage.greaterThan(b.percentage) ? -1 : a.percentage.equalTo(b.percentage) ? 0 : 1));
};
function wrappedAmount(currencyAmount, chainId) {
    if (currencyAmount instanceof tokenAmount_1.TokenAmount)
        return currencyAmount;
    if (currency_1.Currency.isNative(currencyAmount.currency))
        return new tokenAmount_1.TokenAmount(token_1.Token.getNativeWrapper(chainId), currencyAmount.raw);
    (0, tiny_invariant_1.default)(false, 'CURRENCY');
}
function wrappedCurrency(currency, chainId) {
    if (currency instanceof token_1.Token)
        return currency;
    if (currency_1.Currency.isNative(currency))
        return token_1.Token.getNativeWrapper(chainId);
    (0, tiny_invariant_1.default)(false, 'CURRENCY');
}
/**
 * Represents a trade executed against a list of pairs.
 * Does not account for slippage, i.e. trades that front run this trade and move the price.
 */
class ZeroXTrade extends trade_1.TradeWithSwapTransaction {
    constructor({ breakdown, input, output, maximumSlippage, tradeType, to, callData, value, }) {
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
            priceImpact: new percent_1.Percent('0', '100'),
            chainId,
            platform: routable_platform_1.RoutablePlatform.ZEROX,
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
            (0, tiny_invariant_1.default)(chainId !== undefined && chainId === constants_1.ChainId.MAINNET, 'CHAIN_ID'); // 0x is only supported in mainnet for now
            const amountIn = wrappedAmount(currencyAmountIn, chainId);
            const tokenIn = wrappedCurrency(currencyAmountIn.currency, chainId);
            const tokenOut = wrappedCurrency(currencyOut, chainId);
            (0, tiny_invariant_1.default)(!tokenIn.equals(tokenOut), 'CURRENCY');
            let bestTrade;
            try {
                const buyToken = currency_1.Currency.isNative(currencyOut) ? currencyOut.symbol : tokenOut.address;
                const sellToken = currency_1.Currency.isNative(currencyAmountIn.currency)
                    ? currencyAmountIn.currency.symbol
                    : tokenIn.address;
                const response = yield (0, node_fetch_1.default)(`https://api.0x.org/swap/v1/quote?buyToken=${buyToken}&sellToken=${sellToken}&sellAmount=${amountIn.raw}&slippagePercentage=${maximumSlippage.toFixed(3)}`);
                if (!response.ok)
                    throw new Error('response not ok');
                const json = (yield response.json());
                const breakdown = new platforms_breakdown_1.Breakdown(chainId, platformsFromSources(json.sources), tokenIn, tokenOut, new price_1.Price({
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
            (0, tiny_invariant_1.default)(chainId !== undefined && chainId === constants_1.ChainId.MAINNET, 'CHAIN_ID'); // 0x is only supported in mainnet for now
            const tokenIn = wrappedCurrency(currencyIn, chainId);
            const amountOut = wrappedAmount(currencyAmountOut, chainId);
            const tokenOut = wrappedCurrency(currencyAmountOut.currency, chainId);
            (0, tiny_invariant_1.default)(!tokenIn.equals(tokenOut), 'CURRENCY');
            let bestTrade;
            try {
                const buyToken = currency_1.Currency.isNative(currencyIn) ? currencyIn.symbol : tokenIn.address;
                const sellToken = currency_1.Currency.isNative(currencyAmountOut.currency)
                    ? currencyAmountOut.currency.symbol
                    : tokenOut.address;
                const response = yield (0, node_fetch_1.default)(`https://api.0x.org/swap/v1/quote?buyToken=${buyToken}&sellToken=${sellToken}&sellAmount=${amountOut.raw}&slippagePercentage=${maximumSlippage.toFixed(3)}`);
                if (!response.ok)
                    throw new Error('response not ok');
                const json = (yield response.json());
                const breakdown = new platforms_breakdown_1.Breakdown(chainId, platformsFromSources(json.sources), tokenIn, tokenOut, new price_1.Price({
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
                });
            }
            catch (error) {
                console.error('could not fetch 0x trade', error);
            }
            return bestTrade;
        });
    }
    swapTransaction() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return {
                to: this.to,
                data: this.callData,
                value: bignumber_1.BigNumber.from(this.value),
            };
        });
    }
}
exports.ZeroXTrade = ZeroXTrade;
//# sourceMappingURL=0x-trade.js.map