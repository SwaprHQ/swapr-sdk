"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CurrencyAmount = void 0;
const tslib_1 = require("tslib");
const big_js_1 = tslib_1.__importDefault(require("big.js"));
const jsbi_1 = tslib_1.__importDefault(require("jsbi"));
const tiny_invariant_1 = tslib_1.__importDefault(require("tiny-invariant"));
const toformat_1 = tslib_1.__importDefault(require("toformat"));
const constants_1 = require("../../constants");
const utils_1 = require("../../utils");
const currency_1 = require("../currency");
const token_1 = require("../token");
const fraction_1 = require("./fraction");
const Big = (0, toformat_1.default)(big_js_1.default);
class CurrencyAmount extends fraction_1.Fraction {
    /**
     * Helper that calls the constructor with the ETHER currency
     * @param amount ether amount in wei
     */
    static nativeCurrency(amount, chainId) {
        const nativeCurrency = currency_1.Currency.getNative(chainId);
        (0, tiny_invariant_1.default)(!!nativeCurrency, 'NO_NATIVE_CURRENCY');
        return new CurrencyAmount(nativeCurrency, amount);
    }
    /**
     * Helper that calls the constructor with the USD currency
     * @param amount amount of usd experessed in wei (with 18 decimals resolution)
     */
    static usd(amount) {
        return new CurrencyAmount(currency_1.USD, amount);
    }
    // amount _must_ be raw, i.e. in the native representation
    constructor(currency, amount) {
        const parsedAmount = (0, utils_1.parseBigintIsh)(amount);
        (0, utils_1.validateSolidityTypeInstance)(parsedAmount, constants_1.SolidityType.uint256);
        super(parsedAmount, jsbi_1.default.exponentiate(constants_1.TEN, jsbi_1.default.BigInt(currency.decimals)));
        this.currency = currency;
    }
    get raw() {
        return this.numerator;
    }
    add(other) {
        (0, tiny_invariant_1.default)((0, token_1.currencyEquals)(this.currency, other.currency), 'TOKEN');
        return new CurrencyAmount(this.currency, jsbi_1.default.add(this.raw, other.raw));
    }
    subtract(other) {
        (0, tiny_invariant_1.default)((0, token_1.currencyEquals)(this.currency, other.currency), 'TOKEN');
        return new CurrencyAmount(this.currency, jsbi_1.default.subtract(this.raw, other.raw));
    }
    toSignificant(significantDigits = 6, format, rounding = constants_1.Rounding.ROUND_DOWN) {
        return super.toSignificant(significantDigits, format, rounding);
    }
    toFixed(decimalPlaces = this.currency.decimals, format, rounding = constants_1.Rounding.ROUND_DOWN) {
        (0, tiny_invariant_1.default)(decimalPlaces <= this.currency.decimals, 'DECIMALS');
        return super.toFixed(decimalPlaces, format, rounding);
    }
    toExact(format = { groupSeparator: '' }) {
        Big.DP = this.currency.decimals;
        return new Big(this.numerator.toString()).div(this.denominator.toString()).toFormat(format);
    }
}
exports.CurrencyAmount = CurrencyAmount;
//# sourceMappingURL=currencyAmount.js.map