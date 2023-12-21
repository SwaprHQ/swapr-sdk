"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SwapRouter = exports.SelfPermit = void 0;
const tslib_1 = require("tslib");
const abi_1 = require("@ethersproject/abi");
const sdk_core_1 = require("@uniswap/sdk-core");
const tiny_invariant_1 = tslib_1.__importDefault(require("tiny-invariant"));
const encode_route_1 = require("./encode-route");
const calldata_1 = require("./calldata");
const swapr_algebra_router_1 = require("./abi/swapr-algebra-router");
const v3_sdk_1 = require("@uniswap/v3-sdk");
// type guard
function isAllowedPermit(permitOptions) {
    return 'nonce' in permitOptions;
}
class SelfPermit {
    // protected constructor() { }
    static encodePermit(token, options) {
        return isAllowedPermit(options)
            ? SelfPermit.INTERFACE.encodeFunctionData('selfPermitAllowed', [
                token.address,
                (0, calldata_1.toHex)(options.nonce),
                (0, calldata_1.toHex)(options.expiry),
                options.v,
                options.r,
                options.s,
            ])
            : SelfPermit.INTERFACE.encodeFunctionData('selfPermit', [
                token.address,
                (0, calldata_1.toHex)(options.amount),
                (0, calldata_1.toHex)(options.deadline),
                options.v,
                options.r,
                options.s,
            ]);
    }
}
exports.SelfPermit = SelfPermit;
SelfPermit.INTERFACE = new abi_1.Interface(swapr_algebra_router_1.SWAPR_ALGEBRA_ROUTER_ABI);
/**
 * Represents the Uniswap V2 SwapRouter, and has static methods for helping execute trades.
 */
