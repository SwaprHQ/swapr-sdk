import invariant from 'tiny-invariant'
import JSBI from 'jsbi'
import { getNetwork } from '@ethersproject/networks'
import { getDefaultProvider } from '@ethersproject/providers'
import { Contract } from '@ethersproject/contracts'

import { ChainId, SolidityType } from '../constants'
import ERC20 from '../abis/ERC20.json'
import { validateAndParseAddress, validateSolidityTypeInstance } from '../utils'

let CACHE: { [chainId: number]: { [address: string]: number } } = {
  [ChainId.MAINNET]: {
    '0xE0B7927c4aF23765Cb51314A0E0521A9645F0E2A': 9 // DGD
  },
  [ChainId.KOVAN]: {
    '0xDd25BaE0659fC06a8d00CD06C7f5A98D71bfB715': 18 // DXD
  }
}

export class Token {
  public readonly chainId: ChainId
  public readonly address: string
  public readonly decimals: number
  public readonly symbol?: string
  public readonly name?: string

  static async fetchData(
    chainId: ChainId,
    address: string,
    provider = getDefaultProvider(getNetwork(chainId)),
    symbol?: string,
    name?: string
  ): Promise<Token> {
    const parsedDecimals =
      typeof CACHE?.[chainId]?.[address] === 'number'
        ? CACHE[chainId][address]
        : await new Contract(address, ERC20, provider).decimals().then((decimals: number): number => {
            CACHE = {
              ...CACHE,
              [chainId]: {
                ...CACHE?.[chainId],
                [address]: decimals
              }
            }
            return decimals
          })
    return new Token(chainId, address, parsedDecimals, symbol, name)
  }

  constructor(chainId: ChainId, address: string, decimals: number, symbol?: string, name?: string) {
    validateSolidityTypeInstance(JSBI.BigInt(decimals), SolidityType.uint8)

    this.chainId = chainId
    this.address = validateAndParseAddress(address)
    this.decimals = decimals
    if (typeof symbol === 'string') this.symbol = symbol
    if (typeof name === 'string') this.name = name
  }

  equals(other: Token): boolean {
    const equal = this.chainId === other.chainId && this.address === other.address
    if (equal) {
      invariant(this.decimals === other.decimals, 'DECIMALS')
      if (this.symbol && other.symbol) invariant(this.symbol === other.symbol, 'SYMBOL')
      if (this.name && other.name) invariant(this.name === other.name, 'NAME')
    }
    return equal
  }

  sortsBefore(other: Token): boolean {
    invariant(this.chainId === other.chainId, 'CHAIN_IDS')
    invariant(this.address !== other.address, 'ADDRESSES')
    return this.address.toLowerCase() < other.address.toLowerCase()
  }
}

export const WETH = {
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
  [ChainId.KOVAN]: new Token(ChainId.KOVAN, '0xd0A1E359811322d97991E03f863a0C30C2cF029C', 18, 'WETH', 'Wrapped Ether')
}

export const DXD = {
  [ChainId.MAINNET]: new Token(
    ChainId.MAINNET,
    '0xa1d65E8fB6e87b60FECCBc582F7f97804B725521',
    18,
    'DXD',
    'DXDao'
  ),
  [ChainId.KOVAN]: new Token(ChainId.KOVAN, '0xDd25BaE0659fC06a8d00CD06C7f5A98D71bfB715', 18, 'DXD', 'DXDao')
}

export const TEST_TOKENS = {
  WEENUS : {
    [ChainId.MAINNET]: new Token(ChainId.MAINNET, '0x2823589Ae095D99bD64dEeA80B4690313e2fB519', 18, 'WEENUS', 'Weenus'),
    [ChainId.KOVAN]: new Token(ChainId.KOVAN, '0xaFF4481D10270F50f203E0763e2597776068CBc5', 18, 'WEENUS', 'Weenus')
  },
  XEENUS : {
    [ChainId.MAINNET]: new Token(ChainId.MAINNET, '0xeEf5E2d8255E973d587217f9509B416b41CA5870', 18, 'XEENUS', 'Xeenus'),
    [ChainId.KOVAN]: new Token(ChainId.KOVAN, '0x022E292b44B5a146F2e8ee36Ff44D3dd863C915c', 18, 'XEENUS', 'Xeenus')
  },
  YEENUS : {
    [ChainId.MAINNET]: new Token(ChainId.MAINNET, '0x187E63F9eBA692A0ac98d3edE6fEb870AF0079e1', 8, 'YEENUS', 'Yeenus'),
    [ChainId.KOVAN]: new Token(ChainId.KOVAN, '0xc6fDe3FD2Cc2b173aEC24cc3f267cb3Cd78a26B7', 8, 'YEENUS', 'Yeenus')
  },
}
  
