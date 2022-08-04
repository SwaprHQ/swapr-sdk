"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoutablePlatform = void 0;
const constants_1 = require("../../../constants");
/**
 * A platform to which Swapr can route through.
 */
class RoutablePlatform {
    constructor(chainIds, name) {
        this.chainIds = chainIds;
        this.name = name;
    }
    supportsChain(chainId) {
        return this.chainIds.indexOf(chainId) >= 0;
    }
}
exports.RoutablePlatform = RoutablePlatform;
RoutablePlatform.ZEROX = new RoutablePlatform([constants_1.ChainId.MAINNET], '0x');
RoutablePlatform.CURVE = new RoutablePlatform([constants_1.ChainId.MAINNET, constants_1.ChainId.ARBITRUM_ONE, constants_1.ChainId.XDAI], 'Curve');
RoutablePlatform.GNOSIS_PROTOCOL = new RoutablePlatform([constants_1.ChainId.MAINNET, constants_1.ChainId.XDAI], 'COW');
RoutablePlatform.UNISWAP = new RoutablePlatform([constants_1.ChainId.MAINNET, constants_1.ChainId.ARBITRUM_ONE, constants_1.ChainId.POLYGON], 'Uniswap');
//# sourceMappingURL=routable-platform.js.map