"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Pool = void 0;
const tslib_1 = require("tslib");
const sdk_core_1 = require("@uniswap/sdk-core");
const v3_sdk_1 = require("@uniswap/v3-sdk");
const jsbi_1 = tslib_1.__importDefault(require("jsbi"));
const tiny_invariant_1 = tslib_1.__importDefault(require("tiny-invariant"));
const constants_1 = require("../constants");
const Q96 = jsbi_1.default.exponentiate(jsbi_1.default.BigInt(2), jsbi_1.default.BigInt(96));
const Q192 = jsbi_1.default.exponentiate(Q96, jsbi_1.default.BigInt(2));
/**
 * By default, pools will not allow operations that require ticks.
 */
const NO_TICK_DATA_PROVIDER_DEFAULT = new v3_sdk_1.NoTickDataProvider();
/**
 * Represents a V3 pool
 */
class Pool {
    /**
     * Construct a pool
     * @param tokenA One of the tokens in the pool
     * @param tokenB The other token in the pool
     * @param fee The fee in hundredths of a bips of the input amount of every swap that is collected by the pool
     * @param sqrtRatioX96 The sqrt of the current ratio of amounts of token1 to token0
     * @param liquidity The current value of in range liquidity
     * @param tickCurrent The current tick of the pool
     * @param ticks The current state of the pool ticks or a data provider that can return tick data
     */
    constructor(tokenA, tokenB, fee, sqrtRatioX96, liquidity, tickCurrent, ticks = NO_TICK_DATA_PROVIDER_DEFAULT) {
        (0, tiny_invariant_1.default)(Number.isInteger(fee) && fee < 1000000, 'FEE');
        const tickCurrentSqrtRatioX96 = v3_sdk_1.TickMath.getSqrtRatioAtTick(tickCurrent);
        const nextTickSqrtRatioX96 = v3_sdk_1.TickMath.getSqrtRatioAtTick(tickCurrent + 1);
        (0, tiny_invariant_1.default)(jsbi_1.default.greaterThanOrEqual(jsbi_1.default.BigInt(sqrtRatioX96), tickCurrentSqrtRatioX96) &&
            jsbi_1.default.lessThanOrEqual(jsbi_1.default.BigInt(sqrtRatioX96), nextTickSqrtRatioX96), 'PRICE_BOUNDS');
        [this.token0, this.token1] = tokenA.sortsBefore(tokenB) ? [tokenA, tokenB] : [tokenB, tokenA];
        this.fee = fee;
        this.sqrtRatioX96 = jsbi_1.default.BigInt(sqrtRatioX96);
        this.liquidity = jsbi_1.default.BigInt(liquidity);
        this.tickCurrent = tickCurrent;
        this.tickDataProvider = Array.isArray(ticks) ? new v3_sdk_1.TickListDataProvider(ticks, 60) : ticks;
    }
    /**
     * Returns the current mid price of the pool in terms of token0, i.e. the ratio of token1 over token0
     */
    get token0Price() {
        var _a;
        return ((_a = this._token0Price) !== null && _a !== void 0 ? _a : (this._token0Price = new sdk_core_1.Price(this.token0, this.token1, Q192, jsbi_1.default.multiply(this.sqrtRatioX96, this.sqrtRatioX96))));
    }
    /**
     * Returns the current mid price of the pool in terms of token1, i.e. the ratio of token0 over token1
     */
    get token1Price() {
        var _a;
        return ((_a = this._token1Price) !== null && _a !== void 0 ? _a : (this._token1Price = new sdk_core_1.Price(this.token1, this.token0, jsbi_1.default.multiply(this.sqrtRatioX96, this.sqrtRatioX96), Q192)));
    }
    /**
     * Returns the chain ID of the tokens in the pool.
     */
    get chainId() {
        return this.token0.chainId;
    }
    get tickSpacing() {
        return 60;
    }
    static getAddress(tokenA, tokenB, fee, initCodeHashManualOverride) {
        return (0, v3_sdk_1.computePoolAddress)({
            factoryAddress: constants_1.POOL_DEPLOYER_ADDRESS,
            fee,
            tokenA,
            tokenB,
            initCodeHashManualOverride,
        });
    }
    /**
     * Returns true if the token is either token0 or token1
     * @param token The token to check
     * @returns True if token is either token0 or token
     */
    involvesToken(token) {
        return token.equals(this.token0) || token.equals(this.token1);
    }
    /**
     * Return the price of the given token in terms of the other token in the pool.
     * @param token The token to return price of
     * @returns The price of the given token, in terms of the other.
     */
    priceOf(token) {
        (0, tiny_invariant_1.default)(this.involvesToken(token), 'TOKEN');
        return token.equals(this.token0) ? this.token0Price : this.token1Price;
    }
    /**
     * Given an input amount of a token, return the computed output amount, and a pool with state updated after the trade
     * @param inputAmount The input amount for which to quote the output amount
     * @param sqrtPriceLimitX96 The Q64.96 sqrt price limit
     * @returns The output amount and the pool with updated state
     */
    getOutputAmount(inputAmount, sqrtPriceLimitX96) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            (0, tiny_invariant_1.default)(this.involvesToken(inputAmount.currency), 'TOKEN');
            const zeroForOne = inputAmount.currency.equals(this.token0);
            const { amountCalculated: outputAmount, sqrtRatioX96, liquidity, tickCurrent, } = yield this.swap(zeroForOne, inputAmount.quotient, sqrtPriceLimitX96);
            const outputToken = zeroForOne ? this.token1 : this.token0;
            return [
                sdk_core_1.CurrencyAmount.fromRawAmount(outputToken, jsbi_1.default.multiply(outputAmount, jsbi_1.default.BigInt(-1))),
                new Pool(this.token0, this.token1, this.fee, sqrtRatioX96, liquidity, tickCurrent, this.tickDataProvider),
            ];
        });
    }
    /**
     * Given a desired output amount of a token, return the computed input amount and a pool with state updated after the trade
     * @param outputAmount the output amount for which to quote the input amount
     * @param sqrtPriceLimitX96 The Q64.96 sqrt price limit. If zero for one, the price cannot be less than this value after the swap. If one for zero, the price cannot be greater than this value after the swap
     * @returns The input amount and the pool with updated state
     */
    getInputAmount(outputAmount, sqrtPriceLimitX96) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            (0, tiny_invariant_1.default)(outputAmount.currency.isToken && this.involvesToken(outputAmount.currency), 'TOKEN');
            const zeroForOne = outputAmount.currency.equals(this.token1);
            const { amountCalculated: inputAmount, sqrtRatioX96, liquidity, tickCurrent, } = yield this.swap(zeroForOne, jsbi_1.default.multiply(outputAmount.quotient, jsbi_1.default.BigInt(-1)), sqrtPriceLimitX96);
            const inputToken = zeroForOne ? this.token0 : this.token1;
            return [
                sdk_core_1.CurrencyAmount.fromRawAmount(inputToken, inputAmount),
                new Pool(this.token0, this.token1, this.fee, sqrtRatioX96, liquidity, tickCurrent, this.tickDataProvider),
            ];
        });
    }
    /**
     * Executes a swap
     * @param zeroForOne Whether the amount in is token0 or token1
     * @param amountSpecified The amount of the swap, which implicitly configures the swap as exact input (positive), or exact output (negative)
     * @param sqrtPriceLimitX96 The Q64.96 sqrt price limit. If zero for one, the price cannot be less than this value after the swap. If one for zero, the price cannot be greater than this value after the swap
     * @returns amountCalculated
     * @returns sqrtRatioX96
     * @returns liquidity
     * @returns tickCurrent
     */
    swap(zeroForOne, amountSpecified, sqrtPriceLimitX96) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (!sqrtPriceLimitX96)
                sqrtPriceLimitX96 = zeroForOne
                    ? jsbi_1.default.add(v3_sdk_1.TickMath.MIN_SQRT_RATIO, jsbi_1.default.BigInt(1))
                    : jsbi_1.default.subtract(v3_sdk_1.TickMath.MAX_SQRT_RATIO, jsbi_1.default.BigInt(1));
            if (zeroForOne) {
                (0, tiny_invariant_1.default)(jsbi_1.default.greaterThan(sqrtPriceLimitX96, v3_sdk_1.TickMath.MIN_SQRT_RATIO), 'RATIO_MIN');
                (0, tiny_invariant_1.default)(jsbi_1.default.lessThan(sqrtPriceLimitX96, this.sqrtRatioX96), 'RATIO_CURRENT');
            }
            else {
                (0, tiny_invariant_1.default)(jsbi_1.default.lessThan(sqrtPriceLimitX96, v3_sdk_1.TickMath.MAX_SQRT_RATIO), 'RATIO_MAX');
                (0, tiny_invariant_1.default)(jsbi_1.default.greaterThan(sqrtPriceLimitX96, this.sqrtRatioX96), 'RATIO_CURRENT');
            }
            const exactInput = jsbi_1.default.greaterThanOrEqual(amountSpecified, jsbi_1.default.BigInt(0));
            // keep track of swap state
            const state = {
                amountSpecifiedRemaining: amountSpecified,
                amountCalculated: jsbi_1.default.BigInt(0),
                sqrtPriceX96: this.sqrtRatioX96,
                tick: this.tickCurrent,
                liquidity: this.liquidity,
            };
            // start swap while loop
            while (jsbi_1.default.notEqual(state.amountSpecifiedRemaining, jsbi_1.default.BigInt(0)) && state.sqrtPriceX96 != sqrtPriceLimitX96) {
                const step = {};
                step.sqrtPriceStartX96 = state.sqrtPriceX96;
                [step.tickNext, step.initialized] = yield this.tickDataProvider.nextInitializedTickWithinOneWord(state.tick, zeroForOne, this.tickSpacing);
                if (step.tickNext < v3_sdk_1.TickMath.MIN_TICK) {
                    step.tickNext = v3_sdk_1.TickMath.MIN_TICK;
                }
                else if (step.tickNext > v3_sdk_1.TickMath.MAX_TICK) {
                    step.tickNext = v3_sdk_1.TickMath.MAX_TICK;
                }
                step.sqrtPriceNextX96 = v3_sdk_1.TickMath.getSqrtRatioAtTick(step.tickNext);
                [state.sqrtPriceX96, step.amountIn, step.amountOut, step.feeAmount] = v3_sdk_1.SwapMath.computeSwapStep(state.sqrtPriceX96, (zeroForOne
                    ? jsbi_1.default.lessThan(step.sqrtPriceNextX96, sqrtPriceLimitX96)
                    : jsbi_1.default.greaterThan(step.sqrtPriceNextX96, sqrtPriceLimitX96))
                    ? sqrtPriceLimitX96
                    : step.sqrtPriceNextX96, state.liquidity, state.amountSpecifiedRemaining, this.fee);
                if (exactInput) {
                    state.amountSpecifiedRemaining = jsbi_1.default.subtract(state.amountSpecifiedRemaining, jsbi_1.default.add(step.amountIn, step.feeAmount));
                    state.amountCalculated = jsbi_1.default.subtract(state.amountCalculated, step.amountOut);
                }
                else {
                    state.amountSpecifiedRemaining = jsbi_1.default.add(state.amountSpecifiedRemaining, step.amountOut);
                    state.amountCalculated = jsbi_1.default.add(state.amountCalculated, jsbi_1.default.add(step.amountIn, step.feeAmount));
                }
                // TODO
                if (jsbi_1.default.equal(state.sqrtPriceX96, step.sqrtPriceNextX96)) {
                    // if the tick is initialized, run the tick transition
                    if (step.initialized) {
                        let liquidityNet = jsbi_1.default.BigInt((yield this.tickDataProvider.getTick(step.tickNext)).liquidityNet);
                        // if we're moving leftward, we interpret liquidityNet as the opposite sign
                        // safe because liquidityNet cannot be type(int128).min
                        if (zeroForOne)
                            liquidityNet = jsbi_1.default.multiply(liquidityNet, jsbi_1.default.BigInt(-1));
                        state.liquidity = v3_sdk_1.LiquidityMath.addDelta(state.liquidity, liquidityNet);
                    }
                    state.tick = zeroForOne ? step.tickNext - 1 : step.tickNext;
                }
                else if (state.sqrtPriceX96 != step.sqrtPriceStartX96) {
                    // recompute unless we're on a lower tick boundary (i.e. already transitioned ticks), and haven't moved
                    state.tick = v3_sdk_1.TickMath.getTickAtSqrtRatio(state.sqrtPriceX96);
                }
            }
            return {
                amountCalculated: state.amountCalculated,
                sqrtRatioX96: state.sqrtPriceX96,
                liquidity: state.liquidity,
                tickCurrent: state.tick,
            };
        });
    }
}
exports.Pool = Pool;
//# sourceMappingURL=pool.js.map