"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const tiny_invariant_1 = tslib_1.__importDefault(require("tiny-invariant"));
const src_1 = require("../src");
const ADDRESSES = [
    '0x0000000000000000000000000000000000000001',
    '0x0000000000000000000000000000000000000002',
    '0x0000000000000000000000000000000000000003',
];
const CHAIN_ID = src_1.ChainId.RINKEBY;
const WETH = src_1.Token.WETH[src_1.ChainId.RINKEBY];
const DECIMAL_PERMUTATIONS = [
    [0, 0, 0],
    [0, 9, 18],
    [18, 18, 18],
];
function decimalize(amount, decimals) {
    return BigInt(amount) * BigInt(10) ** BigInt(decimals);
}
describe('entities', () => {
    const maximumSlippage = new src_1.Percent('3', '100');
    DECIMAL_PERMUTATIONS.forEach((decimals) => {
        describe(`decimals permutation: ${decimals}`, () => {
            let tokens;
            it('Token', () => {
                tokens = ADDRESSES.map((address, i) => new src_1.Token(CHAIN_ID, address, decimals[i]));
                tokens.forEach((token, i) => {
                    expect(token.chainId).toEqual(CHAIN_ID);
                    expect(token.address).toEqual(ADDRESSES[i]);
                    expect(token.decimals).toEqual(decimals[i]);
                });
            });
            let pairs;
            it('Pair', () => {
                pairs = [
                    new src_1.Pair(new src_1.TokenAmount(tokens[0], decimalize(1, tokens[0].decimals)), new src_1.TokenAmount(tokens[1], decimalize(1, tokens[1].decimals))),
                    new src_1.Pair(new src_1.TokenAmount(tokens[1], decimalize(1, tokens[1].decimals)), new src_1.TokenAmount(tokens[2], decimalize(1, tokens[2].decimals))),
                    new src_1.Pair(new src_1.TokenAmount(tokens[2], decimalize(1, tokens[2].decimals)), new src_1.TokenAmount(WETH, decimalize(1234, WETH.decimals))),
                ];
            });
            let route;
            it('Route', () => {
                route = new src_1.Route(pairs, tokens[0]);
                expect(route.pairs).toEqual(pairs);
                expect(route.path).toEqual(tokens.concat([WETH]));
                expect(route.input).toEqual(tokens[0]);
                expect(route.output).toEqual(WETH);
            });
            it('Price:Route.midPrice', () => {
                (0, tiny_invariant_1.default)(route.input instanceof src_1.Token);
                (0, tiny_invariant_1.default)(route.output instanceof src_1.Token);
                expect(route.midPrice.quote(new src_1.TokenAmount(route.input, decimalize(1, route.input.decimals)))).toEqual(new src_1.TokenAmount(route.output, decimalize(1234, route.output.decimals)));
                expect(route.midPrice.invert().quote(new src_1.TokenAmount(route.output, decimalize(1234, route.output.decimals)))).toEqual(new src_1.TokenAmount(route.input, decimalize(1, route.input.decimals)));
                expect(route.midPrice.toSignificant(1)).toEqual('1000');
                expect(route.midPrice.toSignificant(2)).toEqual('1200');
                expect(route.midPrice.toSignificant(3)).toEqual('1230');
                expect(route.midPrice.toSignificant(4)).toEqual('1234');
                expect(route.midPrice.toSignificant(5)).toEqual('1234');
                expect(route.midPrice.toSignificant(5, { groupSeparator: ',' })).toEqual('1,234');
                expect(route.midPrice.invert().toSignificant(1)).toEqual('0.0008');
                expect(route.midPrice.invert().toSignificant(2)).toEqual('0.00081');
                expect(route.midPrice.invert().toSignificant(3)).toEqual('0.00081');
                expect(route.midPrice.invert().toSignificant(4)).toEqual('0.0008104');
                expect(route.midPrice.invert().toSignificant(4, undefined, src_1.Rounding.ROUND_DOWN)).toEqual('0.0008103');
                expect(route.midPrice.invert().toSignificant(5)).toEqual('0.00081037');
                expect(route.midPrice.toFixed(0)).toEqual('1234');
                expect(route.midPrice.toFixed(1)).toEqual('1234.0');
                expect(route.midPrice.toFixed(2)).toEqual('1234.00');
                expect(route.midPrice.toFixed(2, { groupSeparator: ',' })).toEqual('1,234.00');
                expect(route.midPrice.invert().toFixed(0)).toEqual('0');
                expect(route.midPrice.invert().toFixed(1)).toEqual('0.0');
                expect(route.midPrice.invert().toFixed(2)).toEqual('0.00');
                expect(route.midPrice.invert().toFixed(3)).toEqual('0.001');
                expect(route.midPrice.invert().toFixed(4)).toEqual('0.0008');
                expect(route.midPrice.invert().toFixed(5)).toEqual('0.00081');
                expect(route.midPrice.invert().toFixed(6)).toEqual('0.000810');
                expect(route.midPrice.invert().toFixed(7)).toEqual('0.0008104');
                expect(route.midPrice.invert().toFixed(7, undefined, src_1.Rounding.ROUND_DOWN)).toEqual('0.0008103');
                expect(route.midPrice.invert().toFixed(8)).toEqual('0.00081037');
            });
            describe.skip('Trade', () => {
                let route;
                it('TradeType.EXACT_INPUT', () => {
                    route = new src_1.Route([
                        new src_1.Pair(new src_1.TokenAmount(tokens[1], decimalize(5, tokens[1].decimals)), new src_1.TokenAmount(WETH, decimalize(10, WETH.decimals))),
                    ], tokens[1]);
                    const inputAmount = new src_1.TokenAmount(tokens[1], decimalize(1, tokens[1].decimals));
                    const expectedOutputAmount = new src_1.TokenAmount(WETH, '1662497915624478906');
                    const trade = new src_1.UniswapV2Trade(route, inputAmount, maximumSlippage, src_1.TradeType.EXACT_INPUT);
                    expect(trade.route).toEqual(route);
                    expect(trade.tradeType).toEqual(src_1.TradeType.EXACT_INPUT);
                    expect(trade.inputAmount).toEqual(inputAmount);
                    expect(trade.outputAmount.toFixed(2)).toEqual(expectedOutputAmount.toFixed(2));
                    expect(trade.executionPrice.toSignificant(18)).toEqual('1.66319299708211755');
                    expect(trade.executionPrice.invert().toSignificant(18)).toEqual('0.601253132832080201');
                    expect(trade.executionPrice.quote(inputAmount)).toEqual(expectedOutputAmount);
                    expect(trade.executionPrice.invert().quote(expectedOutputAmount)).toEqual(inputAmount);
                    // expect(trade.nextMidPrice.toSignificant(18)).toEqual('1.38958368072925352')
                    // expect(trade.nextMidPrice.invert().toSignificant(18)).toEqual('0.71964')
                    expect(trade.priceImpact.toSignificant(18)).toEqual('16.8334167083541771');
                });
                it('TradeType.EXACT_OUTPUT', () => {
                    const outputAmount = new src_1.TokenAmount(WETH, '1662497915624478906');
                    const expectedInputAmount = new src_1.TokenAmount(tokens[1], '0.999498746867167920');
                    const trade = new src_1.UniswapV2Trade(route, outputAmount, maximumSlippage, src_1.TradeType.EXACT_OUTPUT);
                    expect(trade.route).toEqual(route);
                    expect(trade.tradeType).toEqual(src_1.TradeType.EXACT_OUTPUT);
                    expect(trade.outputAmount).toEqual(outputAmount);
                    expect(trade.inputAmount.toFixed()).toEqual(expectedInputAmount.toFixed());
                    expect(trade.executionPrice.toSignificant(18)).toEqual('1.66333166583291646');
                    expect(trade.executionPrice.invert().toSignificant(18)).toEqual('0.601203007518796993');
                    expect(trade.executionPrice.quote(expectedInputAmount)).toEqual(outputAmount);
                    expect(trade.executionPrice.invert().quote(outputAmount)).toEqual(expectedInputAmount);
                    // expect(trade.nextMidPrice.toSignificant(18)).toEqual('1.38958368072925352')
                    // expect(trade.nextMidPrice.invert().toSignificant(18)).toEqual('0.71964')
                    expect(trade.priceImpact.toSignificant(18)).toEqual('16.8334167083541771');
                });
                it.skip('minimum TradeType.EXACT_INPUT', () => {
                    if ([9, 18].includes(tokens[1].decimals)) {
                        const route = new src_1.Route([
                            new src_1.Pair(new src_1.TokenAmount(tokens[1], decimalize(1, tokens[1].decimals)), new src_1.TokenAmount(WETH, decimalize(10, WETH.decimals) +
                                (tokens[1].decimals === 9 ? BigInt('30090280812437312') : BigInt('30090270812437322')))),
                        ], tokens[1]);
                        const outputAmount = new src_1.TokenAmount(tokens[1], '1');
                        const trade = new src_1.UniswapV2Trade(route, outputAmount, maximumSlippage, src_1.TradeType.EXACT_INPUT);
                        expect(trade.priceImpact.toSignificant(18)).toEqual(tokens[1].decimals === 9 ? '0.300000099400899902' : '0.3000000000000001');
                    }
                });
            });
            it('TokenAmount', () => {
                const amount = new src_1.TokenAmount(WETH, '1234567000000000000000');
                expect(amount.toExact()).toEqual('1234.567');
                expect(amount.toExact({ groupSeparator: ',' })).toEqual('1,234.567');
            });
        });
    });
});
//# sourceMappingURL=entities.test.js.map