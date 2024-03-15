"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBaseUrlWithChainCode = exports.OO_API_ENDPOINTS = exports.OO_API_BASE_URL = void 0;
// export const OO_API_BASE_URL = 'https://open-api.openocean.finance/v3'
exports.OO_API_BASE_URL = 'https://ethapi.openocean.finance/v2';
var OO_API_ENDPOINTS;
(function (OO_API_ENDPOINTS) {
    OO_API_ENDPOINTS["GET_GAS"] = "gasPrice";
    OO_API_ENDPOINTS["GAS_PRICE"] = "gas-price";
    OO_API_ENDPOINTS["QUOTE"] = "quote";
    OO_API_ENDPOINTS["SWAP_QUOTE"] = "swap_quote";
    OO_API_ENDPOINTS["SWAP"] = "swap";
})(OO_API_ENDPOINTS = exports.OO_API_ENDPOINTS || (exports.OO_API_ENDPOINTS = {}));
/**
 * @see https://docs.openocean.finance/dev/supported-chains
 */
// const OO_API_CHAIN_CODE = {
//   [ChainId.ARBITRUM_ONE]: 'arbitrum',
//   [ChainId.BSC_MAINNET]: 'bsc',
//   [ChainId.GNOSIS]: 'xdai',
//   [ChainId.MAINNET]: 'eth',
//   [ChainId.OPTIMISM_MAINNET]: 'optimism',
//   [ChainId.POLYGON]: 'polygon',
//   [ChainId.SCROLL_MAINNET]: 'scroll',
//   [ChainId.ZK_SYNC_ERA_MAINNET]: 'zksync',
// }
const getBaseUrlWithChainCode = (chainId) => {
    // const API_CHAIN_CODE = OO_API_CHAIN_CODE[chainId]
    return `${exports.OO_API_BASE_URL}/${chainId}`;
    // return `${OO_API_BASE_URL}/${API_CHAIN_CODE}`
};
exports.getBaseUrlWithChainCode = getBaseUrlWithChainCode;
//# sourceMappingURL=api.js.map