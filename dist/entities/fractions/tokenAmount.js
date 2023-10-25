"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TokenAmount = void 0;
const tslib_1 = require("tslib");
const jsbi_1 = tslib_1.__importDefault(require("jsbi"));
const tiny_invariant_1 = tslib_1.__importDefault(require("tiny-invariant"));
const currencyAmount_1 = require("./currencyAmount");
class TokenAmount extends currencyAmount_1.CurrencyAmount {
    // amount _must_ be raw, i.e. in the native representation
    constructor(token, amount) {
        super(token, amount);
        this.token = token;
    }
    add(other) {
        (0, tiny_invariant_1.default)(this.token.equals(other.token), 'TOKEN');
        return new TokenAmount(this.token, jsbi_1.default.add(this.raw, other.raw));
    }
    subtract(other) {
        (0, tiny_invariant_1.default)(this.token.equals(other.token), 'TOKEN');
        return new TokenAmount(this.token, jsbi_1.default.subtract(this.raw, other.raw));
    }
}
exports.TokenAmount = TokenAmount;
//# sourceMappingURL=tokenAmount.js.map