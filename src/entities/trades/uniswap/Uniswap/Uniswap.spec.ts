import { parseUnits } from '@ethersproject/units'

import { ChainId, TradeType } from '../../../../constants'
import { Currency } from '../../../currency'
import { Percent, TokenAmount } from '../../../fractions'
import { Token } from '../../../token'
import { UniswapTrade } from './Uniswap'

describe('Uniswap', () => {
  describe('getQuote', () => {
    test('should return a quote on Polygon for MATIC > USDT', async () => {
      const tokenUSDT = new Token(
        ChainId.POLYGON,
        '0xc2132D05D31c914a87C6611C10748AEb04B58e8F',
        6,
        'USDT',
        'Tether USD'
      )

      const nativeMatic = Currency.getNative(ChainId.POLYGON)
      const maximumSlippage = new Percent('3', '100')
      const recipient = '0x0000000000000000000000000000000000000000'
      const currencyAmount = new TokenAmount(tokenUSDT, parseUnits('1', 6).toString())

      const trade = await UniswapTrade.getQuote({
        quoteCurrency: nativeMatic,
        amount: currencyAmount,
        maximumSlippage,
        recipient,
        tradeType: TradeType.EXACT_OUTPUT,
      })

      expect(trade).toBeDefined()
      expect(trade?.chainId).toEqual(137)
      expect(trade?.outputAmount.currency.address).toBe(tokenUSDT.address)
    })
  })
})
