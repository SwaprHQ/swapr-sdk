"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ZEROX_API_URL = exports.CODE_TO_PLATFORM_NAME = void 0;
const chains_1 = require("../../../constants/chains");
/**
 * Platforms names
 */
exports.CODE_TO_PLATFORM_NAME = {
    Uniswap_V2: 'Uniswap v2',
    'Liquidity provider': 'LP',
    Balancer_V2: 'Balancer v2',
    DODO_V2: 'Dodo v2',
    Uniswap_V3: 'Uniswap v3',
    PancakeSwap_V2: 'PancakeSwap v2', // shouldn't be used since it's on BSC, but added to be extra sure
};
exports.ZEROX_API_URL = {
    [chains_1.ChainId.MAINNET]: 'https://api.0x.org/',
    [chains_1.ChainId.RINKEBY]: '',
    [chains_1.ChainId.ARBITRUM_ONE]: '',
    [chains_1.ChainId.ARBITRUM_RINKEBY]: '',
    [chains_1.ChainId.ARBITRUM_GOERLI]: '',
    [chains_1.ChainId.XDAI]: '',
    [chains_1.ChainId.POLYGON]: 'https://polygon.api.0x.org/',
    [chains_1.ChainId.GOERLI]: '',
    [chains_1.ChainId.OPTIMISM_MAINNET]: 'https://optimism.api.0x.org/',
    [chains_1.ChainId.OPTIMISM_GOERLI]: '',
    [chains_1.ChainId.BSC_MAINNET]: '',
    [chains_1.ChainId.BSC_TESTNET]: '',
};
//# sourceMappingURL=constants.js.map