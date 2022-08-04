"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllCommonPairs = exports.getUniswapPairSwapFee = exports.uniswapV2PairFeeCache = void 0;
const tslib_1 = require("tslib");
const abi_1 = require("@ethersproject/abi");
const contracts_1 = require("@ethersproject/contracts");
const IDXswapPair_json_1 = require("@swapr/core/build/IDXswapPair.json");
const lodash_flatmap_1 = tslib_1.__importDefault(require("lodash.flatmap"));
const multicall2_json_1 = tslib_1.__importDefault(require("../../../../abis/source/multicall2.json"));
const constants_1 = require("../../../../constants");
const fractions_1 = require("../../../../entities/fractions");
const pair_1 = require("../../../pair");
const uniswap_v2_routable_platform_1 = require("../../routable-platform/uniswap-v2-routable-platform");
const utils_1 = require("../../utils");
const utils_2 = require("../../utils");
const cache_1 = require("../cache");
const constants_2 = require("../constants");
/**
 * Cache for the UniswapV2 pair fee
 */
exports.uniswapV2PairFeeCache = (0, cache_1.createCacheList)();
/**
 * Fetches the pair fee from the contract or cache if it's already been fetched.
 * @param pairAddress the address of the pair
 * @param chainId the chain id of the pair
 * @param expiresIn the time in seconds until the cache expires
 * @returns the pair fee in basis points
 */
function getUniswapPairSwapFee(pairAddress, chainId, expiresIn = 3600) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        // Return the fee from the cache if it exists
        const swapFeeFromCache = exports.uniswapV2PairFeeCache[chainId].get(pairAddress);
        // If the fee is in the cache, return it
        if (swapFeeFromCache && swapFeeFromCache.expiresAt < Date.now()) {
            return swapFeeFromCache.data;
        }
        const pairContract = new contracts_1.Contract(pairAddress, IDXswapPair_json_1.abi, (0, utils_2.getProvider)(chainId));
        const swapFee = (yield pairContract.swapFee());
        // Cache and return the fee
        exports.uniswapV2PairFeeCache[chainId].set(pairAddress, {
            expiresAt: Date.now() + expiresIn * 1000,
            data: swapFee,
        });
        return swapFee;
    });
}
exports.getUniswapPairSwapFee = getUniswapPairSwapFee;
/**
 * Fetches all pairs through which the given tokens can be traded.
 * @param currencyA The first currency
 * @param currencyB The second currency
 * @param platform The platform to use
 * @returns
 */
function getAllCommonPairs({ currencyA, currencyB, platform = uniswap_v2_routable_platform_1.UniswapV2RoutablePlatform.SWAPR, provider, }) {
    var _a, _b;
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const chainId = (_a = currencyA.chainId) !== null && _a !== void 0 ? _a : currencyB.chainId;
        // Get a provider if one isn't provided
        provider = provider !== null && provider !== void 0 ? provider : (0, utils_2.getProvider)(chainId);
        const bases = (_b = constants_2.BASES_TO_CHECK_TRADES_AGAINST[chainId]) !== null && _b !== void 0 ? _b : [];
        const [tokenA, tokenB] = [(0, utils_1.wrappedCurrency)(currencyA, chainId), (0, utils_1.wrappedCurrency)(currencyB, chainId)];
        const basePairs = (0, lodash_flatmap_1.default)(bases, (base) => bases.map((otherBase) => [base, otherBase])).filter(([t0, t1]) => t0.address !== t1.address);
        const allPairCombinations = [
            // the direct pair
            [tokenA, tokenB],
            // token A against all bases
            ...bases.map((base) => [tokenA, base]),
            // token B against all bases
            ...bases.map((base) => [tokenB, base]),
            // each base against all bases
            ...basePairs,
        ]
            .filter((tokens) => Boolean(tokens[0] && tokens[1]))
            .filter(([t0, t1]) => t0.address !== t1.address);
        // Compute the pair addresses
        const pairAddressList = allPairCombinations.reduce((list, [tokenA, tokenB]) => {
            if (tokenA && tokenB && !tokenA.equals(tokenB) && chainId && platform.supportsChain(chainId)) {
                list.push(pair_1.Pair.getAddress(tokenA, tokenB, platform));
            }
            return list;
        }, []);
        // Fetch the pair reserves via multicall
        const multicallContract = new contracts_1.Contract(constants_1.MULTICALL2_ADDRESS[chainId], multicall2_json_1.default, provider);
        const uniswapPairInterface = new abi_1.Interface(IDXswapPair_json_1.abi);
        const callData = uniswapPairInterface.encodeFunctionData('getReserves', []);
        const getReservesCallResults = (yield multicallContract.callStatic.tryAggregate(false, pairAddressList.map((target) => ({ target, callData }))));
        const pairList = yield Promise.all(getReservesCallResults.map(({ success, returnData }, i) => tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (!success)
                return undefined;
            let pair;
            try {
                // decode the return data
                const reserves = uniswapPairInterface.decodeFunctionResult('getReserves', returnData);
                const [tokenA, tokenB] = allPairCombinations[i];
                const [token0, token1] = tokenA.sortsBefore(tokenB) ? [tokenA, tokenB] : [tokenB, tokenA];
                const { reserve0, reserve1 } = reserves;
                // fetch the swap fee
                const swapFee = yield getUniswapPairSwapFee(pairAddressList[i], chainId).catch(() => undefined);
                pair = new pair_1.Pair(new fractions_1.TokenAmount(token0, reserve0.toString()), new fractions_1.TokenAmount(token1, reserve1.toString()), (swapFee === null || swapFee === void 0 ? void 0 : swapFee.toString()) || platform.defaultSwapFee, BigInt(0), platform);
                pair.liquidityToken;
            }
            catch (error) {
                // ignore errors
            }
            return pair;
        })));
        return pairList.reduce((list, pair) => {
            // Remove undefined and duplicate pairs
            if (pair !== undefined && !list.some((p) => p.equals(pair))) {
                list.push(pair);
            }
            return list;
        }, []);
    });
}
exports.getAllCommonPairs = getAllCommonPairs;
//# sourceMappingURL=index.js.map