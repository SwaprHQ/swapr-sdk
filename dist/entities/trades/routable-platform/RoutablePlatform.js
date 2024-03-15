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
RoutablePlatform.ZEROX = new RoutablePlatform([constants_1.ChainId.MAINNET, constants_1.ChainId.POLYGON, constants_1.ChainId.ARBITRUM_ONE, constants_1.ChainId.BSC_MAINNET, constants_1.ChainId.OPTIMISM_MAINNET], '0x');
RoutablePlatform.ONE_INCH = new RoutablePlatform([
    constants_1.ChainId.MAINNET,
    constants_1.ChainId.ARBITRUM_ONE,
    constants_1.ChainId.POLYGON,
    constants_1.ChainId.OPTIMISM_MAINNET,
    constants_1.ChainId.GNOSIS,
    constants_1.ChainId.BSC_MAINNET,
    constants_1.ChainId.ZK_SYNC_ERA_MAINNET,
], '1Inch');
RoutablePlatform.COW = new RoutablePlatform([constants_1.ChainId.MAINNET, constants_1.ChainId.GNOSIS], 'CoW');
RoutablePlatform.CURVE = new RoutablePlatform([constants_1.ChainId.MAINNET, constants_1.ChainId.ARBITRUM_ONE, constants_1.ChainId.GNOSIS], 'Curve');
/**
 * @deprecated Use {@link RoutablePlatform.COW} instead.
 */
RoutablePlatform.GNOSIS_PROTOCOL = new RoutablePlatform([constants_1.ChainId.MAINNET, constants_1.ChainId.GNOSIS], 'CoW');
RoutablePlatform.UNISWAP = new RoutablePlatform([constants_1.ChainId.MAINNET, constants_1.ChainId.ARBITRUM_ONE, constants_1.ChainId.POLYGON, constants_1.ChainId.OPTIMISM_MAINNET], 'Uniswap');
RoutablePlatform.VELODROME = new RoutablePlatform([constants_1.ChainId.OPTIMISM_MAINNET], 'Velodrome');
RoutablePlatform.SWAPR_V3 = new RoutablePlatform([constants_1.ChainId.GNOSIS], 'Swapr V3');
RoutablePlatform.SUSHISWAP = new RoutablePlatform([
    constants_1.ChainId.ARBITRUM_ONE,
    constants_1.ChainId.BSC_MAINNET,
    constants_1.ChainId.GNOSIS,
    constants_1.ChainId.MAINNET,
    constants_1.ChainId.POLYGON,
    constants_1.ChainId.OPTIMISM_MAINNET,
    constants_1.ChainId.SCROLL_MAINNET,
], 'Sushiswap');
RoutablePlatform.OPENOCEAN = new RoutablePlatform([
    constants_1.ChainId.ARBITRUM_ONE,
    constants_1.ChainId.BSC_MAINNET,
    constants_1.ChainId.GNOSIS,
    constants_1.ChainId.MAINNET,
    constants_1.ChainId.OPTIMISM_MAINNET,
    constants_1.ChainId.POLYGON,
    constants_1.ChainId.SCROLL_MAINNET,
    constants_1.ChainId.ZK_SYNC_ERA_MAINNET,
], 'OpenOcean');
//# sourceMappingURL=RoutablePlatform.js.map