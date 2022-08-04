"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const units_1 = require("@ethersproject/units");
const src_1 = require("../src");
describe('GnosisProtocolTrade', () => {
    const maximumSlippage = new src_1.Percent('3', '100');
    const tokenUSDC = new src_1.Token(src_1.ChainId.XDAI, '0xDDAfbb505ad214D7b80b1f830fcCc89B60fb7A83', 6, 'USDC', 'USDC');
    const tokenWETH = new src_1.Token(src_1.ChainId.XDAI, '0x6A023CCd1ff6F2045C3309768eAd9E68F978f6e1', 18, 'WETH', 'WETH');
    describe('Gnosis Chain', () => {
        describe('bestExactTradeIn', () => {
            const currencyAmountIn = new src_1.TokenAmount(tokenWETH, (0, units_1.parseUnits)('1', tokenWETH.decimals).toBigInt());
            const tradePromise = src_1.GnosisProtocolTrade.bestTradeExactIn({
                currencyAmountIn,
                currencyOut: tokenUSDC,
                maximumSlippage,
            });
            test('returns a trade', () => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
                const trade = yield tradePromise;
                expect(trade).toBeDefined();
            }));
            test('returns the right platform', () => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
                const trade = yield tradePromise;
                expect(trade === null || trade === void 0 ? void 0 : trade.platform.name).toEqual(src_1.RoutablePlatform.GNOSIS_PROTOCOL.name);
            }));
            test('deducts fees from sell token', () => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
                var _a, _b;
                const trade = yield tradePromise;
                expect((_b = (_a = trade === null || trade === void 0 ? void 0 : trade.feeAmount.currency) === null || _a === void 0 ? void 0 : _a.address) === null || _b === void 0 ? void 0 : _b.toLowerCase()).toEqual(tokenWETH.address.toLowerCase());
                expect(trade === null || trade === void 0 ? void 0 : trade.order.sellToken.toLowerCase()).toEqual(tokenWETH.address.toLowerCase());
                console.log(trade === null || trade === void 0 ? void 0 : trade.feeAmount.toSignificant(2));
                console.log(trade === null || trade === void 0 ? void 0 : trade.fee.toSignificant(2));
            }));
        });
        describe('bestTradeExactOut', () => {
            const currencyAmountOut = new src_1.TokenAmount(tokenUSDC, (0, units_1.parseUnits)('100', tokenUSDC.decimals).toBigInt());
            const tradePromise = src_1.GnosisProtocolTrade.bestTradeExactOut({
                currencyAmountOut,
                maximumSlippage,
                currencyIn: tokenWETH,
            });
            test('returns the a trade', () => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
                const trade = yield tradePromise;
                expect(trade).toBeDefined();
            }));
            test('returns the right platform', () => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
                const trade = yield tradePromise;
                expect(trade === null || trade === void 0 ? void 0 : trade.platform.name).toEqual(src_1.RoutablePlatform.GNOSIS_PROTOCOL.name);
            }));
            test('deducts fees from sell token', () => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
                var _a, _b;
                const trade = yield tradePromise;
                expect((_b = (_a = trade === null || trade === void 0 ? void 0 : trade.feeAmount.currency) === null || _a === void 0 ? void 0 : _a.address) === null || _b === void 0 ? void 0 : _b.toLowerCase()).toEqual(tokenWETH.address.toLowerCase());
                expect(trade === null || trade === void 0 ? void 0 : trade.order.sellToken.toLowerCase()).toEqual(tokenWETH.address.toLowerCase());
                console.log(trade === null || trade === void 0 ? void 0 : trade.feeAmount.toSignificant(2));
                console.log(trade === null || trade === void 0 ? void 0 : trade.fee.toSignificant(2));
            }));
            test('quote output matches exact output', () => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
                const trade = yield tradePromise;
                expect(trade === null || trade === void 0 ? void 0 : trade.order.buyAmount.toString()).toBe((0, units_1.parseUnits)('100', tokenUSDC.decimals).toString());
            }));
        });
    });
});
//# sourceMappingURL=gnosis-protocol-trade.test.js.map