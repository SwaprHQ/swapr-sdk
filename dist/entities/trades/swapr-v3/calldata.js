"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toHex = void 0;
const tslib_1 = require("tslib");
const jsbi_1 = tslib_1.__importDefault(require("jsbi"));
/**
 * Converts a big int to a hex string
 * @param bigintIsh
 * @returns The hex encoded calldata
 */
function toHex(bigintIsh) {
    const bigInt = jsbi_1.default.BigInt(bigintIsh);
    let hex = bigInt.toString(16);
    if (hex.length % 2 !== 0) {
        hex = `0${hex}`;
    }
    return `0x${hex}`;
}
exports.toHex = toHex;
//# sourceMappingURL=calldata.js.map