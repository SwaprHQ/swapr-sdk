"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Price = void 0;
const tslib_1 = require("tslib");
const jsbi_1 = tslib_1.__importDefault(require("jsbi"));
const tiny_invariant_1 = tslib_1.__importDefault(require("tiny-invariant"));
const constants_1 = require("../../constants");
const token_1 = require("../token");
const token_2 = require("../token");
const currencyAmount_1 = require("./currencyAmount");
const fraction_1 = require("./fraction");
const tokenAmount_1 = require("./tokenAmount");
class Price extends fraction_1.Fraction {
    // denominator and numerator _must_ be raw, i.e. in the native representation
    constructor({ baseCurrency, quoteCurrency, denominator, numerator }) {
        super(numerator, denominator);
        this.baseCurrency = baseCurrency;
        this.quoteCurrency = quoteCurrency;
        this.scalar = new fraction_1.Fraction(jsbi_1.default.exponentiate(constants_1.TEN, jsbi_1.default.BigInt(baseCurrency.decimals)), jsbi_1.default.exponentiate(constants_1.TEN, jsbi_1.default.BigInt(quoteCurrency.decimals)));
    }
    static fromRoute(route) {
        const prices = [];
        for (const [i, pair] of route.pairs.entries()) {
            prices.push(route.path[i].equals(pair.token0)
                ? new Price({
                    baseCurrency: pair.reserve0.currency,
                    quoteCurrency: pair.reserve1.currency,
                    denominator: pair.reserve0.raw,
                    numerator: pair.reserve1.raw,
                })
                : new Price({
                    baseCurrency: pair.reserve1.currency,
                    quoteCurrency: pair.reserve0.currency,
                    denominator: pair.reserve1.raw,
                    numerator: pair.reserve0.raw,
                }));
        }
        return prices.slice(1).reduce((accumulator, currentValue) => accumulator.multiply(currentValue), prices[0]);
    }
    get raw() {
        return new fraction_1.Fraction(this.numerator, this.denominator);
    }
    get adjusted() {
        return super.multiply(this.scalar);
    }
    invert() {
        return new Price({
            baseCurrency: this.quoteCurrency,
            quoteCurrency: this.baseCurrency,
            denominator: this.numerator,
            numerator: this.denominator,
        });
    }
    multiply(other) {
        (0, tiny_invariant_1.default)((0, token_2.currencyEquals)(this.quoteCurrency, other.baseCurrency), 'TOKEN');
        const fraction = super.multiply(other);
        return new Price({
            baseCurrency: this.baseCurrency,
            quoteCurrency: other.quoteCurrency,
            denominator: fraction.denominator,
            numerator: fraction.numerator,
        });
    }
    // performs floor division on overflow
    quote(currencyAmount) {
        (0, tiny_invariant_1.default)((0, token_2.currencyEquals)(currencyAmount.currency, this.baseCurrency), 'TOKEN');
        if (this.quoteCurrency instanceof token_1.Token) {
            return new tokenAmount_1.TokenAmount(this.quoteCurrency, super.multiply(currencyAmount.raw).quotient);
        }
        return currencyAmount_1.CurrencyAmount.nativeCurrency(super.multiply(currencyAmount.raw).quotient, constants_1.ChainId.MAINNET);
    }
    toSignificant(significantDigits = 6, format, rounding) {
        return this.adjusted.toSignificant(significantDigits, format, rounding);
    }
    toFixed(decimalPlaces = 4, format, rounding) {
        return this.adjusted.toFixed(decimalPlaces, format, rounding);
    }
}
exports.Price = Price;
//# sourceMappingURL=price.js.map