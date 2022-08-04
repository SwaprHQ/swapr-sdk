"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UniswapV2RoutablePlatform = void 0;
const constants_1 = require("../../../constants");
const routable_platform_1 = require("./routable-platform");
const UNISWAP_FACTORY_ADDRESS = '0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f';
const SUSHISWAP_FACTORY_ADDRESS = {
    [constants_1.ChainId.MAINNET]: '0xC0AEe478e3658e2610c5F7A4A2E1777cE9e4f2Ac',
    [constants_1.ChainId.RINKEBY]: '0xc35DADB65012eC5796536bD9864eD8773aBc74C4',
    [constants_1.ChainId.XDAI]: '0xc35DADB65012eC5796536bD9864eD8773aBc74C4',
    [constants_1.ChainId.ARBITRUM_ONE]: '0xc35DADB65012eC5796536bD9864eD8773aBc74C4',
    [constants_1.ChainId.POLYGON]: '0xc35DADB65012eC5796536bD9864eD8773aBc74C4',
};
const HONEYSWAP_FACTORY_ADDRESS = '0xA818b4F111Ccac7AA31D0BCc0806d64F2E0737D7';
const BAOSWAP_FACTORY_ADDRESS = '0x45de240fbe2077dd3e711299538a09854fae9c9b';
const LEVINSWAP_FACTORY_ADDRESS = '0x965769C9CeA8A7667246058504dcdcDb1E2975A5';
const QUICKSWAP_FACTORY_ADDRESS = '0x5757371414417b8C6CAad45bAeF941aBc7d3Ab32';
const DFYN_FACTORY_ADDRESS = '0xE7Fb3e833eFE5F9c441105EB65Ef8b261266423B';
const UNISWAP_ROUTER_ADDRESS = '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D';
const SUSHISWAP_ROUTER_ADDRESS = {
    [constants_1.ChainId.MAINNET]: '0xd9e1cE17f2641f24aE83637ab66a2cca9C378B9F',
    [constants_1.ChainId.RINKEBY]: '0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506',
    [constants_1.ChainId.XDAI]: '0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506',
    [constants_1.ChainId.ARBITRUM_ONE]: '0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506',
    [constants_1.ChainId.POLYGON]: '0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506',
};
const HONEYSWAP_ROUTER_ADDRESS = '0x1C232F01118CB8B424793ae03F870aa7D0ac7f77';
const BAOSWAP_ROUTER_ADDRESS = '0x6093AeBAC87d62b1A5a4cEec91204e35020E38bE';
const LEVINSWAP_ROUTER_ADDRESS = '0xb18d4f69627F8320619A696202Ad2C430CeF7C53';
const QUICKSWAP_ROUTER_ADDRESS = '0xa5E0829CaCEd8fFDD4De3c43696c57F7D7A678ff';
const DFYN_ROUTER_ADDRESS = '0xA102072A4C07F06EC3B4900FDC4C7B80b6c57429';
/**
 * A platform to which Swapr can route through.
 */
