import type { ContractInterface } from '@ethersproject/contracts'
import { ChainId } from '../../../../constants'
import {
  CURVE_WETH_ERC20_POOL_ABI,
  CURVE_CRYPTO_SWAP_ABI,
  CURVE_3POOL_ABI,
  CURVE_ETHXERC20_ABI,
  CURVE_EURSPOOL_ABI,
  CURVE_ETHXERC20_256_ABI,
  CURVE_3POOL_UNDERLYING_ABI,
} from '../abi'
import { poolMethods } from '../abi/common'
import { TOKENS_XDAI, TOKENS_ARBITRUM_ONE, TOKENS_MAINNET } from '../tokens'
import { CurveToken } from '../tokens/types'

export interface CurvePool {
  id: string
  name: string
  address: string
  abi: ContractInterface
  approveAddress?: string
  tokens: CurveToken[]
  underlyingTokens?: CurveToken[]
  metaTokens?: CurveToken[]
  riskLevel?: number
  isMeta?: boolean
  allowsTradingETH?: boolean
}

/**
 * xDAI pools
 */
export const POOLS_XDAI: CurvePool[] = [
  {
    id: '3pool',
    name: '3Pool',
    abi: CURVE_3POOL_ABI,
    address: '0x7f90122BF0700F9E7e1F688fe926940E8839F353',
    isMeta: false,
    // Order is crucial
    tokens: [TOKENS_XDAI.wxdai, TOKENS_XDAI.usdc, TOKENS_XDAI.usdt],
  },
]

export const POOLS_ARBITRUM_ONE: CurvePool[] = [
  {
    id: '2pool',
    name: '2pool',
    address: '0x7f90122BF0700F9E7e1F688fe926940E8839F353',
    abi: CURVE_3POOL_ABI,
    isMeta: false,
    tokens: [TOKENS_ARBITRUM_ONE.usdc, TOKENS_ARBITRUM_ONE.usdt],
    // underlyingTokens: [TOKENS_ARBITRUM_ONE.usdc, TOKENS_ARBITRUM_ONE.usdt],
  },
  {
    id: 'tricrypto',
    name: 'Tricrypto',
    abi: CURVE_3POOL_ABI,
    isMeta: false,
    address: '0x960ea3e3C7FB317332d990873d354E18d7645590',
    tokens: [TOKENS_ARBITRUM_ONE.usdt, TOKENS_ARBITRUM_ONE.wbtc, TOKENS_ARBITRUM_ONE.weth],
    allowsTradingETH: true,
  },
  {
    id: 'ren',
    name: 'Ren',
    address: '0x3E01dD8a5E1fb3481F0F589056b428Fc308AF0Fb',
    abi: CURVE_3POOL_ABI,
    isMeta: false,
    tokens: [TOKENS_ARBITRUM_ONE.wbtc, TOKENS_ARBITRUM_ONE.renbtc],
  },
  {
    id: 'eursusd',
    name: 'EURs USD',
    address: '0x25e2e8d104bc1a70492e2be32da7c1f8367f9d2c',
    abi: CURVE_CRYPTO_SWAP_ABI,
    isMeta: true,
    tokens: [
      TOKENS_ARBITRUM_ONE.eurs, // EURs
      TOKENS_ARBITRUM_ONE.usdc, // USDC
      TOKENS_ARBITRUM_ONE.usdt, // USDT
    ],
  },
]

