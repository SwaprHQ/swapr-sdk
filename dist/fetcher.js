"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Fetcher = void 0;
const tslib_1 = require("tslib");
const contracts_1 = require("@ethersproject/contracts");
const networks_1 = require("@ethersproject/networks");
const providers_1 = require("@ethersproject/providers");
const IDXswapFactory_json_1 = tslib_1.__importDefault(require("@swapr/core/build/IDXswapFactory.json"));
const IDXswapPair_json_1 = tslib_1.__importDefault(require("@swapr/core/build/IDXswapPair.json"));
const jsbi_1 = tslib_1.__importDefault(require("jsbi"));
const tiny_invariant_1 = tslib_1.__importDefault(require("tiny-invariant"));
const abis_1 = require("./abis");
const constants_1 = require("./constants");
const tokenAmount_1 = require("./entities/fractions/tokenAmount");
const pair_1 = require("./entities/pair");
const token_1 = require("./entities/token");
const routable_platform_1 = require("./entities/trades/routable-platform");
/**
 * Contains methods for constructing instances of pairs and tokens from on-chain data.
 */
class Fetcher {
    /**
     * Cannot be constructed.
     */
    constructor() {
        // do nothing.
    }
    /**
     * Fetches information about a pair and constructs a pair from the given two tokens.
     * @param tokenA first token
     * @param tokenB second token
     * @param provider the provider to use to fetch the data
     */
    static fetchPairData(tokenA, tokenB, provider = (0, providers_1.getDefaultProvider)((0, networks_1.getNetwork)(tokenA.chainId)), platform = routable_platform_1.UniswapV2RoutablePlatform.SWAPR) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            (0, tiny_invariant_1.default)(tokenA.chainId === tokenB.chainId, 'CHAIN_ID');
            const address = pair_1.Pair.getAddress(tokenA, tokenB, platform);
            const [reserves0, reserves1] = yield new contracts_1.Contract(address, IDXswapPair_json_1.default.abi, provider).getReserves();
            const balances = tokenA.sortsBefore(tokenB) ? [reserves0, reserves1] : [reserves1, reserves0];
            const tokenAmountA = new tokenAmount_1.TokenAmount(tokenA, balances[0]);
            const tokenAmountB = new tokenAmount_1.TokenAmount(tokenB, balances[1]);
            const tokenAmounts = tokenAmountA.token.sortsBefore(tokenAmountB.token) // does safety checks
                ? [tokenAmountA, tokenAmountB]
                : [tokenAmountB, tokenAmountA];
            const liquidityToken = new token_1.Token(tokenAmounts[0].token.chainId, pair_1.Pair.getAddress(tokenAmounts[0].token, tokenAmounts[1].token, platform), 18, 'DXS', 'DXswap');
            const swapFee = jsbi_1.default.BigInt(yield new contracts_1.Contract(liquidityToken.address, IDXswapPair_json_1.default.abi, provider).swapFee());
            const protocolFeeDenominator = jsbi_1.default.BigInt(yield new contracts_1.Contract(constants_1.FACTORY_ADDRESS[tokenAmountA.token.chainId], IDXswapFactory_json_1.default.abi, provider).protocolFeeDenominator());
            return new pair_1.Pair(tokenAmountA, tokenAmountB, swapFee, protocolFeeDenominator);
        });
    }
    /**
     * Fetches swap fee information from a liquidity token of a token pair
     * @param liquidityToken the liquidity token from which the swap fee info will be fetched
     * @param provider the provider to use to fetch the data
     */
    static fetchSwapFee(liquidityToken, provider = (0, providers_1.getDefaultProvider)((0, networks_1.getNetwork)(liquidityToken.chainId))) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return {
                fee: jsbi_1.default.BigInt(yield new contracts_1.Contract(liquidityToken.address, IDXswapPair_json_1.default.abi, provider).swapFee()),
                owner: yield new contracts_1.Contract(constants_1.FACTORY_ADDRESS[liquidityToken.chainId], IDXswapFactory_json_1.default.abi, provider).feeToSetter(),
            };
        });
    }
    /**
     * Fetches swap fee information from liquidity tokens of token pairs
     * @param liquidityToken the liquidity tokens from which the swap fee info will be fetched
     * @param provider the provider to use to fetch the data
     */
    static fetchSwapFees(liquidityTokens, provider = (0, providers_1.getDefaultProvider)((0, networks_1.getNetwork)(liquidityTokens[0].chainId))) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const multicall = new contracts_1.Contract(constants_1.MULTICALL2_ADDRESS[liquidityTokens[0].chainId], abis_1.MULTICALL2_ABI, provider);
            const factoryContract = new contracts_1.Contract(constants_1.FACTORY_ADDRESS[liquidityTokens[0].chainId], IDXswapFactory_json_1.default.abi, provider);
            const liquidityTokenContract = new contracts_1.Contract(liquidityTokens[0].address, IDXswapPair_json_1.default.abi, provider);
            const calls = [];
            calls.push({
                address: factoryContract.address,
                callData: factoryContract.interface.encodeFunctionData(factoryContract.interface.getFunction('feeToSetter()')),
            });
            for (let tokenPairsIndex = 0; tokenPairsIndex < liquidityTokens.length; tokenPairsIndex++) {
                calls.push({
                    address: liquidityTokens[tokenPairsIndex].address,
                    callData: liquidityTokenContract.interface.encodeFunctionData(liquidityTokenContract.interface.getFunction('swapFee()')),
                });
            }
            const result = yield multicall.callStatic.aggregate(calls.map((call) => [call.address, call.callData]));
            const owner = factoryContract.interface.decodeFunctionResult(factoryContract.interface.getFunction('feeToSetter()'), result.returnData[0])[0];
            const fees = [];
            for (let resultIndex = 1; resultIndex < result.returnData.length; resultIndex++) {
                fees.push({
                    fee: jsbi_1.default.BigInt(liquidityTokenContract.interface.decodeFunctionResult(liquidityTokenContract.interface.getFunction('swapFee()'), result.returnData[resultIndex])[0]),
                    owner,
                });
            }
            return fees;
        });
    }
    /**
     * Fetches swap fee information of all registered token pairs from factory
     * @param chainId the chainId of the network to fecth the swap fees
     * @param swapFeesCache a cache of already fetched fees to be skiped
     * @param provider the provider to use to fetch the data
     */
    static fetchAllSwapFees(chainId, swapFeesCache = {}, provider = (0, providers_1.getDefaultProvider)((0, networks_1.getNetwork)(chainId))) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const multicall = new contracts_1.Contract(constants_1.MULTICALL2_ADDRESS[chainId], abis_1.MULTICALL2_ABI, provider);
            const factoryContract = new contracts_1.Contract(constants_1.FACTORY_ADDRESS[chainId], IDXswapFactory_json_1.default.abi, provider);
            const allPairsLength = yield factoryContract.allPairsLength();
            const allSwapPairs = {};
            // Get first token pairs from cache
            const tokenPairsCache = Object.keys(swapFeesCache);
            const tokenPairsToFetch = [];
            for (let tokenPaisCacheIndex = 0; tokenPaisCacheIndex < tokenPairsCache.length; tokenPaisCacheIndex++) {
                allSwapPairs[tokenPairsCache[tokenPaisCacheIndex]] = {
                    fee: swapFeesCache[tokenPairsCache[tokenPaisCacheIndex]].fee,
                    owner: swapFeesCache[tokenPairsCache[tokenPaisCacheIndex]].owner,
                };
            }
            // Get rest of the token pairs that are not cached
            const calls = [];
            for (let pairIndex = tokenPairsCache.length; pairIndex < allPairsLength; pairIndex++)
                calls.push({
                    address: factoryContract.address,
                    callData: factoryContract.interface.encodeFunctionData(factoryContract.interface.getFunction('allPairs(uint)'), [pairIndex]),
                });
            const result = yield multicall.callStatic.aggregate(calls.map((call) => [call.address, call.callData]));
            for (let resultIndex = 0; resultIndex < result.returnData.length; resultIndex++) {
                const tokenPairAddress = factoryContract.interface.decodeFunctionResult(factoryContract.interface.getFunction('allPairs(uint256)'), result.returnData[resultIndex])[0];
                tokenPairsToFetch.push(new token_1.Token(chainId, tokenPairAddress, 18, 'DXS', 'DXswap'));
            }
            // Fetch the pairs that we dont have the fee and owner
            const swapFeesFetched = tokenPairsToFetch.length === 0 ? [] : yield this.fetchSwapFees(tokenPairsToFetch, provider);
            for (let tokenPairsToFetchIndex = 0; tokenPairsToFetchIndex < tokenPairsToFetch.length; tokenPairsToFetchIndex++)
                allSwapPairs[tokenPairsToFetch[tokenPairsToFetchIndex].address] = swapFeesFetched[tokenPairsToFetchIndex];
            return allSwapPairs;
        });
    }
    /**
     * Fetches protocol fee information from the token pair factory
     * @param chainId the chainId of the network to fecth the protocol fee
     * @param provider the provider to use to fetch the data
     */
    static fetchProtocolFee(chainId, provider = (0, providers_1.getDefaultProvider)((0, networks_1.getNetwork)(chainId))) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const factoryContract = yield new contracts_1.Contract(constants_1.FACTORY_ADDRESS[chainId], IDXswapFactory_json_1.default.abi, provider);
            const feeDenominator = yield factoryContract.protocolFeeDenominator();
            const feeReceiver = yield factoryContract.feeTo();
            return { feeDenominator, feeReceiver };
        });
    }
}
exports.Fetcher = Fetcher;
//# sourceMappingURL=fetcher.js.map