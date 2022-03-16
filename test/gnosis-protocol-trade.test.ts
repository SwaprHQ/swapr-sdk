import { parseUnits } from '@ethersproject/units'

import { ChainId, GnosisProtocolTrade, Percent, RoutablePlatform, Token, TokenAmount } from '../src'

describe('GnosisProtocolTrade', () => {
  const maximumSlippage = new Percent('3', '100')
  const tokenXWDAI = new Token(ChainId.XDAI, '0xe91D153E0b41518A2Ce8Dd3D7944Fa863463a97d', 18, 'WXDAI', 'WXDAI')
  const tokenUSDC = new Token(ChainId.XDAI, '0xDDAfbb505ad214D7b80b1f830fcCc89B60fb7A83', 6, 'USDC', 'USDC')
  const tokenWETH = new Token(ChainId.XDAI, '0x6A023CCd1ff6F2045C3309768eAd9E68F978f6e1', 18, 'WETH', 'WETH')

  describe('Gnosis Chain', () => {
    test('Should return the best trade from WXDAI to USDC', async () => {
      const currencyAmountIn = new TokenAmount(tokenXWDAI, parseUnits('100', tokenXWDAI.decimals).toBigInt())

      const trade = await GnosisProtocolTrade.bestTradeExactIn({
        currencyAmountIn,
        currencyOut: tokenUSDC,
        maximumSlippage,
      })

      expect(trade).toBeDefined()
      expect(trade?.platform.name).toEqual(RoutablePlatform.GNOSIS_PROTOCOL.name)
    })

    test('Should return the best trade from USDC to WXDAI', async () => {
      const currencyAmountIn = new TokenAmount(tokenUSDC, parseUnits('100', tokenUSDC.decimals).toBigInt())

      const trade = await GnosisProtocolTrade.bestTradeExactIn({
        currencyAmountIn,
        currencyOut: tokenXWDAI,
        maximumSlippage,
      })

      expect(trade).toBeDefined()
      expect(trade?.platform.name).toEqual(RoutablePlatform.GNOSIS_PROTOCOL.name)
    })

    test('Should estimate WXDAI input amount to get 100 USDC', async () => {
      const currencyAmountOut = new TokenAmount(tokenUSDC, parseUnits('100', tokenUSDC.decimals).toBigInt())
      const trade = await GnosisProtocolTrade.bestTradeExactOut({
        currencyAmountOut,
        maximumSlippage,
        currencyIn: tokenXWDAI,
      })
      expect(trade).toBeDefined()
    })
    test('Should estimate WETH input amount to buy 100 WXDAI after fees', async () => {
      const currencyAmountOut = new TokenAmount(tokenXWDAI, parseUnits('1', tokenXWDAI.decimals).toBigInt())
      const trade = await GnosisProtocolTrade.bestTradeExactOut({
        currencyAmountOut,
        maximumSlippage,
        currencyIn: tokenWETH,
      })
      expect(trade).toBeDefined()
    })
  })

  test('Should handle fractions like 1.5 WXDAI to USDC', async () => {
    const currencyAmountIn = new TokenAmount(tokenXWDAI, parseUnits('1.5', tokenXWDAI.decimals).toString())
    const trade = await GnosisProtocolTrade.bestTradeExactIn({
      currencyAmountIn,
      currencyOut: tokenUSDC,
      maximumSlippage,
    })
    expect(trade).toBeDefined()
  })
})
