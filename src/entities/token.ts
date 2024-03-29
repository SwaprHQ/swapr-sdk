import invariant from 'tiny-invariant'

import { ChainId } from '../constants'
import { validateAndParseAddress } from '../utils'
import { Currency } from './currency'

/**
 * Represents an ERC20 token with a unique address and some metadata.
 */
/**
 * @TODO check why we have 2 different token lists here and
 * src/entities/trades/uniswap-v2/constants.ts
 */
export class Token extends Currency {
  public readonly chainId: ChainId
  public readonly address: string

  public static readonly ARB: Record<number, Token> = {
    /**
     * @see https://docs.arbitrum.foundation/deployment-addresses for token info
     */
    [ChainId.ARBITRUM_GOERLI]: new Token(
      ChainId.ARBITRUM_GOERLI,
      '0xF861378B543525ae0C47d33C90C954Dc774Ac1F9',
      18,
      'ARB',
      'Arbitrum',
    ),
    [ChainId.ARBITRUM_ONE]: new Token(
      ChainId.ARBITRUM_ONE,
      '0x912CE59144191C1204E64559FE8253a0e49E6548',
      18,
      'ARB',
      'Arbitrum',
    ),
    [ChainId.MAINNET]: new Token(ChainId.MAINNET, '0xB50721BCf8d664c30412Cfbc6cf7a15145234ad1', 18, 'ARB', 'Arbitrum'),
  }

  public static readonly BUSD: Record<number, Token> = {
    [ChainId.BSC_MAINNET]: new Token(
      ChainId.BSC_MAINNET,
      '0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56',
      18,
      'BUSD',
      'Binance-Peg BUSD Token',
    ),
  }

  public static readonly CAKE: Record<number, Token> = {
    [ChainId.BSC_MAINNET]: new Token(
      ChainId.BSC_MAINNET,
      '0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82',
      18,
      'CAKE',
      'PancakeSwap Token',
    ),
  }

  public static readonly DXD: Record<number, Token> = {
    [ChainId.ARBITRUM_GOERLI]: new Token(
      ChainId.ARBITRUM_GOERLI,
      '0xCEf91E326978fEDbb14825E17DAFCa18508E6232',
      18,
      'DXD',
      'DXdao',
    ),
    [ChainId.ARBITRUM_ONE]: new Token(
      ChainId.ARBITRUM_ONE,
      '0xC3Ae0333F0F34aa734D5493276223d95B8F9Cb37',
      18,
      'DXD',
      'DXdao',
    ),
    [ChainId.ARBITRUM_RINKEBY]: new Token(
      ChainId.ARBITRUM_RINKEBY,
      '0x5d47100B0854525685907D5D773b92c22c0c745e',
      18,
      'DXD',
      'DXdao',
    ),
    [ChainId.MAINNET]: new Token(ChainId.MAINNET, '0xa1d65E8fB6e87b60FECCBc582F7f97804B725521', 18, 'DXD', 'DXdao'),
    [ChainId.RINKEBY]: new Token(ChainId.RINKEBY, '0x554898A0BF98aB0C03ff86C7DccBE29269cc4d29', 18, 'DXD', 'DXdao'),
    [ChainId.XDAI]: new Token(
      ChainId.XDAI,
      '0xb90D6bec20993Be5d72A5ab353343f7a0281f158',
      18,
      'DXD',
      'DXdao from Ethereum',
    ),
  }

  public static readonly SWPR: Record<number, Token> = {
    [ChainId.ARBITRUM_GOERLI]: new Token(
      ChainId.ARBITRUM_GOERLI,
      '0x75902ae4D8AB92d38e20D65f758b03d595C0047B',
      18,
      'SWPR',
      'Swapr',
    ),
    [ChainId.ARBITRUM_ONE]: new Token(
      ChainId.ARBITRUM_ONE,
      '0xdE903E2712288A1dA82942DDdF2c20529565aC30',
      18,
      'SWPR',
      'Swapr',
    ),
    [ChainId.ARBITRUM_RINKEBY]: new Token(
      ChainId.ARBITRUM_RINKEBY,
      '0x8f2072c2142D9fFDc785955E0Ce71561753D44Fb',
      18,
      'SWPR',
      'Swapr',
    ),
    [ChainId.GOERLI]: new Token(ChainId.GOERLI, '0x2F9343Cf18BAAcF57AC4a4e20188b9b00CFce3f1', 18, 'SWPR', 'Swapr'),
    [ChainId.MAINNET]: new Token(ChainId.MAINNET, '0x6cAcDB97e3fC8136805a9E7c342d866ab77D0957', 18, 'SWPR', 'Swapr'),
    [ChainId.RINKEBY]: new Token(ChainId.RINKEBY, '0xDcb0BeB93139c3e5eD0Edb749baccADd6badAc4f', 18, 'SWPR', 'Swapr'),
    [ChainId.XDAI]: new Token(ChainId.XDAI, '0x532801ED6f82FFfD2DAB70A19fC2d7B2772C4f4b', 18, 'SWPR', 'Swapr'),
  }

