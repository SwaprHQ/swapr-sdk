import { ChainId, getAllCommonUniswapV2Pairs, Token, UniswapV2RoutablePlatform } from '../src'

describe('Uniswap V2 Pairs', () => {
  describe('getAllCommonUniswapV2Pairs', () => {
    test('should return pairs for the standard UniswapV2Pair', async () => {
      const pairs = await getAllCommonUniswapV2Pairs({
        currencyA: new Token(ChainId.POLYGON, '0x8f3cf7ad23cd3cadbd9735aff958023239c6a063', 18, 'DAI', 'DAI'),
        currencyB: new Token(ChainId.POLYGON, '0x172370d5cd63279efa6d502dab29171933a610af', 18, 'WETH', 'WETH'),
        platform: UniswapV2RoutablePlatform.QUICKSWAP,
      })

      expect(pairs.length > 0).toBeTruthy()
    })

    test('returns pairs for Swapr UniswapV2Pair', async () => {
      const pairs = await getAllCommonUniswapV2Pairs({
        currencyA: new Token(ChainId.MAINNET, '0x6cacdb97e3fc8136805a9e7c342d866ab77d0957', 18, 'SWPR', 'Swapr'),
        currencyB: new Token(ChainId.MAINNET, '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2', 18, 'WETH', 'WETH'),
        platform: UniswapV2RoutablePlatform.SWAPR,
      })

      expect(pairs.length > 0).toBeTruthy()
    })
  })
})
