"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChainId = void 0;
/**
 * Chain Id
 */
var ChainId;
(function (ChainId) {
    ChainId[ChainId["MAINNET"] = 1] = "MAINNET";
    /**
     * @deprecated Use GOERLI instead
     */
    ChainId[ChainId["RINKEBY"] = 4] = "RINKEBY";
    ChainId[ChainId["GOERLI"] = 5] = "GOERLI";
    /**
     * @deprecated Use GNOSIS instead
     */
    ChainId[ChainId["XDAI"] = 100] = "XDAI";
    ChainId[ChainId["GNOSIS"] = 100] = "GNOSIS";
    ChainId[ChainId["POLYGON"] = 137] = "POLYGON";
    ChainId[ChainId["ARBITRUM_ONE"] = 42161] = "ARBITRUM_ONE";
    ChainId[ChainId["ARBITRUM_RINKEBY"] = 421611] = "ARBITRUM_RINKEBY";
    ChainId[ChainId["ARBITRUM_GOERLI"] = 421613] = "ARBITRUM_GOERLI";
    /**
     * Optimism Mainnet
     */
    ChainId[ChainId["OPTIMISM_MAINNET"] = 10] = "OPTIMISM_MAINNET";
    /**
     * Optimism Göerli
     */
    ChainId[ChainId["OPTIMISM_GOERLI"] = 420] = "OPTIMISM_GOERLI";
    ChainId[ChainId["BSC_MAINNET"] = 56] = "BSC_MAINNET";
    ChainId[ChainId["BSC_TESTNET"] = 97] = "BSC_TESTNET";
})(ChainId = exports.ChainId || (exports.ChainId = {}));
//# sourceMappingURL=chains.js.map