import { parseUnits } from '@ethersproject/units'

import { ChainId, CoWTrade, CurrencyAmount, Percent, RoutablePlatform, Token, TokenAmount } from '../src'

describe('CoWTrade', () => {
  const user = '0x0000000000000000000000000000000000000000'
  const receiver = '0x0000000000000000000000000000000000000000'
  const maximumSlippage = new Percent('3', '100')
  const tokenUSDC = new Token(ChainId.XDAI, '0xDDAfbb505ad214D7b80b1f830fcCc89B60fb7A83', 6, 'USDC', 'USDC')
  const tokenWETH = new Token(ChainId.XDAI, '0x6A023CCd1ff6F2045C3309768eAd9E68F978f6e1', 18, 'WETH', 'WETH')

  describe('Gnosis Chain', () => {
    describe('bestExactTradeIn', () => {
      const currencyAmountIn = new TokenAmount(tokenWETH, parseUnits('1', tokenWETH.decimals).toBigInt())

      const tradePromise = CoWTrade.bestTradeExactIn({
        currencyAmountIn,
        currencyOut: tokenUSDC,
        maximumSlippage,
        user,
        receiver,
      })

      test('returns a trade', async () => {
        const trade = await tradePromise
        expect(trade).toBeDefined()
      })
      test('returns the right platform', async () => {
        const trade = await tradePromise
        expect(trade?.platform.name).toEqual(RoutablePlatform.COW.name)
      })
      test('deducts fees from sell token', async () => {
        const trade = await tradePromise
        expect(trade?.feeAmount.currency?.address?.toLowerCase()).toEqual(tokenWETH.address.toLowerCase())
        expect(trade?.order.sellToken.toLowerCase()).toEqual(tokenWETH.address.toLowerCase())
        console.log(trade?.feeAmount.toSignificant(2))
        console.log(trade?.fee.toSignificant(2))
      })

      test('accepts native tokens', async () => {
        const currencyAmountIn = CurrencyAmount.nativeCurrency(
          parseUnits('1', tokenWETH.decimals).toBigInt(),
          ChainId.GNOSIS
        )

        const trade = await CoWTrade.bestTradeExactIn({
          currencyAmountIn,
          currencyOut: tokenUSDC,
          maximumSlippage,
          user,
          receiver,
        })

        expect(trade).toBeDefined() // It is enough that the constructor does not throw errors
      })
    })

    describe('bestTradeExactOut', () => {
      const currencyAmountOut = new TokenAmount(tokenUSDC, parseUnits('100', tokenUSDC.decimals).toBigInt())
      const tradePromise = CoWTrade.bestTradeExactOut({
        currencyAmountOut,
        maximumSlippage,
        currencyIn: tokenWETH,
        receiver,
        user,
      })

      test('returns a trade', async () => {
        const trade = await tradePromise
        expect(trade).toBeDefined()
      })
      test('returns the right platform', async () => {
        const trade = await tradePromise
        expect(trade?.platform.name).toEqual(RoutablePlatform.COW.name)
      })
      test('deducts fees from sell token', async () => {
        const trade = await tradePromise
        expect(trade?.feeAmount.currency?.address?.toLowerCase()).toEqual(tokenWETH.address.toLowerCase())
        expect(trade?.order.sellToken.toLowerCase()).toEqual(tokenWETH.address.toLowerCase())
        console.log(trade?.feeAmount.toSignificant(2))
        console.log(trade?.fee.toSignificant(2))
      })
      test('quote output matches exact output', async () => {
        const trade = await tradePromise
        expect(trade?.quote.quote.buyAmount.toString()).toBe(parseUnits('100', tokenUSDC.decimals).toString())
      })

      test('accepts native tokens', async () => {
        const currencyAmountOut = CurrencyAmount.nativeCurrency(
          parseUnits('1', tokenWETH.decimals).toBigInt(),
          ChainId.GNOSIS
        )

        const trade = await CoWTrade.bestTradeExactOut({
          currencyAmountOut,
          currencyIn: tokenUSDC,
          maximumSlippage,
          user,
          receiver,
        })
        expect(trade).toBeDefined() // It is enough that the constructor does not throw errors
      })
    })
  })
})
