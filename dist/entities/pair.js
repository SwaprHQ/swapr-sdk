"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Pair = void 0;
const tslib_1 = require("tslib");
const address_1 = require("@ethersproject/address");
const solidity_1 = require("@ethersproject/solidity");
const jsbi_1 = tslib_1.__importDefault(require("jsbi"));
const tiny_invariant_1 = tslib_1.__importDefault(require("tiny-invariant"));
const constants_1 = require("../constants");
const constants_2 = require("../constants");
const errors_1 = require("../errors");
const utils_1 = require("../utils");
const price_1 = require("./fractions/price");
const tokenAmount_1 = require("./fractions/tokenAmount");
const token_1 = require("./token");
const routable_platform_1 = require("./trades/routable-platform");
const INITIAL_CACHE_STATE = {
    [constants_2.ChainId.MAINNET]: {},
    [constants_2.ChainId.RINKEBY]: {},
    [constants_2.ChainId.ARBITRUM_ONE]: {},
    [constants_2.ChainId.ARBITRUM_RINKEBY]: {},
    [constants_2.ChainId.ARBITRUM_GOERLI]: {},
    [constants_2.ChainId.XDAI]: {},
    [constants_2.ChainId.POLYGON]: {},
    [constants_2.ChainId.GOERLI]: {},
    [constants_2.ChainId.OPTIMISM_MAINNET]: {},
    [constants_2.ChainId.OPTIMISM_GOERLI]: {},
};
let PAIR_ADDRESS_CACHE = {
    [routable_platform_1.UniswapV2RoutablePlatform.SWAPR.name]: Object.assign({}, INITIAL_CACHE_STATE),
    [routable_platform_1.UniswapV2RoutablePlatform.SUSHISWAP.name]: Object.assign({}, INITIAL_CACHE_STATE),
    [routable_platform_1.UniswapV2RoutablePlatform.UNISWAP.name]: Object.assign({}, INITIAL_CACHE_STATE),
    [routable_platform_1.UniswapV2RoutablePlatform.HONEYSWAP.name]: Object.assign({}, INITIAL_CACHE_STATE),
    [routable_platform_1.UniswapV2RoutablePlatform.BAOSWAP.name]: Object.assign({}, INITIAL_CACHE_STATE),
    [routable_platform_1.UniswapV2RoutablePlatform.LEVINSWAP.name]: Object.assign({}, INITIAL_CACHE_STATE),
    [routable_platform_1.UniswapV2RoutablePlatform.QUICKSWAP.name]: Object.assign({}, INITIAL_CACHE_STATE),
    [routable_platform_1.UniswapV2RoutablePlatform.DFYN.name]: Object.assign({}, INITIAL_CACHE_STATE),
};
class Pair {
    constructor(tokenAmountA, tokenAmountB, swapFee, protocolFeeDenominator, platform = routable_platform_1.UniswapV2RoutablePlatform.SWAPR, liquidityMiningCampaigns = []) {
        this.swapFee = constants_1.defaultSwapFee;
        this.protocolFeeDenominator = constants_1.defaultProtocolFeeDenominator;
        (0, tiny_invariant_1.default)(tokenAmountA.token.chainId === tokenAmountB.token.chainId, 'CHAIN_ID');
        const tokenAmounts = tokenAmountA.token.sortsBefore(tokenAmountB.token) // does safety checks
            ? [tokenAmountA, tokenAmountB]
            : [tokenAmountB, tokenAmountA];
        this.platform = platform;
        const liquidityTokenAddress = Pair.getAddress(tokenAmounts[0].token, tokenAmounts[1].token, platform);
        this.liquidityToken = new token_1.Token(tokenAmounts[0].token.chainId, liquidityTokenAddress, 18, 'DXS', 'DXswap');
        this.protocolFeeDenominator = protocolFeeDenominator ? protocolFeeDenominator : constants_1.defaultProtocolFeeDenominator;
        this.tokenAmounts = tokenAmounts;
        this.swapFee = swapFee ? swapFee : platform.defaultSwapFee;
        this.liquidityMiningCampaigns = liquidityMiningCampaigns;
    }
    /**
     * Returns true if the two pairs are equivalent, i.e. have the same address (calculated using create2).
     * @param other other pair to compare
     */
    equals(other) {
        // short circuit on reference equality
        if (this === other) {
            return true;
        }
        return this.liquidityToken.address === other.liquidityToken.address;
    }
    static getAddress(tokenA, tokenB, platform = routable_platform_1.UniswapV2RoutablePlatform.SWAPR) {
        var _a, _b, _c, _d, _e;
        const tokens = tokenA.sortsBefore(tokenB) ? [tokenA, tokenB] : [tokenB, tokenA]; // does safety checks
        const chainId = tokenA.chainId;
        (0, tiny_invariant_1.default)(platform.supportsChain(chainId), 'INVALID_PLATFORM_CHAIN_ID');
        if (((_c = (_b = (_a = PAIR_ADDRESS_CACHE === null || PAIR_ADDRESS_CACHE === void 0 ? void 0 : PAIR_ADDRESS_CACHE[platform.name]) === null || _a === void 0 ? void 0 : _a[chainId]) === null || _b === void 0 ? void 0 : _b[tokens[0].address]) === null || _c === void 0 ? void 0 : _c[tokens[1].address]) === undefined) {
            PAIR_ADDRESS_CACHE = Object.assign(Object.assign({}, PAIR_ADDRESS_CACHE), { [platform.name]: Object.assign(Object.assign({}, PAIR_ADDRESS_CACHE[platform.name]), { [chainId]: Object.assign(Object.assign({}, PAIR_ADDRESS_CACHE[platform.name][chainId]), { [tokens[0].address]: Object.assign(Object.assign({}, (_e = (_d = PAIR_ADDRESS_CACHE === null || PAIR_ADDRESS_CACHE === void 0 ? void 0 : PAIR_ADDRESS_CACHE[platform.name]) === null || _d === void 0 ? void 0 : _d[chainId]) === null || _e === void 0 ? void 0 : _e[tokens[0].address]), { [tokens[1].address]: (0, address_1.getCreate2Address)(platform.factoryAddress[chainId], (0, solidity_1.keccak256)(['bytes'], [(0, solidity_1.pack)(['address', 'address'], [tokens[0].address, tokens[1].address])]), platform.initCodeHash) }) }) }) });
        }
        return PAIR_ADDRESS_CACHE[platform.name][chainId][tokens[0].address][tokens[1].address];
    }
    /**
     * Returns true if the token is either token0 or token1
     * @param token to check
     */
    involvesToken(token) {
        return token.equals(this.token0) || token.equals(this.token1);
    }
    /**
     * Returns the current mid price of the pair in terms of token0, i.e. the ratio of reserve1 to reserve0
     */
    get token0Price() {
        return new price_1.Price({
            baseCurrency: this.token0,
            quoteCurrency: this.token1,
            denominator: this.tokenAmounts[0].raw,
            numerator: this.tokenAmounts[1].raw,
        });
    }
    /**
     * Returns the current mid price of the pair in terms of token1, i.e. the ratio of reserve0 to reserve1
     */
    get token1Price() {
        return new price_1.Price({
            baseCurrency: this.token1,
            quoteCurrency: this.token0,
            denominator: this.tokenAmounts[1].raw,
            numerator: this.tokenAmounts[0].raw,
        });
    }
    /**
     * Return the price of the given token in terms of the other token in the pair.
     * @param token token to return price of
     */
    priceOf(token) {
        (0, tiny_invariant_1.default)(this.involvesToken(token), 'TOKEN');
        return token.equals(this.token0) ? this.token0Price : this.token1Price;
    }
    /**
     * Returns the chain ID of the tokens in the pair.
     */
    get chainId() {
        return this.token0.chainId;
    }
    get token0() {
        return this.tokenAmounts[0].token;
    }
    get token1() {
        return this.tokenAmounts[1].token;
    }
    get reserve0() {
        return this.tokenAmounts[0];
    }
    get reserve1() {
        return this.tokenAmounts[1];
    }
    reserveOf(token) {
        (0, tiny_invariant_1.default)(this.involvesToken(token), 'TOKEN');
        return token.equals(this.token0) ? this.reserve0 : this.reserve1;
    }
    getOutputAmount(inputAmount) {
        (0, tiny_invariant_1.default)(this.involvesToken(inputAmount.token), 'TOKEN');
        if (jsbi_1.default.equal(this.reserve0.raw, constants_1.ZERO) || jsbi_1.default.equal(this.reserve1.raw, constants_1.ZERO)) {
            throw new errors_1.InsufficientReservesError();
        }
        const inputReserve = this.reserveOf(inputAmount.token);
        const outputReserve = this.reserveOf(inputAmount.token.equals(this.token0) ? this.token1 : this.token0);
        const inputAmountWithFee = jsbi_1.default.multiply(inputAmount.raw, jsbi_1.default.subtract(constants_1._10000, (0, utils_1.parseBigintIsh)(this.swapFee)));
        const numerator = jsbi_1.default.multiply(inputAmountWithFee, outputReserve.raw);
        const denominator = jsbi_1.default.add(jsbi_1.default.multiply(inputReserve.raw, constants_1._10000), inputAmountWithFee);
        const outputAmount = new tokenAmount_1.TokenAmount(inputAmount.token.equals(this.token0) ? this.token1 : this.token0, jsbi_1.default.divide(numerator, denominator));
        if (jsbi_1.default.equal(outputAmount.raw, constants_1.ZERO)) {
            throw new errors_1.InsufficientInputAmountError();
        }
        return [
            outputAmount,
            new Pair(inputReserve.add(inputAmount), outputReserve.subtract(outputAmount), this.swapFee, this.protocolFeeDenominator, this.platform, this.liquidityMiningCampaigns),
        ];
    }
    getInputAmount(outputAmount) {
        (0, tiny_invariant_1.default)(this.involvesToken(outputAmount.token), 'TOKEN');
        if (jsbi_1.default.equal(this.reserve0.raw, constants_1.ZERO) ||
            jsbi_1.default.equal(this.reserve1.raw, constants_1.ZERO) ||
            jsbi_1.default.greaterThanOrEqual(outputAmount.raw, this.reserveOf(outputAmount.token).raw)) {
            throw new errors_1.InsufficientReservesError();
        }
        const outputReserve = this.reserveOf(outputAmount.token);
        const inputReserve = this.reserveOf(outputAmount.token.equals(this.token0) ? this.token1 : this.token0);
        const numerator = jsbi_1.default.multiply(jsbi_1.default.multiply(inputReserve.raw, outputAmount.raw), constants_1._10000);
        const denominator = jsbi_1.default.multiply(jsbi_1.default.subtract(outputReserve.raw, outputAmount.raw), jsbi_1.default.subtract(constants_1._10000, (0, utils_1.parseBigintIsh)(this.swapFee)));
        const inputAmount = new tokenAmount_1.TokenAmount(outputAmount.token.equals(this.token0) ? this.token1 : this.token0, jsbi_1.default.add(jsbi_1.default.divide(numerator, denominator), constants_1.ONE));
        return [
            inputAmount,
            new Pair(inputReserve.add(inputAmount), outputReserve.subtract(outputAmount), this.swapFee, this.protocolFeeDenominator, this.platform, this.liquidityMiningCampaigns),
        ];
    }
    getLiquidityMinted(totalSupply, tokenAmountA, tokenAmountB) {
        (0, tiny_invariant_1.default)(totalSupply.token.equals(this.liquidityToken), 'LIQUIDITY');
        const tokenAmounts = tokenAmountA.token.sortsBefore(tokenAmountB.token) // does safety checks
            ? [tokenAmountA, tokenAmountB]
            : [tokenAmountB, tokenAmountA];
        (0, tiny_invariant_1.default)(tokenAmounts[0].token.equals(this.token0) && tokenAmounts[1].token.equals(this.token1), 'TOKEN');
        let liquidity;
        if (jsbi_1.default.equal(totalSupply.raw, constants_1.ZERO)) {
            liquidity = jsbi_1.default.subtract((0, utils_1.sqrt)(jsbi_1.default.multiply(tokenAmounts[0].raw, tokenAmounts[1].raw)), constants_1.MINIMUM_LIQUIDITY);
        }
        else {
            const amount0 = jsbi_1.default.divide(jsbi_1.default.multiply(tokenAmounts[0].raw, totalSupply.raw), this.reserve0.raw);
            const amount1 = jsbi_1.default.divide(jsbi_1.default.multiply(tokenAmounts[1].raw, totalSupply.raw), this.reserve1.raw);
            liquidity = jsbi_1.default.lessThanOrEqual(amount0, amount1) ? amount0 : amount1;
        }
        if (!jsbi_1.default.greaterThan(liquidity, constants_1.ZERO)) {
            throw new errors_1.InsufficientInputAmountError();
        }
        return new tokenAmount_1.TokenAmount(this.liquidityToken, liquidity);
    }
    getLiquidityValue(token, totalSupply, liquidity, feeOn = false, kLast) {
        (0, tiny_invariant_1.default)(this.involvesToken(token), 'TOKEN');
        (0, tiny_invariant_1.default)(totalSupply.token.equals(this.liquidityToken), 'TOTAL_SUPPLY');
        (0, tiny_invariant_1.default)(liquidity.token.equals(this.liquidityToken), 'LIQUIDITY');
        (0, tiny_invariant_1.default)(jsbi_1.default.lessThanOrEqual(liquidity.raw, totalSupply.raw), 'LIQUIDITY');
        let totalSupplyAdjusted;
        if (!feeOn) {
            totalSupplyAdjusted = totalSupply;
        }
        else {
            (0, tiny_invariant_1.default)(!!kLast, 'K_LAST');
            const kLastParsed = (0, utils_1.parseBigintIsh)(kLast);
            if (!jsbi_1.default.equal(kLastParsed, constants_1.ZERO)) {
                const rootK = (0, utils_1.sqrt)(jsbi_1.default.multiply(this.reserve0.raw, this.reserve1.raw));
                const rootKLast = (0, utils_1.sqrt)(kLastParsed);
                if (jsbi_1.default.greaterThan(rootK, rootKLast)) {
                    const numerator = jsbi_1.default.multiply(totalSupply.raw, jsbi_1.default.subtract(rootK, rootKLast));
                    const denominator = jsbi_1.default.add(jsbi_1.default.multiply(rootK, (0, utils_1.parseBigintIsh)(this.protocolFeeDenominator)), rootKLast);
                    const feeLiquidity = jsbi_1.default.divide(numerator, denominator);
                    totalSupplyAdjusted = totalSupply.add(new tokenAmount_1.TokenAmount(this.liquidityToken, feeLiquidity));
                }
                else {
                    totalSupplyAdjusted = totalSupply;
                }
            }
            else {
                totalSupplyAdjusted = totalSupply;
            }
        }
        return new tokenAmount_1.TokenAmount(token, jsbi_1.default.divide(jsbi_1.default.multiply(liquidity.raw, this.reserveOf(token).raw), totalSupplyAdjusted.raw));
    }
}
exports.Pair = Pair;
//# sourceMappingURL=pair.js.map