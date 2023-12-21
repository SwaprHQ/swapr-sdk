"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRoutes = exports.computeAllRoutes = void 0;
const tslib_1 = require("tslib");
const route_1 = require("./route");
const pools_1 = require("./pools");
/**
 * Returns true if poolA is equivalent to poolB
 * @param poolA one of the two pools
 * @param poolB the other pool
 */
function poolEquals(poolA, poolB) {
    return (poolA === poolB ||
        (poolA.token0.equals(poolB.token0) && poolA.token1.equals(poolB.token1) && poolA.fee === poolB.fee));
}
function computeAllRoutes(pools, chainId, currentPath = [], allPaths = [], maxHops = 2) {
    for (const pool of pools) {
        if (!pool.involvesToken(pool.token0) || currentPath.some((pathPool) => poolEquals(pool, pathPool)))
            continue;
        const outputToken = pool.token0.equals(pool.token0) ? pool.token1 : pool.token0;
        if (outputToken.equals(pool.token1)) {
            allPaths.push(new route_1.Route([...currentPath, pool], pool.token0, pool.token1));
        }
        else if (maxHops > 1) {
            computeAllRoutes(pools, chainId, [...currentPath, pool], allPaths, maxHops - 1);
        }
    }
    return allPaths;
}
exports.computeAllRoutes = computeAllRoutes;
function getRoutes(currencyIn, currencyOut, chainId) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const pools = yield (0, pools_1.getPools)(currencyIn, currencyOut);
        console.log('pools size', pools.length);
        return computeAllRoutes(pools, chainId, [], [], 3);
    });
}
exports.getRoutes = getRoutes;
//# sourceMappingURL=routes.js.map