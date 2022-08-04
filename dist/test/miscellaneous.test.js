"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const src_1 = require("../src");
const utils_1 = require("../src/utils");
describe('miscellaneous', () => {
    it('getLiquidityMinted:0', () => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
        const tokenA = new src_1.Token(src_1.ChainId.RINKEBY, '0x0000000000000000000000000000000000000001', 18);
        const tokenB = new src_1.Token(src_1.ChainId.RINKEBY, '0x0000000000000000000000000000000000000002', 18);
        const pair = new src_1.Pair(new src_1.TokenAmount(tokenA, '0'), new src_1.TokenAmount(tokenB, '0'));
        expect(() => {
            pair.getLiquidityMinted(new src_1.TokenAmount(pair.liquidityToken, '0'), new src_1.TokenAmount(tokenA, '1000'), new src_1.TokenAmount(tokenB, '1000'));
        }).toThrow(src_1.InsufficientInputAmountError);
        expect(() => {
            pair.getLiquidityMinted(new src_1.TokenAmount(pair.liquidityToken, '0'), new src_1.TokenAmount(tokenA, '1000000'), new src_1.TokenAmount(tokenB, '1'));
        }).toThrow(src_1.InsufficientInputAmountError);
        const liquidity = pair.getLiquidityMinted(new src_1.TokenAmount(pair.liquidityToken, '0'), new src_1.TokenAmount(tokenA, '1001'), new src_1.TokenAmount(tokenB, '1001'));
        expect(liquidity.raw.toString()).toEqual('1');
    }));
    it('getLiquidityMinted:!0', () => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
        const tokenA = new src_1.Token(src_1.ChainId.RINKEBY, '0x0000000000000000000000000000000000000001', 18);
        const tokenB = new src_1.Token(src_1.ChainId.RINKEBY, '0x0000000000000000000000000000000000000002', 18);
        const pair = new src_1.Pair(new src_1.TokenAmount(tokenA, '10000'), new src_1.TokenAmount(tokenB, '10000'));
        expect(pair
            .getLiquidityMinted(new src_1.TokenAmount(pair.liquidityToken, '10000'), new src_1.TokenAmount(tokenA, '2000'), new src_1.TokenAmount(tokenB, '2000'))
            .raw.toString()).toEqual('2000');
    }));
    it('getLiquidityValue:!feeOn', () => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
        const tokenA = new src_1.Token(src_1.ChainId.RINKEBY, '0x0000000000000000000000000000000000000001', 18);
        const tokenB = new src_1.Token(src_1.ChainId.RINKEBY, '0x0000000000000000000000000000000000000002', 18);
        const pair = new src_1.Pair(new src_1.TokenAmount(tokenA, '1000'), new src_1.TokenAmount(tokenB, '1000'));
        {
            const liquidityValue = pair.getLiquidityValue(tokenA, new src_1.TokenAmount(pair.liquidityToken, '1000'), new src_1.TokenAmount(pair.liquidityToken, '1000'), false);
            expect(liquidityValue.token.equals(tokenA)).toBe(true);
            expect(liquidityValue.raw.toString()).toBe('1000');
        }
        // 500
        {
            const liquidityValue = pair.getLiquidityValue(tokenA, new src_1.TokenAmount(pair.liquidityToken, '1000'), new src_1.TokenAmount(pair.liquidityToken, '500'), false);
            expect(liquidityValue.token.equals(tokenA)).toBe(true);
            expect(liquidityValue.raw.toString()).toBe('500');
        }
        // tokenB
        {
            const liquidityValue = pair.getLiquidityValue(tokenB, new src_1.TokenAmount(pair.liquidityToken, '1000'), new src_1.TokenAmount(pair.liquidityToken, '1000'), false);
            expect(liquidityValue.token.equals(tokenB)).toBe(true);
            expect(liquidityValue.raw.toString()).toBe('1000');
        }
    }));
    it('getLiquidityValue:feeOn', () => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
        const tokenA = new src_1.Token(src_1.ChainId.RINKEBY, '0x0000000000000000000000000000000000000001', 18);
        const tokenB = new src_1.Token(src_1.ChainId.RINKEBY, '0x0000000000000000000000000000000000000002', 18);
        const pair = new src_1.Pair(new src_1.TokenAmount(tokenA, '1000'), new src_1.TokenAmount(tokenB, '1000'));
        const liquidityValue = pair.getLiquidityValue(tokenA, new src_1.TokenAmount(pair.liquidityToken, '500'), new src_1.TokenAmount(pair.liquidityToken, '500'), true, '250000' // 500 ** 2
        );
        expect(liquidityValue.token.equals(tokenA)).toBe(true);
        expect(liquidityValue.raw.toString()).toBe('917'); // ceiling(1000 - (500 * (1 / 6)))
    }));
    describe('#sortedInsert', () => {
        const comp = (a, b) => a - b;
        it('throws if maxSize is 0', () => {
            expect(() => (0, utils_1.sortedInsert)([], 1, 0, comp)).toThrow('MAX_SIZE_ZERO');
        });
        it('throws if items.length > maxSize', () => {
            expect(() => (0, utils_1.sortedInsert)([1, 2], 1, 1, comp)).toThrow('ITEMS_SIZE');
        });
        it('adds if empty', () => {
            const arr = [];
            expect((0, utils_1.sortedInsert)(arr, 3, 2, comp)).toEqual(null);
            expect(arr).toEqual([3]);
        });
        it('adds if not full', () => {
            const arr = [1, 5];
            expect((0, utils_1.sortedInsert)(arr, 3, 3, comp)).toEqual(null);
            expect(arr).toEqual([1, 3, 5]);
        });
        it('adds if will not be full after', () => {
            const arr = [1];
            expect((0, utils_1.sortedInsert)(arr, 0, 3, comp)).toEqual(null);
            expect(arr).toEqual([0, 1]);
        });
        it('returns add if sorts after last', () => {
            const arr = [1, 2, 3];
            expect((0, utils_1.sortedInsert)(arr, 4, 3, comp)).toEqual(4);
            expect(arr).toEqual([1, 2, 3]);
        });
        it('removes from end if full', () => {
            const arr = [1, 3, 4];
            expect((0, utils_1.sortedInsert)(arr, 2, 3, comp)).toEqual(4);
            expect(arr).toEqual([1, 2, 3]);
        });
        it('uses comparator', () => {
            const arr = [4, 2, 1];
            expect((0, utils_1.sortedInsert)(arr, 3, 3, (a, b) => comp(a, b) * -1)).toEqual(1);
            expect(arr).toEqual([4, 3, 2]);
        });
        describe('maxSize of 1', () => {
            it('empty add', () => {
                const arr = [];
                expect((0, utils_1.sortedInsert)(arr, 3, 1, comp)).toEqual(null);
                expect(arr).toEqual([3]);
            });
            it('full add greater', () => {
                const arr = [2];
                expect((0, utils_1.sortedInsert)(arr, 3, 1, comp)).toEqual(3);
                expect(arr).toEqual([2]);
            });
            it('full add lesser', () => {
                const arr = [4];
                expect((0, utils_1.sortedInsert)(arr, 3, 1, comp)).toEqual(4);
                expect(arr).toEqual([3]);
            });
        });
    });
});
//# sourceMappingURL=miscellaneous.test.js.map