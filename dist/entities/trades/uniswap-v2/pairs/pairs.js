"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllCommonUniswapV2PairsFromSubgraph = exports.getAllCommonUniswapV2Pairs = void 0;
const tslib_1 = require("tslib");
const abi_1 = require("@ethersproject/abi");
const contracts_1 = require("@ethersproject/contracts");
const units_1 = require("@ethersproject/units");
const IDXswapPair_json_1 = require("@swapr/core/build/IDXswapPair.json");
const debug_1 = tslib_1.__importDefault(require("debug"));
const graphql_request_1 = require("graphql-request");
const lodash_flatmap_1 = tslib_1.__importDefault(require("lodash.flatmap"));
const multicall2_json_1 = tslib_1.__importDefault(require("../../../../abis/source/multicall2.json"));
const constants_1 = require("../../../../constants");
const graphql_1 = require("../../../../generated/graphql");
const fractions_1 = require("../../../fractions");
const pair_1 = require("../../../pair");
const token_1 = require("../../../token");
const utils_1 = require("../../utils");
const constants_2 = require("../constants");
const fees_1 = require("./fees");
const getAllCommonUniswapV2PairsDebug = (0, debug_1.default)('ecoRouter:uniswap:getAllCommonUniswapV2Pairs');
/**
 * Fetches all pairs through which the given tokens can be traded. Use `getAllCommonPairsFromSubgraph` for better results.
 * @returns the pair list
 */
function getAllCommonUniswapV2Pairs({ currencyA, currencyB, platform, provider, }) {
    var _a, _b;
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        // Return value
        const pairList = [];
        // Extract the chain Id from the currencies
        const chainId = (_a = currencyA.chainId) !== null && _a !== void 0 ? _a : currencyB.chainId;
        // Get a provider if one isn't provided
        provider = provider || (0, utils_1.getProvider)(chainId);
        // Create list of all possible pairs for the given currencies
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
        // Compute the pair addresses along with token0 and token1, sorted
        const pairTokenList = allPairCombinations.reduce((list, [tokenA, tokenB]) => {
            if (tokenA && tokenB && !tokenA.equals(tokenB) && chainId && platform.supportsChain(chainId)) {
                const pairAddress = pair_1.Pair.getAddress(tokenA, tokenB, platform);
                list[pairAddress] = tokenA.sortsBefore(tokenB) ? [tokenA, tokenB] : [tokenB, tokenA];
            }
            return list;
        }, {});
        const pairAddressList = Object.keys(pairTokenList);
        // Fetch the pair reserves via multicall
        const multicallContract = new contracts_1.Contract(constants_1.MULTICALL2_ADDRESS[chainId], multicall2_json_1.default, provider);
        const uniswapPairInterface = new abi_1.Interface(IDXswapPair_json_1.abi);
        const getReservesCallData = uniswapPairInterface.encodeFunctionData('getReserves', []);
        const swapFeeCallData = uniswapPairInterface.encodeFunctionData('swapFee', []);
        const multicall2CallData = [];
        for (const pairAddress of pairAddressList) {
            multicall2CallData.push({
                target: pairAddress,
                callData: getReservesCallData,
            });
            multicall2CallData.push({
                target: pairAddress,
                callData: swapFeeCallData,
            });
        }
        const getReservesAndSwapFeeCallResults = (yield multicallContract.callStatic.tryAggregate(false, multicall2CallData));
        for (let i = 0; i < getReservesAndSwapFeeCallResults.length; i += 2) {
            const pairAddressIndex = i / 2;
            const pairAddress = pairAddressList[pairAddressIndex];
            const getReservesResults = getReservesAndSwapFeeCallResults[i];
            const swapFeeResults = getReservesAndSwapFeeCallResults[i + 1];
            // Skip failed getReserves calls
            if (!getReservesResults.success || !pairAddress) {
                continue;
            }
            try {
                // Decode reserves and swap fee from the results
                const { reserve0, reserve1 } = uniswapPairInterface.decodeFunctionResult('getReserves', getReservesResults.returnData);
                // Swap fee is only available in Swapr's extended UniswapV2Pair contract
                // For any other fork, we use the default swap fee
                const swapFee = (swapFeeResults === null || swapFeeResults === void 0 ? void 0 : swapFeeResults.success)
                    ? uniswapPairInterface.decodeFunctionResult('swapFee', swapFeeResults.returnData)
                    : platform.defaultSwapFee;
                const [token0, token1] = pairTokenList[pairAddress];
                pairList.push(new pair_1.Pair(new fractions_1.TokenAmount(token0, reserve0.toString()), new fractions_1.TokenAmount(token1, reserve1.toString()), swapFee.toString(), BigInt(0), platform));
            }
            catch (e) {
                getAllCommonUniswapV2PairsDebug(e);
            }
        }
        return pairList;
    });
}
exports.getAllCommonUniswapV2Pairs = getAllCommonUniswapV2Pairs;
/**
 *
 */
function getAllCommonUniswapV2PairsFromSubgraph({ currencyA, currencyB, platform, }) {
    var _a;
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const chainId = (_a = currencyA.chainId) !== null && _a !== void 0 ? _a : currencyB.chainId;
        const subgraphEndpoint = platform.subgraphEndpoint[chainId];
        if (!subgraphEndpoint) {
            throw new Error(`No subgraph endpoint for chainId ${chainId}`);
        }
        const wrappedCurrencyA = (0, utils_1.wrappedCurrency)(currencyA, chainId);
        const wrappedCurrencyB = (0, utils_1.wrappedCurrency)(currencyB, chainId);
        const results = yield (0, graphql_1.getSdk)(new graphql_request_1.GraphQLClient(subgraphEndpoint)).GetAllCommonPairsBetweenTokenAAndTokenB({
            tokenA: wrappedCurrencyA.address.toLowerCase(),
            tokenB: wrappedCurrencyB.address.toLowerCase(),
        });
        const pairListWithDuplicates = [...results.pairsWithTokenA, ...results.pairsWithTokenB];
        // Remove duplicate pairs
        const pairList = pairListWithDuplicates.filter((pair, index, self) => {
            return self.findIndex((p) => p.id.toLowerCase() === pair.id.toLowerCase()) === index;
        });
        // Fetch the swap fees for all pairs from the chain
        const pairSwapFeeList = yield (0, fees_1.getUniswapV2PairSwapFee)({
            pairAddressList: pairList.map((pair) => pair.id),
            chainId,
        });
        return pairList.map((pair) => {
            const token0 = new token_1.Token(chainId, pair.token0.id, pair.token0.decimals, pair.token0.symbol, pair.token0.name);
            const token1 = new token_1.Token(chainId, pair.token1.id, pair.token1.decimals, pair.token1.symbol, pair.token1.name);
            const swapFee = pairSwapFeeList[pair.id.toLowerCase()] || platform.defaultSwapFee;
            return new pair_1.Pair(new fractions_1.TokenAmount(token0, (0, units_1.parseUnits)(pair.reserve0, token0.decimals).toString()), new fractions_1.TokenAmount(token1, (0, units_1.parseUnits)(pair.reserve1, token1.decimals).toString()), swapFee.toString(), BigInt(0), platform);
        });
    });
}
exports.getAllCommonUniswapV2PairsFromSubgraph = getAllCommonUniswapV2PairsFromSubgraph;
//# sourceMappingURL=pairs.js.map