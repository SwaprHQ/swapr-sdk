"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fee = exports.ZEROX_API_URL = void 0;
const chains_1 = require("../../../constants/chains");
exports.ZEROX_API_URL = {
    [chains_1.ChainId.MAINNET]: 'https://api.0x.org/',
    [chains_1.ChainId.RINKEBY]: '',
    [chains_1.ChainId.ARBITRUM_ONE]: 'https://arbitrum.api.0x.org/',
    [chains_1.ChainId.ARBITRUM_RINKEBY]: '',
    [chains_1.ChainId.ARBITRUM_GOERLI]: '',
    [chains_1.ChainId.XDAI]: '',
    [chains_1.ChainId.POLYGON]: 'https://polygon.api.0x.org/',
    [chains_1.ChainId.GOERLI]: '',
    [chains_1.ChainId.OPTIMISM_MAINNET]: 'https://optimism.api.0x.org/',
    [chains_1.ChainId.OPTIMISM_GOERLI]: '',
    [chains_1.ChainId.BSC_MAINNET]: 'https://bsc.api.0x.org/',
    [chains_1.ChainId.BSC_TESTNET]: '',
};
//API DOCS TO REFRENCE THIS https://docs.0x.org/0x-api-swap/api-references/get-swap-v1-quote
//buyTOkenPercetageFee value
exports.fee = '0'; //MIN-> 0. MAX-> 1 percent
//# sourceMappingURL=constants.js.map