import { AddressZero } from '@ethersproject/constants'

import {
  _25,
  _30,
  BigintIsh,
  ChainId,
  defaultSwapFee,
  FACTORY_ADDRESS,
  INIT_CODE_HASH,
  ROUTER_ADDRESS,
  TEN,
} from '../../../constants'
import { BaseRoutablePlatform } from './BaseRoutablePlatform'

const BAOSWAP_FACTORY_ADDRESS = '0x45de240fbe2077dd3e711299538a09854fae9c9b'
const BISWAP_FACTORY_ADDRESS = { [ChainId.BSC_MAINNET]: '0x858E3312ed3A876947EA49d572A7C42DE08af7EE' }
const DFYN_FACTORY_ADDRESS = '0xE7Fb3e833eFE5F9c441105EB65Ef8b261266423B'
const HONEYSWAP_FACTORY_ADDRESS = '0xA818b4F111Ccac7AA31D0BCc0806d64F2E0737D7'
const LEVINSWAP_FACTORY_ADDRESS = '0x965769C9CeA8A7667246058504dcdcDb1E2975A5'
const PANCAKESWAP_FACTORY_ADDRESS = { [ChainId.BSC_MAINNET]: '0xcA143Ce32Fe78f1f7019d7d551a6402fC5350c73' }
const QUICKSWAP_FACTORY_ADDRESS = '0x5757371414417b8C6CAad45bAeF941aBc7d3Ab32'
const SUSHISWAP_FACTORY_ADDRESS: { [chainId: number]: string } = {
  [ChainId.MAINNET]: '0xC0AEe478e3658e2610c5F7A4A2E1777cE9e4f2Ac',
  [ChainId.RINKEBY]: '0xc35DADB65012eC5796536bD9864eD8773aBc74C4',
  [ChainId.XDAI]: '0xc35DADB65012eC5796536bD9864eD8773aBc74C4',
  [ChainId.ARBITRUM_ONE]: '0xc35DADB65012eC5796536bD9864eD8773aBc74C4',
  [ChainId.POLYGON]: '0xc35DADB65012eC5796536bD9864eD8773aBc74C4',
  [ChainId.BSC_MAINNET]: '0xc35DADB65012eC5796536bD9864eD8773aBc74C4',
}
const UNISWAP_FACTORY_ADDRESS = '0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f'

const BAOSWAP_ROUTER_ADDRESS = '0x6093AeBAC87d62b1A5a4cEec91204e35020E38bE'
const BISWAP_ROUTER_ADDRESS = { [ChainId.BSC_MAINNET]: '0x3a6d8cA21D1CF76F653A67577FA0D27453350dD8' }
const DFYN_ROUTER_ADDRESS = '0xA102072A4C07F06EC3B4900FDC4C7B80b6c57429'
const HONEYSWAP_ROUTER_ADDRESS = '0x1C232F01118CB8B424793ae03F870aa7D0ac7f77'
const LEVINSWAP_ROUTER_ADDRESS = '0xb18d4f69627F8320619A696202Ad2C430CeF7C53'
const PANCAKESWAP_ROUTER_ADDRESS = { [ChainId.BSC_MAINNET]: '0x10ED43C718714eb63d5aA57B78B54704E256024E' }
const QUICKSWAP_ROUTER_ADDRESS = '0xa5E0829CaCEd8fFDD4De3c43696c57F7D7A678ff'
const SUSHISWAP_ROUTER_ADDRESS: { [chainId: number]: string } = {
  [ChainId.MAINNET]: '0xd9e1cE17f2641f24aE83637ab66a2cca9C378B9F',
  [ChainId.RINKEBY]: '0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506',
  [ChainId.XDAI]: '0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506',
  [ChainId.ARBITRUM_ONE]: '0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506',
  [ChainId.POLYGON]: '0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506',
  [ChainId.BSC_MAINNET]: '0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506',
}
const UNISWAP_ROUTER_ADDRESS = '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D'

export interface UniswapV2RoutablePlatformParams {
  /**
   * The chainIds this platform supports
   */
  chainIds: ChainId[]
  /**
   * The name of the platform.
   */
  name: string
  /**
   * List of factory addresses, one for each chainId.
   */
  factoryAddress: {
    [supportedChainId in ChainId]?: string
  }
  /**
   * List of router addresses, one for each chainId.
   */
  routerAddress: {
    [supportedChainId in ChainId]?: string
  }
  /**
   * List of subgraph endpoints, one for each chainId.
   */
  subgraphEndpoint?: {
    [supportedChainId in ChainId]?: string
  }
  /**
   * Initial code hash
   */
  initCodeHash: string
  /**
   * The default swap fee for this platform.
   */
  defaultSwapFee: BigintIsh
}

