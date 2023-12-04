import { parseUnits } from '@ethersproject/units'
import { SwaprV3Trade } from './SwaprV3'

import { ChainId, TradeType } from '../../../constants'
import { Percent, TokenAmount } from '../../fractions'
import { Token } from '../../token'

const maximumSlippage = new Percent('3', '100')
const tokenUSDC = new Token(ChainId.GNOSIS, '0xDDAfbb505ad214D7b80b1f830fcCc89B60fb7A83', 6, 'USDC', 'USDC')
const tokenWXDAI = new Token(ChainId.GNOSIS, '0xe91D153E0b41518A2Ce8Dd3D7944Fa863463a97d', 18, 'WXDAI', 'WXDAI')
//const tokenWETH = new Token(ChainId.GNOSIS, '0x6A023CCd1ff6F2045C3309768eAd9E68F978f6e1', 18, 'WETH', 'WETH')

const VITALIK_ADDRESS = '0xd8da6bf26964af9d7eed9e03e53415d37aa96045'
// const NULL_ADDRESS = '0x0000000000000000000000000000000000000000'
const recipient = VITALIK_ADDRESS

describe('SwaprV3', () => {
  describe('getQuote', () => {
    test('should return a exact input quote on Gnosis for USDC - WXDAI', async () => {
      const recipient = VITALIK_ADDRESS
      const currencyAmount = new TokenAmount(tokenUSDC, parseUnits('2', 6).toString())
      const trade = await SwaprV3Trade.getQuote({
        quoteCurrency: tokenWXDAI,
        amount: currencyAmount,
        maximumSlippage,
        recipient,
        tradeType: TradeType.EXACT_INPUT,
      })
      console.log('trade', trade)
      expect(trade).toBeDefined()
      expect(trade?.chainId).toEqual(ChainId.GNOSIS)
      expect(trade?.tradeType).toEqual(TradeType.EXACT_INPUT)
      expect(trade?.outputAmount.currency.address).toBe(tokenWXDAI.address)
    })
    test('should return a exact output quote on Gnosis for USDC - WXDAI', async () => {
      const recipient = VITALIK_ADDRESS
      const currencyAmount = new TokenAmount(tokenUSDC, parseUnits('2', 6).toString())
      const trade = await SwaprV3Trade.getQuote({
        quoteCurrency: tokenWXDAI,
        amount: currencyAmount,
        maximumSlippage,
        recipient,
        tradeType: TradeType.EXACT_OUTPUT,
      })
      console.log('trade', trade)
      expect(trade).toBeDefined()
      expect(trade?.chainId).toEqual(ChainId.GNOSIS)
      expect(trade?.tradeType).toEqual(TradeType.EXACT_OUTPUT)
      expect(trade?.outputAmount.currency.address).toBe(tokenWXDAI.address)
    })
  })
  describe('Swap', () => {
    test('should return a swap for Gnosis for USDC - WXDAI', async () => {
      const currencyAmount = new TokenAmount(tokenUSDC, parseUnits('2', 6).toString())

      const trade = await SwaprV3Trade.getQuote({
        quoteCurrency: tokenWXDAI,
        amount: currencyAmount,
        maximumSlippage,
        recipient,
        tradeType: TradeType.EXACT_INPUT,
      })

      const swapOptions = {
        recipient: recipient,
        account: recipient,
      }

      const swapr = await trade?.swapTransaction(swapOptions)

      console.log('swapr', swapr)
      expect(swapr !== undefined)
    })
  })
})
