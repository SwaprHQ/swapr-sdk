"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultProtocolFeeDenominator = exports.defaultSwapFee = exports._10000 = exports._1000 = exports._100 = exports._30 = exports.SECONDS_IN_YEAR = exports._25 = exports.TEN = exports.FIVE = exports.THREE = exports.TWO = exports.ONE = exports.ZERO = exports.MINIMUM_LIQUIDITY = exports.INIT_CODE_HASH = exports.SWPR_WHITELIST_IPFS_HASH = exports.Rounding = exports.TradeType = void 0;
const tslib_1 = require("tslib");
const jsbi_1 = tslib_1.__importDefault(require("jsbi"));
tslib_1.__exportStar(require("./addresses"), exports);
tslib_1.__exportStar(require("./chains"), exports);
tslib_1.__exportStar(require("./solidity"), exports);
var TradeType;
(function (TradeType) {
    TradeType[TradeType["EXACT_INPUT"] = 0] = "EXACT_INPUT";
    TradeType[TradeType["EXACT_OUTPUT"] = 1] = "EXACT_OUTPUT";
})(TradeType = exports.TradeType || (exports.TradeType = {}));
var Rounding;
(function (Rounding) {
    Rounding[Rounding["ROUND_DOWN"] = 0] = "ROUND_DOWN";
    Rounding[Rounding["ROUND_HALF_UP"] = 1] = "ROUND_HALF_UP";
    Rounding[Rounding["ROUND_UP"] = 2] = "ROUND_UP";
})(Rounding = exports.Rounding || (exports.Rounding = {}));
exports.SWPR_WHITELIST_IPFS_HASH = 'QmcjTAvDJZU339jrc9Ky2pXKR68R1SjnwdyGSQjt1kad9r';
exports.INIT_CODE_HASH = '0xd306a548755b9295ee49cc729e13ca4a45e00199bbd890fa146da43a50571776';
exports.MINIMUM_LIQUIDITY = jsbi_1.default.BigInt(1000);
// exports for internal consumption
exports.ZERO = jsbi_1.default.BigInt(0);
exports.ONE = jsbi_1.default.BigInt(1);
exports.TWO = jsbi_1.default.BigInt(2);
exports.THREE = jsbi_1.default.BigInt(3);
exports.FIVE = jsbi_1.default.BigInt(5);
exports.TEN = jsbi_1.default.BigInt(10);
exports._25 = jsbi_1.default.BigInt(25);
exports.SECONDS_IN_YEAR = jsbi_1.default.BigInt(31536000);
exports._30 = jsbi_1.default.BigInt(30);
exports._100 = jsbi_1.default.BigInt(100);
exports._1000 = jsbi_1.default.BigInt(1000);
exports._10000 = jsbi_1.default.BigInt(10000);
exports.defaultSwapFee = exports._25;
exports.defaultProtocolFeeDenominator = exports.FIVE;
//# sourceMappingURL=index.js.map