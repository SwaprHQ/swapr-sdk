"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ZERO_OX_REFFERER_FEE = exports.ZEROX_API_URL = void 0;
const chains_1 = require("../../../constants/chains");
/**
 * For API endpoints reference,
 * @see https://0x.org/docs/introduction/0x-cheat-sheet
 */
exports.ZEROX_API_URL = {
    [chains_1.ChainId.MAINNET]: 'https://api.0x.org/',
    [chains_1.ChainId.RINKEBY]: '',
    [chains_1.ChainId.ARBITRUM_ONE]: 'https://arbitrum.api.0x.org/',
    [chains_1.ChainId.ARBITRUM_RINKEBY]: '',
    [chains_1.ChainId.ARBITRUM_GOERLI]: '',
    [chains_1.ChainId.XDAI]: '',
    [chains_1.ChainId.POLYGON]: 'https://polygon.api.0x.org/',
    [chains_1.ChainId.GOERLI]: 'https://goerli.api.0x.org/',
    [chains_1.ChainId.OPTIMISM_MAINNET]: 'https://optimism.api.0x.org/',
    [chains_1.ChainId.OPTIMISM_GOERLI]: '',
    [chains_1.ChainId.BSC_MAINNET]: 'https://bsc.api.0x.org/',
    [chains_1.ChainId.BSC_TESTNET]: '',
    [chains_1.ChainId.ZK_SYNC_ERA_MAINNET]: '',
    [chains_1.ChainId.ZK_SYNC_ERA_TESTNET]: '',
};
//buyTOkenPercetageFee value
exports.ZERO_OX_REFFERER_FEE = '0'; //MIN-> 0. MAX-> 1 percent
//# sourceMappingURL=constants.js.map