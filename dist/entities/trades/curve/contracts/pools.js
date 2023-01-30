"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPoolTokenList = void 0;
const tslib_1 = require("tslib");
const contracts_1 = require("@ethersproject/contracts");
const utils_1 = require("../../utils");
const common_1 = require("../abi/common");
const getPoolTokenListCache = new Map();
/**
 * Fetches and returns tokens from given pool address
 */
function getPoolTokenList({ chainId, poolAddress, provider = (0, utils_1.getProvider)(chainId), }) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const cacheKey = `${chainId}-${poolAddress}`;
        const tokensFromCache = getPoolTokenListCache.get(cacheKey);
        if (tokensFromCache) {
            return tokensFromCache;
        }
        // const multicallProvider = new MulticallProvider(provider, chainId)
        // // // UniswapV3 multicall contract
        // const multicall2Contract = new Contract('0x5ba1e12693dc8f9c48aad8770482f4739beed696', MULTICALL2_ABI, provider)
        const poolContract = new contracts_1.Contract(poolAddress, [common_1.poolMethods['view']['coins'], common_1.poolMethods['view']['underlying_coins']], provider);
        const indexList = [0, 1, 2, 3];
        const mainTokenResult = yield Promise.all(indexList.map((index) => tslib_1.__awaiter(this, void 0, void 0, function* () {
            try {
                return {
                    address: yield poolContract.coins(index),
                    index,
                };
                // eslint-disable-next-line
            }
            catch (error) { }
            return;
        })));
        const underlyingTokenResult = yield Promise.all(indexList.map((index) => tslib_1.__awaiter(this, void 0, void 0, function* () {
            try {
                return {
                    address: yield poolContract.underlying_coins(index),
                    isUnderlying: true,
                    index,
                };
                // eslint-disable-next-line
            }
            catch (error) { }
            return;
        })));
        const mainTokens = mainTokenResult.filter((token) => token !== undefined);
        const underlyingTokens = underlyingTokenResult.filter((token) => token !== undefined);
        const allTokens = [...mainTokens, ...underlyingTokens].map((token, index) => (Object.assign(Object.assign({}, token), { index })));
        const cacheContent = {
            mainTokens,
            underlyingTokens,
            allTokens,
        };
        cacheContent;
        return cacheContent;
    });
}
exports.getPoolTokenList = getPoolTokenList;
//# sourceMappingURL=pools.js.map