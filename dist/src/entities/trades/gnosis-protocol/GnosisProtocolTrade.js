"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GnosisProtocolTrade = void 0;
const tslib_1 = require("tslib");
const units_1 = require("@ethersproject/units");
const api_1 = require("@gnosis.pm/gp-v2-contracts/lib/commonjs/api");
const order_1 = require("@gnosis.pm/gp-v2-contracts/lib/commonjs/order");
const networks_json_1 = require("@gnosis.pm/gp-v2-contracts/networks.json");
const dayjs_1 = tslib_1.__importDefault(require("dayjs"));
const tiny_invariant_1 = tslib_1.__importDefault(require("tiny-invariant"));
const constants_1 = require("../../../constants");
const currency_1 = require("../../currency");
const currencyAmount_1 = require("../../fractions/currencyAmount");
const fraction_1 = require("../../fractions/fraction");
const percent_1 = require("../../fractions/percent");
const price_1 = require("../../fractions/price");
const tokenAmount_1 = require("../../fractions/tokenAmount");
const token_1 = require("../../token");
const trade_1 = require("../interfaces/trade");
const routable_platform_1 = require("../routable-platform");
const utils_1 = require("../utils");
const constants_2 = require("./constants");
const signatures_1 = require("./signatures");
/**
 * Gnosis Protcol Trade uses CowFi API to find and route trades through the MEV-protected Gnosis Protocol v2
 */
