"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CURVE_TOKENS = exports.TOKENS_MAINNET = exports.TOKENS_ARBITRUM_ONE = exports.TOKENS_XDAI = void 0;
const constants_1 = require("../../../../constants");
const types_1 = require("./types");
/**
 * Gnosis Chain
 */
exports.TOKENS_XDAI = {
    wxdai: {
        symbol: 'WXDAI',
        name: 'WXDAI',
        address: '0xe91D153E0b41518A2Ce8Dd3D7944Fa863463a97d',
        decimals: 18,
        type: types_1.TokenType.USD,
    },
    usdc: {
        symbol: 'USDC',
        name: 'USDC',
        address: '0xDDAfbb505ad214D7b80b1f830fcCc89B60fb7A83',
        decimals: 6,
        type: types_1.TokenType.USD,
    },
    usdt: {
        symbol: 'USDT',
        name: 'USDT',
        address: '0x4ECaBa5870353805a9F068101A40E0f32ed605C6',
        decimals: 6,
        type: types_1.TokenType.USD,
    },
};
/**
 * Arbitrum
 */
exports.TOKENS_ARBITRUM_ONE = {
    mim: {
        symbol: 'MIM',
        name: 'Magic Internet Money',
        decimals: 18,
        address: '0xFEa7a6a0B346362BF88A9e4A88416B77a57D6c2A',
        type: types_1.TokenType.USD,
    },
    twocrv: {
        symbol: '2CRV',
        name: 'Curve.fi USDC/USDT',
        decimals: 18,
        address: '0x7f90122bf0700f9e7e1f688fe926940e8839f353',
        type: types_1.TokenType.CRV,
    },
    usdc: {
        symbol: 'USDC',
        name: 'USDC',
        decimals: 6,
        address: '0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8',
        type: types_1.TokenType.USD,
    },
    usdt: {
        symbol: 'USDT',
        name: 'USDT',
        decimals: 6,
        address: '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9',
        type: types_1.TokenType.USD,
    },
    wbtc: {
        symbol: 'wBTC',
        name: 'wBTC',
        decimals: 8,
        address: '0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f',
        type: types_1.TokenType.BTC,
    },
    renbtc: {
        symbol: 'renBTC',
        name: 'renBTC',
        decimals: 8,
        address: '0xDBf31dF14B66535aF65AaC99C32e9eA844e14501',
        type: types_1.TokenType.BTC,
    },
    eth: {
        symbol: 'ETH',
        name: 'ETH',
        decimals: 18,
        address: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
        type: types_1.TokenType.ETH,
    },
    weth: {
        symbol: 'WETH',
        name: 'WETH',
        decimals: 18,
        address: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1',
        type: types_1.TokenType.ETH,
    },
    eurs: {
        symbol: 'EURs',
        name: 'EURs',
        decimals: 2,
        address: '0xD22a58f79e9481D1a88e00c343885A588b34b68B',
        type: types_1.TokenType.EUR,
    },
};
/**
 * Ethereum
 */
