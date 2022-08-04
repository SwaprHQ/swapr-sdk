"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const jsbi_1 = tslib_1.__importDefault(require("jsbi"));
const src_1 = require("../src");
describe('UniswapV2Trade', () => {
    const maximumSlippage = new src_1.Percent('3', '100');
    const token0 = new src_1.Token(src_1.ChainId.MAINNET, '0x0000000000000000000000000000000000000001', 18, 't0');
    const token1 = new src_1.Token(src_1.ChainId.MAINNET, '0x0000000000000000000000000000000000000002', 18, 't1');
    const token2 = new src_1.Token(src_1.ChainId.MAINNET, '0x0000000000000000000000000000000000000003', 18, 't2');
    const token3 = new src_1.Token(src_1.ChainId.MAINNET, '0x0000000000000000000000000000000000000004', 18, 't3');
    const pair_0_1 = new src_1.Pair(new src_1.TokenAmount(token0, jsbi_1.default.BigInt(1000)), new src_1.TokenAmount(token1, jsbi_1.default.BigInt(1000)));
    const pair_0_2 = new src_1.Pair(new src_1.TokenAmount(token0, jsbi_1.default.BigInt(1000)), new src_1.TokenAmount(token2, jsbi_1.default.BigInt(1100)));
    const pair_0_3 = new src_1.Pair(new src_1.TokenAmount(token0, jsbi_1.default.BigInt(1000)), new src_1.TokenAmount(token3, jsbi_1.default.BigInt(900)));
    const pair_1_2 = new src_1.Pair(new src_1.TokenAmount(token1, jsbi_1.default.BigInt(1200)), new src_1.TokenAmount(token2, jsbi_1.default.BigInt(1000)));
    const pair_1_3 = new src_1.Pair(new src_1.TokenAmount(token1, jsbi_1.default.BigInt(1200)), new src_1.TokenAmount(token3, jsbi_1.default.BigInt(1300)));
    const pair_weth_0 = new src_1.Pair(new src_1.TokenAmount(src_1.Token.WETH[src_1.ChainId.MAINNET], jsbi_1.default.BigInt(1000)), new src_1.TokenAmount(token0, jsbi_1.default.BigInt(1000)));
    const empty_pair_0_1 = new src_1.Pair(new src_1.TokenAmount(token0, jsbi_1.default.BigInt(0)), new src_1.TokenAmount(token1, jsbi_1.default.BigInt(0)));
    it('can be constructed with ETHER as input', () => {
        const trade = new src_1.UniswapV2Trade(new src_1.Route([pair_weth_0], src_1.ETHER), src_1.CurrencyAmount.nativeCurrency(jsbi_1.default.BigInt(100), src_1.ChainId.MAINNET), maximumSlippage, src_1.TradeType.EXACT_INPUT);
        expect(trade.inputAmount.currency).toEqual(src_1.ETHER);
        expect(trade.outputAmount.currency).toEqual(token0);
    });
    it('can be constructed with ETHER as input for exact output', () => {
        const trade = new src_1.UniswapV2Trade(new src_1.Route([pair_weth_0], src_1.ETHER, token0), new src_1.TokenAmount(token0, jsbi_1.default.BigInt(100)), maximumSlippage, src_1.TradeType.EXACT_OUTPUT);
        expect(trade.inputAmount.currency).toEqual(src_1.ETHER);
        expect(trade.outputAmount.currency).toEqual(token0);
    });
    it('can be constructed with ETHER as output', () => {
        const trade = new src_1.UniswapV2Trade(new src_1.Route([pair_weth_0], token0, src_1.ETHER), src_1.CurrencyAmount.nativeCurrency(jsbi_1.default.BigInt(100), src_1.ChainId.MAINNET), maximumSlippage, src_1.TradeType.EXACT_OUTPUT);
        expect(trade.inputAmount.currency).toEqual(token0);
        expect(trade.outputAmount.currency).toEqual(src_1.ETHER);
    });
    it('can be constructed with ETHER as output for exact input', () => {
        const trade = new src_1.UniswapV2Trade(new src_1.Route([pair_weth_0], token0, src_1.ETHER), new src_1.TokenAmount(token0, jsbi_1.default.BigInt(100)), maximumSlippage, src_1.TradeType.EXACT_INPUT);
        expect(trade.inputAmount.currency).toEqual(token0);
        expect(trade.outputAmount.currency).toEqual(src_1.ETHER);
    });
    it('has platform value set default to Swapr', () => {
        const trade = new src_1.UniswapV2Trade(new src_1.Route([pair_weth_0], src_1.ETHER), src_1.CurrencyAmount.nativeCurrency(jsbi_1.default.BigInt(100), src_1.ChainId.MAINNET), maximumSlippage, src_1.TradeType.EXACT_INPUT);
        expect(trade.platform).toEqual(src_1.UniswapV2RoutablePlatform.SWAPR);
    });
    describe('#bestTradeExactIn', () => {
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
            var _a, _b, _c, _d, _e, _f, _g;
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
            expect((_e = result[1]) === null || _e === void 0 ? void 0 : _e.route.path).toEqual([token0, token1, token2]);
            expect((_f = result[1]) === null || _f === void 0 ? void 0 : _f.inputAmount).toEqual(new src_1.TokenAmount(token0, jsbi_1.default.BigInt(100)));
            expect((_g = result[1]) === null || _g === void 0 ? void 0 : _g.outputAmount).toEqual(new src_1.TokenAmount(token2, jsbi_1.default.BigInt(69)));
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
        it('works for ETHER currency input', () => {
            var _a, _b, _c;
            const result = src_1.UniswapV2Trade.computeTradesExactIn({
                pairs: [pair_weth_0, pair_0_1, pair_0_3, pair_1_3],
                currencyAmountIn: src_1.CurrencyAmount.nativeCurrency(jsbi_1.default.BigInt(100), src_1.ChainId.MAINNET),
                currencyOut: token3,
                maximumSlippage,
            });
            expect((_a = result[0]) === null || _a === void 0 ? void 0 : _a.inputAmount.currency).toEqual(src_1.ETHER);
            expect((_b = result[0]) === null || _b === void 0 ? void 0 : _b.route.path).toEqual([src_1.Token.WETH[src_1.ChainId.MAINNET], token0, token1, token3]);
            expect((_c = result[0]) === null || _c === void 0 ? void 0 : _c.outputAmount.currency).toEqual(token3);
        });
        it('works for ETHER currency output', () => {
            var _a, _b, _c, _d;
            const result = src_1.UniswapV2Trade.computeTradesExactIn({
                pairs: [pair_weth_0, pair_0_1, pair_0_3, pair_1_3],
                currencyAmountIn: new src_1.TokenAmount(token3, jsbi_1.default.BigInt(100)),
                currencyOut: src_1.ETHER,
                maximumSlippage,
            });
            expect((_a = result[0]) === null || _a === void 0 ? void 0 : _a.inputAmount.currency).toEqual(token3);
            expect((_b = result[0]) === null || _b === void 0 ? void 0 : _b.route.path).toEqual([token3, token0, src_1.Token.WETH[src_1.ChainId.MAINNET]]);
            expect((_c = result[0]) === null || _c === void 0 ? void 0 : _c.inputAmount.currency).toEqual(token3);
            expect((_d = result[0]) === null || _d === void 0 ? void 0 : _d.outputAmount.currency).toEqual(src_1.ETHER);
        });
    });
    /*
    No longer valid, clean up
    describe.skip('#maximumAmountIn', () => {
      describe('tradeType = EXACT_INPUT', () => {
        const exactIn = new UniswapV2Trade(
          new Route([pair_0_1, pair_1_2], token0),
          new TokenAmount(token0, JSBI.BigInt(100)),
          maximumSlippage,
          TradeType.EXACT_INPUT
        )
        it('throws if less than 0', () => {
          expect(() => exactIn.maximumAmountIn(new Percent(JSBI.BigInt(-1), JSBI.BigInt(100)))).toThrow(
            'SLIPPAGE_TOLERANCE'
          )
        })
        it('returns exact if 0', () => {
          expect(exactIn.maximumAmountIn(new Percent(JSBI.BigInt(0), JSBI.BigInt(100)))).toEqual(exactIn.inputAmount)
        })
        it('returns exact if nonzero', () => {
          expect(exactIn.maximumAmountIn(new Percent(JSBI.BigInt(0), JSBI.BigInt(100)))).toEqual(
            new TokenAmount(token0, JSBI.BigInt(100))
          )
          expect(exactIn.maximumAmountIn(new Percent(JSBI.BigInt(5), JSBI.BigInt(100)))).toEqual(
            new TokenAmount(token0, JSBI.BigInt(100))
          )
          expect(exactIn.maximumAmountIn(new Percent(JSBI.BigInt(200), JSBI.BigInt(100)))).toEqual(
            new TokenAmount(token0, JSBI.BigInt(100))
          )
        })
      })
      describe('tradeType = EXACT_OUTPUT', () => {
        const exactOut = new UniswapV2Trade(
          new Route([pair_0_1, pair_1_2], token0),
          new TokenAmount(token2, JSBI.BigInt(100)),
          maximumSlippage,
          TradeType.EXACT_OUTPUT
        )
  
        it('throws if less than 0', () => {
          expect(() => exactOut.maximumAmountIn(new Percent(JSBI.BigInt(-1), JSBI.BigInt(100)))).toThrow(
            'SLIPPAGE_TOLERANCE'
          )
        })
        it('returns exact if 0', () => {
          expect(exactOut.maximumAmountIn(new Percent(JSBI.BigInt(0), JSBI.BigInt(100)))).toEqual(exactOut.inputAmount)
        })
        it('returns slippage amount if nonzero', () => {
          expect(exactOut.maximumAmountIn(new Percent(JSBI.BigInt(0), JSBI.BigInt(100)))).toEqual(
            new TokenAmount(token0, JSBI.BigInt(156))
          )
          expect(exactOut.maximumAmountIn(new Percent(JSBI.BigInt(5), JSBI.BigInt(100)))).toEqual(
            new TokenAmount(token0, JSBI.BigInt(163))
          )
          expect(exactOut.maximumAmountIn(new Percent(JSBI.BigInt(200), JSBI.BigInt(100)))).toEqual(
            new TokenAmount(token0, JSBI.BigInt(468))
          )
        })
      })
    })
  
    describe('#minimumAmountOut', () => {
      describe('tradeType = EXACT_INPUT', () => {
        const exactIn = new UniswapV2Trade(
          new Route([pair_0_1, pair_1_2], token0),
          new TokenAmount(token0, JSBI.BigInt(100)),
          maximumSlippage,
          TradeType.EXACT_INPUT
        )
        it('throws if less than 0', () => {
          expect(() => exactIn.minimumAmountOut(new Percent(JSBI.BigInt(-1), JSBI.BigInt(100)))).toThrow(
            'SLIPPAGE_TOLERANCE'
          )
        })
        it('returns exact if 0', () => {
          expect(exactIn.minimumAmountOut(new Percent(JSBI.BigInt(0), JSBI.BigInt(100)))).toEqual(exactIn.outputAmount)
        })
        it('returns exact if nonzero', () => {
          expect(exactIn.minimumAmountOut(new Percent(JSBI.BigInt(0), JSBI.BigInt(100)))).toEqual(
            new TokenAmount(token2, JSBI.BigInt(69))
          )
          expect(exactIn.minimumAmountOut(new Percent(JSBI.BigInt(5), JSBI.BigInt(100)))).toEqual(
            new TokenAmount(token2, JSBI.BigInt(65))
          )
          expect(exactIn.minimumAmountOut(new Percent(JSBI.BigInt(200), JSBI.BigInt(100)))).toEqual(
            new TokenAmount(token2, JSBI.BigInt(23))
          )
        })
      })
      describe('tradeType = EXACT_OUTPUT', () => {
        const exactOut = new UniswapV2Trade(
          new Route([pair_0_1, pair_1_2], token0),
          new TokenAmount(token2, JSBI.BigInt(100)),
          maximumSlippage,
          TradeType.EXACT_OUTPUT
        )
  
        it('throws if less than 0', () => {
          expect(() => exactOut.minimumAmountOut(new Percent(JSBI.BigInt(-1), JSBI.BigInt(100)))).toThrow(
            'SLIPPAGE_TOLERANCE'
          )
        })
        it('returns exact if 0', () => {
          expect(exactOut.minimumAmountOut(new Percent(JSBI.BigInt(0), JSBI.BigInt(100)))).toEqual(exactOut.outputAmount)
        })
        it('returns slippage amount if nonzero', () => {
          expect(exactOut.minimumAmountOut(new Percent(JSBI.BigInt(0), JSBI.BigInt(100)))).toEqual(
            new TokenAmount(token2, JSBI.BigInt(100))
          )
          expect(exactOut.minimumAmountOut(new Percent(JSBI.BigInt(5), JSBI.BigInt(100)))).toEqual(
            new TokenAmount(token2, JSBI.BigInt(100))
          )
          expect(exactOut.minimumAmountOut(new Percent(JSBI.BigInt(200), JSBI.BigInt(100)))).toEqual(
            new TokenAmount(token2, JSBI.BigInt(100))
          )
        })
      })
    })
    */
    describe('#bestTradeExactOut', () => {
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
            var _a, _b, _c, _d, _e, _f;
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
            expect((_e = result[1]) === null || _e === void 0 ? void 0 : _e.inputAmount).toEqual(new src_1.TokenAmount(token0, jsbi_1.default.BigInt(156)));
            expect((_f = result[1]) === null || _f === void 0 ? void 0 : _f.outputAmount).toEqual(new src_1.TokenAmount(token2, jsbi_1.default.BigInt(100)));
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
        it('works for ETHER currency input', () => {
            var _a, _b, _c, _d, _e, _f;
            const result = src_1.UniswapV2Trade.computeTradesExactOut({
                pairs: [pair_weth_0, pair_0_1, pair_0_3, pair_1_3],
                currencyIn: src_1.ETHER,
                currencyAmountOut: new src_1.TokenAmount(token3, jsbi_1.default.BigInt(100)),
                maximumSlippage,
            });
            expect((_a = result[0]) === null || _a === void 0 ? void 0 : _a.inputAmount.currency).toEqual(src_1.ETHER);
            expect((_b = result[0]) === null || _b === void 0 ? void 0 : _b.route.path).toEqual([src_1.Token.WETH[src_1.ChainId.MAINNET], token0, token1, token3]);
            expect((_c = result[0]) === null || _c === void 0 ? void 0 : _c.outputAmount.currency).toEqual(token3);
            // least efficient path
            expect((_d = result[1]) === null || _d === void 0 ? void 0 : _d.inputAmount.currency).toEqual(src_1.ETHER);
            expect((_e = result[1]) === null || _e === void 0 ? void 0 : _e.route.path).toEqual([src_1.Token.WETH[src_1.ChainId.MAINNET], token0, token3]);
            expect((_f = result[1]) === null || _f === void 0 ? void 0 : _f.outputAmount.currency).toEqual(token3);
        });
        it('works for ETHER currency output', () => {
            var _a, _b, _c, _d, _e, _f;
            const result = src_1.UniswapV2Trade.computeTradesExactOut({
                pairs: [pair_weth_0, pair_0_1, pair_0_3, pair_1_3],
                currencyIn: token3,
                currencyAmountOut: src_1.CurrencyAmount.nativeCurrency(jsbi_1.default.BigInt(100), src_1.ChainId.MAINNET),
                maximumSlippage,
            });
            expect((_a = result[0]) === null || _a === void 0 ? void 0 : _a.inputAmount.currency).toEqual(token3);
            expect((_b = result[0]) === null || _b === void 0 ? void 0 : _b.route.path).toEqual([token3, token0, src_1.Token.WETH[src_1.ChainId.MAINNET]]);
            expect((_c = result[0]) === null || _c === void 0 ? void 0 : _c.outputAmount.currency).toEqual(src_1.ETHER);
            // least efficient path
            expect((_d = result[1]) === null || _d === void 0 ? void 0 : _d.inputAmount.currency).toEqual(token3);
            expect((_e = result[1]) === null || _e === void 0 ? void 0 : _e.outputAmount.currency).toEqual(src_1.ETHER);
            expect((_f = result[1]) === null || _f === void 0 ? void 0 : _f.route.path).toEqual([token3, token1, token0, src_1.Token.WETH[src_1.ChainId.MAINNET]]);
        });
    });
});
//# sourceMappingURL=uniswap-v2-trade.test.js.map