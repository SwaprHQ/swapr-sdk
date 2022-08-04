"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const constants_1 = require("@ethersproject/constants");
const src_1 = require("../src");
const _contracts_json_1 = require("@swapr/core/.contracts.json");
const address_1 = require("@ethersproject/address");
const commons_1 = require("./commons");
describe('fees', () => {
    // skip because uses old implementations, update tests with new local deployment
    describe('fetchSwapFee', () => {
        it.skip('Get WETH-WEENUS rinkeby fee', () => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
            const WETH_WEENUS_RINKEBY = yield src_1.Fetcher.fetchPairData(src_1.Token.WETH[src_1.ChainId.RINKEBY], commons_1.TEST_TOKENS.WEENUS[src_1.ChainId.RINKEBY]);
            const WETH_WEENUS_RINKEBY_FEE = yield src_1.Fetcher.fetchSwapFee(WETH_WEENUS_RINKEBY.liquidityToken);
            expect(WETH_WEENUS_RINKEBY_FEE.fee).toEqual(src_1.JSBI.BigInt(10));
        }));
    });
    describe('fetchSwapFees', () => {
        it.skip('Get WETH-WEENUS rinkeby fee', () => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
            const WETH_WEENUS_RINKEBY = yield src_1.Fetcher.fetchPairData(src_1.Token.WETH[src_1.ChainId.RINKEBY], commons_1.TEST_TOKENS.WEENUS[src_1.ChainId.RINKEBY]);
            const WETH_XEENUS_RINKEBY = yield src_1.Fetcher.fetchPairData(src_1.Token.WETH[src_1.ChainId.RINKEBY], commons_1.TEST_TOKENS.XEENUS[src_1.ChainId.RINKEBY]);
            const fees = yield src_1.Fetcher.fetchSwapFees([WETH_WEENUS_RINKEBY.liquidityToken, WETH_XEENUS_RINKEBY.liquidityToken]);
            expect(fees[0].fee).toEqual(src_1.JSBI.BigInt(10));
            expect(fees[1].fee).toEqual(src_1.JSBI.BigInt(15));
        }));
    });
    describe('fetchAllSwapFees', () => {
        it.skip('Get all rinkeby fees', () => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
            const WETH_WEENUS_RINKEBY = yield src_1.Fetcher.fetchPairData(src_1.Token.WETH[src_1.ChainId.RINKEBY], commons_1.TEST_TOKENS.WEENUS[src_1.ChainId.RINKEBY]);
            const WETH_XEENUS_RINKEBY = yield src_1.Fetcher.fetchPairData(src_1.Token.WETH[src_1.ChainId.RINKEBY], commons_1.TEST_TOKENS.XEENUS[src_1.ChainId.RINKEBY]);
            const WEENUS_XEENUS_RINKEBY = yield src_1.Fetcher.fetchPairData(commons_1.TEST_TOKENS.WEENUS[src_1.ChainId.RINKEBY], commons_1.TEST_TOKENS.XEENUS[src_1.ChainId.RINKEBY]);
            const fees = yield src_1.Fetcher.fetchAllSwapFees(src_1.ChainId.RINKEBY);
            expect(fees[WETH_WEENUS_RINKEBY.liquidityToken.address].fee).toEqual(src_1.JSBI.BigInt(10));
            expect(fees[WETH_XEENUS_RINKEBY.liquidityToken.address].fee).toEqual(src_1.JSBI.BigInt(15));
            expect(fees[WEENUS_XEENUS_RINKEBY.liquidityToken.address].fee).toEqual(src_1.JSBI.BigInt(20));
        }));
        it.skip('Get rinkeby fees with cache', () => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
            const WETH_WEENUS_RINKEBY = yield src_1.Fetcher.fetchPairData(src_1.Token.WETH[src_1.ChainId.RINKEBY], commons_1.TEST_TOKENS.WEENUS[src_1.ChainId.RINKEBY]);
            const WETH_XEENUS_RINKEBY = yield src_1.Fetcher.fetchPairData(src_1.Token.WETH[src_1.ChainId.RINKEBY], commons_1.TEST_TOKENS.XEENUS[src_1.ChainId.RINKEBY]);
            const WEENUS_XEENUS_RINKEBY = yield src_1.Fetcher.fetchPairData(commons_1.TEST_TOKENS.WEENUS[src_1.ChainId.RINKEBY], commons_1.TEST_TOKENS.XEENUS[src_1.ChainId.RINKEBY]);
            const fees = yield src_1.Fetcher.fetchAllSwapFees(src_1.ChainId.RINKEBY, {
                [WETH_WEENUS_RINKEBY.liquidityToken.address]: {
                    fee: src_1.JSBI.BigInt(10),
                    owner: constants_1.AddressZero,
                },
                [WETH_XEENUS_RINKEBY.liquidityToken.address]: {
                    fee: src_1.JSBI.BigInt(15),
                    owner: constants_1.AddressZero,
                },
            });
            expect(fees[WETH_WEENUS_RINKEBY.liquidityToken.address].fee).toEqual(src_1.JSBI.BigInt(10));
            expect(fees[WETH_XEENUS_RINKEBY.liquidityToken.address].fee).toEqual(src_1.JSBI.BigInt(15));
            expect(fees[WEENUS_XEENUS_RINKEBY.liquidityToken.address].fee).toEqual(src_1.JSBI.BigInt(20));
        }));
    });
    describe('fetchProtocolFee', () => {
        it('Get protocol fee on rinkeby', () => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
            const protocolFee = yield src_1.Fetcher.fetchProtocolFee(src_1.ChainId.RINKEBY);
            expect(protocolFee.feeReceiver).toEqual((0, address_1.getAddress)(_contracts_json_1.rinkeby.feeReceiver));
        }));
    });
});
//# sourceMappingURL=fees.test.js.map