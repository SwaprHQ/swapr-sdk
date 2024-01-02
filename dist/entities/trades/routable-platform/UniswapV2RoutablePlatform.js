"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UniswapV2RoutablePlatform = void 0;
const constants_1 = require("@ethersproject/constants");
const constants_2 = require("../../../constants");
const BaseRoutablePlatform_1 = require("./BaseRoutablePlatform");
const BAOSWAP_FACTORY_ADDRESS = '0x45de240fbe2077dd3e711299538a09854fae9c9b';
const BISWAP_FACTORY_ADDRESS = { [constants_2.ChainId.BSC_MAINNET]: '0x858E3312ed3A876947EA49d572A7C42DE08af7EE' };
const DFYN_FACTORY_ADDRESS = '0xE7Fb3e833eFE5F9c441105EB65Ef8b261266423B';
const HONEYSWAP_FACTORY_ADDRESS = '0xA818b4F111Ccac7AA31D0BCc0806d64F2E0737D7';
const LEVINSWAP_FACTORY_ADDRESS = '0x965769C9CeA8A7667246058504dcdcDb1E2975A5';
const PANCAKESWAP_FACTORY_ADDRESS = { [constants_2.ChainId.BSC_MAINNET]: '0xcA143Ce32Fe78f1f7019d7d551a6402fC5350c73' };
const QUICKSWAP_FACTORY_ADDRESS = '0x5757371414417b8C6CAad45bAeF941aBc7d3Ab32';
/**
 * @see https://github.com/sushiswap/v3-periphery/tree/master/deployments
 */
const SUSHISWAP_FACTORY_ADDRESS = {
    [constants_2.ChainId.ARBITRUM_ONE]: '0x1af415a1EbA07a4986a52B6f2e7dE7003D82231e',
    [constants_2.ChainId.BSC_MAINNET]: '0x126555dd55a39328F69400d6aE4F782Bd4C34ABb',
    [constants_2.ChainId.GNOSIS]: '0xf78031CBCA409F2FB6876BDFDBc1b2df24cF9bEf',
    [constants_2.ChainId.MAINNET]: '0xbACEB8eC6b9355Dfc0269C18bac9d6E2Bdc29C4F',
    [constants_2.ChainId.OPTIMISM_MAINNET]: '0x9c6522117e2ed1fE5bdb72bb0eD5E3f2bdE7DBe0',
    [constants_2.ChainId.POLYGON]: '0x917933899c6a5F8E37F31E19f92CdBFF7e8FF0e2',
};
const UNISWAP_FACTORY_ADDRESS = '0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f';
const BAOSWAP_ROUTER_ADDRESS = '0x6093AeBAC87d62b1A5a4cEec91204e35020E38bE';
const BISWAP_ROUTER_ADDRESS = { [constants_2.ChainId.BSC_MAINNET]: '0x3a6d8cA21D1CF76F653A67577FA0D27453350dD8' };
const DFYN_ROUTER_ADDRESS = '0xA102072A4C07F06EC3B4900FDC4C7B80b6c57429';
const HONEYSWAP_ROUTER_ADDRESS = '0x1C232F01118CB8B424793ae03F870aa7D0ac7f77';
const LEVINSWAP_ROUTER_ADDRESS = '0xb18d4f69627F8320619A696202Ad2C430CeF7C53';
const PANCAKESWAP_ROUTER_ADDRESS = { [constants_2.ChainId.BSC_MAINNET]: '0x10ED43C718714eb63d5aA57B78B54704E256024E' };
const QUICKSWAP_ROUTER_ADDRESS = '0xa5E0829CaCEd8fFDD4De3c43696c57F7D7A678ff';
/**
 * @see https://github.com/sushiswap/v3-periphery/tree/master/deployments
 */
const SUSHISWAP_ROUTER_ADDRESS = {
    [constants_2.ChainId.ARBITRUM_ONE]: '0x8A21F6768C1f8075791D08546Dadf6daA0bE820c',
    [constants_2.ChainId.BSC_MAINNET]: '0x909662a99605382dB1E8d69cc1f182bb577d9038',
    [constants_2.ChainId.GNOSIS]: '0x4F54dd2F4f30347d841b7783aD08c050d8410a9d',
    [constants_2.ChainId.MAINNET]: '0x2E6cd2d30aa43f40aa81619ff4b6E0a41479B13F',
    [constants_2.ChainId.OPTIMISM_MAINNET]: '0x8c32Fd078B89Eccb06B40289A539D84A4aA9FDA6',
    [constants_2.ChainId.POLYGON]: '0x0aF89E1620b96170e2a9D0b68fEebb767eD044c3',
};
const UNISWAP_ROUTER_ADDRESS = '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D';
/**
 * A Uniswap V2 platform to which Swapr can route through.
 */
