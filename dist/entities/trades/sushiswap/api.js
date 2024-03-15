"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getApiVersion = exports.SWAP_BASE_URL = void 0;
const constants_1 = require("./constants");
exports.SWAP_BASE_URL = 'https://production.sushi.com/swap';
const getApiVersion = (chainId) => {
    if ((0, constants_1.isRouteProcessor3_2ChainId)(chainId)) {
        return '/v3.2';
    }
    if ((0, constants_1.isRouteProcessor3_1ChainId)(chainId)) {
        return '/v3.1';
    }
    return '';
};
exports.getApiVersion = getApiVersion;
//# sourceMappingURL=api.js.map