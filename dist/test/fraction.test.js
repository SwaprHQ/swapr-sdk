"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const src_1 = require("../src");
const jsbi_1 = tslib_1.__importDefault(require("jsbi"));
describe.only('Fraction', () => {
    describe('#quotient', () => {
        it('floor division', () => {
            expect(new src_1.Fraction(jsbi_1.default.BigInt(8), jsbi_1.default.BigInt(3)).quotient).toEqual(jsbi_1.default.BigInt(2)); // one below
            expect(new src_1.Fraction(jsbi_1.default.BigInt(12), jsbi_1.default.BigInt(4)).quotient).toEqual(jsbi_1.default.BigInt(3)); // exact
            expect(new src_1.Fraction(jsbi_1.default.BigInt(16), jsbi_1.default.BigInt(5)).quotient).toEqual(jsbi_1.default.BigInt(3)); // one above
        });
    });
    describe('#remainder', () => {
        it('returns fraction after divison', () => {
            expect(new src_1.Fraction(jsbi_1.default.BigInt(8), jsbi_1.default.BigInt(3)).remainder).toEqual(new src_1.Fraction(jsbi_1.default.BigInt(2), jsbi_1.default.BigInt(3)));
            expect(new src_1.Fraction(jsbi_1.default.BigInt(12), jsbi_1.default.BigInt(4)).remainder).toEqual(new src_1.Fraction(jsbi_1.default.BigInt(0), jsbi_1.default.BigInt(4)));
            expect(new src_1.Fraction(jsbi_1.default.BigInt(16), jsbi_1.default.BigInt(5)).remainder).toEqual(new src_1.Fraction(jsbi_1.default.BigInt(1), jsbi_1.default.BigInt(5)));
        });
    });
    describe('#invert', () => {
        it('flips num and denom', () => {
            expect(new src_1.Fraction(jsbi_1.default.BigInt(5), jsbi_1.default.BigInt(10)).invert().numerator).toEqual(jsbi_1.default.BigInt(10));
            expect(new src_1.Fraction(jsbi_1.default.BigInt(5), jsbi_1.default.BigInt(10)).invert().denominator).toEqual(jsbi_1.default.BigInt(5));
        });
    });
    describe('#add', () => {
        it('multiples denoms and adds nums', () => {
            expect(new src_1.Fraction(jsbi_1.default.BigInt(1), jsbi_1.default.BigInt(10)).add(new src_1.Fraction(jsbi_1.default.BigInt(4), jsbi_1.default.BigInt(12)))).toEqual(new src_1.Fraction(jsbi_1.default.BigInt(52), jsbi_1.default.BigInt(120)));
        });
        it('same denom', () => {
            expect(new src_1.Fraction(jsbi_1.default.BigInt(1), jsbi_1.default.BigInt(5)).add(new src_1.Fraction(jsbi_1.default.BigInt(2), jsbi_1.default.BigInt(5)))).toEqual(new src_1.Fraction(jsbi_1.default.BigInt(3), jsbi_1.default.BigInt(5)));
        });
    });
    describe('#subtract', () => {
        it('multiples denoms and subtracts nums', () => {
            expect(new src_1.Fraction(jsbi_1.default.BigInt(1), jsbi_1.default.BigInt(10)).subtract(new src_1.Fraction(jsbi_1.default.BigInt(4), jsbi_1.default.BigInt(12)))).toEqual(new src_1.Fraction(jsbi_1.default.BigInt(-28), jsbi_1.default.BigInt(120)));
        });
        it('same denom', () => {
            expect(new src_1.Fraction(jsbi_1.default.BigInt(3), jsbi_1.default.BigInt(5)).subtract(new src_1.Fraction(jsbi_1.default.BigInt(2), jsbi_1.default.BigInt(5)))).toEqual(new src_1.Fraction(jsbi_1.default.BigInt(1), jsbi_1.default.BigInt(5)));
        });
    });
    describe('#lessThan', () => {
        it('correct', () => {
            expect(new src_1.Fraction(jsbi_1.default.BigInt(1), jsbi_1.default.BigInt(10)).lessThan(new src_1.Fraction(jsbi_1.default.BigInt(4), jsbi_1.default.BigInt(12)))).toBe(true);
            expect(new src_1.Fraction(jsbi_1.default.BigInt(1), jsbi_1.default.BigInt(3)).lessThan(new src_1.Fraction(jsbi_1.default.BigInt(4), jsbi_1.default.BigInt(12)))).toBe(false);
            expect(new src_1.Fraction(jsbi_1.default.BigInt(5), jsbi_1.default.BigInt(12)).lessThan(new src_1.Fraction(jsbi_1.default.BigInt(4), jsbi_1.default.BigInt(12)))).toBe(false);
        });
    });
    describe('#equalTo', () => {
        it('correct', () => {
            expect(new src_1.Fraction(jsbi_1.default.BigInt(1), jsbi_1.default.BigInt(10)).equalTo(new src_1.Fraction(jsbi_1.default.BigInt(4), jsbi_1.default.BigInt(12)))).toBe(false);
            expect(new src_1.Fraction(jsbi_1.default.BigInt(1), jsbi_1.default.BigInt(3)).equalTo(new src_1.Fraction(jsbi_1.default.BigInt(4), jsbi_1.default.BigInt(12)))).toBe(true);
            expect(new src_1.Fraction(jsbi_1.default.BigInt(5), jsbi_1.default.BigInt(12)).equalTo(new src_1.Fraction(jsbi_1.default.BigInt(4), jsbi_1.default.BigInt(12)))).toBe(false);
        });
    });
    describe('#greaterThan', () => {
        it('correct', () => {
            expect(new src_1.Fraction(jsbi_1.default.BigInt(1), jsbi_1.default.BigInt(10)).greaterThan(new src_1.Fraction(jsbi_1.default.BigInt(4), jsbi_1.default.BigInt(12)))).toBe(false);
            expect(new src_1.Fraction(jsbi_1.default.BigInt(1), jsbi_1.default.BigInt(3)).greaterThan(new src_1.Fraction(jsbi_1.default.BigInt(4), jsbi_1.default.BigInt(12)))).toBe(false);
            expect(new src_1.Fraction(jsbi_1.default.BigInt(5), jsbi_1.default.BigInt(12)).greaterThan(new src_1.Fraction(jsbi_1.default.BigInt(4), jsbi_1.default.BigInt(12)))).toBe(true);
        });
    });
    describe('#multiplty', () => {
        it('correct', () => {
            expect(new src_1.Fraction(jsbi_1.default.BigInt(1), jsbi_1.default.BigInt(10)).multiply(new src_1.Fraction(jsbi_1.default.BigInt(4), jsbi_1.default.BigInt(12)))).toEqual(new src_1.Fraction(jsbi_1.default.BigInt(4), jsbi_1.default.BigInt(120)));
            expect(new src_1.Fraction(jsbi_1.default.BigInt(1), jsbi_1.default.BigInt(3)).multiply(new src_1.Fraction(jsbi_1.default.BigInt(4), jsbi_1.default.BigInt(12)))).toEqual(new src_1.Fraction(jsbi_1.default.BigInt(4), jsbi_1.default.BigInt(36)));
            expect(new src_1.Fraction(jsbi_1.default.BigInt(5), jsbi_1.default.BigInt(12)).multiply(new src_1.Fraction(jsbi_1.default.BigInt(4), jsbi_1.default.BigInt(12)))).toEqual(new src_1.Fraction(jsbi_1.default.BigInt(20), jsbi_1.default.BigInt(144)));
        });
    });
    describe('#divide', () => {
        it('correct', () => {
            expect(new src_1.Fraction(jsbi_1.default.BigInt(1), jsbi_1.default.BigInt(10)).divide(new src_1.Fraction(jsbi_1.default.BigInt(4), jsbi_1.default.BigInt(12)))).toEqual(new src_1.Fraction(jsbi_1.default.BigInt(12), jsbi_1.default.BigInt(40)));
            expect(new src_1.Fraction(jsbi_1.default.BigInt(1), jsbi_1.default.BigInt(3)).divide(new src_1.Fraction(jsbi_1.default.BigInt(4), jsbi_1.default.BigInt(12)))).toEqual(new src_1.Fraction(jsbi_1.default.BigInt(12), jsbi_1.default.BigInt(12)));
            expect(new src_1.Fraction(jsbi_1.default.BigInt(5), jsbi_1.default.BigInt(12)).divide(new src_1.Fraction(jsbi_1.default.BigInt(4), jsbi_1.default.BigInt(12)))).toEqual(new src_1.Fraction(jsbi_1.default.BigInt(60), jsbi_1.default.BigInt(48)));
        });
    });
});
//# sourceMappingURL=fraction.test.js.map