class UniswapV2RoutablePlatform extends BaseRoutablePlatform_1.BaseRoutablePlatform {
    /**
     * Create a new UniswapV2RoutablePlatform instance.
     */
    constructor({ chainIds, name, factoryAddress, routerAddress, initCodeHash, defaultSwapFee, subgraphEndpoint, }) {
        super(chainIds, name);
        this.factoryAddress = factoryAddress;
        this.routerAddress = routerAddress;
        this.initCodeHash = initCodeHash;
        this.defaultSwapFee = defaultSwapFee;
        this.subgraphEndpoint = subgraphEndpoint || {};
    }
    /**
     * Check if the platform supports the given chain
     * @param chainId The chainId of the desired platform
     * @returns Whether the platform supports the given chain
     */
    supportsChain(chainId) {
        return (this.chainIds.includes(chainId) &&
            this.factoryAddress[chainId] !== constants_1.AddressZero &&
            this.routerAddress[chainId] !== constants_1.AddressZero);
    }
}
exports.UniswapV2RoutablePlatform = UniswapV2RoutablePlatform;
UniswapV2RoutablePlatform.BAOSWAP = new UniswapV2RoutablePlatform({
    chainIds: [constants_2.ChainId.XDAI],
    name: 'Baoswap',
    factoryAddress: {
        [constants_2.ChainId.XDAI]: BAOSWAP_FACTORY_ADDRESS,
    },
    routerAddress: {
        [constants_2.ChainId.XDAI]: BAOSWAP_ROUTER_ADDRESS,
    },
    initCodeHash: '0x0bae3ead48c325ce433426d2e8e6b07dac10835baec21e163760682ea3d3520d',
    defaultSwapFee: constants_2._30,
});
/**
 * @see https://docs.biswap.org/biswap/general-information/biswap-smart-contracts for smart contract info
 * @see https://bscscan.com/address/0x858E3312ed3A876947EA49d572A7C42DE08af7EE#readContract (Factor address) for INIT_CODE_HASH
 * @see https://github.com/biswap-org/core/blob/78a67b2bf9dccc551adf91b0529aec6df9eb9b27/contracts/BiswapPair.sol#L29 for swapFee default value
 * @see https://thegraph.com/hosted-service/subgraph/unchase/biswap for Subraph Endpoint
 */
