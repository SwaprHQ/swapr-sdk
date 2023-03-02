"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.approveAddressUrl = exports.generateApiRequestUrl = exports.RequestType = void 0;
const apiBaseUrl = (chainId) => 'https://api.1inch.io/v5.0/' + chainId;
var RequestType;
(function (RequestType) {
    RequestType["QUOTE"] = "/quote";
    RequestType["SWAP"] = "/swap";
})(RequestType = exports.RequestType || (exports.RequestType = {}));
function generateApiRequestUrl({ methodName, queryParams, chainId }) {
    return apiBaseUrl(chainId) + methodName + '?' + new URLSearchParams(queryParams).toString();
}
exports.generateApiRequestUrl = generateApiRequestUrl;
function approveAddressUrl(chainId) {
    return apiBaseUrl(chainId) + '/approve/spender';
}
exports.approveAddressUrl = approveAddressUrl;
//# sourceMappingURL=api.js.map