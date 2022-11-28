"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTradesPromise = void 0;
const tslib_1 = require("tslib");
const tradeTypes_1 = require("./tradeTypes");
function getTradesPromise(parsedAmount, inputCurrency, outputCurrency, isExactIn, commonParams, ecoRouterSourceOptionsParams, staticJsonRpcProvider, signal) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const abortPromise = new Promise((_, reject) => {
            signal.onabort = () => {
                reject(new DOMException('Aborted', 'AbortError'));
            };
        });
        const ecoRouterPromise = isExactIn
            ? (0, tradeTypes_1.getExactIn)(Object.assign({ currencyAmountIn: parsedAmount, currencyOut: outputCurrency }, commonParams), ecoRouterSourceOptionsParams, staticJsonRpcProvider)
            : (0, tradeTypes_1.getExactOut)(Object.assign({ currencyAmountOut: parsedAmount, currencyIn: inputCurrency }, commonParams), ecoRouterSourceOptionsParams, staticJsonRpcProvider);
        return yield Promise.race([abortPromise, ecoRouterPromise]);
    });
}
exports.getTradesPromise = getTradesPromise;
//# sourceMappingURL=trades.js.map