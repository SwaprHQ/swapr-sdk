"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const constants_1 = require("../src/constants");
const DXswapPair_json_1 = require("@swapr/core/build/DXswapPair.json");
const solidity_1 = require("@ethersproject/solidity");
const _contracts_json_1 = require("@swapr/core/.contracts.json");
// this _could_ go in constants, except that it would cost every consumer of the sdk the CPU to compute the hash
// and load the JSON.
const COMPUTED_INIT_CODE_HASH = (0, solidity_1.keccak256)(['bytes'], [`${'0x' + DXswapPair_json_1.bytecode}`]);
describe('constants', () => {
    describe('INIT_CODE_HASH', () => {
        it('matches computed bytecode hash', () => {
            expect(COMPUTED_INIT_CODE_HASH).toEqual(constants_1.INIT_CODE_HASH);
        });
    });
    describe('FACTORY_ADDRESS', () => {
        it('matches computed bytecode hash', () => {
            expect(constants_1.FACTORY_ADDRESS[constants_1.ChainId.RINKEBY]).toEqual(_contracts_json_1.rinkeby.factory);
        });
    });
});
//# sourceMappingURL=constants.test.js.map