export const POOLS_MAINNET: CurvePool[] = [
  {
    id: 'compound',
    name: 'Compound',
    abi: CURVE_3POOL_ABI,
    tokens: [TOKENS_MAINNET.cdai, TOKENS_MAINNET.cusdc],
    underlyingTokens: [TOKENS_MAINNET.dai, TOKENS_MAINNET.usdc],
    address: '0xA2B47E3D5c44877cca798226B7B8118F9BFb7A56',
  },
  {
    id: 'usdt',
    name: 'USDT',
    abi: CURVE_3POOL_UNDERLYING_ABI,
    tokens: [TOKENS_MAINNET.cdai, TOKENS_MAINNET.cusdc, TOKENS_MAINNET.usdt],
    underlyingTokens: [TOKENS_MAINNET.dai, TOKENS_MAINNET.usdc, TOKENS_MAINNET.usdt],
    address: '0x52EA46506B9CC5Ef470C5bf89f17Dc28bB35D85C',
  },
  {
    id: 'pax',
    name: 'PAX',
    abi: CURVE_3POOL_ABI,
    tokens: [TOKENS_MAINNET.ycdai, TOKENS_MAINNET.ycusdc, TOKENS_MAINNET.ycusdt, TOKENS_MAINNET.pax],
    underlyingTokens: [TOKENS_MAINNET.dai, TOKENS_MAINNET.usdc, TOKENS_MAINNET.usdt, TOKENS_MAINNET.pax],
    address: '0x06364f10B501e868329afBc005b3492902d6C763',
  },
  {
    id: 'Y',
    name: 'Y',
    abi: CURVE_3POOL_ABI,
    tokens: [TOKENS_MAINNET.ydai, TOKENS_MAINNET.yusdc, TOKENS_MAINNET.yusdt, TOKENS_MAINNET.ytusd],
    underlyingTokens: [TOKENS_MAINNET.dai, TOKENS_MAINNET.usdc, TOKENS_MAINNET.usdt, TOKENS_MAINNET.tusd],
    address: '0x45F783CCE6B7FF23B2ab2D70e416cdb7D6055f51',
  },
  {
    id: 'busd',
    name: 'Binance USD',
    abi: CURVE_3POOL_ABI,
    tokens: [TOKENS_MAINNET.ydai, TOKENS_MAINNET.yusdc, TOKENS_MAINNET.yusdt, TOKENS_MAINNET.ybusd],
    underlyingTokens: [TOKENS_MAINNET.dai, TOKENS_MAINNET.usdc, TOKENS_MAINNET.usdt, TOKENS_MAINNET.busd],
    address: '0x79a8C46DeA5aDa233ABaFFD40F3A0A2B1e5A4F27',
  },
  {
    id: 'sUSD',
    name: 'Synthetix USD',
    abi: CURVE_3POOL_ABI,
    tokens: [TOKENS_MAINNET.dai, TOKENS_MAINNET.usdc, TOKENS_MAINNET.usdt, TOKENS_MAINNET.susd],
    address: '0xA5407eAE9Ba41422680e2e00537571bcC53efBfD',
  },
  {
    id: 'ren',
    name: 'Ren',
    abi: CURVE_3POOL_ABI,
    tokens: [TOKENS_MAINNET.renbtc, TOKENS_MAINNET.wbtc],
    address: '0x93054188d876f558f4a66B2EF1d97d16eDf0895B',
  },
  {
    id: 'sbtc',
    name: 'sbtc',
    abi: CURVE_3POOL_ABI,
    tokens: [TOKENS_MAINNET.renbtc, TOKENS_MAINNET.wbtc, TOKENS_MAINNET.sbtc],
    address: '0x7fC77b5c7614E1533320Ea6DDc2Eb61fa00A9714',
  },
  {
    id: 'hbtc',
    name: 'Houbi BTC',
    abi: CURVE_3POOL_ABI,
    tokens: [TOKENS_MAINNET.hbtc, TOKENS_MAINNET.wbtc],
    address: '0x4CA9b3063Ec5866A4B82E437059D2C43d1be596F',
  },
  {
    id: '3pool',
    name: 'Curve 3Pool',
    abi: CURVE_3POOL_ABI,
    tokens: [TOKENS_MAINNET.dai, TOKENS_MAINNET.usdc, TOKENS_MAINNET.usdt],
    address: '0xbebc44782c7db0a1a60cb6fe97d0b483032ff1c7',
  },
  {
    id: 'gusd',
    name: 'Gemini USD',
    isMeta: true,
    abi: CURVE_CRYPTO_SWAP_ABI,
    tokens: [TOKENS_MAINNET.gusd, TOKENS_MAINNET.tricrv],
    metaTokens: [TOKENS_MAINNET.dai, TOKENS_MAINNET.usdc, TOKENS_MAINNET.usdt],
    address: '0x4f062658EaAF2C1ccf8C8e36D6824CDf41167956',
  },
  {
    id: 'husd',
    name: 'Houbi USD',
    isMeta: true,
    abi: CURVE_CRYPTO_SWAP_ABI,
    tokens: [TOKENS_MAINNET.husd, TOKENS_MAINNET.tricrv],
    metaTokens: [TOKENS_MAINNET.dai, TOKENS_MAINNET.usdc, TOKENS_MAINNET.usdt],
    address: '0x3eF6A01A0f81D6046290f3e2A8c5b843e738E604',
  },
  {
    id: 'usdk',
    name: 'usdk',
    isMeta: true,
    abi: CURVE_CRYPTO_SWAP_ABI,
    tokens: [TOKENS_MAINNET.usdk, TOKENS_MAINNET.tricrv],
    metaTokens: [TOKENS_MAINNET.dai, TOKENS_MAINNET.usdc, TOKENS_MAINNET.usdt],
    address: '0x3E01dD8a5E1fb3481F0F589056b428Fc308AF0Fb',
  },
  {
    id: 'usdn',
    name: 'usdn',
    isMeta: true,
    abi: CURVE_CRYPTO_SWAP_ABI,
    tokens: [TOKENS_MAINNET.usdn, TOKENS_MAINNET.tricrv],
    metaTokens: [TOKENS_MAINNET.dai, TOKENS_MAINNET.usdc, TOKENS_MAINNET.usdt],
    address: '0x0f9cb53Ebe405d49A0bbdBD291A65Ff571bC83e1',
  },
  {
    id: 'musd',
    name: 'mStable USD',
    abi: CURVE_CRYPTO_SWAP_ABI,
    isMeta: true,
    tokens: [TOKENS_MAINNET.musd, TOKENS_MAINNET.tricrv],
    metaTokens: [TOKENS_MAINNET.dai, TOKENS_MAINNET.usdc, TOKENS_MAINNET.usdt],
    address: '0x8474DdbE98F5aA3179B3B3F5942D724aFcdec9f6',
  },
  {
    id: 'rsv',
    name: 'rsv',
    abi: CURVE_CRYPTO_SWAP_ABI,
    tokens: [TOKENS_MAINNET.rsv, TOKENS_MAINNET.tricrv],
    metaTokens: [TOKENS_MAINNET.dai, TOKENS_MAINNET.usdc, TOKENS_MAINNET.usdt],
    address: '0xC18cC39da8b11dA8c3541C598eE022258F9744da',
  },
  {
    id: 'tbtc',
    name: 'tbtc',
    abi: CURVE_3POOL_ABI,
    tokens: [TOKENS_MAINNET.tbtc, TOKENS_MAINNET.sbtccrv],
    metaTokens: [TOKENS_MAINNET.renbtc, TOKENS_MAINNET.wbtc, TOKENS_MAINNET.sbtc],
    address: '0xC25099792E9349C7DD09759744ea681C7de2cb66',
  },
  {
    id: 'dusd',
    name: 'dusd',
    tokens: [TOKENS_MAINNET.dusd, TOKENS_MAINNET.tricrv],
    abi: CURVE_3POOL_ABI,
    metaTokens: [TOKENS_MAINNET.dai, TOKENS_MAINNET.usdc, TOKENS_MAINNET.usdt],
    address: '0x8038C01A0390a8c547446a0b2c18fc9aEFEcc10c',
  },
  {
    id: 'pbtc',
    name: 'pbtc',
    tokens: [TOKENS_MAINNET.pbtc, TOKENS_MAINNET.sbtccrv],
    abi: CURVE_3POOL_ABI,
    metaTokens: [TOKENS_MAINNET.renbtc, TOKENS_MAINNET.wbtc, TOKENS_MAINNET.sbtc],
    address: '0x7F55DDe206dbAD629C080068923b36fe9D6bDBeF',
  },
  {
    id: 'bbtc',
    name: 'bbtc',
    abi: CURVE_3POOL_ABI,
    tokens: [TOKENS_MAINNET.bbtc, TOKENS_MAINNET.sbtccrv],
    metaTokens: [TOKENS_MAINNET.renbtc, TOKENS_MAINNET.wbtc, TOKENS_MAINNET.sbtc],
    address: '0x071c661B4DeefB59E2a3DdB20Db036821eeE8F4b',
  },
  {
    id: 'obtc',
    name: 'obtc',
    abi: CURVE_3POOL_ABI,
    tokens: [TOKENS_MAINNET.obtc, TOKENS_MAINNET.sbtccrv],
    metaTokens: [TOKENS_MAINNET.renbtc, TOKENS_MAINNET.wbtc, TOKENS_MAINNET.sbtc],
    address: '0xd81dA8D904b52208541Bade1bD6595D8a251F8dd',
  },
  {
    id: 'ust',
    name: 'ust',
    abi: CURVE_3POOL_ABI,
    tokens: [TOKENS_MAINNET.ust, TOKENS_MAINNET.tricrv],
    metaTokens: [TOKENS_MAINNET.dai, TOKENS_MAINNET.usdc, TOKENS_MAINNET.usdt],
    address: '0x890f4e345B1dAED0367A877a1612f86A1f86985f',
  },
  {
    id: 'saave',
    name: 'saave',
    abi: CURVE_3POOL_ABI,
    tokens: [TOKENS_MAINNET.adai, TOKENS_MAINNET.asusd],
    underlyingTokens: [TOKENS_MAINNET.dai, TOKENS_MAINNET.susd],
    address: '0xEB16Ae0052ed37f479f7fe63849198Df1765a733',
  },
  {
    id: 'eurs',
    name: 'eurs',
    abi: CURVE_3POOL_ABI,
    tokens: [TOKENS_MAINNET.eurs, TOKENS_MAINNET.seur],
    address: '0x0Ce6a5fF5217e38315f87032CF90686C96627CAA',
  },
  {
    id: 'usdp',
    name: 'usdp',
    abi: CURVE_CRYPTO_SWAP_ABI,
    isMeta: true,
    tokens: [TOKENS_MAINNET.usdp, TOKENS_MAINNET.tricrv],
    metaTokens: [TOKENS_MAINNET.dai, TOKENS_MAINNET.usdc, TOKENS_MAINNET.usdt],
    address: '0x42d7025938bEc20B69cBae5A77421082407f053A',
  },
  {
    id: 'link',
    name: 'link',
    abi: CURVE_3POOL_ABI,
    tokens: [TOKENS_MAINNET.link, TOKENS_MAINNET.slink],
    address: '0xF178C0b5Bb7e7aBF4e12A4838C7b7c5bA2C623c0',
  },
  {
    id: 'tusd',
    name: 'tusd',
    abi: CURVE_CRYPTO_SWAP_ABI,
    isMeta: true,
    tokens: [TOKENS_MAINNET.tusd, TOKENS_MAINNET.tricrv],
    metaTokens: [TOKENS_MAINNET.dai, TOKENS_MAINNET.usdc, TOKENS_MAINNET.usdt],
    address: '0xecd5e75afb02efa118af914515d6521aabd189f1',
  },
  {
    id: 'frax',
    name: 'Frax',
    abi: CURVE_CRYPTO_SWAP_ABI,
    isMeta: true,
    tokens: [TOKENS_MAINNET.frax, TOKENS_MAINNET.tricrv],
    metaTokens: [TOKENS_MAINNET.dai, TOKENS_MAINNET.usdc, TOKENS_MAINNET.usdt],
    address: '0xd632f22692FaC7611d2AA1C0D552930D43CAEd3B',
  },
  {
    id: 'lusd',
    name: 'lusd',
    abi: CURVE_3POOL_ABI,
    tokens: [TOKENS_MAINNET.lusd, TOKENS_MAINNET.tricrv],
    metaTokens: [TOKENS_MAINNET.dai, TOKENS_MAINNET.usdc, TOKENS_MAINNET.usdt],
    address: '0xEd279fDD11cA84bEef15AF5D39BB4d4bEE23F0cA',
  },
  {
    id: 'busdv2',
    name: 'busdv2',
    isMeta: true,
    abi: CURVE_CRYPTO_SWAP_ABI,
    tokens: [TOKENS_MAINNET.busd, TOKENS_MAINNET.tricrv],
    metaTokens: [TOKENS_MAINNET.dai, TOKENS_MAINNET.usdc, TOKENS_MAINNET.usdt],
    address: '0x4807862AA8b2bF68830e4C8dc86D0e9A998e085a',
  },

  {
    id: 'alusd',
    name: 'alUSD',
    abi: CURVE_CRYPTO_SWAP_ABI,
    isMeta: true,
    tokens: [TOKENS_MAINNET.alusd, TOKENS_MAINNET.tricrv],
    metaTokens: [TOKENS_MAINNET.dai, TOKENS_MAINNET.usdc, TOKENS_MAINNET.usdt],
    address: '0x43b4FdFD4Ff969587185cDB6f0BD875c5Fc83f8c',
  },
  {
    id: 'mim',
    name: 'Magic Internet Money',
    abi: CURVE_CRYPTO_SWAP_ABI,
    isMeta: true,
    tokens: [TOKENS_MAINNET.mim, TOKENS_MAINNET.tricrv],
    metaTokens: [TOKENS_MAINNET.dai, TOKENS_MAINNET.usdc, TOKENS_MAINNET.usdt],
    address: '0x5a6A4D54456819380173272A5E8E9B9904BdF41B',
  },
  {
    id: 'tricrypto',
    name: 'Tricrypto',
    abi: CURVE_WETH_ERC20_POOL_ABI,
    tokens: [TOKENS_MAINNET.usdt, TOKENS_MAINNET.wbtc, TOKENS_MAINNET.weth],
    address: '0x80466c64868E1ab14a1Ddf27A676C3fcBE638Fe5',
  },
  {
    id: 'tricrypto2',
    name: 'tricrypto2',
    abi: CURVE_WETH_ERC20_POOL_ABI,
    tokens: [TOKENS_MAINNET.usdt, TOKENS_MAINNET.wbtc, TOKENS_MAINNET.weth],
    allowsTradingETH: true,
    address: '0xD51a44d3FaE010294C616388b506AcdA1bfAAE46',
  },
  {
    id: 'eurt',
    name: 'eurt',
    abi: CURVE_3POOL_ABI,
    tokens: [TOKENS_MAINNET.eurt, TOKENS_MAINNET.seur],
    address: '0xfd5db7463a3ab53fd211b4af195c5bccc1a03890',
  },
  {
    id: 'eurtusd',
    name: 'eurtusd',
    isMeta: true,
    abi: CURVE_3POOL_ABI,
    tokens: [TOKENS_MAINNET.eurt, TOKENS_MAINNET.tricrv],
    metaTokens: [TOKENS_MAINNET.dai, TOKENS_MAINNET.usdc, TOKENS_MAINNET.usdt],
    address: '0x9838eCcC42659FA8AA7daF2aD134b53984c9427b',
  },
  {
    id: 'eursusd',
    name: 'eursusd',
    abi: CURVE_EURSPOOL_ABI,
    tokens: [TOKENS_MAINNET.usdc, TOKENS_MAINNET.eurs],
    address: '0x98a7F18d4E56Cfe84E3D081B40001B3d5bD3eB8B',
  },
  {
    id: 'rai',
    name: 'Rai',
    abi: CURVE_CRYPTO_SWAP_ABI,
    isMeta: true,
    tokens: [TOKENS_MAINNET.rai, TOKENS_MAINNET.tricrv],
    metaTokens: [TOKENS_MAINNET.dai, TOKENS_MAINNET.usdc, TOKENS_MAINNET.usdt],
    address: '0x618788357D0EBd8A37e763ADab3bc575D54c2C7d',
  },
  {
    id: 'cvxeth',
    name: 'cvxeth',
    abi: CURVE_ETHXERC20_256_ABI,
    tokens: [TOKENS_MAINNET.weth, TOKENS_MAINNET.cvx],
    address: '0xB576491F1E6e5E62f1d8F26062Ee822B40B0E0d4',
    allowsTradingETH: true,
  },
  {
    id: 'spelleth',
    name: 'spelleth',
    abi: CURVE_WETH_ERC20_POOL_ABI,
    tokens: [TOKENS_MAINNET.weth, TOKENS_MAINNET.spell],
    address: '0x98638FAcf9a3865cd033F36548713183f6996122',
    allowsTradingETH: true,
  },
  {
    id: 'crveth',
    name: 'crveth',
    abi: CURVE_ETHXERC20_256_ABI,
    tokens: [TOKENS_MAINNET.weth, TOKENS_MAINNET.crv],
    address: '0x8301AE4fc9c624d1D396cbDAa1ed877821D7C511',
    allowsTradingETH: true,
  },
  {
    id: 'reth',
    name: 'rETH',
    abi: CURVE_ETHXERC20_256_ABI,
    tokens: [TOKENS_MAINNET.eth, TOKENS_MAINNET.reth],
    address: '0xF9440930043eb3997fc70e1339dBb11F341de7A8',
  },
  {
    id: 'seth',
    name: 'seth',
    abi: CURVE_ETHXERC20_ABI,
    tokens: [TOKENS_MAINNET.eth, TOKENS_MAINNET.seth],
    address: '0xc5424b857f758e906013f3555dad202e4bdb4567',
  },
  {
    id: 'steth',
    name: 'steth',
    abi: [
      poolMethods['view']['fee'],
      poolMethods['payable']['exchange(uint256,uint256,uint256,uint256)'],
      poolMethods['payable']['exchange(uint256,uint256,uint256,uint256,bool)'],
      poolMethods['payable']['exchange_underlying(uint256,uint256,uint256,uint256)'],
      poolMethods['view']['get_dy(int128,int128,uint256)'],
    ],
    tokens: [TOKENS_MAINNET.eth, TOKENS_MAINNET.steth],
    address: '0xDC24316b9AE028F1497c275EB9192a3Ea0f67022',
    allowsTradingETH: true,
  },
  {
    id: 'ankreth',
    name: 'ankreth',
    abi: CURVE_ETHXERC20_256_ABI,
    tokens: [TOKENS_MAINNET.eth, TOKENS_MAINNET.ankreth],
    address: '0xA96A65c051bF88B4095Ee1f2451C2A9d43F53Ae2',
  },
  /**
   * @todo debug these
  {
    id: 'xautusd',
    name: 'xautusd',
    abi: CURVE_3POOL_ABI,
    isMeta: true,
    tokens: [TOKENS_MAINNET.xaut, TOKENS_MAINNET.tricrv],
    metaTokens: [TOKENS_MAINNET.dai, TOKENS_MAINNET.usdc, TOKENS_MAINNET.usdt],
    address:'0xAdCFcf9894335dC340f6Cd182aFA45999F45Fc44'
  },
  {
    id: 'ironbank',
    name: 'ironbank',
    abi: CURVE_3POOL_ABI,
    tokens: [TOKENS_MAINNET.cydai, TOKENS_MAINNET.cyusdc, TOKENS_MAINNET.cyusdt],
    underlyingTokens: [TOKENS_MAINNET.dai, TOKENS_MAINNET.usdc, TOKENS_MAINNET.usdt],
    address:'0x2dded6Da1BF5DBdF597C45fcFaa3194e53EcfeAF'
  },
  {
    id: 'teth',
    name: 'teth',
    abi: CURVE_3POOL_ABI,
    tokens: [TOKENS_MAINNET.weth, TOKENS_MAINNET.t],
    address:'0x752eBeb79963cf0732E9c0fec72a49FD1DEfAEAC',
    allowsTradingETH: true
  },
  {
    id: 'aave',
    name: 'Aave',
    abi: CURVE_3POOL_ABI,
    tokens: [TOKENS_MAINNET.adai, TOKENS_MAINNET.ausdc, TOKENS_MAINNET.ausdt],
    underlyingTokens: [TOKENS_MAINNET.dai, TOKENS_MAINNET.usdc, TOKENS_MAINNET.usdt],
    address:'0xDeBF20617708857ebe4F679508E7b7863a8A8EeE'
  },
  */
  /*
  Inactive pool
  {
    id: 'linkusd',
    name: 'linkusd',
    abi: CURVE_CRYPTO_SWAP_ABI,
    tokens: [TOKENS_MAINNET.linkusd, TOKENS_MAINNET.tricrv],
    metaTokens: [TOKENS_MAINNET.dai, TOKENS_MAINNET.usdc, TOKENS_MAINNET.usdt],
    address:'0xE7a24EF0C5e95Ffb0f6684b813A78F2a3AD7D171'
  },
  */
]

export const CURVE_POOLS: { [chainId in ChainId]: CurvePool[] } = {
  [ChainId.MAINNET]: POOLS_MAINNET,
  [ChainId.XDAI]: POOLS_XDAI,
  [ChainId.ARBITRUM_ONE]: POOLS_ARBITRUM_ONE,
  // Empty
  [ChainId.RINKEBY]: [],
  [ChainId.ARBITRUM_RINKEBY]: [],
}