UniswapV2RoutablePlatform.BISWAP = new UniswapV2RoutablePlatform({
    chainIds: [constants_2.ChainId.BSC_MAINNET],
    name: 'Biswap',
    factoryAddress: BISWAP_FACTORY_ADDRESS,
    routerAddress: BISWAP_ROUTER_ADDRESS,
    initCodeHash: '0xfea293c909d87cd4153593f077b76bb7e94340200f4ee84211ae8e4f9bd7ffdf',
    defaultSwapFee: constants_2.TEN,
    subgraphEndpoint: {
        [constants_2.ChainId.BSC_MAINNET]: 'https://api.thegraph.com/subgraphs/name/unchase/biswap',
    },
});
UniswapV2RoutablePlatform.DFYN = new UniswapV2RoutablePlatform({
    chainIds: [constants_2.ChainId.POLYGON],
    name: 'DFYN',
    factoryAddress: {
        [constants_2.ChainId.POLYGON]: DFYN_FACTORY_ADDRESS,
    },
    routerAddress: {
        [constants_2.ChainId.POLYGON]: DFYN_ROUTER_ADDRESS,
    },
    initCodeHash: '0xf187ed688403aa4f7acfada758d8d53698753b998a3071b06f1b777f4330eaf3',
    defaultSwapFee: constants_2._30,
});
UniswapV2RoutablePlatform.HONEYSWAP = new UniswapV2RoutablePlatform({
    chainIds: [constants_2.ChainId.XDAI],
    name: 'Honeyswap',
    factoryAddress: {
        [constants_2.ChainId.XDAI]: HONEYSWAP_FACTORY_ADDRESS,
    },
    routerAddress: {
        [constants_2.ChainId.XDAI]: HONEYSWAP_ROUTER_ADDRESS,
    },
    initCodeHash: '0x3f88503e8580ab941773b59034fb4b2a63e86dbc031b3633a925533ad3ed2b93',
    defaultSwapFee: constants_2._30,
});
UniswapV2RoutablePlatform.LEVINSWAP = new UniswapV2RoutablePlatform({
    chainIds: [constants_2.ChainId.XDAI],
    name: 'Levinswap',
    factoryAddress: {
        [constants_2.ChainId.XDAI]: LEVINSWAP_FACTORY_ADDRESS,
    },
    routerAddress: {
        [constants_2.ChainId.XDAI]: LEVINSWAP_ROUTER_ADDRESS,
    },
    initCodeHash: '0x4955fd9146732ca7a64d43c7a8d65fe6db1acca27e9c5b3bee7c3abe5849f441',
    defaultSwapFee: constants_2._30,
});
UniswapV2RoutablePlatform.PANCAKESWAP = new UniswapV2RoutablePlatform({
    chainIds: [constants_2.ChainId.BSC_MAINNET],
    name: 'Pancakeswap',
    factoryAddress: PANCAKESWAP_FACTORY_ADDRESS,
    routerAddress: PANCAKESWAP_ROUTER_ADDRESS,
    initCodeHash: '0x00fb7f630766e6a796048ea87d01acd3068e8ff67d078148a3fa3f4a84f69bd5',
    defaultSwapFee: constants_2._25,
    subgraphEndpoint: {},
});
UniswapV2RoutablePlatform.QUICKSWAP = new UniswapV2RoutablePlatform({
    chainIds: [constants_2.ChainId.POLYGON],
    name: 'Quickswap',
    factoryAddress: {
        [constants_2.ChainId.POLYGON]: QUICKSWAP_FACTORY_ADDRESS,
    },
    routerAddress: {
        [constants_2.ChainId.POLYGON]: QUICKSWAP_ROUTER_ADDRESS,
    },
    initCodeHash: '0x96e8ac4277198ff8b6f785478aa9a39f403cb768dd02cbee326c3e7da348845f',
    defaultSwapFee: constants_2._30,
});
UniswapV2RoutablePlatform.SUSHISWAP = new UniswapV2RoutablePlatform({
    chainIds: [constants_2.ChainId.MAINNET, constants_2.ChainId.RINKEBY, constants_2.ChainId.ARBITRUM_ONE, constants_2.ChainId.POLYGON, constants_2.ChainId.BSC_MAINNET],
    name: 'Sushiswap',
    factoryAddress: SUSHISWAP_FACTORY_ADDRESS,
    routerAddress: SUSHISWAP_ROUTER_ADDRESS,
    initCodeHash: '0xe18a34eb0e04b04f7a0ac29a6e80748dca96319b42c54d679cb821dca90c6303',
    defaultSwapFee: constants_2._30,
    subgraphEndpoint: {},
});
UniswapV2RoutablePlatform.SWAPR = new UniswapV2RoutablePlatform({
    chainIds: [
        constants_2.ChainId.MAINNET,
        constants_2.ChainId.RINKEBY,
        constants_2.ChainId.ARBITRUM_ONE,
        constants_2.ChainId.ARBITRUM_RINKEBY,
        constants_2.ChainId.ARBITRUM_GOERLI,
        constants_2.ChainId.XDAI,
        constants_2.ChainId.GOERLI,
    ],
    name: 'Swapr',
    factoryAddress: constants_2.FACTORY_ADDRESS,
    routerAddress: constants_2.ROUTER_ADDRESS,
    initCodeHash: constants_2.INIT_CODE_HASH,
    defaultSwapFee: constants_2.defaultSwapFee,
    subgraphEndpoint: {
        [constants_2.ChainId.MAINNET]: 'https://api.thegraph.com/subgraphs/name/dxgraphs/swapr-mainnet-v2',
        [constants_2.ChainId.ARBITRUM_ONE]: 'https://api.thegraph.com/subgraphs/name/dxgraphs/swapr-arbitrum-one-v3',
        [constants_2.ChainId.XDAI]: 'https://api.thegraph.com/subgraphs/name/dxgraphs/swapr-xdai-v2',
        [constants_2.ChainId.RINKEBY]: 'https://api.thegraph.com/subgraphs/name/dxgraphs/swapr-rinkeby',
        [constants_2.ChainId.ARBITRUM_RINKEBY]: 'https://api.thegraph.com/subgraphs/name/dxgraphs/swapr-arbitrum-rinkeby-v2',
    },
});
UniswapV2RoutablePlatform.UNISWAP = new UniswapV2RoutablePlatform({
    chainIds: [constants_2.ChainId.MAINNET, constants_2.ChainId.RINKEBY],
    name: 'Uniswap v2',
    factoryAddress: {
        [constants_2.ChainId.MAINNET]: UNISWAP_FACTORY_ADDRESS,
        [constants_2.ChainId.RINKEBY]: UNISWAP_FACTORY_ADDRESS,
    },
    routerAddress: {
        [constants_2.ChainId.MAINNET]: UNISWAP_ROUTER_ADDRESS,
        [constants_2.ChainId.RINKEBY]: UNISWAP_ROUTER_ADDRESS,
    },
    initCodeHash: '0x96e8ac4277198ff8b6f785478aa9a39f403cb768dd02cbee326c3e7da348845f',
    defaultSwapFee: constants_2._30,
    subgraphEndpoint: {
        [constants_2.ChainId.MAINNET]: 'https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v2',
    },
});
//# sourceMappingURL=UniswapV2RoutablePlatform.js.map