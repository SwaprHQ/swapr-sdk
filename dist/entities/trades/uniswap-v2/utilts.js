"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.inputOutputComparator = exports.computePriceImpact = exports.ZERO_HEX = exports.toHex = void 0;
const tslib_1 = require("tslib");
const tiny_invariant_1 = tslib_1.__importDefault(require("tiny-invariant"));
const percent_1 = require("../../fractions/percent");
const token_1 = require("../../token");
function toHex(currencyAmount) {
    return `0x${currencyAmount.raw.toString(16)}`;
}
exports.toHex = toHex;
exports.ZERO_HEX = '0x0';
/**
 * Returns the percent difference between the mid price and the execution price, i.e. price impact.
 * @param midPrice mid price before the trade
 * @param inputAmount the input amount of the trade
 * @param outputAmount the output amount of the trade
 */
function computePriceImpact(midPrice, inputAmount, outputAmount) {
    const exactQuote = midPrice.raw.multiply(inputAmount.raw);
    // calculate slippage := (exactQuote - outputAmount) / exactQuote
    const slippage = exactQuote.subtract(outputAmount.raw).divide(exactQuote);
    return new percent_1.Percent(slippage.numerator, slippage.denominator);
}
exports.computePriceImpact = computePriceImpact;
// comparator function that allows sorting trades by their output amounts, in decreasing order, and then input amounts
// in increasing order. i.e. the best trades have the most outputs for the least inputs and are sorted first
function inputOutputComparator(a, b) {
    // must have same input and output token for comparison
    (0, tiny_invariant_1.default)((0, token_1.currencyEquals)(a.inputAmount.currency, b.inputAmount.currency), 'INPUT_CURRENCY');
    (0, tiny_invariant_1.default)((0, token_1.currencyEquals)(a.outputAmount.currency, b.outputAmount.currency), 'OUTPUT_CURRENCY');
    if (a.outputAmount.equalTo(b.outputAmount)) {
        if (a.inputAmount.equalTo(b.inputAmount)) {
            return 0;
        }
        // trade A requires less input than trade B, so A should come first
        if (a.inputAmount.lessThan(b.inputAmount)) {
            return -1;
        }
        else {
            return 1;
        }
    }
    else {
        // tradeA has less output than trade B, so should come second
        if (a.outputAmount.lessThan(b.outputAmount)) {
            return 1;
        }
        else {
            return -1;
        }
    }
}
exports.inputOutputComparator = inputOutputComparator;
//# sourceMappingURL=utilts.js.map