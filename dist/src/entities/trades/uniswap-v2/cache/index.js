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
        [constants_1.ChainId.POLYGON]: new Map(),
    };
}
exports.createCacheList = createCacheList;
//# sourceMappingURL=index.js.map