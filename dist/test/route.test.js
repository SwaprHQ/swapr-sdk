"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const src_1 = require("../src");
describe('Route', () => {
    const token0 = new src_1.Token(src_1.ChainId.MAINNET, '0x0000000000000000000000000000000000000001', 18, 't0');
    const token1 = new src_1.Token(src_1.ChainId.MAINNET, '0x0000000000000000000000000000000000000002', 18, 't1');
    const weth = src_1.Token.WETH[src_1.ChainId.MAINNET];
    const pair_0_1 = new src_1.Pair(new src_1.TokenAmount(token0, '100'), new src_1.TokenAmount(token1, '200'));
    const pair_0_weth = new src_1.Pair(new src_1.TokenAmount(token0, '100'), new src_1.TokenAmount(weth, '100'));
    const pair_1_weth = new src_1.Pair(new src_1.TokenAmount(token1, '175'), new src_1.TokenAmount(weth, '100'));
    it('constructs a path from the tokens', () => {
        const route = new src_1.Route([pair_0_1], token0);
        expect(route.pairs).toEqual([pair_0_1]);
        expect(route.path).toEqual([token0, token1]);
        expect(route.input).toEqual(token0);
        expect(route.output).toEqual(token1);
        expect(route.chainId).toEqual(src_1.ChainId.MAINNET);
    });
    it('can have a token as both input and output', () => {
        const route = new src_1.Route([pair_0_weth, pair_0_1, pair_1_weth], weth);
        expect(route.pairs).toEqual([pair_0_weth, pair_0_1, pair_1_weth]);
        expect(route.input).toEqual(weth);
        expect(route.output).toEqual(weth);
    });
    it('supports ether input', () => {
        const route = new src_1.Route([pair_0_weth], src_1.ETHER);
        expect(route.pairs).toEqual([pair_0_weth]);
        expect(route.input).toEqual(src_1.ETHER);
        expect(route.output).toEqual(token0);
    });
    it('supports ether output', () => {
        const route = new src_1.Route([pair_0_weth], token0, src_1.ETHER);
        expect(route.pairs).toEqual([pair_0_weth]);
        expect(route.input).toEqual(token0);
        expect(route.output).toEqual(src_1.ETHER);
    });
});
//# sourceMappingURL=route.test.js.map