  public static readonly WBNB: Record<number, Token> = {
    [ChainId.BSC_MAINNET]: new Token(
      ChainId.BSC_MAINNET,
      '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c',
      18,
      'WBNB',
      'Wrapped BNB',
    ),
    [ChainId.BSC_TESTNET]: new Token(
      ChainId.BSC_TESTNET,
      '0x094616F0BdFB0b526bD735Bf66Eca0Ad254ca81F',
      18,
      'WBNB',
      'Wrapped BNB',
    ),
  }

  public static readonly WETH: Record<number, Token> = {
    [ChainId.ARBITRUM_GOERLI]: new Token(
      ChainId.ARBITRUM_GOERLI,
      '0x89C0DBbF7559E200443735e113039cE5f1e0e6F0',
      18,
      'WETH',
      'Wrapped Ether on Görli',
    ),
    [ChainId.ARBITRUM_ONE]: new Token(
      ChainId.ARBITRUM_ONE,
      '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1',
      18,
      'WETH',
      'Wrapped Ether',
    ),
    [ChainId.ARBITRUM_RINKEBY]: new Token(
      ChainId.ARBITRUM_RINKEBY,
      '0xB47e6A5f8b33b3F17603C83a0535A9dcD7E32681',
      18,
      'WETH',
      'Wrapped Ether',
    ),
    [ChainId.GOERLI]: new Token(
      ChainId.GOERLI,
      '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
      18,
      'WETH',
      'Wrapped Ether on Görli',
    ),
    [ChainId.MAINNET]: new Token(
      ChainId.MAINNET,
      '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
      18,
      'WETH',
      'Wrapped Ether',
    ),
    [ChainId.OPTIMISM_MAINNET]: new Token(
      ChainId.OPTIMISM_MAINNET,
      '0x4200000000000000000000000000000000000006',
      18,
      'WETH',
      'Wrapped Ether',
    ),
    [ChainId.POLYGON]: new Token(
      ChainId.POLYGON,
      '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619',
      18,
      'WETH',
      'Wrapped Ether on Polygon',
    ),
    [ChainId.RINKEBY]: new Token(
      ChainId.RINKEBY,
      '0xc778417E063141139Fce010982780140Aa0cD5Ab',
      18,
      'WETH',
      'Wrapped Ether',
    ),
    [ChainId.SCROLL_MAINNET]: new Token(
      ChainId.SCROLL_MAINNET,
      '0x5300000000000000000000000000000000000004',
      18,
      'WETH',
      'Wrapped Ether on Scroll',
    ),
    [ChainId.XDAI]: new Token(
      ChainId.XDAI,
      '0x6A023CCd1ff6F2045C3309768eAd9E68F978f6e1',
      18,
      'WETH',
      'Wrapped Ether on xDai',
    ),
    [ChainId.ZK_SYNC_ERA_MAINNET]: new Token(
      ChainId.ZK_SYNC_ERA_MAINNET,
      '0x5aea5775959fbc2557cc8789bc1bf90a239d9a91',
      18,
      'WETH',
      'Wrapped Ether on zkSync',
    ),
    /**
     * NOTE: Note the address of zkSync testnet contracts is subject
     * to change without notice.
     * @see https://era.zksync.io/docs/dev/building-on-zksync/useful-address.html
     * @see https://syncswap.gitbook.io/api-documentation/resources/smart-contract
     */
    [ChainId.ZK_SYNC_ERA_TESTNET]: new Token(
      ChainId.ZK_SYNC_ERA_TESTNET,
      '0x20b28b1e4665fff290650586ad76e977eab90c5d',
      18,
      'WETH',
      'Wrapped Ether on zkSync Testnet',
    ),
  }

