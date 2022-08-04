"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const jsbi_1 = tslib_1.__importDefault(require("jsbi"));
const src_1 = require("../src");
const constants_1 = require("../src/constants");
describe('Dynamic-Fees', () => {
    const maximumSlippage = new src_1.Percent('3', '100');
    const token0 = new src_1.Token(src_1.ChainId.MAINNET, '0x0000000000000000000000000000000000000001', 18, 't0');
    const token1 = new src_1.Token(src_1.ChainId.MAINNET, '0x0000000000000000000000000000000000000002', 18, 't1');
    const token2 = new src_1.Token(src_1.ChainId.MAINNET, '0x0000000000000000000000000000000000000003', 18, 't2');
    const token3 = new src_1.Token(src_1.ChainId.MAINNET, '0x0000000000000000000000000000000000000004', 18, 't3');
    const pair_0_1 = new src_1.Pair(new src_1.TokenAmount(token0, jsbi_1.default.BigInt(1000)), new src_1.TokenAmount(token1, jsbi_1.default.BigInt(1000)), jsbi_1.default.BigInt(0), jsbi_1.default.BigInt(0));
    const pair_0_2 = new src_1.Pair(new src_1.TokenAmount(token0, jsbi_1.default.BigInt(1000)), new src_1.TokenAmount(token2, jsbi_1.default.BigInt(1100)), jsbi_1.default.BigInt(15), jsbi_1.default.BigInt(5));
    const pair_0_3 = new src_1.Pair(new src_1.TokenAmount(token0, jsbi_1.default.BigInt(1000)), new src_1.TokenAmount(token3, jsbi_1.default.BigInt(900)), jsbi_1.default.BigInt(30), jsbi_1.default.BigInt(0));
    const pair_1_2 = new src_1.Pair(new src_1.TokenAmount(token1, jsbi_1.default.BigInt(1200)), new src_1.TokenAmount(token2, jsbi_1.default.BigInt(1000)), jsbi_1.default.BigInt(0), jsbi_1.default.BigInt(5));
    const pair_1_3 = new src_1.Pair(new src_1.TokenAmount(token1, jsbi_1.default.BigInt(1200)), new src_1.TokenAmount(token3, jsbi_1.default.BigInt(1300)), constants_1.defaultSwapFee, constants_1.defaultProtocolFeeDenominator);
    const empty_pair_0_1 = new src_1.Pair(new src_1.TokenAmount(token0, jsbi_1.default.BigInt(0)), new src_1.TokenAmount(token1, jsbi_1.default.BigInt(0)));
    describe('#computeTradesExactIn', () => {
        it('throws with empty pairs', () => {
            expect(() => src_1.UniswapV2Trade.computeTradesExactIn({
                pairs: [],
                currencyAmountIn: new src_1.TokenAmount(token0, jsbi_1.default.BigInt(100)),
                currencyOut: token2,
                maximumSlippage,
            })).toThrow('PAIRS');
        });
        it('throws with max hops of 0', () => {
            expect(() => src_1.UniswapV2Trade.computeTradesExactIn({
                pairs: [pair_0_2],
                currencyAmountIn: new src_1.TokenAmount(token0, jsbi_1.default.BigInt(100)),
                currencyOut: token2,
                maxHops: { maxHops: 0 },
                maximumSlippage,
            })).toThrow('MAX_HOPS');
        });
        it('provides best route', () => {
            var _a, _b, _c, _d;
            const result = src_1.UniswapV2Trade.computeTradesExactIn({
                pairs: [pair_0_1, pair_0_2, pair_1_2],
                currencyAmountIn: new src_1.TokenAmount(token0, jsbi_1.default.BigInt(100)),
                currencyOut: token2,
                maximumSlippage,
            });
            expect((_a = result[0]) === null || _a === void 0 ? void 0 : _a.route.pairs).toHaveLength(1); // 0 -> 2 at 10:11
            expect((_b = result[0]) === null || _b === void 0 ? void 0 : _b.route.path).toEqual([token0, token2]);
            expect((_c = result[0]) === null || _c === void 0 ? void 0 : _c.inputAmount).toEqual(new src_1.TokenAmount(token0, jsbi_1.default.BigInt(100)));
            expect((_d = result[0]) === null || _d === void 0 ? void 0 : _d.outputAmount).toEqual(new src_1.TokenAmount(token2, jsbi_1.default.BigInt(99)));
        });
        it('doesnt throw for zero liquidity pairs', () => {
            expect(src_1.UniswapV2Trade.computeTradesExactIn({
                pairs: [empty_pair_0_1],
                currencyAmountIn: new src_1.TokenAmount(token0, jsbi_1.default.BigInt(100)),
                currencyOut: token1,
                maximumSlippage,
            })).toHaveLength(0);
        });
        it('respects maxHops', () => {
            var _a, _b;
            const result = src_1.UniswapV2Trade.computeTradesExactIn({
                pairs: [pair_0_1, pair_0_2, pair_1_2],
                currencyAmountIn: new src_1.TokenAmount(token0, jsbi_1.default.BigInt(10)),
                currencyOut: token2,
                maxHops: { maxHops: 1 },
                maximumSlippage,
            });
            expect((_a = result[0]) === null || _a === void 0 ? void 0 : _a.route.pairs).toHaveLength(1); // 0 -> 2 at 10:11
            expect((_b = result[0]) === null || _b === void 0 ? void 0 : _b.route.path).toEqual([token0, token2]);
        });
        it('insufficient input for one pair', () => {
            var _a, _b, _c;
            const result = src_1.UniswapV2Trade.computeTradesExactIn({
                pairs: [pair_0_1, pair_0_2, pair_1_2],
                currencyAmountIn: new src_1.TokenAmount(token0, jsbi_1.default.BigInt(1)),
                currencyOut: token2,
                maximumSlippage,
            });
            expect((_a = result[0]) === null || _a === void 0 ? void 0 : _a.route.pairs).toHaveLength(1); // 0 -> 2 at 10:11
            expect((_b = result[0]) === null || _b === void 0 ? void 0 : _b.route.path).toEqual([token0, token2]);
            expect((_c = result[0]) === null || _c === void 0 ? void 0 : _c.outputAmount).toEqual(new src_1.TokenAmount(token2, jsbi_1.default.BigInt(1)));
        });
        it('respects n', () => {
            var _a;
            const result = src_1.UniswapV2Trade.computeTradesExactIn({
                pairs: [pair_0_1, pair_0_2, pair_1_2],
                currencyAmountIn: new src_1.TokenAmount(token0, jsbi_1.default.BigInt(10)),
                currencyOut: token2,
                maxHops: { maxNumResults: 1 },
                maximumSlippage,
            });
            expect((_a = result[0]) === null || _a === void 0 ? void 0 : _a.route.pairs).toHaveLength(1);
        });
        it('no path', () => {
            const result = src_1.UniswapV2Trade.computeTradesExactIn({
                pairs: [pair_0_1, pair_0_3, pair_1_3],
                currencyAmountIn: new src_1.TokenAmount(token0, jsbi_1.default.BigInt(10)),
                currencyOut: token2,
                maximumSlippage,
            });
            expect(result).toHaveLength(0);
        });
    });
    describe('#computeTradesExactOut', () => {
        it('throws with empty pairs', () => {
            expect(() => src_1.UniswapV2Trade.computeTradesExactOut({
                pairs: [],
                currencyIn: token0,
                currencyAmountOut: new src_1.TokenAmount(token2, jsbi_1.default.BigInt(100)),
                maximumSlippage,
            })).toThrow('PAIRS');
        });
        it('throws with max hops of 0', () => {
            expect(() => src_1.UniswapV2Trade.computeTradesExactOut({
                pairs: [pair_0_2],
                currencyIn: token0,
                currencyAmountOut: new src_1.TokenAmount(token2, jsbi_1.default.BigInt(100)),
                maxHops: { maxHops: 0 },
                maximumSlippage,
            })).toThrow('MAX_HOPS');
        });
        it('provides best route', () => {
            var _a, _b, _c, _d;
            const result = src_1.UniswapV2Trade.computeTradesExactOut({
                pairs: [pair_0_1, pair_0_2, pair_1_2],
                currencyIn: token0,
                currencyAmountOut: new src_1.TokenAmount(token2, jsbi_1.default.BigInt(100)),
                maximumSlippage,
            });
            expect((_a = result[0]) === null || _a === void 0 ? void 0 : _a.route.pairs).toHaveLength(1); // 0 -> 2 at 10:11
            expect((_b = result[0]) === null || _b === void 0 ? void 0 : _b.route.path).toEqual([token0, token2]);
            expect((_c = result[0]) === null || _c === void 0 ? void 0 : _c.inputAmount).toEqual(new src_1.TokenAmount(token0, jsbi_1.default.BigInt(101)));
            expect((_d = result[0]) === null || _d === void 0 ? void 0 : _d.outputAmount).toEqual(new src_1.TokenAmount(token2, jsbi_1.default.BigInt(100)));
        });
        it('respects maxHops', () => {
            var _a, _b;
            const result = src_1.UniswapV2Trade.computeTradesExactOut({
                pairs: [pair_0_1, pair_0_2, pair_1_2],
                currencyIn: token0,
                currencyAmountOut: new src_1.TokenAmount(token2, jsbi_1.default.BigInt(10)),
                maxHops: { maxHops: 1 },
                maximumSlippage,
            });
            expect((_a = result[0]) === null || _a === void 0 ? void 0 : _a.route.pairs).toHaveLength(1); // 0 -> 2 at 10:11
            expect((_b = result[0]) === null || _b === void 0 ? void 0 : _b.route.path).toEqual([token0, token2]);
        });
        it('insufficient liquidity', () => {
            const result = src_1.UniswapV2Trade.computeTradesExactOut({
                pairs: [pair_0_1, pair_0_2, pair_1_2],
                currencyIn: token0,
                currencyAmountOut: new src_1.TokenAmount(token2, jsbi_1.default.BigInt(1200)),
                maximumSlippage,
            });
            expect(result).toHaveLength(0);
        });
        it('insufficient liquidity in one pair but not the other', () => {
            var _a;
            const result = src_1.UniswapV2Trade.computeTradesExactOut({
                pairs: [pair_0_1, pair_0_2, pair_1_2],
                currencyIn: token0,
                currencyAmountOut: new src_1.TokenAmount(token2, jsbi_1.default.BigInt(1050)),
                maximumSlippage,
            });
            expect((_a = result[0]) === null || _a === void 0 ? void 0 : _a.route.pairs).toHaveLength(1);
        });
        it('respects n', () => {
            var _a;
            const result = src_1.UniswapV2Trade.computeTradesExactOut({
                pairs: [pair_0_1, pair_0_2, pair_1_2],
                currencyIn: token0,
                currencyAmountOut: new src_1.TokenAmount(token2, jsbi_1.default.BigInt(10)),
                maxHops: { maxNumResults: 1 },
                maximumSlippage,
            });
            expect((_a = result[0]) === null || _a === void 0 ? void 0 : _a.route.pairs).toHaveLength(1);
        });
        it('no path', () => {
            const result = src_1.UniswapV2Trade.computeTradesExactOut({
                pairs: [pair_0_1, pair_0_3, pair_1_3],
                currencyIn: token0,
                currencyAmountOut: new src_1.TokenAmount(token2, jsbi_1.default.BigInt(10)),
                maximumSlippage,
            });
            expect(result).toHaveLength(0);
        });
    });
});
//# sourceMappingURL=dynamic-fees.test.js.map