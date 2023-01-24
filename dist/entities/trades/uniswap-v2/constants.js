"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BASES_TO_CHECK_TRADES_AGAINST = exports.GNO = exports.AGAVE = exports.BAO = exports.STAKE = exports.HONEY = exports.WBTC = exports.USDT = exports.USDC = exports.DAI = void 0;
const constants_1 = require("../../../constants");
const token_1 = require("../../token");
exports.DAI = {
    [constants_1.ChainId.MAINNET]: new token_1.Token(constants_1.ChainId.MAINNET, '0x6B175474E89094C44Da98b954EedeAC495271d0F', 18, 'DAI', 'Dai Stablecoin'),
    [constants_1.ChainId.POLYGON]: new token_1.Token(constants_1.ChainId.POLYGON, '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063', 18, 'DAI', 'Dai Stablecoin'),
    [constants_1.ChainId.ARBITRUM_ONE]: new token_1.Token(constants_1.ChainId.ARBITRUM_ONE, '0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1', 18, 'DAI', 'Dai Stablecoin'),
    [constants_1.ChainId.OPTIMISM_MAINNET]: new token_1.Token(constants_1.ChainId.OPTIMISM_MAINNET, '0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1', 18, 'DAI', 'Dai Stablecoin'),
    [constants_1.ChainId.BSC_MAINNET]: new token_1.Token(constants_1.ChainId.BSC_MAINNET, '0x1AF3F329e8BE154074D8769D1FFa4eE058B1DBc3', 18, 'DAI', 'Binance-Peg Dai Stablecoin'),
    [constants_1.ChainId.BSC_TESTNET]: new token_1.Token(constants_1.ChainId.BSC_TESTNET, '0xEC5dCb5Dbf4B114C9d0F65BcCAb49EC54F6A0867', 18, 'DAI', 'Dai Token'),
};
exports.USDC = {
    [constants_1.ChainId.MAINNET]: new token_1.Token(constants_1.ChainId.MAINNET, '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', 6, 'USDC', 'USD//C'),
    [constants_1.ChainId.ARBITRUM_ONE]: new token_1.Token(constants_1.ChainId.ARBITRUM_ONE, '0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8', 6, 'USDC', 'USD//C'),
    [constants_1.ChainId.XDAI]: new token_1.Token(constants_1.ChainId.XDAI, '0xDDAfbb505ad214D7b80b1f830fcCc89B60fb7A83', 6, 'USDC', 'USD//C from Ethereum'),
    [constants_1.ChainId.POLYGON]: new token_1.Token(constants_1.ChainId.POLYGON, '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174', 6, 'USDC', 'USD//C from Ethereum'),
    [constants_1.ChainId.OPTIMISM_MAINNET]: new token_1.Token(constants_1.ChainId.OPTIMISM_MAINNET, '0x7F5c764cBc14f9669B88837ca1490cCa17c31607', 6, 'USDC', 'USD Coin'),
    [constants_1.ChainId.BSC_MAINNET]: new token_1.Token(constants_1.ChainId.BSC_MAINNET, '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d', 18, 'USDC', 'Binance-Peg USD Coin'),
    [constants_1.ChainId.BSC_TESTNET]: new token_1.Token(constants_1.ChainId.BSC_TESTNET, '0x64544969ed7EBf5f083679233325356EbE738930', 6, 'USDC', 'USDC Token'),
};
exports.USDT = {
    [constants_1.ChainId.MAINNET]: new token_1.Token(constants_1.ChainId.MAINNET, '0xdAC17F958D2ee523a2206206994597C13D831ec7', 6, 'USDT', 'Tether USD'),
    [constants_1.ChainId.XDAI]: new token_1.Token(constants_1.ChainId.XDAI, '0x4ECaBa5870353805a9F068101A40E0f32ed605C6', 6, 'USDT', 'Tether USD from Ethereum'),
    [constants_1.ChainId.ARBITRUM_ONE]: new token_1.Token(constants_1.ChainId.ARBITRUM_ONE, '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9', 6, 'USDT', 'Tether USD'),
    [constants_1.ChainId.POLYGON]: new token_1.Token(constants_1.ChainId.POLYGON, '0xc2132D05D31c914a87C6611C10748AEb04B58e8F', 6, 'USDT', 'Tether USD'),
    [constants_1.ChainId.OPTIMISM_MAINNET]: new token_1.Token(constants_1.ChainId.OPTIMISM_MAINNET, '0x94b008aA00579c1307B0EF2c499aD98a8ce58e58', 6, 'USDT', 'Tether USD'),
    [constants_1.ChainId.BSC_MAINNET]: new token_1.Token(constants_1.ChainId.BSC_MAINNET, '0x55d398326f99059fF775485246999027B3197955', 18, 'USDT', 'Binance-Peg BSC-USD'),
    [constants_1.ChainId.BSC_TESTNET]: new token_1.Token(constants_1.ChainId.BSC_TESTNET, '0x337610d27c682E347C9cD60BD4b3b107C9d34dDd', 6, 'USDT', 'USDT Token'),
};
exports.WBTC = {
    [constants_1.ChainId.MAINNET]: new token_1.Token(constants_1.ChainId.MAINNET, '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599', 8, 'WBTC', 'Wrapped BTC'),
    [constants_1.ChainId.ARBITRUM_ONE]: new token_1.Token(constants_1.ChainId.ARBITRUM_ONE, '0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f', 8, 'WBTC', 'Wrapped BTC'),
    [constants_1.ChainId.XDAI]: new token_1.Token(constants_1.ChainId.XDAI, '0x8e5bBbb09Ed1ebdE8674Cda39A0c169401db4252', 8, 'WBTC', 'Wrapped BTC from Ethereum'),
    [constants_1.ChainId.POLYGON]: new token_1.Token(constants_1.ChainId.POLYGON, '0x1BFD67037B42Cf73acF2047067bd4F2C47D9BfD6', 8, 'WBTC', 'Wrapped BTC from Ethereum'),
    [constants_1.ChainId.OPTIMISM_MAINNET]: new token_1.Token(constants_1.ChainId.OPTIMISM_MAINNET, '0x68f180fcCe6836688e9084f035309E29Bf0A2095', 8, 'WBTC', 'Wrapped BTC'),
};
exports.HONEY = new token_1.Token(constants_1.ChainId.XDAI, '0x71850b7E9Ee3f13Ab46d67167341E4bDc905Eef9', 18, 'HNY', 'Honey');
exports.STAKE = new token_1.Token(constants_1.ChainId.XDAI, '0xb7D311E2Eb55F2f68a9440da38e7989210b9A05e', 18, 'STAKE', 'Stake Token on xDai');
exports.BAO = new token_1.Token(constants_1.ChainId.XDAI, '0x82dFe19164729949fD66Da1a37BC70dD6c4746ce', 18, 'BAO', 'BaoToken from Ethereum');
exports.AGAVE = new token_1.Token(constants_1.ChainId.XDAI, '0x3a97704a1b25F08aa230ae53B352e2e72ef52843', 18, 'AGVE', 'Agave token');
exports.GNO = new token_1.Token(constants_1.ChainId.XDAI, '0x9C58BAcC331c9aa871AFD802DB6379a98e80CEdb', 18, 'GNO', 'Gnosis Token');
// used to construct intermediary pairs for trading
exports.BASES_TO_CHECK_TRADES_AGAINST = {
    [constants_1.ChainId.MAINNET]: [
        token_1.WETH[constants_1.ChainId.MAINNET],
        token_1.DXD[constants_1.ChainId.MAINNET],
        exports.DAI[constants_1.ChainId.MAINNET],
        exports.USDC[constants_1.ChainId.MAINNET],
        exports.WBTC[constants_1.ChainId.MAINNET],
        exports.USDT[constants_1.ChainId.MAINNET],
    ],
    [constants_1.ChainId.RINKEBY]: [token_1.WETH[constants_1.ChainId.RINKEBY]],
    [constants_1.ChainId.ARBITRUM_ONE]: [
        token_1.WETH[constants_1.ChainId.ARBITRUM_ONE],
        token_1.DXD[constants_1.ChainId.ARBITRUM_ONE],
        exports.USDC[constants_1.ChainId.ARBITRUM_ONE],
        exports.WBTC[constants_1.ChainId.ARBITRUM_ONE],
        exports.USDT[constants_1.ChainId.ARBITRUM_ONE],
    ],
    [constants_1.ChainId.ARBITRUM_RINKEBY]: [token_1.WETH[constants_1.ChainId.ARBITRUM_RINKEBY], token_1.DXD[constants_1.ChainId.ARBITRUM_RINKEBY]],
    [constants_1.ChainId.ARBITRUM_GOERLI]: [token_1.WETH[constants_1.ChainId.ARBITRUM_GOERLI]],
    [constants_1.ChainId.XDAI]: [
        token_1.WXDAI[constants_1.ChainId.XDAI],
        token_1.WETH[constants_1.ChainId.XDAI],
        token_1.DXD[constants_1.ChainId.XDAI],
        exports.USDC[constants_1.ChainId.XDAI],
        exports.USDT[constants_1.ChainId.XDAI],
        exports.WBTC[constants_1.ChainId.XDAI],
        exports.HONEY,
        exports.STAKE,
        exports.AGAVE,
        exports.BAO,
        exports.GNO,
    ],
    [constants_1.ChainId.POLYGON]: [token_1.WMATIC[constants_1.ChainId.POLYGON], exports.WBTC[constants_1.ChainId.POLYGON], exports.USDC[constants_1.ChainId.POLYGON], exports.USDT[constants_1.ChainId.POLYGON]],
    [constants_1.ChainId.GOERLI]: [token_1.WETH[constants_1.ChainId.GOERLI]],
    [constants_1.ChainId.OPTIMISM_MAINNET]: [
        token_1.WETH[constants_1.ChainId.OPTIMISM_MAINNET],
        exports.USDC[constants_1.ChainId.OPTIMISM_MAINNET],
        exports.USDT[constants_1.ChainId.OPTIMISM_MAINNET],
        exports.WBTC[constants_1.ChainId.OPTIMISM_MAINNET],
        exports.DAI[constants_1.ChainId.OPTIMISM_MAINNET],
    ],
    [constants_1.ChainId.OPTIMISM_GOERLI]: [token_1.WETH[constants_1.ChainId.OPTIMISM_GOERLI]],
    [constants_1.ChainId.BSC_MAINNET]: [
        token_1.WBNB[constants_1.ChainId.BSC_MAINNET],
        exports.DAI[constants_1.ChainId.BSC_MAINNET],
        exports.USDT[constants_1.ChainId.BSC_MAINNET],
        exports.USDC[constants_1.ChainId.BSC_MAINNET],
    ],
    [constants_1.ChainId.BSC_TESTNET]: [exports.DAI[constants_1.ChainId.BSC_TESTNET], exports.USDT[constants_1.ChainId.BSC_TESTNET], exports.USDC[constants_1.ChainId.BSC_TESTNET]],
};
//# sourceMappingURL=constants.js.map