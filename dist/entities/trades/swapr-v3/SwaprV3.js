"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SwaprV3Trade = exports.getQuoterContract = exports.getRouterContract = exports.getPoolsContract = exports.GNOSIS_CONTRACTS = void 0;
const tslib_1 = require("tslib");
const dayjs_1 = tslib_1.__importDefault(require("dayjs"));
const sdk_core_1 = require("@uniswap/sdk-core");
const tiny_invariant_1 = tslib_1.__importDefault(require("tiny-invariant"));
const fractions_1 = require("../../fractions");
const trade_1 = require("../interfaces/trade");
const routable_platform_1 = require("../routable-platform");
const utils_1 = require("../utils");
const constants_1 = require("../../../constants");
const abi_1 = require("./abi");
const ethers_1 = require("ethers");
const constants_2 = require("@ethersproject/constants");
const units_1 = require("@ethersproject/units");
const routes_1 = require("./routes");
// Constants
exports.GNOSIS_CONTRACTS = {
    quoter: '0xcBaD9FDf0D2814659Eb26f600EFDeAF005Eda0F7',
    router: '0xfFB643E73f280B97809A8b41f7232AB401a04ee1',
};
function getPoolsContract(pool_address) {
    return new ethers_1.Contract(pool_address, abi_1.SWAPR_ALGEBRA_POOL_ABI, (0, utils_1.getProvider)(100));
}
exports.getPoolsContract = getPoolsContract;
function getRouterContract() {
    return new ethers_1.Contract(exports.GNOSIS_CONTRACTS.router, abi_1.SWAPR_ALGEBRA_ROUTER_ABI, (0, utils_1.getProvider)(100));
}
exports.getRouterContract = getRouterContract;
function getQuoterContract() {
    return new ethers_1.Contract(exports.GNOSIS_CONTRACTS.quoter, abi_1.SWAPR_ALGEBRA_QUOTER_ABI, (0, utils_1.getProvider)(100));
}
exports.getQuoterContract = getQuoterContract;
class SwaprV3Trade extends trade_1.TradeWithSwapTransaction {
    constructor({ inputAmount, outputAmount, maximumSlippage, priceImpact, tradeType, chainId, fee, }) {
        super({
            details: undefined,
            type: tradeType,
            inputAmount,
            outputAmount,
            maximumSlippage,
            platform: routable_platform_1.RoutablePlatform.SWAPR_V3,
            chainId,
            executionPrice: new fractions_1.Price({
                baseCurrency: inputAmount.currency,
                quoteCurrency: outputAmount.currency,
                denominator: inputAmount.raw,
                numerator: outputAmount.raw,
            }),
            priceImpact,
            fee,
            approveAddress: exports.GNOSIS_CONTRACTS['router'],
        });
    }
    // SwaprV3Trade.getQuote({
    //   quoteCurrency: currencyOut,
    //   amount: currencyAmountIn,
    //   maximumSlippage,
    //   recipient: receiver,
    //   tradeType: TradeType.EXACT_INPUT,
    // })
    static getQuote({ amount, quoteCurrency, tradeType, recipient, maximumSlippage }, provider) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const chainId = (0, utils_1.tryGetChainId)(amount, quoteCurrency);
            (0, tiny_invariant_1.default)(chainId, 'SwaprV3Trade.getQuote: chainId is required');
            recipient = recipient || constants_2.AddressZero;
            maximumSlippage = maximumSlippage || 0;
            provider = provider || (0, utils_1.getProvider)(chainId);
            const tokenIn = amount.currency;
            const tokenOut = quoteCurrency;
            (0, tiny_invariant_1.default)((yield provider.getNetwork()).chainId == chainId, `SwaprV3Trade.getQuote: currencies chainId does not match provider's chainId`);
            if (tradeType === constants_1.TradeType.EXACT_INPUT) {
                const routes = yield (0, routes_1.getRoutes)(tokenIn, tokenOut, chainId);
                console.log('routes[0]', routes[0]);
                const quotedAmountOut = yield getQuoterContract()
                    .callStatic.quoteExactInputSingle(tokenIn.address, tokenOut.address, (0, units_1.parseUnits)(amount.toSignificant(), amount.currency.decimals), 0)
                    .catch((error) => {
                    console.error(`Error sending quoteExactInputSingle transaction: ${error}`);
                    return null;
                });
                const fee = new fractions_1.Percent(routes[0].pools[0].fee.toString(), '1000000');
                if (quotedAmountOut) {
                    return new SwaprV3Trade({
                        maximumSlippage,
                        inputAmount: amount,
                        outputAmount: new fractions_1.TokenAmount(quoteCurrency, quotedAmountOut),
                        tradeType: tradeType,
                        chainId: chainId,
                        priceImpact: new fractions_1.Percent('0', '1000'),
                        fee,
                    });
                }
            }
            else {
                const routes = yield (0, routes_1.getRoutes)(tokenIn, tokenOut, chainId);
                const fee = new fractions_1.Percent(routes[0].pools[0].fee.toString(), '1000000');
                const quotedAmountIn = yield getQuoterContract()
                    .callStatic.quoteExactOutputSingle(quoteCurrency.address, amount.currency.address, (0, units_1.parseUnits)(amount.toSignificant(), amount.currency.decimals), 0)
                    .catch((error) => {
                    console.error(`Error sending quoteExactOutputSingle transaction: ${error}`);
                    return null;
                });
                if (quotedAmountIn) {
                    return new SwaprV3Trade({
                        maximumSlippage,
                        inputAmount: new fractions_1.TokenAmount(quoteCurrency, quotedAmountIn),
                        outputAmount: amount,
                        tradeType: tradeType,
                        chainId: chainId,
                        priceImpact: new fractions_1.Percent('0', '1000'),
                        fee: fee,
                    });
                }
            }
            return null;
        });
    }
    minimumAmountOut() {
        if (this.tradeType === constants_1.TradeType.EXACT_OUTPUT) {
            return this.outputAmount;
        }
        else {
            const slippageAdjustedAmountOut = new sdk_core_1.Fraction(constants_1.ONE)
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
            const slippageAdjustedAmountIn = new sdk_core_1.Fraction(constants_1.ONE)
                .add(this.maximumSlippage)
                .multiply(this.inputAmount.raw).quotient;
            return this.inputAmount instanceof fractions_1.TokenAmount
                ? new fractions_1.TokenAmount(this.inputAmount.token, slippageAdjustedAmountIn)
                : fractions_1.CurrencyAmount.nativeCurrency(slippageAdjustedAmountIn, this.chainId);
        }
    }
    //   struct ExactInputSingleParams {
    //     uint256 amountIn;           // Amount of the input token to be swapped
    //     address recipient;          // Address that will receive the output tokens
    //     uint160 limitSqrtPrice;     // Limit on the square root price of the swap
    //     uint256 amountOutMinimum;   // Minimum amount of output tokens expected
    //     uint256 deadline;           // Timestamp by which the transaction must be mined
    //     address tokenIn;            // Address of the input token
    //     address tokenOut;           // Address of the output token
    // }
    swapTransaction(options) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const to = (0, sdk_core_1.validateAndParseAddress)(options.recipient);
            const amountIn = toHex(this.maximumAmountIn());
            const amountOut = toHex(this.minimumAmountOut());
            const isTradeExactInput = this.tradeType === constants_1.TradeType.EXACT_INPUT;
            const routerContract = getRouterContract();
            const baseParams = {
                tokenIn: this.inputAmount.currency.address,
                tokenOut: this.outputAmount.currency.address,
                recipient: to,
                deadline: (0, dayjs_1.default)().add(30, 'm').unix(),
                sqrtPriceLimitX96: 0,
                fee: this.fee,
            };
            const exactInputSingleParams = Object.assign(Object.assign({}, baseParams), { amountIn: amountIn, amountOutMinimum: amountOut });
            const exactOutputSingleParams = Object.assign(Object.assign({}, baseParams), { amountOut: amountOut, amountInMaximum: amountIn });
            const methodName = isTradeExactInput ? 'exactInputSingle' : 'exactOutputSingle';
            const params = isTradeExactInput ? exactInputSingleParams : exactOutputSingleParams;
            const populatedTransaction = yield routerContract.populateTransaction[methodName](params);
            return populatedTransaction;
        });
    }
}
exports.SwaprV3Trade = SwaprV3Trade;
function toHex(currencyAmount) {
    return `0x${currencyAmount.raw.toString(16)}`;
}
//# sourceMappingURL=SwaprV3.js.map