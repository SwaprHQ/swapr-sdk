"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WXDAI = exports.WMATIC = exports.WETH = exports.WBNB = exports.SWPR = exports.DXD = exports.CAKE = exports.BUSD = exports.ARB = exports.currencyEquals = exports.Token = void 0;
const tslib_1 = require("tslib");
const tiny_invariant_1 = tslib_1.__importDefault(require("tiny-invariant"));
const constants_1 = require("../constants");
const utils_1 = require("../utils");
const currency_1 = require("./currency");
/**
 * Represents an ERC20 token with a unique address and some metadata.
 */
class Token extends currency_1.Currency {
    constructor(chainId, address, decimals, symbol, name) {
        super(decimals, symbol, name);
        this.chainId = chainId;
        this.address = (0, utils_1.validateAndParseAddress)(address);
    }
    /**
     * Returns true if the two tokens are equivalent, i.e. have the same chainId and address.
     * @param other other token to compare
     */
    equals(other) {
        // short circuit on reference equality
        if (this === other) {
            return true;
        }
        return this.chainId === other.chainId && this.address === other.address;
    }
    /**
     * Returns true if the address of this token sorts before the address of the other token
     * @param other other token to compare
     * @throws if the tokens have the same address
     * @throws if the tokens are on different chains
     */
    sortsBefore(other) {
        (0, tiny_invariant_1.default)(this.chainId === other.chainId, 'CHAIN_IDS');
        (0, tiny_invariant_1.default)(this.address !== other.address, 'ADDRESSES');
        return this.address.toLowerCase() < other.address.toLowerCase();
    }
    static getNativeWrapper(chainId) {
        return Token.NATIVE_CURRENCY_WRAPPER[chainId];
    }
    static isNativeWrapper(token) {
        return Token.NATIVE_CURRENCY_WRAPPER[token.chainId].equals(token);
    }
}
exports.Token = Token;
Token.ARB = {
    /**
     * @see https://docs.arbitrum.foundation/deployment-addresses for token info
     */
    [constants_1.ChainId.ARBITRUM_GOERLI]: new Token(constants_1.ChainId.ARBITRUM_GOERLI, '0xF861378B543525ae0C47d33C90C954Dc774Ac1F9', 18, 'ARB', 'Arbitrum'),
    [constants_1.ChainId.ARBITRUM_ONE]: new Token(constants_1.ChainId.ARBITRUM_ONE, '0x912CE59144191C1204E64559FE8253a0e49E6548', 18, 'ARB', 'Arbitrum'),
    [constants_1.ChainId.MAINNET]: new Token(constants_1.ChainId.MAINNET, '0xB50721BCf8d664c30412Cfbc6cf7a15145234ad1', 18, 'ARB', 'Arbitrum'),
};
Token.BUSD = {
    [constants_1.ChainId.BSC_MAINNET]: new Token(constants_1.ChainId.BSC_MAINNET, '0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56', 18, 'BUSD', 'Binance-Peg BUSD Token'),
};
Token.CAKE = {
    [constants_1.ChainId.BSC_MAINNET]: new Token(constants_1.ChainId.BSC_MAINNET, '0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82', 18, 'CAKE', 'PancakeSwap Token'),
};
Token.DXD = {
    [constants_1.ChainId.ARBITRUM_GOERLI]: new Token(constants_1.ChainId.ARBITRUM_GOERLI, '0xCEf91E326978fEDbb14825E17DAFCa18508E6232', 18, 'DXD', 'DXdao'),
    [constants_1.ChainId.ARBITRUM_ONE]: new Token(constants_1.ChainId.ARBITRUM_ONE, '0xC3Ae0333F0F34aa734D5493276223d95B8F9Cb37', 18, 'DXD', 'DXdao'),
    [constants_1.ChainId.ARBITRUM_RINKEBY]: new Token(constants_1.ChainId.ARBITRUM_RINKEBY, '0x5d47100B0854525685907D5D773b92c22c0c745e', 18, 'DXD', 'DXdao'),
    [constants_1.ChainId.MAINNET]: new Token(constants_1.ChainId.MAINNET, '0xa1d65E8fB6e87b60FECCBc582F7f97804B725521', 18, 'DXD', 'DXdao'),
    [constants_1.ChainId.RINKEBY]: new Token(constants_1.ChainId.RINKEBY, '0x554898A0BF98aB0C03ff86C7DccBE29269cc4d29', 18, 'DXD', 'DXdao'),
    [constants_1.ChainId.XDAI]: new Token(constants_1.ChainId.XDAI, '0xb90D6bec20993Be5d72A5ab353343f7a0281f158', 18, 'DXD', 'DXdao from Ethereum'),
};
Token.SWPR = {
    [constants_1.ChainId.ARBITRUM_GOERLI]: new Token(constants_1.ChainId.ARBITRUM_GOERLI, '0x75902ae4D8AB92d38e20D65f758b03d595C0047B', 18, 'SWPR', 'Swapr'),
    [constants_1.ChainId.ARBITRUM_ONE]: new Token(constants_1.ChainId.ARBITRUM_ONE, '0xdE903E2712288A1dA82942DDdF2c20529565aC30', 18, 'SWPR', 'Swapr'),
    [constants_1.ChainId.ARBITRUM_RINKEBY]: new Token(constants_1.ChainId.ARBITRUM_RINKEBY, '0x8f2072c2142D9fFDc785955E0Ce71561753D44Fb', 18, 'SWPR', 'Swapr'),
    [constants_1.ChainId.GOERLI]: new Token(constants_1.ChainId.GOERLI, '0x2F9343Cf18BAAcF57AC4a4e20188b9b00CFce3f1', 18, 'SWPR', 'Swapr'),
    [constants_1.ChainId.MAINNET]: new Token(constants_1.ChainId.MAINNET, '0x6cAcDB97e3fC8136805a9E7c342d866ab77D0957', 18, 'SWPR', 'Swapr'),
    [constants_1.ChainId.RINKEBY]: new Token(constants_1.ChainId.RINKEBY, '0xDcb0BeB93139c3e5eD0Edb749baccADd6badAc4f', 18, 'SWPR', 'Swapr'),
    [constants_1.ChainId.XDAI]: new Token(constants_1.ChainId.XDAI, '0x532801ED6f82FFfD2DAB70A19fC2d7B2772C4f4b', 18, 'SWPR', 'Swapr'),
};
Token.WBNB = {
    [constants_1.ChainId.BSC_MAINNET]: new Token(constants_1.ChainId.BSC_MAINNET, '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c', 18, 'WBNB', 'Wrapped BNB'),
    [constants_1.ChainId.BSC_TESTNET]: new Token(constants_1.ChainId.BSC_TESTNET, '0x094616F0BdFB0b526bD735Bf66Eca0Ad254ca81F', 18, 'WBNB', 'Wrapped BNB'),
};
Token.WETH = {
    [constants_1.ChainId.ARBITRUM_GOERLI]: new Token(constants_1.ChainId.ARBITRUM_GOERLI, '0x89C0DBbF7559E200443735e113039cE5f1e0e6F0', 18, 'WETH', 'Wrapped Ether on Görli'),
    [constants_1.ChainId.ARBITRUM_ONE]: new Token(constants_1.ChainId.ARBITRUM_ONE, '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1', 18, 'WETH', 'Wrapped Ether'),
    [constants_1.ChainId.ARBITRUM_RINKEBY]: new Token(constants_1.ChainId.ARBITRUM_RINKEBY, '0xB47e6A5f8b33b3F17603C83a0535A9dcD7E32681', 18, 'WETH', 'Wrapped Ether'),
    [constants_1.ChainId.GOERLI]: new Token(constants_1.ChainId.GOERLI, '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', 18, 'WETH', 'Wrapped Ether on Görli'),
    [constants_1.ChainId.MAINNET]: new Token(constants_1.ChainId.MAINNET, '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', 18, 'WETH', 'Wrapped Ether'),
    [constants_1.ChainId.OPTIMISM_MAINNET]: new Token(constants_1.ChainId.OPTIMISM_MAINNET, '0x4200000000000000000000000000000000000006', 18, 'WETH', 'Wrapped Ether'),
    [constants_1.ChainId.POLYGON]: new Token(constants_1.ChainId.POLYGON, '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619', 18, 'WETH', 'Wrapped Ether on Polygon'),
    [constants_1.ChainId.RINKEBY]: new Token(constants_1.ChainId.RINKEBY, '0xc778417E063141139Fce010982780140Aa0cD5Ab', 18, 'WETH', 'Wrapped Ether'),
    [constants_1.ChainId.XDAI]: new Token(constants_1.ChainId.XDAI, '0x6A023CCd1ff6F2045C3309768eAd9E68F978f6e1', 18, 'WETH', 'Wrapped Ether on xDai'),
};
Token.WMATIC = {
    [constants_1.ChainId.POLYGON]: new Token(constants_1.ChainId.POLYGON, '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270', 18, 'WMATIC', 'Wrapped Matic'),
};
Token.WXDAI = {
    [constants_1.ChainId.XDAI]: new Token(constants_1.ChainId.XDAI, '0xe91D153E0b41518A2Ce8Dd3D7944Fa863463a97d', 18, 'WXDAI', 'Wrapped xDAI'),
};
Token.NATIVE_CURRENCY_WRAPPER = {
    [constants_1.ChainId.ARBITRUM_GOERLI]: Token.WETH[constants_1.ChainId.ARBITRUM_GOERLI],
    [constants_1.ChainId.ARBITRUM_ONE]: Token.WETH[constants_1.ChainId.ARBITRUM_ONE],
    [constants_1.ChainId.ARBITRUM_RINKEBY]: Token.WETH[constants_1.ChainId.ARBITRUM_RINKEBY],
    [constants_1.ChainId.BSC_MAINNET]: Token.WBNB[constants_1.ChainId.BSC_MAINNET],
    [constants_1.ChainId.BSC_TESTNET]: Token.WBNB[constants_1.ChainId.BSC_TESTNET],
    [constants_1.ChainId.GOERLI]: Token.WETH[constants_1.ChainId.GOERLI],
    [constants_1.ChainId.MAINNET]: Token.WETH[constants_1.ChainId.MAINNET],
    [constants_1.ChainId.OPTIMISM_GOERLI]: Token.WETH[constants_1.ChainId.OPTIMISM_MAINNET],
    [constants_1.ChainId.OPTIMISM_MAINNET]: Token.WETH[constants_1.ChainId.OPTIMISM_MAINNET],
    [constants_1.ChainId.POLYGON]: Token.WMATIC[constants_1.ChainId.POLYGON],
    [constants_1.ChainId.RINKEBY]: Token.WETH[constants_1.ChainId.RINKEBY],
    [constants_1.ChainId.XDAI]: Token.WXDAI[constants_1.ChainId.XDAI],
};
/**
 * Compares two currencies for equality
 */
function currencyEquals(currencyA, currencyB) {
    if (currencyA instanceof Token && currencyB instanceof Token) {
        return currencyA.equals(currencyB);
    }
    else if (currencyA instanceof Token) {
        return false;
    }
    else if (currencyB instanceof Token) {
        return false;
    }
    else {
        return currencyA === currencyB;
    }
}
exports.currencyEquals = currencyEquals;
// reexport for convenience
exports.ARB = Token.ARB;
exports.BUSD = Token.BUSD;
exports.CAKE = Token.CAKE;
exports.DXD = Token.DXD;
exports.SWPR = Token.SWPR;
exports.WBNB = Token.WBNB;
exports.WETH = Token.WETH;
exports.WMATIC = Token.WMATIC;
exports.WXDAI = Token.WXDAI;
//# sourceMappingURL=token.js.map