/**
 * A Uniswap V2 platform to which Swapr can route through.
 */
export class UniswapV2RoutablePlatform extends BaseRoutablePlatform {
  public readonly factoryAddress: {
    [supportedChainId in ChainId]?: string
  }
  public readonly routerAddress: {
    [supportedChainId in ChainId]?: string
  }
  public readonly subgraphEndpoint: {
    [supportedChainId in ChainId]?: string
  }
  public readonly initCodeHash: string
  public readonly defaultSwapFee: BigintIsh

  public static readonly BAOSWAP = new UniswapV2RoutablePlatform({
    chainIds: [ChainId.XDAI],
    name: 'Baoswap',
    factoryAddress: {
      [ChainId.XDAI]: BAOSWAP_FACTORY_ADDRESS,
    },
    routerAddress: {
      [ChainId.XDAI]: BAOSWAP_ROUTER_ADDRESS,
    },
    initCodeHash: '0x0bae3ead48c325ce433426d2e8e6b07dac10835baec21e163760682ea3d3520d',
    defaultSwapFee: _30,
  })

  /**
   * @see https://docs.biswap.org/biswap/general-information/biswap-smart-contracts for smart contract info
   * @see https://bscscan.com/address/0x858E3312ed3A876947EA49d572A7C42DE08af7EE#readContract (Factor address) for INIT_CODE_HASH
   * @see https://github.com/biswap-org/core/blob/78a67b2bf9dccc551adf91b0529aec6df9eb9b27/contracts/BiswapPair.sol#L29 for swapFee default value
   * @see https://thegraph.com/hosted-service/subgraph/unchase/biswap for Subraph Endpoint
   */
  public static readonly BISWAP = new UniswapV2RoutablePlatform({
    chainIds: [ChainId.BSC_MAINNET],
    name: 'Biswap',
    factoryAddress: BISWAP_FACTORY_ADDRESS,
    routerAddress: BISWAP_ROUTER_ADDRESS,
    initCodeHash: '0xfea293c909d87cd4153593f077b76bb7e94340200f4ee84211ae8e4f9bd7ffdf',
    defaultSwapFee: TEN,
    subgraphEndpoint: {
      [ChainId.BSC_MAINNET]: 'https://api.thegraph.com/subgraphs/name/unchase/biswap',
    },
  })

  public static readonly DFYN = new UniswapV2RoutablePlatform({
    chainIds: [ChainId.POLYGON],
    name: 'DFYN',
    factoryAddress: {
      [ChainId.POLYGON]: DFYN_FACTORY_ADDRESS,
    },
    routerAddress: {
      [ChainId.POLYGON]: DFYN_ROUTER_ADDRESS,
    },
    initCodeHash: '0xf187ed688403aa4f7acfada758d8d53698753b998a3071b06f1b777f4330eaf3',
    defaultSwapFee: _30,
  })

  public static readonly HONEYSWAP = new UniswapV2RoutablePlatform({
    chainIds: [ChainId.XDAI],
    name: 'Honeyswap',
    factoryAddress: {
      [ChainId.XDAI]: HONEYSWAP_FACTORY_ADDRESS,
    },
    routerAddress: {
      [ChainId.XDAI]: HONEYSWAP_ROUTER_ADDRESS,
    },
    initCodeHash: '0x3f88503e8580ab941773b59034fb4b2a63e86dbc031b3633a925533ad3ed2b93',
    defaultSwapFee: _30,
  })

  public static readonly LEVINSWAP = new UniswapV2RoutablePlatform({
    chainIds: [ChainId.XDAI],
    name: 'Levinswap',
    factoryAddress: {
      [ChainId.XDAI]: LEVINSWAP_FACTORY_ADDRESS,
    },
    routerAddress: {
      [ChainId.XDAI]: LEVINSWAP_ROUTER_ADDRESS,
    },
    initCodeHash: '0x4955fd9146732ca7a64d43c7a8d65fe6db1acca27e9c5b3bee7c3abe5849f441',
    defaultSwapFee: _30,
  })

  public static readonly PANCAKESWAP = new UniswapV2RoutablePlatform({
    chainIds: [ChainId.BSC_MAINNET],
    name: 'Pancakeswap',
    factoryAddress: PANCAKESWAP_FACTORY_ADDRESS,
    routerAddress: PANCAKESWAP_ROUTER_ADDRESS,
    initCodeHash: '0x00fb7f630766e6a796048ea87d01acd3068e8ff67d078148a3fa3f4a84f69bd5',
    defaultSwapFee: _25,
    subgraphEndpoint: {},
  })