class SwapRouter extends SelfPermit {
    /**
     * Cannot be constructed.
     */
    constructor() {
        super();
    }
    /**
     * Produces the on-chain method name to call and the hex encoded parameters to pass as arguments for a given trade.
     * @param trade to produce call parameters for
     * @param options options for the call parameters
     */
    static swapCallParameters(trades, options) {
        var _a, _b;
        if (!Array.isArray(trades)) {
            trades = [trades];
        }
        const sampleTrade = trades[0];
        const tokenIn = sampleTrade.route.tokenPath[0];
        const tokenOut = sampleTrade.route.tokenPath[sampleTrade.route.tokenPath.length - 1];
        // All trades should have the same starting and ending token.
        (0, tiny_invariant_1.default)(trades.every((trade) => trade.route.tokenPath[0].equals(tokenIn)), 'TOKEN_IN_DIFF');
        (0, tiny_invariant_1.default)(trades.every((trade) => trade.route.tokenPath[trade.route.tokenPath.length - 1].equals(tokenOut)), 'TOKEN_OUT_DIFF');
        const calldatas = [];
        const ZERO_IN = sdk_core_1.CurrencyAmount.fromRawAmount(trades[0].inputAmount.currency, 0);
        const ZERO_OUT = sdk_core_1.CurrencyAmount.fromRawAmount(trades[0].outputAmount.currency, 0);
        const totalAmountOut = trades.reduce((sum, trade) => sum.add(trade.minimumAmountOut(options.slippageTolerance)), ZERO_OUT);
        // flag for whether a refund needs to happen
        const mustRefund = sampleTrade.inputAmount.currency.isNative && sampleTrade.tradeType === sdk_core_1.TradeType.EXACT_OUTPUT;
        const inputIsNative = sampleTrade.inputAmount.currency.isNative;
        // flags for whether funds should be send first to the router
        const outputIsNative = sampleTrade.outputAmount.currency.isNative;
        const routerMustCustody = outputIsNative || !!options.fee;
        const totalValue = inputIsNative
            ? trades.reduce((sum, trade) => sum.add(trade.maximumAmountIn(options.slippageTolerance)), ZERO_IN)
            : ZERO_IN;
        // encode permit if necessary
        if (options.inputTokenPermit) {
            (0, tiny_invariant_1.default)(sampleTrade.inputAmount.currency.isToken, 'NON_TOKEN_PERMIT');
            calldatas.push(SwapRouter.encodePermit(sampleTrade.inputAmount.currency, options.inputTokenPermit));
        }
        const recipient = (0, sdk_core_1.validateAndParseAddress)(options.recipient);
        const deadline = (0, calldata_1.toHex)(options.deadline);
        for (const trade of trades) {
            const amountIn = (0, calldata_1.toHex)(trade.maximumAmountIn(options.slippageTolerance).quotient);
            const amountOut = (0, calldata_1.toHex)(trade.minimumAmountOut(options.slippageTolerance).quotient);
            // flag for whether the trade is single hop or not
            const singleHop = trade.route.pools.length === 1;
            if (singleHop) {
                if (trade.tradeType === sdk_core_1.TradeType.EXACT_INPUT) {
                    const exactInputSingleParams = {
                        tokenIn: trade.route.tokenPath[0].address,
                        tokenOut: trade.route.tokenPath[1].address,
                        fee: trade.route.pools[0].fee,
                        recipient: routerMustCustody ? v3_sdk_1.ADDRESS_ZERO : recipient,
                        sqrtPriceLimitX96: (0, calldata_1.toHex)((_a = options.sqrtPriceLimitX96) !== null && _a !== void 0 ? _a : 0),
                        deadline,
                        amountIn,
                        amountOutMinimum: amountOut,
                    };
                    calldatas.push(SwapRouter.INTERFACE.encodeFunctionData('exactInputSingle', [exactInputSingleParams]));
                }
                else {
                    const exactOutputSingleParams = {
                        tokenIn: trade.route.tokenPath[0].address,
                        tokenOut: trade.route.tokenPath[1].address,
                        fee: trade.route.pools[0].fee,
                        recipient: routerMustCustody ? v3_sdk_1.ADDRESS_ZERO : recipient,
                        sqrtPriceLimitX96: (0, calldata_1.toHex)((_b = options.sqrtPriceLimitX96) !== null && _b !== void 0 ? _b : 0),
                        deadline,
                        amountOut,
                        amountInMaximum: amountIn,
                    };
                    calldatas.push(SwapRouter.INTERFACE.encodeFunctionData('exactOutputSingle', [exactOutputSingleParams]));
                }
            }
            else {
                (0, tiny_invariant_1.default)(options.sqrtPriceLimitX96 === undefined, 'MULTIHOP_PRICE_LIMIT');
                const path = (0, encode_route_1.encodeRouteToPath)(trade.route, trade.tradeType === sdk_core_1.TradeType.EXACT_OUTPUT);
                if (trade.tradeType === sdk_core_1.TradeType.EXACT_INPUT) {
                    const exactInputParams = {
                        path,
                        recipient: routerMustCustody ? v3_sdk_1.ADDRESS_ZERO : recipient,
                        deadline,
                        amountIn,
                        amountOutMinimum: amountOut,
                    };
                    calldatas.push(SwapRouter.INTERFACE.encodeFunctionData('exactInput', [exactInputParams]));
                }
                else {
                    const exactOutputParams = {
                        path,
                        recipient: routerMustCustody ? v3_sdk_1.ADDRESS_ZERO : recipient,
                        deadline,
                        amountOut,
                        amountInMaximum: amountIn,
                    };
                    calldatas.push(SwapRouter.INTERFACE.encodeFunctionData('exactOutput', [exactOutputParams]));
                }
            }
        }
        // unwrap
        if (routerMustCustody) {
            if (!!options.fee) {
                const feeRecipient = (0, sdk_core_1.validateAndParseAddress)(options.fee.recipient);
                const fee = (0, calldata_1.toHex)(options.fee.fee.multiply(10000).quotient);
                if (outputIsNative) {
                    calldatas.push(SwapRouter.INTERFACE.encodeFunctionData('unwrapWNativeTokenWithFee', [
                        (0, calldata_1.toHex)(totalAmountOut.quotient),
                        recipient,
                        fee,
                        feeRecipient,
                    ]));
                }
                else {
                    calldatas.push(SwapRouter.INTERFACE.encodeFunctionData('sweepTokenWithFee', [
                        sampleTrade.route.tokenPath[sampleTrade.route.tokenPath.length - 1].address,
                        (0, calldata_1.toHex)(totalAmountOut.quotient),
                        recipient,
                        fee,
                        feeRecipient,
                    ]));
                }
            }
            else {
                calldatas.push(SwapRouter.INTERFACE.encodeFunctionData('unwrapWNativeToken', [(0, calldata_1.toHex)(totalAmountOut.quotient), recipient]));
            }
        }
        // refund
        if (mustRefund) {
            calldatas.push(SwapRouter.INTERFACE.encodeFunctionData('refundNativeToken'));
        }
        return {
            calldata: calldatas.length === 1 ? calldatas[0] : SwapRouter.INTERFACE.encodeFunctionData('multicall', [calldatas]),
            value: (0, calldata_1.toHex)(totalValue.quotient),
        };
    }
}
exports.SwapRouter = SwapRouter;
SwapRouter.INTERFACE = new abi_1.Interface(swapr_algebra_router_1.SWAPR_ALGEBRA_ROUTER_ABI);
//# sourceMappingURL=router.js.map