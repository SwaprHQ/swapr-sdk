"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoutablePlatform = void 0;
const constants_1 = require("../../../constants");
const BaseRoutablePlatform_1 = require("./BaseRoutablePlatform");
/**
 * A platform to which Swapr can route through.
 */
class RoutablePlatform extends BaseRoutablePlatform_1.BaseRoutablePlatform {
}
exports.RoutablePlatform = RoutablePlatform;
RoutablePlatform.ZEROX = new RoutablePlatform([constants_1.ChainId.MAINNET, constants_1.ChainId.POLYGON], '0x');
RoutablePlatform.CURVE = new RoutablePlatform([constants_1.ChainId.MAINNET, constants_1.ChainId.ARBITRUM_ONE, constants_1.ChainId.XDAI], 'Curve');
RoutablePlatform.VELODROME = new RoutablePlatform([constants_1.ChainId.OPTIMISM_MAINNET], 'Velodrome');
/**
 * @deprecated Use {@link RoutablePlatform.COW} instead.
 */
RoutablePlatform.GNOSIS_PROTOCOL = new RoutablePlatform([constants_1.ChainId.MAINNET, constants_1.ChainId.XDAI], 'CoW');
RoutablePlatform.COW = new RoutablePlatform([constants_1.ChainId.MAINNET, constants_1.ChainId.XDAI], 'CoW');
RoutablePlatform.UNISWAP = new RoutablePlatform([constants_1.ChainId.MAINNET, constants_1.ChainId.ARBITRUM_ONE, constants_1.ChainId.POLYGON, constants_1.ChainId.OPTIMISM_MAINNET], 'Uniswap');
//# sourceMappingURL=RoutablePlatform.js.map