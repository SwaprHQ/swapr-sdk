"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GnosisProtocolTrade = exports.CoWTrade = void 0;
const tslib_1 = require("tslib");
// eslint-disable-next-line no-restricted-imports
const networks_json_1 = tslib_1.__importDefault(require("@cowprotocol/contracts/networks.json"));
const cow_sdk_1 = require("@cowprotocol/cow-sdk");
const units_1 = require("@ethersproject/units");
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
const app_data_json_1 = tslib_1.__importDefault(require("./app-data.json"));
const CoWTradeError_1 = require("./CoWTradeError");
/**
 * CoWTrade uses CowFi API to find and route trades through the MEV-protected Gnosis Protocol v2
 */
class CoWTrade extends trade_1.Trade {
    constructor(params) {
        var _a;
        const { chainId, feeAmount, inputAmount, maximumSlippage, outputAmount, quote, tradeType, fee } = params;
        (0, tiny_invariant_1.default)(!(0, token_1.currencyEquals)(inputAmount.currency, outputAmount.currency), 'SAME_TOKEN');
        const approveAddress = CoWTrade.getVaultRelayerAddress(chainId);
        (0, tiny_invariant_1.default)(approveAddress, 'Missing GPv2VaultRelayer address');
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
            platform: routable_platform_1.RoutablePlatform.COW,
            fee,
            approveAddress,
        });
        this.quote = quote;
        // construct the order
        this.order = Object.assign(Object.assign({}, quote.quote), { validTo: parseInt(quote.quote.validTo), receiver: (_a = quote.quote.receiver) !== null && _a !== void 0 ? _a : quote.from });
        this.executionPriceWithoutFee = new price_1.Price({
            baseCurrency: inputAmount.currency,
            quoteCurrency: outputAmount.currency,
            denominator: inputAmount.subtract(feeAmount).raw,
            numerator: outputAmount.raw,
        });
        this.inputAmountWithoutFee = this.inputAmount.subtract(feeAmount);
        this.outputAmountWithoutFee = this.outputAmount;
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
    static getCowSdk(chainId = constants_1.ChainId.MAINNET, cowContext) {
        return new cow_sdk_1.CowSdk(chainId, Object.assign(Object.assign({}, cowContext), { 
            // Always append correct app data
            appDataHash: CoWTrade.getAppData(chainId).ipfsHashInfo.appDataHash }), {
            loglevel: 'debug',
        });
    }
    /**
     * Fetches the order metadata from the API
     * @param orderId The order ID
     * @param chainId The chainId, defaults to Mainnet (1)
     */
    static getOrderMetadata(orderId, chainId = constants_1.ChainId.MAINNET) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return CoWTrade.getCowSdk(chainId).cowApi.getOrder(orderId);
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
    static bestTradeExactIn({ currencyAmountIn, currencyOut, maximumSlippage, receiver, user, }) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            // Try to extract the chain ID from the tokens
            const chainId = (0, utils_1.tryGetChainId)(currencyAmountIn, currencyOut);
            // Require the chain ID
            (0, tiny_invariant_1.default)(chainId !== undefined && routable_platform_1.RoutablePlatform.COW.supportsChain(chainId), 'CHAIN_ID');
            const tokenIn = (0, utils_1.wrappedCurrency)(currencyAmountIn.currency, chainId);
            const tokenOut = currencyOut;
            const amountInBN = (0, units_1.parseUnits)(currencyAmountIn.toSignificant(), tokenIn.decimals);
            (0, tiny_invariant_1.default)(!tokenIn.equals(tokenOut), 'CURRENCY');
            // const etherOut = this.outputAmount.currency === nativeCurrency
            // // the router does not support both ether in and out
            // invariant(!(etherIn && etherOut), 'ETHER_IN_OUT')
            try {
                const quoteResponse = yield CoWTrade.getCowSdk(chainId).cowApi.getQuote({
                    kind: cow_sdk_1.OrderKind.SELL,
                    amount: amountInBN.toString(),
                    sellToken: tokenIn.address,
                    buyToken: tokenOut.address,
                    userAddress: user.toLowerCase(),
                    receiver,
                    validTo: (0, dayjs_1.default)().add(1, 'h').unix(), // Order expires in 1 hour
                });
                // Calculate the fee in terms of percentages
                const feeAmountBN = (0, units_1.parseUnits)(quoteResponse.quote.feeAmount.toString(), tokenIn.decimals)
                    .div(quoteResponse.quote.sellAmount.toString())
                    .mul(100);
                const tokenInDenominator = (0, units_1.parseUnits)('100', tokenIn.decimals).toBigInt();
                const fee = new percent_1.Percent(feeAmountBN.toBigInt(), tokenInDenominator);
                const feeAmount = currency_1.Currency.isNative(currencyAmountIn.currency)
                    ? currencyAmount_1.CurrencyAmount.nativeCurrency(quoteResponse.quote.feeAmount.toString(), chainId)
                    : new tokenAmount_1.TokenAmount(currencyAmountIn.currency, quoteResponse.quote.feeAmount.toString());
                return new CoWTrade({
                    chainId,
                    maximumSlippage,
                    tradeType: constants_1.TradeType.EXACT_INPUT,
                    inputAmount: currencyAmountIn,
                    outputAmount: currency_1.Currency.isNative(currencyOut)
                        ? currencyAmount_1.CurrencyAmount.nativeCurrency(quoteResponse.quote.buyAmount.toString(), chainId)
                        : new tokenAmount_1.TokenAmount(tokenOut, quoteResponse.quote.buyAmount.toString()),
                    fee,
                    feeAmount,
                    quote: quoteResponse,
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
    static bestTradeExactOut({ currencyAmountOut, currencyIn, maximumSlippage, receiver, user, }) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            // Try to extract the chain ID from the tokens
            const chainId = (0, utils_1.tryGetChainId)(currencyAmountOut, currencyIn);
            // Require the chain ID
            (0, tiny_invariant_1.default)(chainId !== undefined && routable_platform_1.RoutablePlatform.COW.supportsChain(chainId), 'CHAIN_ID');
            const tokenIn = (0, utils_1.wrappedCurrency)(currencyIn, chainId);
            const tokenOut = currencyAmountOut.currency;
            const amountOutBN = (0, units_1.parseUnits)(currencyAmountOut.toSignificant(), tokenOut.decimals);
            (0, tiny_invariant_1.default)(!tokenIn.equals(tokenOut), 'CURRENCY');
            try {
                const cowSdk = CoWTrade.getCowSdk(chainId);
                const quoteResponse = yield cowSdk.cowApi.getQuote({
                    kind: cow_sdk_1.OrderKind.BUY,
                    amount: amountOutBN.toString(),
                    sellToken: tokenIn.address,
                    buyToken: tokenOut.address,
                    userAddress: user.toLowerCase(),
                    receiver,
                    validTo: (0, dayjs_1.default)().add(1, 'h').unix(), // Order expires in 1 hour
                });
                // Calculate the fee in terms of percentages
                const feeAmountBN = (0, units_1.parseUnits)(quoteResponse.quote.feeAmount.toString(), tokenIn.decimals)
                    .div(quoteResponse.quote.sellAmount.toString())
                    .mul(100);
                const tokenInDenominator = (0, units_1.parseUnits)('100', tokenIn.decimals).toBigInt();
                const fee = new percent_1.Percent(feeAmountBN.toBigInt(), tokenInDenominator);
                const inputAmount = currency_1.Currency.isNative(tokenIn)
                    ? currencyAmount_1.CurrencyAmount.nativeCurrency(quoteResponse.quote.sellAmount.toString(), chainId)
                    : new tokenAmount_1.TokenAmount(tokenIn, quoteResponse.quote.sellAmount.toString());
                const outputAmount = currency_1.Currency.isNative(currencyAmountOut.currency)
                    ? currencyAmount_1.CurrencyAmount.nativeCurrency(quoteResponse.quote.buyAmount.toString(), chainId)
                    : new tokenAmount_1.TokenAmount(tokenOut, quoteResponse.quote.buyAmount.toString());
                const feeAmount = currency_1.Currency.isNative(currencyIn)
                    ? currencyAmount_1.CurrencyAmount.nativeCurrency(quoteResponse.quote.feeAmount.toString(), chainId)
                    : new tokenAmount_1.TokenAmount(currencyIn, quoteResponse.quote.feeAmount.toString());
                return new CoWTrade({
                    chainId,
                    maximumSlippage,
                    tradeType: constants_1.TradeType.EXACT_OUTPUT,
                    inputAmount,
                    outputAmount,
                    fee,
                    feeAmount,
                    quote: quoteResponse,
                });
            }
            catch (error) {
                console.error('could not fetch COW trade', error);
                return;
            }
        });
    }
    /**
     * Signs the order by adding signature
     * @param signer The signer
     * @returns The current instance
     * @throws {CoWTradeError} If the order is missing a receiver
     */
    signOrder(signer) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const { receiver } = this.quote.quote;
            if (!receiver) {
                throw new CoWTradeError_1.CoWTradeError('Missing order receiver');
            }
            const signOrderResults = yield CoWTrade.getCowSdk(this.chainId, {
                signer,
            }).signOrder(this.order);
            if (!signOrderResults.signature) {
                throw new CoWTradeError_1.CoWTradeError('Order was not signed');
            }
            this.orderSignatureInfo = signOrderResults;
            return this;
        });
    }
    /**
     * Cancels the current instance order, if submitted
     * @param signer The signer
     * @returns True if the order was cancelled, false otherwise
     * @throws {CoWTradeError} If the order is yet to be submitted
     */
    cancelOrder(signer) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (!this.orderId) {
                throw new CoWTradeError_1.CoWTradeError('CoWTrade: Missing order ID');
            }
            return CoWTrade.cancelOrder(this.orderId, this.chainId, signer);
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
            const cowSdk = CoWTrade.getCowSdk(chainId, {
                signer,
            });
            const orderCancellationSignature = yield cowSdk.signOrderCancellation(orderId);
            const url = `${cowSdk.cowApi.API_BASE_URL[chainId]}/api/v1/orders/${orderId}`;
            const response = yield fetch(url, {
                method: 'delete',
                body: JSON.stringify(orderCancellationSignature),
            });
            if (response.ok && response.status === 200) {
                return true;
            }
            throw new CoWTradeError_1.CoWTradeError(`CoWTrade: Failed to cancel order. API Status code: ${response.status}`);
        });
    }
    /**
     * Submits the order to GPv2 API
     * @returns The order ID from GPv2
     * @throws {CoWTradeError} If the order is missing a signature
     */
    submitOrder() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (!this.orderSignatureInfo) {
                throw new CoWTradeError_1.CoWTradeError('CoWTrade: Missing order signature');
            }
            const { from, id: quoteId } = this.quote;
            const sendOrderParams = {
                order: Object.assign(Object.assign({}, this.order), { quoteId, signature: this.orderSignatureInfo.signature, signingScheme: this.orderSignatureInfo.signingScheme }),
                owner: from,
            };
            this.orderId = yield CoWTrade.getCowSdk(this.chainId).cowApi.sendOrder(sendOrderParams);
            return this.orderId;
        });
    }
    /**
     * Fetches the order status from the API
     * @throws {CoWTradeError} if the order ID is missing
     */
    getOrderMetadata() {
        if (!this.orderId) {
            throw new CoWTradeError_1.CoWTradeError('CoWTrade: Missing order ID');
        }
        return CoWTrade.getOrderMetadata(this.orderId, this.chainId);
    }
    /**
     * Gets the app data for Swapr's CoW trade
     * @param chainId The chain Id
     */
    static getAppData(chainId) {
        return app_data_json_1.default[chainId];
    }
    /**
     * Returns the vault relayer contract address for the given chain.
     * ERC20 tokens must approve this address.
     * @param chainId The chain Id
     * @returns The vault relayer address
     */
    static getVaultRelayerAddress(chainId) {
        var _a;
        const GPv2VaultRelayer = networks_json_1.default.GPv2VaultRelayer;
        return (_a = GPv2VaultRelayer[chainId]) === null || _a === void 0 ? void 0 : _a.address;
    }
    /**
     * Returns the settlement contract address for the given chain
     * @param chainId The chain Id
     * @returns The settlement address
     */
    static getSettlementAddress(chainId) {
        var _a;
        const GPv2Settlement = networks_json_1.default.GPv2Settlement;
        return (_a = GPv2Settlement[chainId]) === null || _a === void 0 ? void 0 : _a.address;
    }
}
exports.CoWTrade = CoWTrade;
/**
 * @deprecated use CoWTrade instead
 */
class GnosisProtocolTrade extends CoWTrade {
}
exports.GnosisProtocolTrade = GnosisProtocolTrade;
//# sourceMappingURL=CoWTrade.js.map