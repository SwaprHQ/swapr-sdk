"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SOLIDITY_TYPE_MAXIMA = exports.SolidityType = void 0;
const tslib_1 = require("tslib");
const jsbi_1 = tslib_1.__importDefault(require("jsbi"));
var SolidityType;
(function (SolidityType) {
    SolidityType["uint8"] = "uint8";
    SolidityType["uint256"] = "uint256";
})(SolidityType = exports.SolidityType || (exports.SolidityType = {}));
exports.SOLIDITY_TYPE_MAXIMA = {
    [SolidityType.uint8]: jsbi_1.default.BigInt('0xff'),
    [SolidityType.uint256]: jsbi_1.default.BigInt('0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff'),
};
//# sourceMappingURL=solidity.js.map