  public static readonly WMATIC: Record<number, Token> = {
    [ChainId.POLYGON]: new Token(
      ChainId.POLYGON,
      '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270',
      18,
      'WMATIC',
      'Wrapped Matic',
    ),
  }

  public static readonly WXDAI: Record<number, Token> = {
    [ChainId.XDAI]: new Token(ChainId.XDAI, '0xe91D153E0b41518A2Ce8Dd3D7944Fa863463a97d', 18, 'WXDAI', 'Wrapped xDAI'),
  }

  private static readonly NATIVE_CURRENCY_WRAPPER: { [chainId in ChainId]: Token } = {
    [ChainId.ARBITRUM_GOERLI]: Token.WETH[ChainId.ARBITRUM_GOERLI],
    [ChainId.ARBITRUM_ONE]: Token.WETH[ChainId.ARBITRUM_ONE],
    [ChainId.ARBITRUM_RINKEBY]: Token.WETH[ChainId.ARBITRUM_RINKEBY],
    [ChainId.BSC_MAINNET]: Token.WBNB[ChainId.BSC_MAINNET],
    [ChainId.BSC_TESTNET]: Token.WBNB[ChainId.BSC_TESTNET],
    [ChainId.GOERLI]: Token.WETH[ChainId.GOERLI],
    [ChainId.MAINNET]: Token.WETH[ChainId.MAINNET],
    [ChainId.OPTIMISM_GOERLI]: Token.WETH[ChainId.OPTIMISM_MAINNET],
    [ChainId.OPTIMISM_MAINNET]: Token.WETH[ChainId.OPTIMISM_MAINNET],
    [ChainId.POLYGON]: Token.WMATIC[ChainId.POLYGON],
    [ChainId.RINKEBY]: Token.WETH[ChainId.RINKEBY],
    [ChainId.XDAI]: Token.WXDAI[ChainId.XDAI],
    [ChainId.SCROLL_MAINNET]: Token.WETH[ChainId.SCROLL_MAINNET],
    [ChainId.ZK_SYNC_ERA_MAINNET]: Token.WETH[ChainId.ZK_SYNC_ERA_MAINNET],
    [ChainId.ZK_SYNC_ERA_TESTNET]: Token.WETH[ChainId.ZK_SYNC_ERA_TESTNET],
  }

  public constructor(chainId: ChainId, address: string, decimals: number, symbol?: string, name?: string) {
    super(decimals, symbol, name)
    this.chainId = chainId
    this.address = validateAndParseAddress(address)
  }

  /**
   * Returns true if the two tokens are equivalent, i.e. have the same chainId and address.
   * @param other other token to compare
   */
  public equals(other: Token): boolean {
    // short circuit on reference equality
    if (this === other) {
      return true
    }
    return this.chainId === other.chainId && this.address === other.address
  }

  /**
   * Returns true if the address of this token sorts before the address of the other token
   * @param other other token to compare
   * @throws if the tokens have the same address
   * @throws if the tokens are on different chains
   */
  public sortsBefore(other: Token): boolean {
    invariant(this.chainId === other.chainId, 'CHAIN_IDS')
    invariant(this.address !== other.address, 'ADDRESSES')
    return this.address.toLowerCase() < other.address.toLowerCase()
  }

  public static getNativeWrapper(chainId: ChainId): Token {
    return Token.NATIVE_CURRENCY_WRAPPER[chainId]
  }

  public static isNativeWrapper(token: Token): boolean {
    return Token.NATIVE_CURRENCY_WRAPPER[token.chainId].equals(token)
  }
}

/**
 * Compares two currencies for equality
 */
export function currencyEquals(currencyA: Currency, currencyB: Currency): boolean {
  if (currencyA instanceof Token && currencyB instanceof Token) {
    return currencyA.equals(currencyB)
  } else if (currencyA instanceof Token) {
    return false
  } else if (currencyB instanceof Token) {
    return false
  } else {
    return currencyA === currencyB
  }
}

// reexport for convenience
export const ARB = Token.ARB
export const BUSD = Token.BUSD
export const CAKE = Token.CAKE
export const DXD = Token.DXD
export const SWPR = Token.SWPR
export const WBNB = Token.WBNB
export const WETH = Token.WETH
export const WMATIC = Token.WMATIC
export const WXDAI = Token.WXDAI
