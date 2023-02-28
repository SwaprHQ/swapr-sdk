"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.approveAddressUrl = exports.generateApiRequestUrl = exports.RequestType = void 0;
const constants_1 = require("../constants");
const apiBaseUrl = (chainId) => 'https://api.1inch.io/v5.0/' + chainId;
var RequestType;
(function (RequestType) {
    RequestType["QUOTE"] = "/quote";
    RequestType["SWAP"] = "/swap";
})(RequestType = exports.RequestType || (exports.RequestType = {}));
//0.1% fee here is link to api https://docs.1inch.io/docs/aggregation-protocol/api/swap-params
const ONE_INCH_REFFERER_FEE = '0.1'; //MIN-> 0 MAX-> 3
function generateApiRequestUrl({ methodName, queryParams, chainId }) {
    var _a;
    if (constants_1.REFFERER_ADDRESS_CHAIN_MAPPING[chainId]) {
        queryParams.referrerAddress = (_a = constants_1.REFFERER_ADDRESS_CHAIN_MAPPING[chainId]) !== null && _a !== void 0 ? _a : '';
        queryParams.fee = ONE_INCH_REFFERER_FEE;
    }
    return apiBaseUrl(chainId) + methodName + '?' + new URLSearchParams(queryParams).toString();
}
exports.generateApiRequestUrl = generateApiRequestUrl;
function approveAddressUrl(chainId) {
    return apiBaseUrl(chainId) + '/approve/spender';
}
exports.approveAddressUrl = approveAddressUrl;
//# sourceMappingURL=api.js.map