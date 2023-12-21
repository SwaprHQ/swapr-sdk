"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Route = void 0;
const tslib_1 = require("tslib");
const tiny_invariant_1 = tslib_1.__importDefault(require("tiny-invariant"));
const sdk_core_1 = require("@uniswap/sdk-core");
/**
 * Represents a list of pools through which a swap can occur
 * @template TInput The input token
 * @template TOutput The output token
 */
class Route {
    /**
     * Creates an instance of route.
     * @param pools An array of `Pool` objects, ordered by the route the swap will take
     * @param input The input token
     * @param output The output token
     */
    constructor(pools, input, output) {
        this._midPrice = null;
        (0, tiny_invariant_1.default)(pools.length > 0, 'POOLS');
        const chainId = pools[0].chainId;
        const allOnSameChain = pools.every((pool) => pool.chainId === chainId);
        (0, tiny_invariant_1.default)(allOnSameChain, 'CHAIN_IDS');
        const wrappedInput = input.wrapped;
        (0, tiny_invariant_1.default)(pools[0].involvesToken(wrappedInput), 'INPUT');
        (0, tiny_invariant_1.default)(pools[pools.length - 1].involvesToken(output.wrapped), 'OUTPUT');
        /**
         * Normalizes token0-token1 order and selects the next token/fee step to add to the path
         * */
        const tokenPath = [wrappedInput];
        for (const [i, pool] of pools.entries()) {
            const currentInputToken = tokenPath[i];
            (0, tiny_invariant_1.default)(currentInputToken.equals(pool.token0) || currentInputToken.equals(pool.token1), 'PATH');
            const nextToken = currentInputToken.equals(pool.token0) ? pool.token1 : pool.token0;
            tokenPath.push(nextToken);
        }
        this.pools = pools;
        this.tokenPath = tokenPath;
        this.input = input;
        this.output = output !== null && output !== void 0 ? output : tokenPath[tokenPath.length - 1];
    }
    /**
     * Returns the mid price of the route
     */
    get midPrice() {
        if (this._midPrice !== null)
            return this._midPrice;
        const price = this.pools.slice(1).reduce(({ nextInput, price }, pool) => {
            return nextInput.equals(pool.token0)
                ? {
                    nextInput: pool.token1,
                    price: price.multiply(pool.token0Price),
                }
                : {
                    nextInput: pool.token0,
                    price: price.multiply(pool.token1Price),
                };
        }, this.pools[0].token0.equals(this.input.wrapped)
            ? {
                nextInput: this.pools[0].token1,
                price: this.pools[0].token0Price,
            }
            : {
                nextInput: this.pools[0].token0,
                price: this.pools[0].token1Price,
            }).price;
        return (this._midPrice = new sdk_core_1.Price(this.input, this.output, price.denominator, price.numerator));
    }
    get chainId() {
        return this.pools[0].chainId;
    }
}
exports.Route = Route;
//# sourceMappingURL=route.js.map