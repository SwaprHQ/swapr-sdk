"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUniswapNativeCurrency = void 0;
const tslib_1 = require("tslib");
const sdk_core_1 = require("@uniswap/sdk-core");
const smart_order_router_1 = require("@uniswap/smart-order-router");
const tiny_invariant_1 = tslib_1.__importDefault(require("tiny-invariant"));
function isMatic(chainId) {
    return chainId === smart_order_router_1.ChainId.POLYGON_MUMBAI || chainId === smart_order_router_1.ChainId.POLYGON;
}
class MaticNativeCurrency extends sdk_core_1.NativeCurrency {
    equals(other) {
        return other.isNative && other.chainId === this.chainId;
    }
    get wrapped() {
        if (!isMatic(this.chainId))
            throw new Error('Not matic');
        const wrapped = smart_order_router_1.WRAPPED_NATIVE_CURRENCY[this.chainId];
        (0, tiny_invariant_1.default)(wrapped instanceof sdk_core_1.Token);
        return wrapped;
    }
    constructor(chainId) {
        if (!isMatic(chainId))
            throw new Error('Not matic');
        super(chainId, 18, 'MATIC', 'Polygon Matic');
    }
}
function getUniswapNativeCurrency(chainId) {
    if (isMatic(chainId)) {
        return new MaticNativeCurrency(chainId);
    }
    else {
        return sdk_core_1.Ether.onChain(chainId);
    }
}
exports.getUniswapNativeCurrency = getUniswapNativeCurrency;
//# sourceMappingURL=nativeCurrency.js.map