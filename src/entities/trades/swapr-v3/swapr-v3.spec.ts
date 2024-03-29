import { parseUnits } from '@ethersproject/units'

import { ChainId, TradeType } from '../../../constants'
import { Currency } from '../../currency'
import { Percent, TokenAmount } from '../../fractions'
import { Token } from '../../token'
import { SwaprV3Trade } from './SwaprV3'

const maximumSlippage = new Percent('3', '100')
const tokenWXDAI = new Token(ChainId.GNOSIS, '0xe91D153E0b41518A2Ce8Dd3D7944Fa863463a97d', 18, 'WXDAI', 'WXDAI')
const tokenUSDC = new Token(ChainId.GNOSIS, '0xDDAfbb505ad214D7b80b1f830fcCc89B60fb7A83', 6, 'USDC', 'USDC')
const tokenWETH = new Token(ChainId.GNOSIS, '0x6A023CCd1ff6F2045C3309768eAd9E68F978f6e1', 18, 'WETH', 'Wrapped WETH')
const tokenSWPR = new Token(ChainId.GNOSIS, '0x532801ED6f82FFfD2DAB70A19fC2d7B2772C4f4b', 18, 'SWPR', 'Swapr token')
// const tokenGNO = new Token(ChainId.GNOSIS, '0x9C58BAcC331c9aa871AFD802DB6379a98e80CEdb', 18, 'GNO', 'Gnosis token')

const NULL_ADDRESS = '0x0000000000000000000000000000000000000000'
const recipient = NULL_ADDRESS

