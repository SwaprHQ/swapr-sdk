"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Route = void 0;
const tslib_1 = require("tslib");
const tiny_invariant_1 = tslib_1.__importDefault(require("tiny-invariant"));
const currency_1 = require("./currency");
const price_1 = require("./fractions/price");
const token_1 = require("./token");
class Route {
    constructor(pairs, input, output) {
        (0, tiny_invariant_1.default)(pairs.length > 0, 'PAIRS');
        (0, tiny_invariant_1.default)(pairs.every((pair) => pair.chainId === pairs[0].chainId), 'CHAIN_IDS');
        (0, tiny_invariant_1.default)(pairs.every((pair) => pair.platform === pairs[0].platform), 'PLATFORM');
        (0, tiny_invariant_1.default)((input instanceof token_1.Token && pairs[0].involvesToken(input)) ||
            (currency_1.Currency.isNative(input) && pairs[0].involvesToken(token_1.Token.getNativeWrapper(pairs[0].chainId))), 'INPUT');
        (0, tiny_invariant_1.default)(typeof output === 'undefined' ||
            (output instanceof token_1.Token && pairs[pairs.length - 1].involvesToken(output)) ||
            (currency_1.Currency.isNative(output) && pairs[pairs.length - 1].involvesToken(token_1.Token.getNativeWrapper(pairs[0].chainId))), 'OUTPUT');
        const path = [input instanceof token_1.Token ? input : token_1.Token.getNativeWrapper(pairs[0].chainId)];
        for (const [i, pair] of pairs.entries()) {
            const currentInput = path[i];
            (0, tiny_invariant_1.default)(currentInput.equals(pair.token0) || currentInput.equals(pair.token1), 'PATH');
            const output = currentInput.equals(pair.token0) ? pair.token1 : pair.token0;
            path.push(output);
        }
        this.pairs = pairs;
        this.path = path;
        this.midPrice = price_1.Price.fromRoute(this);
        this.input = input;
        this.output = output !== null && output !== void 0 ? output : path[path.length - 1];
    }
    get chainId() {
        return this.pairs[0].chainId;
    }
}
exports.Route = Route;
//# sourceMappingURL=route.js.map