exports.TOKENS_MAINNET = {
    crv: {
        address: '0xD533a949740bb3306d119CC777fa900bA034cd52',
        name: 'Curve DAO Token',
        symbol: 'CRV',
        decimals: 18,
        type: types_1.TokenType.CRV,
    },
    // Bitcoin Tokens
    hbtc: {
        address: '0x0316EB71485b0Ab14103307bf65a021042c6d380',
        name: 'Huobi BTC',
        symbol: 'HBTC',
        decimals: 18,
        type: types_1.TokenType.BTC,
    },
    sbtc: {
        address: '0xfE18be6b3Bd88A2D2A7f928d00292E7a9963CfC6',
        name: 'Synth sBTC',
        symbol: 'sBTC',
        decimals: 18,
        type: types_1.TokenType.BTC,
    },
    obtc: {
        address: '0x8064d9Ae6cDf087b1bcd5BDf3531bD5d8C537a68',
        name: 'BoringDAO BTC',
        symbol: 'oBTC',
        decimals: 18,
        type: types_1.TokenType.BTC,
    },
    bbtc: {
        address: '0x9BE89D2a4cd102D8Fecc6BF9dA793be995C22541',
        name: 'Binance Wrapped BTC',
        symbol: 'BBTC',
        decimals: 8,
        type: types_1.TokenType.BTC,
    },
    pbtc: {
        address: '0x5228a22e72ccC52d415EcFd199F99D0665E7733b',
        name: 'pTokens BTC',
        symbol: 'pBTC',
        decimals: 18,
        type: types_1.TokenType.BTC,
    },
    tbtc: {
        address: '0x8dAEBADE922dF735c38C80C7eBD708Af50815fAa',
        name: 'tBTC',
        symbol: 'TBTC',
        decimals: 18,
        type: types_1.TokenType.BTC,
    },
    wbtc: {
        address: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
        name: 'Wrapped BTC',
        symbol: 'WBTC',
        decimals: 8,
        type: types_1.TokenType.BTC,
    },
    renbtc: {
        address: '0xEB4C2781e4ebA804CE9a9803C67d0893436bB27D',
        name: 'renBTC',
        symbol: 'renBTC',
        decimals: 8,
        type: types_1.TokenType.BTC,
    },
    // USD Tokens
    ycdai: {
        address: '0x99d1Fa417f94dcD62BfE781a1213c092a47041Bc',
        name: 'Curve (iearn fork) DAI',
        symbol: 'ycDAI',
        decimals: 18,
        type: types_1.TokenType.USD,
    },
    ycusdt: {
        address: '0x1bE5d71F2dA660BFdee8012dDc58D024448A0A59',
        name: 'Curve (iearn fork) USDT',
        symbol: 'ycUSDT',
        decimals: 6,
        type: types_1.TokenType.USD,
    },
    cusdc: {
        address: '0x39AA39c021dfbaE8faC545936693aC917d5E7563',
        name: 'Compound USD Coin',
        symbol: 'cUSDC',
        decimals: 8,
        type: types_1.TokenType.USD,
    },
    usdp: {
        address: '0x1456688345527bE1f37E9e627DA0837D6f08C925',
        name: 'USDP Stablecoin',
        symbol: 'USDP',
        decimals: 18,
        type: types_1.TokenType.USD,
    },
    adai: {
        address: '0x028171bCA77440897B824Ca71D1c56caC55b68A3',
        name: 'Aave interest bearing DAI',
        symbol: 'aDAI',
        decimals: 18,
        type: types_1.TokenType.USD,
    },
    musd: {
        address: '0xe2f2a5C287993345a840Db3B0845fbC70f5935a5',
        name: 'mStable USD',
        symbol: 'mUSD',
        decimals: 18,
        type: types_1.TokenType.USD,
    },
    gusd: {
        address: '0x056Fd409E1d7A124BD7017459dFEa2F387b6d5Cd',
        name: 'Gemini dollar',
        symbol: 'GUSD',
        decimals: 2,
        type: types_1.TokenType.USD,
    },
    ydai: {
        address: '0xC2cB1040220768554cf699b0d863A3cd4324ce32',
        name: 'iearn DAI',
        symbol: 'yDAI',
        decimals: 18,
        type: types_1.TokenType.USD,
    },
    cyusdt: {
        address: '0x48759f220ed983db51fa7a8c0d2aab8f3ce4166a',
        name: 'Yearn Tether USD',
        symbol: 'cyUSDT',
        decimals: 8,
        type: types_1.TokenType.USD,
    },
    cyusdc: {
        address: '0x76Eb2FE28b36B3ee97F3Adae0C69606eeDB2A37c',
        name: 'Yearn USD Coin',
        symbol: 'cyUSDC',
        decimals: 8,
        type: types_1.TokenType.USD,
    },
    yusdc: {
        address: '0xd6aD7a6750A7593E092a9B218d66C0A814a3436e',
        name: 'iearn USDC',
        symbol: 'yUSDC',
        decimals: 6,
        type: types_1.TokenType.USD,
    },
    husd: {
        address: '0xdF574c24545E5FfEcb9a659c229253D4111d87e1',
        name: 'HUSD',
        symbol: 'HUSD',
        decimals: 8,
        type: types_1.TokenType.USD,
    },
    cydai: {
        address: '0x8e595470Ed749b85C6F7669de83EAe304C2ec68F',
        name: 'Yearn Dai Stablecoin',
        symbol: 'cyDAI',
        decimals: 8,
        type: types_1.TokenType.USD,
    },
    cdai: {
        address: '0x5d3a536E4D6DbD6114cc1Ead35777bAB948E3643',
        name: 'Compound Dai',
        symbol: 'cDAI',
        decimals: 8,
        type: types_1.TokenType.USD,
    },
    ycusdc: {
        address: '0x9777d7E2b60bB01759D0E2f8be2095df444cb07E',
        name: 'Curve (iearn fork) USDC',
        symbol: 'ycUSDC',
        decimals: 6,
        type: types_1.TokenType.USD,
    },
    ust: {
        address: '0xa47c8bf37f92aBed4A126BDA807A7b7498661acD',
        name: 'Wrapped UST Token',
        symbol: 'UST',
        decimals: 18,
        type: types_1.TokenType.USD,
    },
    yusdt: {
        address: '0x83f798e925BcD4017Eb265844FDDAbb448f1707D',
        name: 'iearn USDT',
        symbol: 'yUSDT',
        decimals: 6,
        type: types_1.TokenType.USD,
    },
    ybusd: {
        address: '0x04bC0Ab673d88aE9dbC9DA2380cB6B79C4BCa9aE',
        name: 'iearn BUSD',
        symbol: 'yBUSD',
        decimals: 18,
        type: types_1.TokenType.USD,
    },
    ausdc: {
        address: '0xBcca60bB61934080951369a648Fb03DF4F96263C',
        name: 'Aave interest bearing USDC',
        symbol: 'aUSDC',
        decimals: 6,
        type: types_1.TokenType.USD,
    },
    lusd: {
        address: '0x5f98805A4E8be255a32880FDeC7F6728C6568bA0',
        name: 'LUSD Stablecoin',
        symbol: 'LUSD',
        decimals: 18,
        type: types_1.TokenType.USD,
    },
    tusd: {
        address: '0x0000000000085d4780B73119b644AE5ecd22b376',
        name: 'TrueUSD',
        symbol: 'TUSD',
        decimals: 18,
        type: types_1.TokenType.USD,
    },
    usdn: {
        address: '0x674C6Ad92Fd080e4004b2312b45f796a192D27a0',
        name: 'Neutrino USD',
        symbol: 'USDN',
        decimals: 18,
        type: types_1.TokenType.USD,
    },
    usdc: {
        address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
        name: 'USD Coin',
        symbol: 'USDC',
        decimals: 6,
        type: types_1.TokenType.USD,
    },
    ausdt: {
        address: '0x3Ed3B47Dd13EC9a98b44e6204A523E766B225811',
        name: 'Aave interest bearing USDT',
        symbol: 'aUSDT',
        decimals: 6,
        type: types_1.TokenType.USD,
    },
    '3crv': {
        address: '0x6c3F90f043a72FA612cbac8115EE7e52BDe6E490',
        name: 'Curve.fi DAI/USDC/USDT',
        symbol: '3Crv',
        decimals: 18,
        type: types_1.TokenType.USD,
    },
    usdk: {
        address: '0x1c48f86ae57291F7686349F12601910BD8D470bb',
        name: 'USDK',
        symbol: 'USDK',
        decimals: 18,
        type: types_1.TokenType.USD,
    },
    frax: {
        address: '0x853d955aCEf822Db058eb8505911ED77F175b99e',
        name: 'Frax',
        symbol: 'FRAX',
        decimals: 18,
        type: types_1.TokenType.USD,
    },
    busd: {
        address: '0x4Fabb145d64652a948d72533023f6E7A623C7C53',
        name: 'Binance USD',
        symbol: 'BUSD',
        decimals: 18,
        type: types_1.TokenType.USD,
    },
    asusd: {
        address: '0x6C5024Cd4F8A59110119C56f8933403A539555EB',
        name: 'Aave interest bearing SUSD',
        symbol: 'aSUSD',
        decimals: 18,
        type: types_1.TokenType.USD,
    },
    mim: {
        address: '0x99D8a9C45b2ecA8864373A26D1459e3Dff1e17F3',
        name: 'Magic Internet Money',
        symbol: 'MIM',
        decimals: 18,
        type: types_1.TokenType.USD,
    },
    alusd: {
        address: '0xBC6DA0FE9aD5f3b0d58160288917AA56653660E9',
        name: 'Alchemix USD',
        symbol: 'alUSD',
        decimals: 18,
        type: types_1.TokenType.USD,
    },
    usdt: {
        address: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
        name: 'Tether USD',
        symbol: 'USDT',
        decimals: 6,
        type: types_1.TokenType.USD,
    },
    dai: {
        address: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
        name: 'Dai Stablecoin',
        symbol: 'DAI',
        decimals: 18,
        type: types_1.TokenType.USD,
    },
    susd: {
        address: '0x57Ab1ec28D129707052df4dF418D58a2D46d5f51',
        name: 'Synth sUSD',
        symbol: 'sUSD',
        decimals: 18,
        type: types_1.TokenType.USD,
    },
    dusd: {
        address: '0x5BC25f649fc4e26069dDF4cF4010F9f706c23831',
        name: 'DefiDollar',
        symbol: 'DUSD',
        decimals: 18,
        type: types_1.TokenType.USD,
    },
    ytusd: {
        address: '0x73a052500105205d34Daf004eAb301916DA8190f',
        name: 'iearn TUSD',
        symbol: 'yTUSD',
        decimals: 18,
        type: types_1.TokenType.USD,
    },
    pax: {
        address: '0x8E870D67F660D95d5be530380D0eC0bd388289E1',
        name: 'Pax Dollar',
        symbol: 'pax',
        decimals: 18,
        type: types_1.TokenType.USD,
    },
    // Ether and deriivates
    reth: {
        address: '0x9559Aaa82d9649C7A7b220E7c461d2E74c9a3593',
        name: 'StaFi',
        symbol: 'rETH',
        decimals: 18,
        type: types_1.TokenType.ETH,
    },
    eth: {
        symbol: 'ETH',
        name: 'Ether',
        decimals: 18,
        address: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
        type: types_1.TokenType.ETH,
    },
    ankreth: {
        name: 'ankreth',
        symbol: 'ankrETH',
        decimals: 18,
        address: '0xE95A203B1a91a908F9B9CE46459d101078c2c3cb',
        type: types_1.TokenType.ETH,
    },
    weth: {
        address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
        name: 'Wrapped Ether',
        symbol: 'WETH',
        decimals: 18,
        type: types_1.TokenType.ETH,
    },
    aethc: {
        address: '0xE95A203B1a91a908F9B9CE46459d101078c2c3cb',
        name: 'Ankr ETH2 Reward Bearing Certificate',
        symbol: 'aETHc',
        decimals: 18,
        type: types_1.TokenType.ETH,
    },
    seth: {
        address: '0x5e74C9036fb86BD7eCdcb084a0673EFc32eA31cb',
        name: 'Synth sETH',
        symbol: 'sETH',
        decimals: 18,
        type: types_1.TokenType.ETH,
    },
    steth: {
        address: '0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84',
        name: 'Liquid staked Ether 2.0',
        symbol: 'stETH',
        decimals: 18,
        type: types_1.TokenType.ETH,
    },
    snx: {
        address: '0xc011a73ee8576fb46f5e1c5751ca3b9fe0af2a6f',
        name: 'Synthetix Network Token',
        symbol: 'SNX',
        decimals: 18,
        type: types_1.TokenType.OTHER,
    },
    slink: {
        address: '0xbBC455cb4F1B9e4bFC4B73970d360c8f032EfEE6',
        name: 'Synth sLINK',
        symbol: 'sLINK',
        decimals: 18,
        type: types_1.TokenType.LINK,
    },
    link: {
        address: '0x514910771AF9Ca656af840dff83E8264EcF986CA',
        name: 'ChainLink Token',
        symbol: 'LINK',
        decimals: 18,
        type: types_1.TokenType.LINK,
    },
    seur: {
        address: '0xD71eCFF9342A5Ced620049e616c5035F1dB98620',
        name: 'Synth sEUR',
        symbol: 'sEUR',
        decimals: 18,
        type: types_1.TokenType.EUR,
    },
    eurs: {
        address: '0xdB25f211AB05b1c97D595516F45794528a807ad8',
        name: 'STASIS EURS Token',
        symbol: 'EURS',
        decimals: 2,
        type: types_1.TokenType.EUR,
    },
    linkusd: {
        name: 'LINKUSD',
        symbol: 'LINKUSD',
        decimals: 18,
        address: '0x0E2EC54fC0B509F445631Bf4b91AB8168230C752',
        type: types_1.TokenType.LINK,
    },
    spell: {
        name: 'Spell',
        symbol: 'SPELL',
        decimals: 18,
        address: '0x090185f2135308BaD17527004364eBcC2D37e5F6',
        type: types_1.TokenType.SPELL,
    },
    cvx: {
        name: 'Convex',
        symbol: 'CVX',
        decimals: 18,
        address: '0x4e3FBD56CD56c3e72c1403e103b45Db9da5B9D2B',
        type: types_1.TokenType.CVX,
    },
    xaut: {
        name: 'Tether Gold',
        symbol: 'XAUt',
        decimals: 6,
        address: '0x68749665FF8D2d112Fa859AA293F07A622782F38',
        type: types_1.TokenType.GOLD,
    },
    t: {
        name: 'Threshold Network',
        symbol: 'T',
        decimals: 18,
        address: '0xCdF7028ceAB81fA0C6971208e83fa7872994beE5',
        type: types_1.TokenType.T,
    },
    eurt: {
        name: 'Tether Euro',
        symbol: 'EURT',
        decimals: 6,
        address: '0xC581b735A1688071A1746c968e0798D642EDE491',
        type: types_1.TokenType.EUR,
    },
    tricrv: {
        name: 'Curve.fi DAI/USDC/USDT (3Crv)',
        symbol: '3Crv',
        decimals: 18,
        address: '0x6c3F90f043a72FA612cbac8115EE7e52BDe6E490',
        isLPToken: true,
        type: types_1.TokenType.USD,
    },
    sbtccrv: {
        symbol: 'sbtcCrv',
        name: 'Curve.fi renBTC/wBTC/sBTC',
        decimals: 18,
        address: '0x075b1bb99792c9E1041bA13afEf80C91a1e70fB3',
        isLPToken: true,
        type: types_1.TokenType.BTC,
    },
    rai: {
        name: ' Rai Reflex Index',
        symbol: 'RAI',
        decimals: 18,
        address: '0x03ab458634910AaD20eF5f1C8ee96F1D6ac54919',
        type: types_1.TokenType.OTHER,
    },
    rsv: {
        address: '0x196f4727526eA7FB1e17b2071B3d8eAA38486988',
        name: 'Reserve',
        symbol: 'RSV',
        decimals: 18,
        type: types_1.TokenType.OTHER,
    },
    crvrenwsbtc: {
        address: '0x075b1bb99792c9E1041bA13afEf80C91a1e70fB3',
        name: 'Curve.fi renBTC/wBTC/sBTC',
        symbol: 'crvRenWSBTC',
        decimals: 18,
        type: types_1.TokenType.OTHER,
    },
};
exports.CURVE_TOKENS = {
    [constants_1.ChainId.MAINNET]: exports.TOKENS_MAINNET,
    [constants_1.ChainId.XDAI]: exports.TOKENS_XDAI,
    [constants_1.ChainId.ARBITRUM_ONE]: exports.TOKENS_ARBITRUM_ONE,
    [constants_1.ChainId.ARBITRUM_RINKEBY]: {},
    [constants_1.ChainId.RINKEBY]: {},
    [constants_1.ChainId.POLYGON]: {},
};
//# sourceMappingURL=tokens.js.map