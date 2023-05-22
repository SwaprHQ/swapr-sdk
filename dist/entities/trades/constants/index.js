"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.REFFERER_ADDRESS_CHAIN_MAPPING = exports.maximumSlippage = void 0;
const constants_1 = require("../../../constants");
const fractions_1 = require("../../../entities/fractions");
/**
 * Default maximum slippage tolerance at 3%
 */
exports.maximumSlippage = new fractions_1.Percent('3', '100');
exports.REFFERER_ADDRESS_CHAIN_MAPPING = {
    [constants_1.ChainId.MAINNET]: '0x424F2fc764aFFaE340021d65EF0343af1847Cf1d',
    [constants_1.ChainId.POLYGON]: '0x6810B7D3FEF83A37fF39501d03A42d9f57DF1df1',
    [constants_1.ChainId.ARBITRUM_ONE]: '0x654a8A1B2ee4F0B4470c5C7db9794664BA70E076',
    [constants_1.ChainId.BSC_MAINNET]: '0x09D4B6C9c1Cb8Cf2d49C928d0109ba19931eC3c2',
    [constants_1.ChainId.OPTIMISM_MAINNET]: '0x78C90A9f0e457278350D8BFfb4ee8be28238f891',
    [constants_1.ChainId.GNOSIS]: '0xfe0da679F5DC5732CF6E6522026B7f2ea2856597',
};
//# sourceMappingURL=index.js.map