import { parseUnits } from '@ethersproject/units'

import { ChainId, CurrencyAmount, OneInchTrade, Percent, Token, TradeType } from '../src'

describe('OneInchTrade', () => {
  const user = '0x26358E62C2eDEd350e311bfde51588b8383A9315'
  //   const receiver = '0x26358E62C2eDEd350e311bfde51588b8383A9315'
  const maximumSlippage = new Percent('3', '100')
  const tokenUSDC = new Token(ChainId.XDAI, '0xDDAfbb505ad214D7b80b1f830fcCc89B60fb7A83', 6, 'USDC', 'USDC')
  const tokenWETH = new Token(ChainId.XDAI, '0x6A023CCd1ff6F2045C3309768eAd9E68F978f6e1', 18, 'WETH', 'WETH')
  const currencyAmountIn = CurrencyAmount.nativeCurrency(parseUnits('1', tokenWETH.decimals).toBigInt(), ChainId.GNOSIS)

  describe('Gnosis Chain', () => {
    describe('getQuote', () => {
      //   const currencyAmountIn2 = new TokenAmount(tokenWETH, parseUnits('1', tokenWETH.decimals).toBigInt())

      const tradePromise = OneInchTrade.getQuote({
        amount: currencyAmountIn,
        quoteCurrency: tokenUSDC,
        maximumSlippage,
        recipient: user,
        tradeType: TradeType.EXACT_INPUT,
      })

      test('returns a trade', async () => {
        const trade = await tradePromise
        expect(trade).toBeDefined()
      })
      test('swap transaction works', async () => {
        const trade = await tradePromise
        const options = {
          recipient: user,
          account: user,
        }
        const swapr = await trade?.swapTransaction(options)
        console.log('swapr', swapr)
        expect(swapr !== undefined)
      })

      test('accepts native tokens', async () => {
        const currencyAmountIn = CurrencyAmount.nativeCurrency(
          parseUnits('1', tokenWETH.decimals).toBigInt(),
          ChainId.GNOSIS
        )

        const trade = await OneInchTrade.getQuote({
          amount: currencyAmountIn,
          quoteCurrency: tokenUSDC,
          maximumSlippage,
          tradeType: TradeType.EXACT_INPUT,
          recipient: user,
        })

        expect(trade).toBeDefined() // It is enough that the constructor does not throw errors
      })
      test('exact output test', async () => {
        const currencyAmountIn = CurrencyAmount.nativeCurrency(
          parseUnits('1', tokenWETH.decimals).toBigInt(),
          ChainId.GNOSIS
        )

        const trade = await OneInchTrade.getQuote({
          amount: currencyAmountIn,
          quoteCurrency: tokenUSDC,
          maximumSlippage,
          tradeType: TradeType.EXACT_OUTPUT,
          recipient: user,
        })

        expect(trade).toBeDefined() // It is enough that the constructor does not throw errors
      })
    })
  })
})
