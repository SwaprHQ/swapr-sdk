"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPools = exports.setupTokens = void 0;
const tslib_1 = require("tslib");
// @ts-nocheck
const sdk_core_1 = require("@uniswap/sdk-core");
const constants_1 = require("./constants");
const computePoolAddress_1 = require("./computePoolAddress");
const SwaprV3_1 = require("./SwaprV3");
const pool_1 = require("./pool");
const GNOSIS_CHAIN_ID = 100;
const getBaseTokens = constants_1.baseTokens.map(({ address, decimals, symbol, name }) => new sdk_core_1.Token(GNOSIS_CHAIN_ID, address, decimals, symbol, name));
const setupTokens = (currencyIn, currencyOut) => {
    const tokenIn = new sdk_core_1.Token(GNOSIS_CHAIN_ID, currencyIn.address, currencyIn.decimals, currencyIn.symbol, currencyIn.name);
    const tokenOut = new sdk_core_1.Token(GNOSIS_CHAIN_ID, currencyOut.address, currencyOut.decimals, currencyOut.symbol, currencyOut.name);
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
            poolDeployer: constants_1.POOL_DEPLOYER_ADDRESS,
            tokenA: value[0],
            tokenB: value[1],
        });
    });
    // console.log('poolAddresses:', poolAddresses)
    console.log('poolAddresses lenght:', poolAddresses.length);
    const poolsGlobalSpace = () => Promise.allSettled(poolAddresses.map((poolAddress) => fetchPoolGlobalState(poolAddress))).then((results) => results
        .map((result, index) => {
        if (result.status === 'fulfilled') {
            return { value: result.value, poolAddress: poolAddresses[index] };
        }
    })
        .filter((result) => result));
    const poolsLiquidity = () => Promise.allSettled(poolAddresses.map((poolAddress) => fetchPoolLiquidity(poolAddress))).then((results) => results
        .map((result, index) => {
        if (result.status === 'fulfilled') {
            return { value: result.value, poolAddress: poolAddresses[index] };
        }
    })
        .filter((result) => result));
    const getPoolsGlobalSpaceResults = () => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
        try {
            const results = yield poolsGlobalSpace();
            return results;
        }
        catch (error) {
            console.error('Error fetching pool globalSpace results:', error);
        }
    });
    const getPoolsLiquiditiesResults = () => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
        try {
            const results = yield poolsLiquidity();
            return results;
        }
        catch (error) {
            console.error('Error fetching pool liquidity results:', error);
        }
    });
    const [liquidityResults, globalSpaceResults] = yield Promise.all([
        yield getPoolsLiquiditiesResults(),
        yield getPoolsGlobalSpaceResults(),
    ]);
    console.log('globalSpaceResults:', globalSpaceResults);
    console.log('liquidityResults:', liquidityResults);
    console.log('globalSpaceResults length:', globalSpaceResults.length);
    console.log('liquidityResults length:', liquidityResults.length);
    const combinedResults = poolAddresses.flatMap((poolAddress) => {
        const liquidityResult = liquidityResults.find(({ poolAddress: liquidityPoolAddress }) => liquidityPoolAddress === poolAddress);
        const globalSpaceResult = globalSpaceResults.find(({ poolAddress: globalSpacePoolAddress }) => globalSpacePoolAddress === poolAddress);
        if (globalSpaceResult && liquidityResult) {
            return new pool_1.Pool(tokenA, tokenB, globalSpaceResult.value.fee, globalSpaceResult.value.price, liquidityResult ? liquidityResult.value : null, globalSpaceResult.value.tick);
        }
        return [];
    });
    return combinedResults;
});
exports.getPools = getPools;
const fetchPoolGlobalState = (poolAddress) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    return (0, SwaprV3_1.getPoolsContract)(poolAddress).globalState();
});
const fetchPoolLiquidity = (poolAddress) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    return (0, SwaprV3_1.getPoolsContract)(poolAddress).liquidity();
});
//# sourceMappingURL=pools.js.map