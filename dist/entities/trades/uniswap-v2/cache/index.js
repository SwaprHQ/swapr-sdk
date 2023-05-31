"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCacheList = void 0;
const constants_1 = require("../../../../constants");
/**
 * Creates a cache list for a given type.
 */
function createCacheList() {
    return {
        [constants_1.ChainId.MAINNET]: new Map(),
        [constants_1.ChainId.ARBITRUM_ONE]: new Map(),
        [constants_1.ChainId.XDAI]: new Map(),
        [constants_1.ChainId.RINKEBY]: new Map(),
        [constants_1.ChainId.ARBITRUM_RINKEBY]: new Map(),
        [constants_1.ChainId.ARBITRUM_GOERLI]: new Map(),
        [constants_1.ChainId.POLYGON]: new Map(),
        [constants_1.ChainId.GOERLI]: new Map(),
        [constants_1.ChainId.OPTIMISM_MAINNET]: new Map(),
        [constants_1.ChainId.OPTIMISM_GOERLI]: new Map(),
        [constants_1.ChainId.BSC_MAINNET]: new Map(),
        [constants_1.ChainId.BSC_TESTNET]: new Map(),
        [constants_1.ChainId.ZK_SYNC_ERA_MAINNET]: new Map(),
        [constants_1.ChainId.ZK_SYNC_ERA_TESTNET]: new Map(),
    };
}
exports.createCacheList = createCacheList;
//# sourceMappingURL=index.js.map