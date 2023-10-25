"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUniswapV2PlatformList = exports.sortTradesByExecutionPrice = void 0;
const routable_platform_1 = require("../routable-platform");
/**
 * Sort trades by price in descending order. Best trades are first.
 * @param trades list of trades
 * @returns sorted list of trades in descending order
 */
function sortTradesByExecutionPrice(trades) {
    return trades.sort((a, b) => {
        if (a === undefined || a === null) {
            return 1;
        }
        if (b === undefined || b === null) {
            return -1;
        }
        if (a.executionPrice.lessThan(b.executionPrice)) {
            return 1;
        }
        else if (a.executionPrice.equalTo(b.executionPrice)) {
            return 0;
        }
        else {
            return -1;
        }
    });
}
exports.sortTradesByExecutionPrice = sortTradesByExecutionPrice;
/**
 * List of Uniswap V2 platform that support current chain
 */
function getUniswapV2PlatformList(chainId) {
    return [
        routable_platform_1.UniswapV2RoutablePlatform.SWAPR,
        routable_platform_1.UniswapV2RoutablePlatform.SUSHISWAP,
        routable_platform_1.UniswapV2RoutablePlatform.HONEYSWAP,
        routable_platform_1.UniswapV2RoutablePlatform.LEVINSWAP,
        routable_platform_1.UniswapV2RoutablePlatform.DFYN,
        routable_platform_1.UniswapV2RoutablePlatform.QUICKSWAP,
        routable_platform_1.UniswapV2RoutablePlatform.PANCAKESWAP,
    ].filter((platform) => platform.supportsChain(chainId));
}
exports.getUniswapV2PlatformList = getUniswapV2PlatformList;
//# sourceMappingURL=utils.js.map