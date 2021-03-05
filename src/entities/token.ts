import invariant from 'tiny-invariant'
import { ChainId } from '../constants'
import { validateAndParseAddress } from '../utils'
import { Currency } from './currency'

/**
 * Represents an ERC20 token with a unique address and some metadata.
 */
export class Token extends Currency {
  public readonly chainId: ChainId
  public readonly address: string

  public static readonly WETH: { [key: number]: Token } = {
    [ChainId.MAINNET]: new Token(
      ChainId.MAINNET,
      '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
      18,
      'WETH',
      'Wrapped Ether'
    ),
    [ChainId.RINKEBY]: new Token(
      ChainId.RINKEBY,
      '0xc778417E063141139Fce010982780140Aa0cD5Ab',
      18,
      'WETH',
      'Wrapped Ether'
    ),
    [ChainId.ARBITRUM_TESTNET_V3]: new Token(
      ChainId.ARBITRUM_TESTNET_V3,
      '0xf8456e5e6A225C2C1D74D8C9a4cB2B1d5dc1153b',
      18,
      'WETH',
      'Wrapped Ether'
    ),
    [ChainId.SOKOL]: new Token(
      ChainId.SOKOL,
      '0xfDc50eF6b67F65Dddc36e56729a9D07BAe1A1f68',
      18,
      'WETH',
      'Wrapped Ether'
    ),
    [ChainId.XDAI]: new Token(ChainId.XDAI, '0x6a023ccd1ff6f2045c3309768ead9e68f978f6e1', 18, 'WETH', 'Wrapped Ether on xDai')
  }

  public static readonly WSPOA: { [key: number]: Token } = {
    [ChainId.SOKOL]: new Token(ChainId.SOKOL, '0xc655c6D80ac92d75fBF4F40e95280aEb855B1E87', 18, 'WSPOA', 'Wrapped SPOA')
  }

  public static readonly WXDAI: { [key: number]: Token } = {
    [ChainId.XDAI]: new Token(ChainId.XDAI, '0xe91D153E0b41518A2Ce8Dd3D7944Fa863463a97d', 18, 'WXDAI', 'Wrapped xDAI')
  }

  public static readonly DXD: { [key: number]: Token } = {
    [ChainId.MAINNET]: new Token(ChainId.MAINNET, '0xa1d65E8fB6e87b60FECCBc582F7f97804B725521', 18, 'DXD', 'DXdao'),
    [ChainId.RINKEBY]: new Token(ChainId.RINKEBY, '0x554898A0BF98aB0C03ff86C7DccBE29269cc4d29', 18, 'DXD', 'DXdao')
  }

  private static readonly NATIVE_CURRENCY_WRAPPER: { [chainId in ChainId]: Token } = {
    [ChainId.MAINNET]: Token.WETH[ChainId.MAINNET],
    [ChainId.RINKEBY]: Token.WETH[ChainId.RINKEBY],
    [ChainId.ARBITRUM_TESTNET_V3]: Token.WETH[ChainId.ARBITRUM_TESTNET_V3],
    [ChainId.SOKOL]: Token.WSPOA[ChainId.SOKOL],
    [ChainId.XDAI]: Token.WXDAI[ChainId.XDAI]
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
export const WETH = Token.WETH
export const WSPOA = Token.WSPOA
export const DXD = Token.DXD
export const WXDAI = Token.WXDAI
