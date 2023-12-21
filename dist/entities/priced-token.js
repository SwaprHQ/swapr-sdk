"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PricedToken = void 0;
const tslib_1 = require("tslib");
const tiny_invariant_1 = tslib_1.__importDefault(require("tiny-invariant"));
const token_1 = require("./token");
/**
 * Represents an ERC20 token and its price, expressed in any given currency.
 */
class PricedToken extends token_1.Token {
    constructor(chainId, address, decimals, price, symbol, name) {
        (0, tiny_invariant_1.default)(price.baseCurrency.symbol === symbol && price.baseCurrency.decimals === decimals, 'TOKEN');
        super(chainId, address, decimals, symbol, name);
        this.price = price;
    }
}
exports.PricedToken = PricedToken;
//# sourceMappingURL=priced-token.js.map