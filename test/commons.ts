import { ChainId, Token } from '../src'

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
