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
    [ChainId.ARBITRUM_ONE]: new Token(
      ChainId.ARBITRUM_ONE,
      '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1',
      18,
      'WETH',
      'Wrapped Ether'
    ),
    [ChainId.ARBITRUM_RINKEBY]: new Token(
      ChainId.ARBITRUM_RINKEBY,
      '0xB47e6A5f8b33b3F17603C83a0535A9dcD7E32681',
      18,
      'WETH',
      'Wrapped Ether'
    ),
    [ChainId.XDAI]: new Token(
      ChainId.XDAI,
      '0x6a023ccd1ff6f2045c3309768ead9e68f978f6e1',
      18,
      'WETH',
      'Wrapped Ether on xDai'
    )
  }

  public static readonly WXDAI: { [key: number]: Token } = {
    [ChainId.XDAI]: new Token(ChainId.XDAI, '0xe91D153E0b41518A2Ce8Dd3D7944Fa863463a97d', 18, 'WXDAI', 'Wrapped xDAI')
  }

  public static readonly DXD: { [key: number]: Token } = {
    [ChainId.MAINNET]: new Token(ChainId.MAINNET, '0xa1d65E8fB6e87b60FECCBc582F7f97804B725521', 18, 'DXD', 'DXdao'),
    [ChainId.RINKEBY]: new Token(ChainId.RINKEBY, '0x554898A0BF98aB0C03ff86C7DccBE29269cc4d29', 18, 'DXD', 'DXdao'),
    [ChainId.XDAI]: new Token(
      ChainId.XDAI,
      '0xb90d6bec20993be5d72a5ab353343f7a0281f158',
      18,
      'DXD',
      'DXdao from Ethereum'
    ),
    [ChainId.ARBITRUM_ONE]: new Token(
      ChainId.ARBITRUM_ONE,
      '0xC3Ae0333F0F34aa734D5493276223d95B8F9Cb37',
      18,
      'DXD',
      'DXdao from Ethereum'
    ),
    [ChainId.ARBITRUM_RINKEBY]: new Token(
      ChainId.ARBITRUM_RINKEBY,
      '0x5d47100B0854525685907D5D773b92c22c0c745e',
      18,
      'DXD',
      'DXdao from Ethereum'
    )
  }

  private static readonly NATIVE_CURRENCY_WRAPPER: { [chainId in ChainId]: Token } = {
    [ChainId.MAINNET]: Token.WETH[ChainId.MAINNET],
    [ChainId.RINKEBY]: Token.WETH[ChainId.RINKEBY],
    [ChainId.ARBITRUM_ONE]: Token.WETH[ChainId.ARBITRUM_ONE],
    [ChainId.ARBITRUM_RINKEBY]: Token.WETH[ChainId.ARBITRUM_RINKEBY],
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
export const WETH = Token.WETH
export const DXD = Token.DXD
export const WXDAI = Token.WXDAI
