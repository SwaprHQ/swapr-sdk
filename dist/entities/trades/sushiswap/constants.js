"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isRouteProcessor3_2ChainId = exports.ROUTE_PROCESSOR_3_2_ADDRESS = exports.ROUTE_PROCESSOR_3_2_SUPPORTED_CHAIN_IDS = exports.isRouteProcessor3_1ChainId = exports.ROUTE_PROCESSOR_3_1_ADDRESS = exports.ROUTE_PROCESSOR_3_1_SUPPORTED_CHAIN_IDS = exports.isRouteProcessor3ChainId = exports.ROUTE_PROCESSOR_3_ADDRESS = exports.ROUTE_PROCESSOR_3_SUPPORTED_CHAIN_IDS = void 0;
const constants_1 = require("../../../constants");
// v3
exports.ROUTE_PROCESSOR_3_SUPPORTED_CHAIN_IDS = [
    constants_1.ChainId.ARBITRUM_ONE,
    constants_1.ChainId.BSC_MAINNET,
    constants_1.ChainId.GNOSIS,
    constants_1.ChainId.MAINNET,
    constants_1.ChainId.OPTIMISM_MAINNET,
    constants_1.ChainId.POLYGON,
];
exports.ROUTE_PROCESSOR_3_ADDRESS = {
    [constants_1.ChainId.ARBITRUM_ONE]: '0xfc506AaA1340b4dedFfd88bE278bEe058952D674',
    [constants_1.ChainId.BSC_MAINNET]: '0x400d75dAb26bBc18D163AEA3e83D9Ea68F6c1804',
    [constants_1.ChainId.GNOSIS]: '0xBBDe1d67297329148Fe1ED5e6B00114842728e65',
    [constants_1.ChainId.MAINNET]: '0x827179dD56d07A7eeA32e3873493835da2866976',
    [constants_1.ChainId.OPTIMISM_MAINNET]: '0x4C5D5234f232BD2D76B96aA33F5AE4FCF0E4BFAb',
    [constants_1.ChainId.POLYGON]: '0x0a6e511Fe663827b9cA7e2D2542b20B37fC217A6',
};
const isRouteProcessor3ChainId = (chainId) => exports.ROUTE_PROCESSOR_3_SUPPORTED_CHAIN_IDS.includes(chainId);
exports.isRouteProcessor3ChainId = isRouteProcessor3ChainId;
// v3.1
exports.ROUTE_PROCESSOR_3_1_SUPPORTED_CHAIN_IDS = [constants_1.ChainId.ARBITRUM_ONE, constants_1.ChainId.MAINNET, constants_1.ChainId.POLYGON];
exports.ROUTE_PROCESSOR_3_1_ADDRESS = {
    [constants_1.ChainId.ARBITRUM_ONE]: '0x3c1fBA3bCEE7CE410B155a8C71F9fF1312852C82',
    [constants_1.ChainId.MAINNET]: '0x8516944E89f296eb6473d79aED1Ba12088016c9e',
    [constants_1.ChainId.POLYGON]: '0x9cfEAdcC38377283aDB944205c5238d04d4dD8A1',
};
const isRouteProcessor3_1ChainId = (chainId) => exports.ROUTE_PROCESSOR_3_1_SUPPORTED_CHAIN_IDS.includes(chainId);
exports.isRouteProcessor3_1ChainId = isRouteProcessor3_1ChainId;
// v3.2
exports.ROUTE_PROCESSOR_3_2_SUPPORTED_CHAIN_IDS = [
    constants_1.ChainId.ARBITRUM_ONE,
    constants_1.ChainId.BSC_MAINNET,
    constants_1.ChainId.GNOSIS,
    constants_1.ChainId.MAINNET,
    constants_1.ChainId.OPTIMISM_MAINNET,
    constants_1.ChainId.POLYGON,
];
exports.ROUTE_PROCESSOR_3_2_ADDRESS = {
    [constants_1.ChainId.ARBITRUM_ONE]: '0x09bD2A33c47746fF03b86BCe4E885D03C74a8E8C',
    [constants_1.ChainId.BSC_MAINNET]: '0xd36990D74b947eC4Ad9f52Fe3D49d14AdDB51E44',
    [constants_1.ChainId.GNOSIS]: '0x7A4af156379f512DE147ed3b96393047226d923F',
    [constants_1.ChainId.MAINNET]: '0x5550D13389bB70F45fCeF58f19f6b6e87F6e747d',
    [constants_1.ChainId.OPTIMISM_MAINNET]: '0xEb94EcA012eC0bbB254722FdDa2CE7475875A52B',
    [constants_1.ChainId.POLYGON]: '0xE7eb31f23A5BefEEFf76dbD2ED6AdC822568a5d2',
};
const isRouteProcessor3_2ChainId = (chainId) => exports.ROUTE_PROCESSOR_3_2_SUPPORTED_CHAIN_IDS.includes(chainId);
exports.isRouteProcessor3_2ChainId = isRouteProcessor3_2ChainId;
//# sourceMappingURL=constants.js.map