class GnosisProtocolTrade extends trade_1.Trade {
    constructor({ chainId, inputAmount, maximumSlippage, outputAmount, tradeType, order, fee, feeAmount, }) {
        (0, tiny_invariant_1.default)(!(0, token_1.currencyEquals)(inputAmount.currency, outputAmount.currency), 'SAME_TOKEN');
        super({
            details: undefined,
            type: tradeType,
            inputAmount,
            outputAmount,
            executionPrice: new price_1.Price({
                baseCurrency: inputAmount.currency,
                quoteCurrency: outputAmount.currency,
                denominator: inputAmount.raw,
                numerator: outputAmount.raw,
            }),
            maximumSlippage,
            chainId,
            priceImpact: new percent_1.Percent('0'),
            platform: routable_platform_1.RoutablePlatform.GNOSIS_PROTOCOL,
            fee,
        });
        this.order = order;
        this.approveAddress = networks_json_1.GPv2VaultRelayer[chainId].address;
        // The fee token and amount are sell token
        this.feeAmount = feeAmount;
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
    /**
     * Returns the Gnosis Protocol API, with access to low level methods.
     * @param quote Quote query params
     * @param chainId The chainId, defaults to Mainnet (1)
     * @returns
     */
    static getApi(chainId = constants_1.ChainId.MAINNET) {
        return new api_1.Api(constants_2.CHAIN_ID_TO_NETWORK[chainId], api_1.Environment.Prod);
    }
    /**
     * Fetches the order metadata from the API
     * @param orderId The order ID
     * @param chainId The chainId, defaults to Mainnet (1)
     */
    static getOrderMetadata(orderId, chainId = constants_1.ChainId.MAINNET) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const response = yield fetch(`${GnosisProtocolTrade.getApi(chainId).baseUrl}/api/v1/orders/${orderId}`);
            if (!response.ok) {
                throw new Error('GnosisProtocolTrade: Failed to fetch order metadata');
            }
            return response.json();
        });
    }
    /**
     * Computes and returns the best trade from Gnosis Protocol API
     * @param {object} obj options
     * @param {CurrencyAmount} obj.currencyAmountIn the amount of curreny in - sell token
     * @param {Currency} obj.currencyOut the currency out - buy token
     * @param {Percent} obj.maximumSlippage Maximum slippage
     * @param {Percent} obj.receiver The receiver
     * @returns A GPv2 trade if found, otherwise undefined
     */
    static bestTradeExactIn({ currencyAmountIn, currencyOut, maximumSlippage, receiver = constants_2.ORDER_PLACEHOLDER_ADDRESS, }) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            // Try to extract the chain ID from the tokens
            const chainId = (0, utils_1.tryGetChainId)(currencyAmountIn, currencyOut);
            // Require the chain ID
            (0, tiny_invariant_1.default)(chainId !== undefined && routable_platform_1.RoutablePlatform.GNOSIS_PROTOCOL.supportsChain(chainId), 'CHAIN_ID');
            const tokenIn = (0, utils_1.wrappedCurrency)(currencyAmountIn.currency, chainId);
            const tokenOut = currencyOut;
            const amountInBN = (0, units_1.parseUnits)(currencyAmountIn.toSignificant(), tokenIn.decimals);
            (0, tiny_invariant_1.default)(!tokenIn.equals(tokenOut), 'CURRENCY');
            // const etherOut = this.outputAmount.currency === nativeCurrency
            // // the router does not support both ether in and out
            // invariant(!(etherIn && etherOut), 'ETHER_IN_OUT')
            try {
                const { quote } = yield GnosisProtocolTrade.getApi(chainId).getQuote({
                    kind: order_1.OrderKind.SELL,
                    sellAmountBeforeFee: amountInBN.toString(),
                    sellToken: tokenIn.address,
                    buyToken: tokenOut.address,
                    from: receiver !== null && receiver !== void 0 ? receiver : constants_2.ORDER_PLACEHOLDER_ADDRESS,
                    receiver,
                    appData: constants_2.ORDER_APP_DATA,
                    validTo: (0, dayjs_1.default)().add(1, 'h').unix(),
                    partiallyFillable: false,
                });
                // Calculate the fee in terms of percentages
                const feeAmountBN = (0, units_1.parseUnits)(quote.feeAmount.toString(), tokenIn.decimals)
                    .div(quote.sellAmount.toString())
                    .mul(100);
                const tokenInDenominator = (0, units_1.parseUnits)('100', tokenIn.decimals).toBigInt();
                const fee = new percent_1.Percent(feeAmountBN.toBigInt(), tokenInDenominator);
                return new GnosisProtocolTrade({
                    chainId,
                    maximumSlippage,
                    tradeType: constants_1.TradeType.EXACT_INPUT,
                    inputAmount: currencyAmountIn,
                    outputAmount: currency_1.Currency.isNative(currencyOut)
                        ? currencyAmount_1.CurrencyAmount.nativeCurrency(quote.buyAmount.toString(), chainId)
                        : new tokenAmount_1.TokenAmount(tokenOut, quote.buyAmount.toString()),
                    fee,
                    order: quote,
                    feeAmount: new tokenAmount_1.TokenAmount(tokenIn, quote.feeAmount.toString()),
                });
            }
            catch (error) {
                console.error('could not fetch Cow trade', error);
                return;
            }
        });
    }
    /**
     * Computes and returns the best trade from Gnosis Protocol API
     * @param {object} obj options
     * @param {CurrencyAmount} obj.currencyAmountIn the amount of curreny in - sell token
     * @param {Currency} obj.currencyOut the currency out - buy token
     * @param {Percent} obj.maximumSlippage Maximum slippage
     * @returns A GPv2 trade if found, otherwise undefined
     */
    static bestTradeExactOut({ currencyAmountOut, currencyIn, maximumSlippage, receiver = constants_2.ORDER_PLACEHOLDER_ADDRESS, }) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            // Try to extract the chain ID from the tokens
            const chainId = (0, utils_1.tryGetChainId)(currencyAmountOut, currencyIn);
            // Require the chain ID
            (0, tiny_invariant_1.default)(chainId !== undefined && routable_platform_1.RoutablePlatform.GNOSIS_PROTOCOL.supportsChain(chainId), 'CHAIN_ID');
            const tokenIn = (0, utils_1.wrappedCurrency)(currencyIn, chainId);
            const tokenOut = currencyAmountOut.currency;
            const amountOutBN = (0, units_1.parseUnits)(currencyAmountOut.toSignificant(), tokenOut.decimals);
            (0, tiny_invariant_1.default)(!tokenIn.equals(tokenOut), 'CURRENCY');
            // the router does not support both ether in and out
            // invariant(!(etherIn && etherOut), 'ETHER_IN_OUT')
            try {
                const { quote } = yield GnosisProtocolTrade.getApi(chainId).getQuote({
                    kind: order_1.OrderKind.BUY,
                    buyAmountAfterFee: amountOutBN.toString(),
                    sellToken: tokenIn.address,
                    buyToken: tokenOut.address,
                    from: receiver !== null && receiver !== void 0 ? receiver : constants_2.ORDER_PLACEHOLDER_ADDRESS,
                    receiver,
                    appData: constants_2.ORDER_APP_DATA,
                    validTo: (0, dayjs_1.default)().add(1, 'h').unix(),
                    partiallyFillable: false,
                });
                // Calculate the fee in terms of percentages
                const feeAmountBN = (0, units_1.parseUnits)(quote.feeAmount.toString(), tokenIn.decimals)
                    .div(quote.sellAmount.toString())
                    .mul(100);
                const tokenInDenominator = (0, units_1.parseUnits)('100', tokenIn.decimals).toBigInt();
                const fee = new percent_1.Percent(feeAmountBN.toBigInt(), tokenInDenominator);
                const inputAmount = currency_1.Currency.isNative(tokenIn)
                    ? currencyAmount_1.CurrencyAmount.nativeCurrency(quote.sellAmount.toString(), chainId)
                    : new tokenAmount_1.TokenAmount(tokenIn, quote.sellAmount.toString());
                const outputAmount = currency_1.Currency.isNative(currencyAmountOut.currency)
                    ? currencyAmount_1.CurrencyAmount.nativeCurrency(quote.buyAmount.toString(), chainId)
                    : new tokenAmount_1.TokenAmount(tokenOut, quote.buyAmount.toString());
                return new GnosisProtocolTrade({
                    chainId,
                    maximumSlippage,
                    tradeType: constants_1.TradeType.EXACT_OUTPUT,
                    inputAmount,
                    outputAmount,
                    fee,
                    feeAmount: new tokenAmount_1.TokenAmount(tokenIn, quote.feeAmount.toString()),
                    order: quote,
                });
            }
            catch (error) {
                console.error('could not fetch COW trade', error);
                return;
            }
        });
    }
    /**
     * Returns the order payload. The order must be signed
     * @param options
     * @returns
     */
    swapOrder({ receiver }) {
        return Object.assign(Object.assign({}, this.order), { receiver });
    }
    /**
     * Signs the order by adding signature
     * @param signature
     */
    signOrder(signer) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const { receiver } = this.order;
            if (!receiver) {
                throw new Error('GnosisProtocolTrade: Missing order receiver');
            }
            // assign signature info and return instance
            this.orderSignatureInfo = yield (0, signatures_1.signOrder)(Object.assign(Object.assign({}, this.order), { receiver }), this.chainId, signer);
            return this;
        });
    }
    /**
     * Cancels the current instance order, if submitted
     */
    cancelOrder(signer) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (!this.orderId) {
                throw new Error('GnosisProtocolTrade: Missing order ID');
            }
            return GnosisProtocolTrade.cancelOrder(this.orderId, this.chainId, signer);
        });
    }
    /**
     * Cancels the current instance order, if submitted
     * @param orderId The order ID from GPv2
     * @param chainId The chain Id on which the order exists
     * @param signer A Signer with ability to sign the payload
     * @returns the signing results
     */
    static cancelOrder(orderId, chainId, signer) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const orderCancellationSignature = yield (0, signatures_1.signOrderCancellation)(orderId, chainId, signer);
            const response = yield fetch(`${GnosisProtocolTrade.getApi(chainId).baseUrl}/api/v1/orders/${orderId}`, {
                method: 'delete',
                body: JSON.stringify(orderCancellationSignature),
            });
            if (response.ok && response.status === 200) {
                return true;
            }
            throw new Error(`GnosisProtocolTrade: Failed to cancel order. API Status code: ${response.status}`);
        });
    }
    /**
     * Submits the order to GPv2 API
     * @returns The order ID from GPv2
     */
    submitOrder() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (!this.orderSignatureInfo) {
                throw new Error('GnosisProtocolTrade: Missing order signature');
            }
            console.log({
                orderSignatureInfo: this.orderSignatureInfo,
            });
            this.orderId = yield GnosisProtocolTrade.getApi(this.chainId).placeOrder({
                order: this.order,
                signature: {
                    data: this.orderSignatureInfo.signature,
                    scheme: this.orderSignatureInfo.signingScheme,
                },
            });
            return this.orderId;
        });
    }
    /**
     * Fetches the order status from the API
     */
    getOrderMetadata() {
        return GnosisProtocolTrade.getOrderMetadata(this.orderId, this.chainId);
    }
}
exports.GnosisProtocolTrade = GnosisProtocolTrade;
//# sourceMappingURL=GnosisProtocolTrade.js.map