import {
  BigintIsh,
  ChainId,
  defaultSwapFee,
  FACTORY_ADDRESS,
  INIT_CODE_HASH,
  ROUTER_ADDRESS,
  _30
} from '../../../constants'
import { RoutablePlatform } from './routable-platform'

const UNISWAP_FACTORY_ADDRESS = '0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f'
const SUSHISWAP_FACTORY_ADDRESS: { [chainId: number]: string } = {
  [ChainId.MAINNET]: '0xC0AEe478e3658e2610c5F7A4A2E1777cE9e4f2Ac',
  [ChainId.RINKEBY]: '0xc35DADB65012eC5796536bD9864eD8773aBc74C4',
  [ChainId.XDAI]: '0xc35DADB65012eC5796536bD9864eD8773aBc74C4',
  [ChainId.ARBITRUM_ONE]: '0xc35DADB65012eC5796536bD9864eD8773aBc74C4'
}
const HONEYSWAP_FACTORY_ADDRESS = '0xA818b4F111Ccac7AA31D0BCc0806d64F2E0737D7'
const BAOSWAP_FACTORY_ADDRESS = '0x45de240fbe2077dd3e711299538a09854fae9c9b'
const LEVINSWAP_FACTORY_ADDRESS = '0x965769C9CeA8A7667246058504dcdcDb1E2975A5'

const UNISWAP_ROUTER_ADDRESS = '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D'
const SUSHISWAP_ROUTER_ADDRESS: { [chainId: number]: string } = {
  [ChainId.MAINNET]: '0xd9e1cE17f2641f24aE83637ab66a2cca9C378B9F',
  [ChainId.RINKEBY]: '0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506',
  [ChainId.XDAI]: '0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506',
  [ChainId.ARBITRUM_ONE]: '0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506'
}
const HONEYSWAP_ROUTER_ADDRESS = '0x1C232F01118CB8B424793ae03F870aa7D0ac7f77'
const BAOSWAP_ROUTER_ADDRESS = '0x6093AeBAC87d62b1A5a4cEec91204e35020E38bE'
const LEVINSWAP_ROUTER_ADDRESS = '0xb18d4f69627F8320619A696202Ad2C430CeF7C53'

/**
 * A platform to which Swapr can route through.
 */
export class UniswapV2RoutablePlatform extends RoutablePlatform {
  public readonly factoryAddress: { [supportedChainId in ChainId]?: string }
  public readonly routerAddress: { [supportedChainId in ChainId]?: string }
  public readonly initCodeHash: string
  public readonly defaultSwapFee: BigintIsh

  public static readonly SWAPR = new UniswapV2RoutablePlatform(
    [ChainId.MAINNET, ChainId.RINKEBY, ChainId.ARBITRUM_ONE, ChainId.ARBITRUM_RINKEBY, ChainId.XDAI],
    'Swapr',
    FACTORY_ADDRESS,
    ROUTER_ADDRESS,
    INIT_CODE_HASH,
    defaultSwapFee
  )
  public static readonly UNISWAP = new UniswapV2RoutablePlatform(
    [ChainId.MAINNET, ChainId.RINKEBY],
    'Uniswap v2',
    { [ChainId.MAINNET]: UNISWAP_FACTORY_ADDRESS, [ChainId.RINKEBY]: UNISWAP_FACTORY_ADDRESS },
    { [ChainId.MAINNET]: UNISWAP_ROUTER_ADDRESS, [ChainId.RINKEBY]: UNISWAP_ROUTER_ADDRESS },
    '0x96e8ac4277198ff8b6f785478aa9a39f403cb768dd02cbee326c3e7da348845f',
    _30
  )
  public static readonly SUSHISWAP = new UniswapV2RoutablePlatform(
    [ChainId.MAINNET, ChainId.RINKEBY],
    'Sushiswap',
    SUSHISWAP_FACTORY_ADDRESS,
    SUSHISWAP_ROUTER_ADDRESS,
    '0xe18a34eb0e04b04f7a0ac29a6e80748dca96319b42c54d679cb821dca90c6303',
    _30
  )
  public static readonly HONEYSWAP = new UniswapV2RoutablePlatform(
    [ChainId.XDAI],
    'Honeyswap',
    { [ChainId.XDAI]: HONEYSWAP_FACTORY_ADDRESS },
    { [ChainId.XDAI]: HONEYSWAP_ROUTER_ADDRESS },
    '0x3f88503e8580ab941773b59034fb4b2a63e86dbc031b3633a925533ad3ed2b93',
    _30
  )
  public static readonly BAOSWAP = new UniswapV2RoutablePlatform(
    [ChainId.XDAI],
    'Baoswap',
    { [ChainId.XDAI]: BAOSWAP_FACTORY_ADDRESS },
    { [ChainId.XDAI]: BAOSWAP_ROUTER_ADDRESS },
    '0x0bae3ead48c325ce433426d2e8e6b07dac10835baec21e163760682ea3d3520d',
    _30
  )
  public static readonly LEVINSWAP = new UniswapV2RoutablePlatform(
    [ChainId.XDAI],
    'Levinswap',
    { [ChainId.XDAI]: LEVINSWAP_FACTORY_ADDRESS },
    { [ChainId.XDAI]: LEVINSWAP_ROUTER_ADDRESS },
    '0x4955fd9146732ca7a64d43c7a8d65fe6db1acca27e9c5b3bee7c3abe5849f441',
    _30
  )

  public constructor(
    chainIds: ChainId[],
    name: string,
    factoryAddress: { [supportedChainId in ChainId]?: string },
    routerAddress: { [supportedChainId in ChainId]?: string },
    initCodeHash: string,
    defaultSwapFee: BigintIsh
  ) {
    super(chainIds, name)
    this.factoryAddress = factoryAddress
    this.routerAddress = routerAddress
    this.initCodeHash = initCodeHash
    this.defaultSwapFee = defaultSwapFee
  }

  public supportsChain(chainId: ChainId): boolean {
    return !!this.factoryAddress[chainId] && !!this.routerAddress[chainId]
  }
}