class UniswapV2RoutablePlatform extends routable_platform_1.RoutablePlatform {
    constructor({ chainIds, name, factoryAddress, routerAddress, initCodeHash, defaultSwapFee, }) {
        super(chainIds, name);
        this.factoryAddress = factoryAddress;
        this.routerAddress = routerAddress;
        this.initCodeHash = initCodeHash;
        this.defaultSwapFee = defaultSwapFee;
    }
    supportsChain(chainId) {
        return !!this.factoryAddress[chainId] && !!this.routerAddress[chainId];
    }
}
exports.UniswapV2RoutablePlatform = UniswapV2RoutablePlatform;
UniswapV2RoutablePlatform.SWAPR = new UniswapV2RoutablePlatform({
    chainIds: [constants_1.ChainId.MAINNET, constants_1.ChainId.RINKEBY, constants_1.ChainId.ARBITRUM_ONE, constants_1.ChainId.ARBITRUM_RINKEBY, constants_1.ChainId.XDAI],
    name: 'Swapr',
    factoryAddress: constants_1.FACTORY_ADDRESS,
    routerAddress: constants_1.ROUTER_ADDRESS,
    initCodeHash: constants_1.INIT_CODE_HASH,
    defaultSwapFee: constants_1.defaultSwapFee,
});
UniswapV2RoutablePlatform.UNISWAP = new UniswapV2RoutablePlatform({
    chainIds: [constants_1.ChainId.MAINNET, constants_1.ChainId.RINKEBY],
    name: 'Uniswap v2',
    factoryAddress: { [constants_1.ChainId.MAINNET]: UNISWAP_FACTORY_ADDRESS, [constants_1.ChainId.RINKEBY]: UNISWAP_FACTORY_ADDRESS },
    routerAddress: { [constants_1.ChainId.MAINNET]: UNISWAP_ROUTER_ADDRESS, [constants_1.ChainId.RINKEBY]: UNISWAP_ROUTER_ADDRESS },
    initCodeHash: '0x96e8ac4277198ff8b6f785478aa9a39f403cb768dd02cbee326c3e7da348845f',
    defaultSwapFee: constants_1._30,
});
UniswapV2RoutablePlatform.SUSHISWAP = new UniswapV2RoutablePlatform({
    chainIds: [constants_1.ChainId.MAINNET, constants_1.ChainId.RINKEBY, constants_1.ChainId.POLYGON],
    name: 'Sushiswap',
    factoryAddress: SUSHISWAP_FACTORY_ADDRESS,
    routerAddress: SUSHISWAP_ROUTER_ADDRESS,
    initCodeHash: '0xe18a34eb0e04b04f7a0ac29a6e80748dca96319b42c54d679cb821dca90c6303',
    defaultSwapFee: constants_1._30,
});
UniswapV2RoutablePlatform.HONEYSWAP = new UniswapV2RoutablePlatform({
    chainIds: [constants_1.ChainId.XDAI],
    name: 'Honeyswap',
    factoryAddress: { [constants_1.ChainId.XDAI]: HONEYSWAP_FACTORY_ADDRESS },
    routerAddress: { [constants_1.ChainId.XDAI]: HONEYSWAP_ROUTER_ADDRESS },
    initCodeHash: '0x3f88503e8580ab941773b59034fb4b2a63e86dbc031b3633a925533ad3ed2b93',
    defaultSwapFee: constants_1._30,
});
UniswapV2RoutablePlatform.BAOSWAP = new UniswapV2RoutablePlatform({
    chainIds: [constants_1.ChainId.XDAI],
    name: 'Baoswap',
    factoryAddress: { [constants_1.ChainId.XDAI]: BAOSWAP_FACTORY_ADDRESS },
    routerAddress: { [constants_1.ChainId.XDAI]: BAOSWAP_ROUTER_ADDRESS },
    initCodeHash: '0x0bae3ead48c325ce433426d2e8e6b07dac10835baec21e163760682ea3d3520d',
    defaultSwapFee: constants_1._30,
});
UniswapV2RoutablePlatform.LEVINSWAP = new UniswapV2RoutablePlatform({
    chainIds: [constants_1.ChainId.XDAI],
    name: 'Levinswap',
    factoryAddress: { [constants_1.ChainId.XDAI]: LEVINSWAP_FACTORY_ADDRESS },
    routerAddress: { [constants_1.ChainId.XDAI]: LEVINSWAP_ROUTER_ADDRESS },
    initCodeHash: '0x4955fd9146732ca7a64d43c7a8d65fe6db1acca27e9c5b3bee7c3abe5849f441',
    defaultSwapFee: constants_1._30,
});
UniswapV2RoutablePlatform.QUICKSWAP = new UniswapV2RoutablePlatform({
    chainIds: [constants_1.ChainId.POLYGON],
    name: 'Quickswap',
    factoryAddress: { [constants_1.ChainId.POLYGON]: QUICKSWAP_FACTORY_ADDRESS },
    routerAddress: { [constants_1.ChainId.POLYGON]: QUICKSWAP_ROUTER_ADDRESS },
    initCodeHash: '0x96e8ac4277198ff8b6f785478aa9a39f403cb768dd02cbee326c3e7da348845f',
    defaultSwapFee: constants_1._30,
});
UniswapV2RoutablePlatform.DFYN = new UniswapV2RoutablePlatform({
    chainIds: [constants_1.ChainId.POLYGON],
    name: 'DFYN',
    factoryAddress: { [constants_1.ChainId.POLYGON]: DFYN_FACTORY_ADDRESS },
    routerAddress: { [constants_1.ChainId.POLYGON]: DFYN_ROUTER_ADDRESS },
    initCodeHash: '0xf187ed688403aa4f7acfada758d8d53698753b998a3071b06f1b777f4330eaf3',
    defaultSwapFee: constants_1._30,
});
//# sourceMappingURL=uniswap-v2-routable-platform.js.map