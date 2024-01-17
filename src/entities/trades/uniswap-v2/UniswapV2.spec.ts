import { parseUnits } from '@ethersproject/units'

import { ChainId } from '../../../constants'
import { Currency } from '../../currency'
import { Percent, TokenAmount } from '../../fractions'
import { Token, WETH } from '../../token'
import { UniswapV2RoutablePlatform } from '../routable-platform'
import { USDC } from './constants'
import { getAllCommonUniswapV2Pairs } from './pairs'
import { UniswapV2Trade } from './UniswapV2'

describe('UniswapV2Trade', () => {
  describe('computeTradesExactIn', () => {
    test('return a trade list between USDT and MATIC on Polygon', async () => {
      const platform = UniswapV2RoutablePlatform.SUSHISWAP

      const tokenUSDT = new Token(
        ChainId.POLYGON,
        '0xc2132D05D31c914a87C6611C10748AEb04B58e8F',
        6,
        'USDT',
        'Tether USD',
      )

      const maximumSlippage = new Percent('5', '100')
      const currencyAmountIn = new TokenAmount(tokenUSDT, parseUnits('1', 6).toString())
      const currencyOut = Currency.getNative(ChainId.POLYGON)

      const pairs = await getAllCommonUniswapV2Pairs({
        currencyB: tokenUSDT,
        currencyA: currencyOut,
        platform,
      })

      expect(pairs.length).toBeGreaterThan(0)

      pairs.forEach((pair) => {
        expect(pair.platform).toBe(platform)
      })

      const computedTradeList = await UniswapV2Trade.computeTradesExactIn({
        pairs,
        currencyAmountIn,
        currencyOut,
        maximumSlippage,
      })

      expect(computedTradeList.length > 1).toBeTruthy()
      computedTradeList.forEach((trade) => {
        expect(trade.platform).toBe(platform)
      })
    })

    test('return a trade list between USDT and CRV on Polygon', async () => {
      const platform = UniswapV2RoutablePlatform.SUSHISWAP

      const tokenUSDT = new Token(
        ChainId.POLYGON,
        '0xc2132D05D31c914a87C6611C10748AEb04B58e8F',
        6,
        'USDT',
        'Tether USD',
      )

      const maximumSlippage = new Percent('5', '100')
      const currencyAmountIn = new TokenAmount(tokenUSDT, parseUnits('1', 6).toString())
      const currencyOut = new Token(ChainId.POLYGON, '0x172370d5Cd63279eFa6d502DAB29171933a610AF', 18, 'CRV', 'Curve')

      const pairs = await getAllCommonUniswapV2Pairs({
        currencyB: tokenUSDT,
        currencyA: currencyOut,
        platform,
      })

      pairs.forEach((pair) => {
        expect(pair.platform).toBe(platform)
      })

      const computedTradeList = await UniswapV2Trade.computeTradesExactIn({
        pairs,
        currencyAmountIn,
        currencyOut,
        maximumSlippage,
      })

      expect(computedTradeList.length > 1).toBeTruthy()
      computedTradeList.forEach((trade) => {
        expect(trade.platform).toBe(platform)
      })
    })

    test('return a trade list on Arbitrum', async () => {
      const platform = UniswapV2RoutablePlatform.SUSHISWAP

      const tokenUSDT = new Token(
        ChainId.ARBITRUM_ONE,
        '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9',
        6,
        'USDT',
        'Tether USD',
      )

      const maximumSlippage = new Percent('5', '100')
      const currencyAmountIn = new TokenAmount(tokenUSDT, parseUnits('1', 6).toString())
      const currencyOut = Currency.getNative(ChainId.ARBITRUM_ONE)

      const pairs = await getAllCommonUniswapV2Pairs({
        currencyB: tokenUSDT,
        currencyA: currencyOut,
        platform,
      })

      pairs.forEach((pair) => {
        expect(pair.platform).toBe(platform)
      })

      const computedTradeList = await UniswapV2Trade.computeTradesExactIn({
        pairs,
        currencyAmountIn,
        currencyOut,
        maximumSlippage,
      })

      expect(computedTradeList.length > 1).toBeTruthy()
      computedTradeList.forEach((trade) => {
        expect(trade.platform).toBe(platform)
      })
    })
  })
  describe('getAllCommonUniswapV2Pairs', () => {
    test('returns at least one pair from SushiSwap on Polygon', async () => {
      const platform = UniswapV2RoutablePlatform.SUSHISWAP

      const tokenUSDT = new Token(
        ChainId.POLYGON,
        '0xc2132D05D31c914a87C6611C10748AEb04B58e8F',
        6,
        'USDT',
        'Tether USD',
      )
      const currencyOut = new Token(ChainId.POLYGON, '0x172370d5Cd63279eFa6d502DAB29171933a610AF', 18, 'CRV', 'Curve')

      const pairs = await getAllCommonUniswapV2Pairs({
        currencyB: tokenUSDT,
        currencyA: currencyOut,
        platform,
      })

      expect(pairs.length).toBeGreaterThan(0)
    })

    test('returns at least one pair from SushiSwap on Arbitrum', async () => {
      const platform = UniswapV2RoutablePlatform.SUSHISWAP

      const tokenUSDC = USDC[ChainId.ARBITRUM_ONE]
      const tokenWETH = WETH[ChainId.ARBITRUM_ONE]

      const pairs = await getAllCommonUniswapV2Pairs({
        currencyB: tokenUSDC,
        currencyA: tokenWETH,
        platform,
      })

      expect(pairs.length).toBeGreaterThan(0)
    })
  })
})
