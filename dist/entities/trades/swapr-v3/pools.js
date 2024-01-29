"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPools = exports.setupTokens = void 0;
const tslib_1 = require("tslib");
const sdk_core_1 = require("@uniswap/sdk-core");
const constants_1 = require("../../../constants");
const token_1 = require("../../token");
const constants_2 = require("./constants");
const contracts_1 = require("./contracts");
const pool_1 = require("./entities/pool");
const computePoolAddress_1 = require("./utils/computePoolAddress");
const getBaseTokens = constants_2.baseTokens.map(({ address, decimals, symbol, name }) => new sdk_core_1.Token(constants_1.ChainId.GNOSIS, address, decimals, symbol, name));
const currencyAddress = (currency) => {
    return currency.isNative ? token_1.WXDAI[constants_1.ChainId.GNOSIS].address : currency.address;
};
const setupTokens = (currencyIn, currencyOut) => {
    const tokenIn = new sdk_core_1.Token(constants_1.ChainId.GNOSIS, currencyAddress(currencyIn), currencyIn.decimals, currencyIn.symbol, currencyIn.name);
    const tokenOut = new sdk_core_1.Token(constants_1.ChainId.GNOSIS, currencyAddress(currencyOut), currencyOut.decimals, currencyOut.symbol, currencyOut.name);
    const [tokenA, tokenB] = [tokenIn === null || tokenIn === void 0 ? void 0 : tokenIn.wrapped, tokenOut === null || tokenOut === void 0 ? void 0 : tokenOut.wrapped];
    return { tokenA, tokenB };
};
exports.setupTokens = setupTokens;
const pairsDiffCombinations = (tokenA, tokenB) => {
    const basePairs = getBaseTokens
        .flatMap((base) => getBaseTokens.map((otherBase) => [base, otherBase]))
        .filter(([t0, t1]) => !t0.equals(t1));
    return ([
        // the direct pair
        [tokenA, tokenB],
        // token A against all bases
        ...getBaseTokens.map((base) => [tokenA, base]),
        // token B against all bases
        ...getBaseTokens.map((base) => [tokenB, base]),
        // each base against all bases
        ...basePairs,
    ] // filter out invalid pairs comprised of the same asset (e.g. WETH<>WETH)
        .filter(([t0, t1]) => !t0.equals(t1))
        // filter out duplicate pairs
        .filter(([t0, t1], i, otherPairs) => {
        // find the first index in the array at which there are the same 2 tokens as the current
        const firstIndexInOtherPairs = otherPairs.findIndex(([t0Other, t1Other]) => {
            return (t0.equals(t0Other) && t1.equals(t1Other)) || (t0.equals(t1Other) && t1.equals(t0Other));
        });
        // only accept the first occurrence of the same 2 tokens
        return firstIndexInOtherPairs === i;
    }));
};
const getPools = (currencyIn, currencyOut) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    const { tokenA, tokenB } = (0, exports.setupTokens)(currencyIn, currencyOut);
    const pairsCombinations = pairsDiffCombinations(tokenA, tokenB);
    const sortedPairs = pairsCombinations.map(([currencyA, currencyB]) => {
        const [token0, token1] = currencyA.sortsBefore(currencyB) ? [currencyA, currencyB] : [currencyB, currencyA];
        return [token0, token1];
    });
    const poolAddresses = sortedPairs.map((value) => {
        return (0, computePoolAddress_1.computePoolAddress)({
            poolDeployer: constants_2.POOL_DEPLOYER_ADDRESS,
            tokenA: value[0],
            tokenB: value[1],
        });
    });
    const poolsGlobalSpace = () => Promise.allSettled(poolAddresses.map((poolAddress) => fetchPoolGlobalState(poolAddress))).then((results) => results
        .map((result, index) => {
        if (result.status === 'fulfilled') {
            return { value: result.value, poolAddress: poolAddresses[index] };
        }
        else {
            return { value: null, poolAddress: poolAddresses[index] };
        }
    })
        .filter((result) => result.value));
    const poolsLiquidity = () => Promise.allSettled(poolAddresses.map((poolAddress) => fetchPoolLiquidity(poolAddress))).then((results) => results
        .map((result, index) => {
        if (result.status === 'fulfilled') {
            return { value: result.value, poolAddress: poolAddresses[index] };
        }
        else {
            return { value: null, poolAddress: poolAddresses[index] };
        }
    })
        .filter((result) => result.value));
    const getPoolsGlobalSpaceResults = () => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
        try {
            const results = yield poolsGlobalSpace();
            return results;
        }
        catch (error) {
            console.error('Failed fetching pool globalSpace results:', error);
            return null;
        }
    });
    const getPoolsLiquiditiesResults = () => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
        try {
            const results = yield poolsLiquidity();
            return results;
        }
        catch (error) {
            console.error('Failed fetching pool liquidity results:', error);
            return null;
        }
    });
    const [liquidityResults, globalSpaceResults] = yield Promise.all([
        yield getPoolsLiquiditiesResults(),
        yield getPoolsGlobalSpaceResults(),
    ]);
    const combinedResults = poolAddresses.flatMap((poolAddress) => {
        const liquidityResult = liquidityResults === null || liquidityResults === void 0 ? void 0 : liquidityResults.find(({ poolAddress: liquidityPoolAddress }) => liquidityPoolAddress === poolAddress);
        const globalSpaceResult = globalSpaceResults === null || globalSpaceResults === void 0 ? void 0 : globalSpaceResults.find(({ poolAddress: globalSpacePoolAddress }) => globalSpacePoolAddress === poolAddress);
        if (globalSpaceResult && liquidityResult) {
            return new pool_1.Pool(tokenA, tokenB, globalSpaceResult.value.fee, globalSpaceResult.value.price, liquidityResult ? liquidityResult.value : null, globalSpaceResult.value.tick);
        }
        return [];
    });
    return combinedResults;
});
exports.getPools = getPools;
const fetchPoolGlobalState = (poolAddress) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    return (0, contracts_1.getPoolsContract)(poolAddress).globalState();
});
const fetchPoolLiquidity = (poolAddress) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    return (0, contracts_1.getPoolsContract)(poolAddress).liquidity();
});
//# sourceMappingURL=pools.js.map