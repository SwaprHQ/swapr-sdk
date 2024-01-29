"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.encodeRouteToPath = void 0;
const solidity_1 = require("@ethersproject/solidity");
/**
 * Converts a route to a hex encoded path
 * @param route the v3 path to convert to an encoded path
 * @param exactOutput whether the route should be encoded in reverse, for making exact output swaps
 */
function encodeRouteToPath(route, exactOutput) {
    const firstInputToken = route.input.wrapped;
    const { path, types } = route.pools.reduce(({ inputToken, path, types }, pool, index) => {
        const outputToken = pool.token0.equals(inputToken) ? pool.token1 : pool.token0;
        if (index === 0) {
            return {
                inputToken: outputToken,
                types: ['address', 'address'],
                path: [inputToken.address, outputToken.address],
            };
        }
        else {
            return {
                inputToken: outputToken,
                types: [...types, 'address'],
                path: [...path, outputToken.address],
            };
        }
    }, { inputToken: firstInputToken, path: [], types: [] });
    return exactOutput ? (0, solidity_1.pack)(types.reverse(), path.reverse()) : (0, solidity_1.pack)(types, path);
}
exports.encodeRouteToPath = encodeRouteToPath;
//# sourceMappingURL=encode-route.js.map