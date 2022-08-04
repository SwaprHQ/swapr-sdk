"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CurveTrade = void 0;
const tslib_1 = require("tslib");
const bignumber_1 = require("@ethersproject/bignumber");
const constants_1 = require("@ethersproject/constants");
const contracts_1 = require("@ethersproject/contracts");
const units_1 = require("@ethersproject/units");
const debug_1 = tslib_1.__importDefault(require("debug"));
const decimal_js_light_1 = tslib_1.__importDefault(require("decimal.js-light"));
const tiny_invariant_1 = tslib_1.__importDefault(require("tiny-invariant"));
const constants_2 = require("../../../constants");
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
const utils_2 = require("../utils");
// Curve imports
const contracts_2 = require("./contracts");
const pools_1 = require("./pools");
const utils_3 = require("./utils");
// Debuging logger. See documentation to enable logging.
const debugCurveGetQuote = (0, debug_1.default)('ecoRouter:curve:getQuote');
/**
 * Represents a trade executed against a list of pairs.
 * Does not account for slippage, i.e. trades that front run this trade and move the price.
 */
class CurveTrade extends trade_1.Trade {
    /**
     *
     * @param {Object} obj Curve trade options.
     * @param {CurrencyAmount} obj.inputAmount - Input token
     * @param {CurrencyAmount} obj.outputAmount - Output token
     * @param {Percent} obj.maximumSlippage - Maximum slippage indicated by the user
     * @param {TradeType} obj.tradeType - Trade type
     * @param {string} obj.transactionRequest - Address to to which transaction is send
     * @param {Percent} obj.fee - Trade fee
     * @param {string} obj.approveAddress - Approve address, defaults to `to`
     */
    constructor({ inputAmount, outputAmount, maximumSlippage, tradeType, chainId, transactionRequest, approveAddress, fee, contract, }) {
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
            priceImpact: new percent_1.Percent('0', '100'),
            chainId,
            platform: routable_platform_1.RoutablePlatform.CURVE,
            fee,
            approveAddress: approveAddress || transactionRequest.to,
        });
        this.transactionRequest = transactionRequest;
        this.contract = contract;
    }
    minimumAmountOut() {
        if (this.tradeType === constants_2.TradeType.EXACT_OUTPUT) {
            return this.outputAmount;
        }
        else {
            const slippageAdjustedAmountOut = new fraction_1.Fraction(constants_2.ONE)
                .add(this.maximumSlippage)
                .invert()
                .multiply(this.outputAmount.raw).quotient;
            return this.outputAmount instanceof tokenAmount_1.TokenAmount
                ? new tokenAmount_1.TokenAmount(this.outputAmount.token, slippageAdjustedAmountOut)
                : currencyAmount_1.CurrencyAmount.nativeCurrency(slippageAdjustedAmountOut, this.chainId);
        }
    }
    maximumAmountIn() {
        if (this.tradeType === constants_2.TradeType.EXACT_INPUT) {
            return this.inputAmount;
        }
        else {
            const slippageAdjustedAmountIn = new fraction_1.Fraction(constants_2.ONE)
                .add(this.maximumSlippage)
                .multiply(this.inputAmount.raw).quotient;
            return this.inputAmount instanceof tokenAmount_1.TokenAmount
                ? new tokenAmount_1.TokenAmount(this.inputAmount.token, slippageAdjustedAmountIn)
                : currencyAmount_1.CurrencyAmount.nativeCurrency(slippageAdjustedAmountIn, this.chainId);
        }
    }
    /**
     * Checks if two tokens can be routed between on Curve Finance pools.
     * This method returns accurate results only on Ethereum since the Curve Router is available there.
     * @param {string} tokenIn
     * @param {string} tokenOut
     * @returns a `boolean` whether the tokens can be exchanged on Curve Finance pools
     */
    static canRoute(tokenIn, tokenOut) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return (0, contracts_2.getRouter)().can_route(tokenIn.address, tokenOut.address);
        });
    }
    /**
     * Given an a sell token and a buy token, and amount of sell token, returns a
     * quote from Curve's pools with best pool, and unsigned transactions data
     * @param {object} obj options
     * @param {CurrencyAmount} obj.currencyAmountIn the amount of curreny in - sell token
     * @param {Currency} obj.currencyOut the currency in - buy token
     * @param {Percent} obj.maximumSlippage Maximum slippage
     * @param {Provider} provider an optional provider, the router defaults public providers
     * @returns the best trade if found
     */
    static getQuote({ currencyAmountIn, currencyOut, maximumSlippage, receiver = constants_1.AddressZero }, provider) {
        var _a, _b, _c, _d, _e, _f, _g;
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            // Try to extract the chain ID from the tokens
            const chainId = (0, utils_1.tryGetChainId)(currencyAmountIn, currencyOut);
            // Require the chain ID
            (0, tiny_invariant_1.default)(chainId !== undefined, 'CHAIN_ID');
            if (!routable_platform_1.RoutablePlatform.CURVE.supportsChain(chainId)) {
                return undefined;
            }
            const wrappedTokenIn = (0, utils_1.wrappedCurrency)(currencyAmountIn.currency, chainId);
            const wrappedtokenOut = (0, utils_1.wrappedCurrency)(currencyOut, chainId);
            // Get the token's data from Curve
            const tokenIn = (0, utils_3.getCurveToken)(wrappedTokenIn, chainId);
            const tokenOut = (0, utils_3.getCurveToken)(wrappedtokenOut, chainId);
            // Get the native address
            const nativeCurrency = currency_1.Currency.getNative(chainId);
            // Determine if the currency sent is native
            // First using address
            // then, using symbol/name
            const isNativeAssetIn = ((_b = (_a = currencyAmountIn.currency) === null || _a === void 0 ? void 0 : _a.address) === null || _b === void 0 ? void 0 : _b.toLocaleLowerCase()) === ((_c = nativeCurrency.address) === null || _c === void 0 ? void 0 : _c.toLowerCase())
                ? true
                : currencyAmountIn.currency === nativeCurrency;
            const isNativeAssetOut = (tokenOut === null || tokenOut === void 0 ? void 0 : tokenOut.address.toLowerCase()) == ((_d = nativeCurrency.address) === null || _d === void 0 ? void 0 : _d.toLowerCase())
                ? true
                : ((_e = currencyOut.name) === null || _e === void 0 ? void 0 : _e.toLowerCase()) === ((_f = nativeCurrency.name) === null || _f === void 0 ? void 0 : _f.toLowerCase())
                    ? true
                    : currencyOut === nativeCurrency;
            // Validations
            (0, tiny_invariant_1.default)(tokenIn != undefined, 'NO_TOKEN_IN');
            (0, tiny_invariant_1.default)(tokenOut != undefined, 'NO_TOKEN_OUT');
            (0, tiny_invariant_1.default)(tokenIn.address.toLowerCase() != tokenOut.address.toLowerCase(), 'SAME_TOKEN');
            // const etherOut = this.outputAmount.currency === nativeCurrency
            // // the router does not support both ether in and out
            try {
                yield (provider === null || provider === void 0 ? void 0 : provider.getNetwork());
            }
            catch (e) {
                // If it throws NoNetwork while computing the provider we take the chain provider as a redundancy
                console.warn(e);
                console.warn('Default provider has a network problem. Fetching chain provider.');
                provider = (0, utils_2.getProvider)(chainId);
            }
            // if the provider is undefined, the above expression doesn't throw an exception
            if (!provider) {
                provider = (0, utils_2.getProvider)(chainId);
            }
            let value = '0x0'; // With Curve, most value exchanged is ERC20
            // Get the Router contract to populate the unsigned transaction
            // Get all Curve pools for the chain
            const curvePools = pools_1.CURVE_POOLS[chainId];
            // Basic trade information
            const amountInBN = (0, units_1.parseUnits)(currencyAmountIn.toSignificant(), tokenIn.decimals);
            if (isNativeAssetIn) {
                value = amountInBN.toString();
            }
            // Majority of Curve pools
            // have 4bps fee of which 50% goes to Curve
            const FEE_DECIMAL = 0.0004;
            let fee = new percent_1.Percent('4', '10000');
            // Exchange fee
            const exchangeRateWithoutFee = 1;
            const exchangeRate = 1 - FEE_DECIMAL;
            debugCurveGetQuote({
                isNativeAssetIn,
                isNativeAssetOut,
            });
            // Use Custom contract for native xDAI<>USDT and xDAI<>USDC trades on Gnosis Chain
            if (chainId === constants_2.ChainId.XDAI && (isNativeAssetIn || isNativeAssetOut)) {
                const poolContract = (0, contracts_2.getCurveDAIExchangeContract)();
                const tokenInAddress = isNativeAssetIn && nativeCurrency.address != undefined ? nativeCurrency.address : tokenIn.address;
                const tokenOutAddress = isNativeAssetOut && nativeCurrency.address != undefined ? nativeCurrency.address : tokenOut.address;
                const estimatedAmountOutParams = [tokenInAddress, tokenOutAddress, amountInBN.toString()];
                const estimatedAmountOut = yield poolContract.getEstimatedAmountOut(...estimatedAmountOutParams);
                // Prepapre signature and params for Curve3PoolExchange
                let exchangeSignature = 'exchangeExactNativeTokenForERC20';
                let exchangeParams = [tokenOut.address, estimatedAmountOut, receiver];
                if (isNativeAssetOut) {
                    exchangeSignature = 'exchangeExactERC20ForNativeToken';
                    exchangeParams = [tokenInAddress, amountInBN.toString(), estimatedAmountOut, receiver];
                }
                debugCurveGetQuote('populating transaction ', {
                    exchangeSignature,
                    exchangeParams,
                    value,
                });
                const populatedTransaction = yield poolContract.populateTransaction[exchangeSignature](...exchangeParams, {
                    value,
                });
                return {
                    currencyAmountIn,
                    populatedTransaction,
                    currencyOut,
                    estimatedAmountOut: currency_1.Currency.isNative(currencyOut)
                        ? currencyAmount_1.CurrencyAmount.nativeCurrency(estimatedAmountOut.toBigInt(), chainId)
                        : new tokenAmount_1.TokenAmount(wrappedtokenOut, estimatedAmountOut.toBigInt()),
                    maximumSlippage,
                    fee,
                    to: poolContract.address,
                    exchangeRateWithoutFee,
                    exchangeRate,
                    contract: poolContract,
                };
            }
            // Check if the two pairs are of different type
            // When the pair types are different, there is
            // a potential that Curve Smart Router can handle the trade
            const isCryptoSwap = tokenIn.type !== tokenOut.type;
            // Find all pools that the trade can go through from both factory and regular pools
            let routablePools = yield (0, utils_3.getRoutablePools)(curvePools, tokenIn, tokenOut, chainId);
            // On mainnet, use the exchange info to get the best pool
            const bestPoolAndOutputRes = chainId === constants_2.ChainId.MAINNET
                ? yield (0, contracts_2.getBestCurvePoolAndOutput)({
                    amountIn: amountInBN,
                    tokenInAddress: tokenIn.address,
                    tokenOutAddress: tokenOut.address,
                    chainId,
                })
                : undefined;
            // If a pool is found
            // Ignore the manual off-chain search
            if (bestPoolAndOutputRes) {
                debugCurveGetQuote(`Found best pool from Curve registry`, bestPoolAndOutputRes);
                const bestPool = routablePools.filter((pool) => pool.address.toLowerCase() === bestPoolAndOutputRes.poolAddress.toLowerCase());
                if (bestPool.length !== 0)
                    routablePools = bestPool;
            }
            debugCurveGetQuote('Routeable pools: ', routablePools);
            // Start finding a possible pool
            // First via Curve's internal best pool finder
            // On Mainnet, try to find a route via Curve's Smart Router
            if (isCryptoSwap && chainId === constants_2.ChainId.MAINNET) {
                const exchangeRoutingInfo = yield (0, contracts_2.getExchangeRoutingInfo)({
                    amountIn: amountInBN.toString(),
                    chainId: constants_2.ChainId.MAINNET,
                    tokenInAddress: tokenIn.address,
                    tokenOutAddress: tokenOut.address,
                });
                // If the swap can be handled by the smart router, use it
                if (exchangeRoutingInfo) {
                    const params = [
                        amountInBN.toString(),
                        exchangeRoutingInfo.routes,
                        exchangeRoutingInfo.indices,
                        exchangeRoutingInfo.expectedAmountOut.mul(98).div(100).toString(),
                    ];
                    const curveRouterContract = (0, contracts_2.getRouter)();
                    debugCurveGetQuote(`Found a route via Smart Router at ${curveRouterContract.address}`, params);
                    const populatedTransaction = yield curveRouterContract.populateTransaction.exchange(...params, {
                        value,
                    });
                    // Add 30% gas buffer
                    populatedTransaction.gasLimit = (_g = populatedTransaction.gasLimit) === null || _g === void 0 ? void 0 : _g.mul(13).div(10);
                    return {
                        fee,
                        estimatedAmountOut: new tokenAmount_1.TokenAmount(currencyOut, exchangeRoutingInfo.expectedAmountOut.toBigInt()),
                        currencyAmountIn,
                        currencyOut,
                        maximumSlippage,
                        populatedTransaction,
                        to: curveRouterContract.address,
                        exchangeRateWithoutFee,
                        exchangeRate,
                        contract: curveRouterContract,
                    };
                }
            }
            // Continue using pool-by-pool cases
            // Exit since no pools have been found
            if (routablePools.length === 0) {
                console.error('CurveTrade: no pools found for trade pair');
                return;
            }
            // The final step
            // Compile all the output
            // Using Multicall contract
            const quoteFromPoolList = yield Promise.all(routablePools.map((pool) => tslib_1.__awaiter(this, void 0, void 0, function* () {
                const poolContract = new contracts_1.Contract(pool.address, pool.abi, provider);
                // Map token address to index
                const tokenInIndex = (0, utils_3.getTokenIndex)(pool, tokenIn.address);
                const tokenOutIndex = (0, utils_3.getTokenIndex)(pool, tokenOut.address);
                // Skip pool that return -1
                if (tokenInIndex < 0 || tokenOutIndex < 0) {
                    console.error(`Curve: pool does not have one of tokens: ${tokenIn.symbol}, ${tokenOut.symbol}`);
                }
                // Get expected output from the pool
                // Use underylying signature if the pool is a meta pool
                // A meta pool is a pool composed of an ERC20 pair with the Curve base 3Pool (DAI+USDC+USDT)
                const dyMethodSignature = pool.isMeta ? 'get_dy_underlying' : 'get_dy';
                // Construct the params
                const dyMethodParams = [tokenInIndex.toString(), tokenOutIndex.toString(), currencyAmountIn.raw.toString()];
                debugCurveGetQuote(`Fetching estimated output from ${pool.address}`, {
                    dyMethodSignature,
                    dyMethodParams,
                });
                try {
                    const estimatedAmountOut = (yield poolContract[dyMethodSignature](...dyMethodParams));
                    // Return the call bytes
                    return {
                        pool,
                        estimatedAmountOut,
                        poolContract,
                    };
                }
                catch (error) {
                    console.error(`CurveTrade error: failed to fetch estimated out from `, {
                        address: pool.address,
                        dyMethodSignature,
                        dyMethodParams,
                        error,
                    });
                    return {
                        pool,
                        estimatedAmountOut: bignumber_1.BigNumber.from(0),
                        poolContract,
                        error,
                    };
                }
            })));
            // Sort the pool by best output
            const estimatedAmountOutPerPoolSorted = quoteFromPoolList
                .filter((pool) => {
                return pool.estimatedAmountOut.gt(0) && pool.error == undefined;
            })
                .sort((poolA, poolB) => poolA.estimatedAmountOut.gt(poolB.estimatedAmountOut)
                ? -1
                : poolA.estimatedAmountOut.eq(poolB.estimatedAmountOut)
                    ? 0
                    : 1);
            if (estimatedAmountOutPerPoolSorted.length === 0) {
                throw new Error('CurveTrade: zero pools returned an quote');
            }
            // Select the best (first) pool
            // among the sorted pools
            const { pool, estimatedAmountOut, poolContract } = estimatedAmountOutPerPoolSorted[0];
            // Try to fetch the fee from the contract the newest
            // If the call fails, the fee defaults back to 4bps
            try {
                const feeFromContract = (yield poolContract.fee());
                fee = new percent_1.Percent(feeFromContract.toString(), '10000000000');
            }
            catch (e) {
                (0, debug_1.default)(e);
            }
            // Map token address to index
            const tokenInIndex = (0, utils_3.getTokenIndex)(pool, tokenIn.address, chainId);
            const tokenOutIndex = (0, utils_3.getTokenIndex)(pool, tokenOut.address, chainId);
            // Construct the unsigned transaction
            // Default method signature and params
            // This is the most optimistic
            let exchangeSignature = Object.keys(poolContract.functions).find((signature) => {
                return signature.startsWith('exchange(');
            }) || 'exchange';
            // If the pool has meta coins
            // Exit to avoid issues
            if (pool.isMeta || (pool === null || pool === void 0 ? void 0 : pool.underlyingTokens)) {
                // Try uint256
                exchangeSignature = 'exchange_underlying(uint256,uint256,uint256,uint256)';
                if (!(exchangeSignature in poolContract.functions)) {
                    exchangeSignature = 'exchange_underlying(int128,int128,uint256,uint256)';
                    if (!(exchangeSignature in poolContract.functions)) {
                        // Exit the search
                        console.error(`CurveTrade: could not find a signature. Target: ${exchangeSignature}`);
                        return;
                    }
                }
            }
            // Reduce by 0.1% to cover fees
            const dyMinimumReceived = estimatedAmountOut.mul(9999).div(10000);
            const exchangeParams = [
                tokenInIndex.toString(),
                tokenOutIndex.toString(),
                amountInBN.toString(),
                dyMinimumReceived.toString(),
            ];
            // Some pools allow trading ETH
            // Use the correct method signature for swaps that involve ETH
            if (pool.allowsTradingETH) {
                exchangeSignature = 'exchange(uint256,uint256,uint256,uint256,bool)';
                if (!(exchangeSignature in poolContract.functions) ||
                    !poolContract.interface.getFunction(exchangeSignature).payable) {
                    // Exit the search
                    console.error(`CurveTrade: could not find a signature. Target: ${exchangeSignature}`);
                    return;
                }
                // Native currency ETH parameter: eth_in
                exchangeParams.push(isNativeAssetIn);
            }
            debugCurveGetQuote('Final pool', {
                address: poolContract.address,
                exchangeSignature,
                exchangeParams,
            });
            const populatedTransaction = yield poolContract.populateTransaction[exchangeSignature](...exchangeParams, {
                value,
            });
            return {
                currencyAmountIn,
                populatedTransaction,
                currencyOut,
                estimatedAmountOut: currency_1.Currency.isNative(currencyOut)
                    ? currencyAmount_1.CurrencyAmount.nativeCurrency(estimatedAmountOut.toBigInt(), chainId)
                    : new tokenAmount_1.TokenAmount(wrappedtokenOut, estimatedAmountOut.toBigInt()),
                maximumSlippage,
                fee,
                to: poolContract.address,
                exchangeRateWithoutFee,
                exchangeRate,
                contract: poolContract,
            };
        });
    }
    /**
     * Computes and returns the best trade from Curve pools
     * by comparing all the Curve pools on target chain
     * @param {object} obj options
     * @param {CurrencyAmount} obj.currencyAmountIn the amount of curreny in - sell token
     * @param {Currency} obj.currencyOut the currency out - buy token
     * @param {Percent} obj.maximumSlippage Maximum slippage
     * @param {Provider} provider an optional provider, the router defaults public providers
     * @returns the best trade if found
     */
    static bestTradeExactIn({ currencyAmountIn, currencyOut, maximumSlippage, receiver }, provider) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            // Try to extract the chain ID from the tokens
            const chainId = (0, utils_1.tryGetChainId)(currencyAmountIn, currencyOut);
            // Require the chain ID
            (0, tiny_invariant_1.default)(chainId !== undefined && routable_platform_1.RoutablePlatform.CURVE.supportsChain(chainId), 'CHAIN_ID');
            try {
                const quote = yield CurveTrade.getQuote({
                    currencyAmountIn,
                    currencyOut,
                    maximumSlippage,
                    receiver,
                }, provider);
                if (quote) {
                    const { currencyAmountIn, estimatedAmountOut, fee, maximumSlippage, populatedTransaction, to, contract } = quote;
                    // Return the CurveTrade
                    return new CurveTrade({
                        fee,
                        maximumSlippage,
                        tradeType: constants_2.TradeType.EXACT_INPUT,
                        chainId,
                        transactionRequest: populatedTransaction,
                        inputAmount: currencyAmountIn,
                        outputAmount: estimatedAmountOut,
                        approveAddress: to,
                        contract,
                    });
                }
            }
            catch (error) {
                console.error('could not fetch Curve trade', error);
            }
            return;
        });
    }
    /**
     * Computes and returns the best trade from Curve pools using output as target.
     * Avoid usig this method. It uses some optimistic math estimate right input.
     * @param {object} obj options
     * @param {CurrencyAmount} obj.currencyAmountOut the amount of curreny in - buy token
     * @param {Currency} obj.currencyIn the currency in - sell token
     * @param {Percent} obj.maximumSlippage Maximum slippage
     * @param {Provider} provider an optional provider, the router defaults public providers
     * @returns the best trade if found
     */
    static bestTradeExactOut({ currencyAmountOut, currencyIn, maximumSlippage, receiver }, provider) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            // Try to extract the chain ID from the tokens
            const chainId = (0, utils_1.tryGetChainId)(currencyAmountOut, currencyIn);
            // Require the chain ID
            (0, tiny_invariant_1.default)(chainId !== undefined && routable_platform_1.RoutablePlatform.CURVE.supportsChain(chainId), 'CHAIN_ID');
            try {
                // Get quote for original amounts in
                const baseQuote = (yield CurveTrade.getQuote({
                    currencyAmountIn: currencyAmountOut,
                    currencyOut: currencyIn,
                    maximumSlippage,
                    receiver,
                }, provider));
                const currencyOut = currencyAmountOut.currency;
                const rawInputToOutputExchangeRate = new decimal_js_light_1.default(baseQuote.exchangeRate).pow(-currencyOut.decimals);
                const outputToInputExchangeRate = new decimal_js_light_1.default(rawInputToOutputExchangeRate).pow(-1);
                const amountOut = new decimal_js_light_1.default(currencyAmountOut.toFixed(currencyOut.decimals));
                const estimatedAmountIn = amountOut.times(outputToInputExchangeRate).dividedBy('0.9996');
                const currencyAmountIn = new tokenAmount_1.TokenAmount(currencyIn, (0, units_1.parseUnits)(estimatedAmountIn.toFixed(currencyIn.decimals), currencyIn.decimals).toString());
                const quote = yield CurveTrade.getQuote({
                    currencyAmountIn,
                    currencyOut,
                    maximumSlippage,
                    receiver,
                }, provider);
                if (quote) {
                    const { currencyAmountIn, estimatedAmountOut, fee, maximumSlippage, populatedTransaction, to, contract } = quote;
                    // Return the CurveTrade
                    return new CurveTrade({
                        fee,
                        maximumSlippage,
                        tradeType: constants_2.TradeType.EXACT_OUTPUT,
                        chainId,
                        transactionRequest: populatedTransaction,
                        inputAmount: currencyAmountIn,
                        outputAmount: estimatedAmountOut,
                        approveAddress: to,
                        contract,
                    });
                }
            }
            catch (error) {
                console.error('could not fetch Curve trade', error);
            }
            return;
        });
    }
    /**
     * Returns unsigned transaction for the trade
     * @returns the unsigned transaction
     */
    swapTransaction() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return Object.assign(Object.assign({}, this.transactionRequest), { gasLimit: this.transactionRequest.gasLimit ? bignumber_1.BigNumber.from(this.transactionRequest.gasLimit) : undefined, value: this.transactionRequest.value ? this.transactionRequest.value : bignumber_1.BigNumber.from(0) });
        });
    }
}
exports.CurveTrade = CurveTrade;
//# sourceMappingURL=CurveTrade.js.map