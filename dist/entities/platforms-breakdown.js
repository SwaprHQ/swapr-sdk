"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Breakdown = void 0;
const tslib_1 = require("tslib");
const tiny_invariant_1 = tslib_1.__importDefault(require("tiny-invariant"));
const fractions_1 = require("./fractions");
const token_1 = require("./token");
class Breakdown {
    constructor(chainId, platforms, input, output, midPrice) {
        (0, tiny_invariant_1.default)(platforms.length > 0, 'Missing routable platform');
        (0, tiny_invariant_1.default)(platforms
            .reduce((accumulator, platform) => accumulator.add(platform.percentage), new fractions_1.Percent('0', '100'))
            .toFixed(2) === '1.00', 'Inconsistent breakdown percentage');
        if (input instanceof token_1.Token && output instanceof token_1.Token)
            (0, tiny_invariant_1.default)(input.chainId === output.chainId, 'Input and output tokens must be on the same chain');
        this.chainId = chainId;
        this.platforms = platforms;
        this.midPrice = midPrice;
        this.input = input;
        this.output = output;
    }
}
exports.Breakdown = Breakdown;
//# sourceMappingURL=platforms-breakdown.js.map