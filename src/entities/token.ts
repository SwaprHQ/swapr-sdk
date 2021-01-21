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

export const WETH: { [key: number]: Token } = {
  [ChainId.MAINNET]: new Token(
    ChainId.MAINNET,
    '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
    18,
    'WETH',
    'Wrapped Ether'
  ),
  [ChainId.ROPSTEN]: new Token(
    ChainId.ROPSTEN,
    '0xc778417E063141139Fce010982780140Aa0cD5Ab',
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
  [ChainId.GÖRLI]: new Token(ChainId.GÖRLI, '0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6', 18, 'WETH', 'Wrapped Ether'),
  [ChainId.KOVAN]: new Token(ChainId.KOVAN, '0xd0A1E359811322d97991E03f863a0C30C2cF029C', 18, 'WETH', 'Wrapped Ether'),
  [ChainId.ARBITRUM_TESTNET_V3]: new Token(
    ChainId.ARBITRUM_TESTNET_V3,
    '0xaE909196e549587b8Dc0D26cdbf05B754BB580B3',
    18,
    'WETH',
    'Wrapped Ether'
  )
}

export const DXD: { [key: number]: Token } = {
  [ChainId.MAINNET]: new Token(ChainId.MAINNET, '0xa1d65E8fB6e87b60FECCBc582F7f97804B725521', 18, 'DXD', 'DXdao'),
  [ChainId.KOVAN]: new Token(ChainId.KOVAN, '0xDd25BaE0659fC06a8d00CD06C7f5A98D71bfB715', 18, 'DXD', 'DXdao'),
  [ChainId.RINKEBY]: new Token(ChainId.RINKEBY, '0x554898A0BF98aB0C03ff86C7DccBE29269cc4d29', 18, 'DXD', 'DXdao')
}

export const TEST_TOKENS: { [key: string]: { [key: number]: Token } } = {
  WEENUS: {
    [ChainId.MAINNET]: new Token(
      ChainId.MAINNET,
      '0x2823589Ae095D99bD64dEeA80B4690313e2fB519',
      18,
      'WEENUS',
      'Weenus 💪'
    ),
    [ChainId.RINKEBY]: new Token(
      ChainId.RINKEBY,
      '0xaFF4481D10270F50f203E0763e2597776068CBc5',
      18,
      'WEENUS',
      'Weenus 💪'
    )
  },
  XEENUS: {
    [ChainId.MAINNET]: new Token(
      ChainId.MAINNET,
      '0xeEf5E2d8255E973d587217f9509B416b41CA5870',
      18,
      'XEENUS',
      'Xeenus 💪'
    ),
    [ChainId.RINKEBY]: new Token(
      ChainId.RINKEBY,
      '0x022E292b44B5a146F2e8ee36Ff44D3dd863C915c',
      18,
      'XEENUS',
      'Xeenus 💪'
    )
  },
  YEENUS: {
    [ChainId.MAINNET]: new Token(
      ChainId.MAINNET,
      '0x187E63F9eBA692A0ac98d3edE6fEb870AF0079e1',
      8,
      'YEENUS',
      'Yeenus 💪'
    ),
    [ChainId.RINKEBY]: new Token(
      ChainId.RINKEBY,
      '0xc6fDe3FD2Cc2b173aEC24cc3f267cb3Cd78a26B7',
      8,
      'YEENUS',
      'Yeenus 💪'
    )
  },
  ZEENUS: {
    [ChainId.MAINNET]: new Token(
      ChainId.MAINNET,
      '0x187E63F9eBA692A0ac98d3edE6fEb870AF0079e1',
      8,
      'ZEENUS',
      'Zeenus 💪'
    ),
    [ChainId.RINKEBY]: new Token(
      ChainId.RINKEBY,
      '0x1f9061B953bBa0E36BF50F21876132DcF276fC6e',
      8,
      'ZEENUS',
      'Zeenus 💪'
    )
  }
}
