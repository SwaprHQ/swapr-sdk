import { ChainId, getAllCommonUniswapV2Pairs, Token, UniswapV2RoutablePlatform } from '../src'

describe('Uniswap V2 Pairs', () => {
  describe('getAllCommonUniswapV2Pairs', () => {
    test('should return pairs for the standard UniswapV2Pair', async () => {
      const pairs = await getAllCommonUniswapV2Pairs({
        currencyA: new Token(ChainId.POLYGON, '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063', 18, 'DAI', 'DAI'),
        currencyB: new Token(ChainId.POLYGON, '0x172370d5Cd63279eFa6d502DAB29171933a610AF', 18, 'CRV', 'Curve'),
        platform: UniswapV2RoutablePlatform.QUICKSWAP,
      })

      expect(pairs.length > 0).toBeTruthy()
    })

    test('returns pairs for Swapr UniswapV2Pair', async () => {
      const pairs = await getAllCommonUniswapV2Pairs({
        currencyA: new Token(ChainId.MAINNET, '0x6cAcDB97e3fC8136805a9E7c342d866ab77D0957', 18, 'SWPR', 'Swapr'),
        currencyB: new Token(ChainId.MAINNET, '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', 18, 'WETH', 'WETH'),
        platform: UniswapV2RoutablePlatform.SWAPR,
      })

      expect(pairs.length > 0).toBeTruthy()
    })
  })
})
