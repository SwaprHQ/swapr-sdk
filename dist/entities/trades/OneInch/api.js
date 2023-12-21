"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.approveAddressUrl = exports.generateApiRequestUrl = exports.RequestType = void 0;
const constants_1 = require("../constants");
var RequestType;
(function (RequestType) {
    RequestType["QUOTE"] = "/quote";
    RequestType["SWAP"] = "/swap";
})(RequestType = exports.RequestType || (exports.RequestType = {}));
var ApiName;
(function (ApiName) {
    ApiName["FUSION"] = "/fusion";
    ApiName["SPOT_PRICE"] = "/price";
    ApiName["SWAP"] = "/swap";
})(ApiName || (ApiName = {}));
var SubApiName;
(function (SubApiName) {
    SubApiName["ORDERS"] = "/orders";
    SubApiName["QUOTER"] = "/quoter";
    SubApiName["RELAYER"] = "/relayer";
})(SubApiName || (SubApiName = {}));
var ApiVersion;
(function (ApiVersion) {
    ApiVersion["FUSION"] = "/v1.0";
    ApiVersion["SPOT_PRICE"] = "/v1.1";
    ApiVersion["SWAP"] = "/v5.2";
})(ApiVersion || (ApiVersion = {}));
/**
 * @see https://portal.1inch.dev/documentation/swap/introduction
 */
const API_BASE_URL = (_a = process.env.REACT_APP_ONEINCH_BASE_API_URL) !== null && _a !== void 0 ? _a : 'https://api.1inch.dev/';
const ONE_INCH_REFFERER_FEE = '0'; //MIN-> 0 MAX-> 3
const getApiUrl = ({ apiName, apiVersion, chainId, subApiName = '' }) => `${API_BASE_URL}${apiName}${subApiName}${apiVersion}/${chainId}`;
function generateApiRequestUrl({ methodName, queryParams, chainId }) {
    var _a;
    if (constants_1.REFFERER_ADDRESS_CHAIN_MAPPING[chainId]) {
        queryParams.referrerAddress = (_a = constants_1.REFFERER_ADDRESS_CHAIN_MAPPING[chainId]) !== null && _a !== void 0 ? _a : '';
        queryParams.fee = ONE_INCH_REFFERER_FEE;
    }
    return (getApiUrl({ apiName: ApiName.SWAP, apiVersion: ApiVersion.SWAP, chainId }) +
        methodName +
        '?' +
        new URLSearchParams(queryParams).toString());
}
exports.generateApiRequestUrl = generateApiRequestUrl;
function approveAddressUrl(chainId) {
    return getApiUrl({ apiName: ApiName.SWAP, apiVersion: ApiVersion.SWAP, chainId }) + '/approve/spender';
}
exports.approveAddressUrl = approveAddressUrl;
//# sourceMappingURL=api.js.map