  public static readonly QUICKSWAP = new UniswapV2RoutablePlatform({
    chainIds: [ChainId.POLYGON],
    name: 'Quickswap',
    factoryAddress: {
      [ChainId.POLYGON]: QUICKSWAP_FACTORY_ADDRESS,
    },
    routerAddress: {
      [ChainId.POLYGON]: QUICKSWAP_ROUTER_ADDRESS,
    },
    initCodeHash: '0x96e8ac4277198ff8b6f785478aa9a39f403cb768dd02cbee326c3e7da348845f',
    defaultSwapFee: _30,
  })

  public static readonly SUSHISWAP = new UniswapV2RoutablePlatform({
    chainIds: [ChainId.MAINNET, ChainId.RINKEBY, ChainId.ARBITRUM_ONE, ChainId.POLYGON, ChainId.BSC_MAINNET],
    name: 'Sushiswap',
    factoryAddress: SUSHISWAP_FACTORY_ADDRESS,
    routerAddress: SUSHISWAP_ROUTER_ADDRESS,
    initCodeHash: '0xe18a34eb0e04b04f7a0ac29a6e80748dca96319b42c54d679cb821dca90c6303',
    defaultSwapFee: _30,
    subgraphEndpoint: {},
  })

  public static readonly SWAPR = new UniswapV2RoutablePlatform({
    chainIds: [
      ChainId.MAINNET,
      ChainId.RINKEBY,
      ChainId.ARBITRUM_ONE,
      ChainId.ARBITRUM_RINKEBY,
      ChainId.ARBITRUM_GOERLI,
      ChainId.XDAI,
      ChainId.GOERLI,
    ],
    name: 'Swapr',
    factoryAddress: FACTORY_ADDRESS,
    routerAddress: ROUTER_ADDRESS,
    initCodeHash: INIT_CODE_HASH,
    defaultSwapFee,
    subgraphEndpoint: {
      [ChainId.MAINNET]: 'https://api.thegraph.com/subgraphs/name/dxgraphs/swapr-mainnet-v2',
      [ChainId.ARBITRUM_ONE]: 'https://api.thegraph.com/subgraphs/name/dxgraphs/swapr-arbitrum-one-v3',
      [ChainId.XDAI]: 'https://api.thegraph.com/subgraphs/name/dxgraphs/swapr-xdai-v2',
      [ChainId.RINKEBY]: 'https://api.thegraph.com/subgraphs/name/dxgraphs/swapr-rinkeby',
      [ChainId.ARBITRUM_RINKEBY]: 'https://api.thegraph.com/subgraphs/name/dxgraphs/swapr-arbitrum-rinkeby-v2',
    },
  })

  public static readonly UNISWAP = new UniswapV2RoutablePlatform({
    chainIds: [ChainId.MAINNET, ChainId.RINKEBY],
    name: 'Uniswap v2',
    factoryAddress: {
      [ChainId.MAINNET]: UNISWAP_FACTORY_ADDRESS,
      [ChainId.RINKEBY]: UNISWAP_FACTORY_ADDRESS,
    },
    routerAddress: {
      [ChainId.MAINNET]: UNISWAP_ROUTER_ADDRESS,
      [ChainId.RINKEBY]: UNISWAP_ROUTER_ADDRESS,
    },
    initCodeHash: '0x96e8ac4277198ff8b6f785478aa9a39f403cb768dd02cbee326c3e7da348845f',
    defaultSwapFee: _30,
    subgraphEndpoint: {
      [ChainId.MAINNET]: 'https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v2',
    },
  })

  /**
   * Create a new UniswapV2RoutablePlatform instance.
   */
  public constructor({
    chainIds,
    name,
    factoryAddress,
    routerAddress,
    initCodeHash,
    defaultSwapFee,
    subgraphEndpoint,
  }: UniswapV2RoutablePlatformParams) {
    super(chainIds, name)
    this.factoryAddress = factoryAddress
    this.routerAddress = routerAddress
    this.initCodeHash = initCodeHash
    this.defaultSwapFee = defaultSwapFee
    this.subgraphEndpoint = subgraphEndpoint || {}
  }

  /**
   * Check if the platform supports the given chain
   * @param chainId The chainId of the desired platform
   * @returns Whether the platform supports the given chain
   */
  public supportsChain(chainId: ChainId): boolean {
    return (
      this.chainIds.includes(chainId) &&
      this.factoryAddress[chainId] !== AddressZero &&
      this.routerAddress[chainId] !== AddressZero
    )
  }
}
