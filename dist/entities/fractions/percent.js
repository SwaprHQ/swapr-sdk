"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Percent = void 0;
const constants_1 = require("../../constants");
const fraction_1 = require("./fraction");
const _100_PERCENT = new fraction_1.Fraction(constants_1._100);
class Percent extends fraction_1.Fraction {
    toSignificant(significantDigits = 5, format, rounding) {
        return this.multiply(_100_PERCENT).toSignificant(significantDigits, format, rounding);
    }
    toFixed(decimalPlaces = 2, format, rounding) {
        return this.multiply(_100_PERCENT).toFixed(decimalPlaces, format, rounding);
    }
}
exports.Percent = Percent;
//# sourceMappingURL=percent.js.map