describe('SwaprV3', () => {
  describe('Quote', () => {
    test('should return a EXACT INPUT quote for USDC - WXDAI', async () => {
      const currencyAmount = new TokenAmount(tokenUSDC, parseUnits('2.59', 6).toString())
      const trade = await SwaprV3Trade.getQuote({
        amount: currencyAmount,
        quoteCurrency: tokenWXDAI,
        maximumSlippage,
        recipient,
        tradeType: TradeType.EXACT_INPUT,
      })

      expect(trade).toBeDefined()
      expect(trade?.chainId).toEqual(ChainId.GNOSIS)
      expect(trade?.tradeType).toEqual(TradeType.EXACT_INPUT)
      expect(trade?.outputAmount.currency.address).toBe(tokenWXDAI.address)
    })

    test('should return a EXACT INPUT quote for WETH - WXDAI', async () => {
      const currencyAmount = new TokenAmount(tokenWETH, parseUnits('1', 18).toString())
      const trade = await SwaprV3Trade.getQuote({
        amount: currencyAmount,
        quoteCurrency: tokenWXDAI,
        maximumSlippage,
        recipient,
        tradeType: TradeType.EXACT_INPUT,
      })

      expect(trade).toBeDefined()
      expect(trade?.chainId).toEqual(ChainId.GNOSIS)
      expect(trade?.tradeType).toEqual(TradeType.EXACT_INPUT)
      expect(trade?.outputAmount.currency.address).toBe(tokenWXDAI.address)
    })

    test.skip('should return a EXACT INPUT quote for SWPR - WXDAI', async () => {
      const currencyAmount = new TokenAmount(tokenWXDAI, parseUnits('1', 18).toString())
      const trade = await SwaprV3Trade.getQuote({
        amount: currencyAmount,
        quoteCurrency: tokenSWPR,
        maximumSlippage,
        recipient,
        tradeType: TradeType.EXACT_INPUT,
      })

      expect(trade).toBeDefined()
      expect(trade?.chainId).toEqual(ChainId.GNOSIS)
      expect(trade?.tradeType).toEqual(TradeType.EXACT_INPUT)
      expect(trade?.outputAmount.currency.address).toBe(tokenSWPR.address)
    })

    test.skip('should return a exact output quote for WXDAI - USDC', async () => {
      const currencyAmount = new TokenAmount(tokenWXDAI, parseUnits('2', 18).toString())
      const trade = await SwaprV3Trade.getQuote({
        quoteCurrency: tokenUSDC,
        amount: currencyAmount,
        maximumSlippage,
        recipient,
        tradeType: TradeType.EXACT_OUTPUT,
      })
      expect(trade).toBeDefined()
      expect(trade?.chainId).toEqual(ChainId.GNOSIS)
      expect(trade?.tradeType).toEqual(TradeType.EXACT_OUTPUT)
      expect(trade?.inputAmount.currency.address).toBe(tokenUSDC.address)
    })

    test('should return a exact input quote for a native token XDAI - USDC', async () => {
      const currencyAmount = new TokenAmount(tokenUSDC, parseUnits('2', 6).toString())
      const trade = await SwaprV3Trade.getQuote({
        quoteCurrency: Currency.getNative(ChainId.GNOSIS),
        amount: currencyAmount,
        maximumSlippage,
        recipient,
        tradeType: TradeType.EXACT_OUTPUT,
      })

      expect(trade).toBeDefined()
      expect(trade?.chainId).toEqual(ChainId.GNOSIS)
      expect(trade?.tradeType).toEqual(TradeType.EXACT_OUTPUT)
      expect(trade?.outputAmount.currency.address).toBe(tokenUSDC.address)
    })

    // test('should return a EXACT INPUT quote on Gnosis for GNO - WETH', async () => {
    //   const currencyAmount = new TokenAmount(tokenGNO, parseUnits('1', 18).toString())
    //   const trade = await SwaprV3Trade.getQuote({
    //     amount: currencyAmount,
    //     quoteCurrency: tokenWETH,
    //     maximumSlippage,
    //     recipient,
    //     tradeType: TradeType.EXACT_INPUT,
    //   })

    //   expect(trade).toBeDefined()
    //   expect(trade?.chainId).toEqual(ChainId.GNOSIS)
    //   expect(trade?.tradeType).toEqual(TradeType.EXACT_INPUT)
    //   expect(trade?.outputAmount.currency.address).toBe(tokenWETH.address)
    // })
  })

  describe('Swap', () => {
    test('should return a swap EXACT INPUT for USDC - WXDAI', async () => {
      const currencyAmount = new TokenAmount(tokenUSDC, parseUnits('2', 6).toString())

      const trade = await SwaprV3Trade.getQuote({
        quoteCurrency: tokenWXDAI,
        amount: currencyAmount,
        maximumSlippage,
        recipient,
        tradeType: TradeType.EXACT_INPUT,
      })

      const swapOptions = {
        recipient,
        account: recipient,
      }

      const swap = await trade?.swapTransaction(swapOptions)
      expect(swap !== undefined)
    })
    test('should return a swap EXACT OUTPUT for USDC - WXDAI', async () => {
      const currencyAmount = new TokenAmount(tokenWXDAI, parseUnits('2', 18).toString())
      const trade = await SwaprV3Trade.getQuote({
        quoteCurrency: tokenUSDC,
        amount: currencyAmount,
        maximumSlippage,
        recipient,
        tradeType: TradeType.EXACT_OUTPUT,
      })

      expect(trade).toBeDefined()
      expect(trade?.chainId).toEqual(ChainId.GNOSIS)
      expect(trade?.tradeType).toEqual(TradeType.EXACT_OUTPUT)
      expect(trade?.inputAmount.currency.address).toBe(tokenUSDC.address)

      const swapOptions = {
        recipient,
        account: recipient,
      }

      const swap = await trade?.swapTransaction(swapOptions)
      expect(swap !== undefined)
    })
    test('should return a swap EXACT INPUT for XDAI - USDC', async () => {
      const currencyAmount = new TokenAmount(tokenUSDC, parseUnits('2', 6).toString())

      const trade = await SwaprV3Trade.getQuote({
        quoteCurrency: Currency.getNative(ChainId.GNOSIS),
        amount: currencyAmount,
        maximumSlippage,
        recipient,
        tradeType: TradeType.EXACT_INPUT,
      })

      const swapOptions = {
        recipient,
        account: recipient,
      }

      const swap = await trade?.swapTransaction(swapOptions)
      expect(swap !== undefined)
    })
  })
})
