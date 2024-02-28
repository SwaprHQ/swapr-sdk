import { parseUnits } from '@ethersproject/units'

import { ChainId, TradeType } from '../../../constants'
import { Percent, TokenAmount } from '../../fractions'
import { WXDAI } from '../../token'
import { USDC } from '../uniswap-v2'
import { OpenoceanTrade } from './Openocean'

const maximumSlippage = new Percent('3', '100')
// const tokenGNOGnosis = new Token(
//   ChainId.GNOSIS,
//   '0x9C58BAcC331c9aa871AFD802DB6379a98e80CEdb',
//   18,
//   'GNO',
//   'Gnosis token',
// )

const recipient = '0x0000000000000000000000000000000000000000'

describe.only('Openocean', () => {
  describe('Quote', () => {
    test('should return a EXACT INPUT quote on Gnosis for USDC - WXDAI', async () => {
      const currencyAmount = new TokenAmount(
        USDC[ChainId.GNOSIS],
        parseUnits('2879.59', USDC[ChainId.GNOSIS].decimals).toString(),
      )
      const trade = await OpenoceanTrade.getQuote({
        amount: currencyAmount,
        quoteCurrency: WXDAI[ChainId.GNOSIS],
        maximumSlippage,
        recipient,
        tradeType: TradeType.EXACT_INPUT,
      })

      expect(trade).toBeDefined()
      expect(trade).not.toBeNull()
      expect(trade?.chainId).toEqual(ChainId.GNOSIS)
      expect(trade?.tradeType).toEqual(TradeType.EXACT_INPUT)
      expect(trade?.outputAmount.currency.address).toBe(WXDAI[ChainId.GNOSIS].address)
    })

    // test('should return a EXACT INPUT quote on Gnosis for SWPR - WXDAI', async () => {
    //   const currencyAmount = new TokenAmount(WXDAI[ChainId.GNOSIS], parseUnits('1000', 18).toString())
    //   const trade = await OpenoceanTrade.getQuote({
    //     amount: currencyAmount,
    //     quoteCurrency: SWPR[ChainId.GNOSIS],
    //     maximumSlippage,
    //     recipient,
    //     tradeType: TradeType.EXACT_INPUT,
    //   })

    //   expect(trade).toBeDefined()
    //   expect(trade).not.toBeNull()
    //   expect(trade?.chainId).toEqual(ChainId.GNOSIS)
    //   expect(trade?.tradeType).toEqual(TradeType.EXACT_INPUT)
    //   expect(trade?.outputAmount.currency.address).toBe(SWPR[ChainId.GNOSIS].address)
    // })

    // test('should return a EXACT INPUT quote on Gnosis for XDAI - WETH', async () => {
    //   const currencyAmount = CurrencyAmount.nativeCurrency(parseEther('1000').toString(), ChainId.GNOSIS)
    //   const trade = await OpenoceanTrade.getQuote({
    //     amount: currencyAmount,
    //     quoteCurrency: WETH[ChainId.GNOSIS],
    //     maximumSlippage,
    //     recipient,
    //     tradeType: TradeType.EXACT_INPUT,
    //   })

    //   expect(trade).toBeDefined()
    //   expect(trade).not.toBeNull()
    //   expect(trade?.chainId).toEqual(ChainId.GNOSIS)
    //   expect(trade?.tradeType).toEqual(TradeType.EXACT_INPUT)
    //   expect(trade?.outputAmount.currency.address).toBe(WETH[ChainId.GNOSIS].address)
    // })

    // test('should return a EXACT INPUT quote on Gnosis for GNO - WETH', async () => {
    //   const currencyAmount = new TokenAmount(tokenGNOGnosis, parseEther('1000000000').toString())
    //   const trade = await OpenoceanTrade.getQuote({
    //     amount: currencyAmount,
    //     quoteCurrency: WETH[ChainId.GNOSIS],
    //     maximumSlippage,
    //     recipient,
    //     tradeType: TradeType.EXACT_INPUT,
    //   })

    //   expect(trade).toBeDefined()
    //   expect(trade?.chainId).toEqual(ChainId.GNOSIS)
    //   expect(trade?.tradeType).toEqual(TradeType.EXACT_INPUT)
    //   expect(trade?.outputAmount.currency.address).toBe(WETH[ChainId.GNOSIS].address)
    // })

    // test('should return a EXACT INPUT quote on Polygon for USDT - MATIC', async () => {
    //   const currencyAmount = new TokenAmount(
    //     USDT[ChainId.POLYGON],
    //     parseUnits('1000000000', USDT[ChainId.POLYGON].decimals).toString(),
    //   )
    //   const currencyOut = Currency.getNative(ChainId.POLYGON)
    //   const trade = await OpenoceanTrade.getQuote({
    //     amount: currencyAmount,
    //     quoteCurrency: currencyOut,
    //     maximumSlippage,
    //     recipient,
    //     tradeType: TradeType.EXACT_INPUT,
    //   })

    //   expect(trade).toBeDefined()
    //   expect(trade).not.toBeNull()
    //   expect(trade?.chainId).toEqual(ChainId.POLYGON)
    //   expect(trade?.tradeType).toEqual(TradeType.EXACT_INPUT)
    //   expect(trade?.outputAmount.currency.address).toBe(currencyOut.address)
    // })

    // test('should return a EXACT INPUT quote on BSC for CAKE - BNB', async () => {
    //   const currencyAmount = new TokenAmount(
    //     CAKE[ChainId.BSC_MAINNET],
    //     parseUnits('1000', CAKE[ChainId.BSC_MAINNET].decimals).toString(),
    //   )
    //   const currencyOut = Currency.getNative(ChainId.BSC_MAINNET)
    //   const trade = await OpenoceanTrade.getQuote({
    //     amount: currencyAmount,
    //     quoteCurrency: currencyOut,
    //     maximumSlippage,
    //     recipient,
    //     tradeType: TradeType.EXACT_INPUT,
    //   })

    //   expect(trade).toBeDefined()
    //   expect(trade).not.toBeNull()
    //   expect(trade?.chainId).toEqual(ChainId.BSC_MAINNET)
    //   expect(trade?.tradeType).toEqual(TradeType.EXACT_INPUT)
    //   expect(trade?.outputAmount.currency.address).toBe(currencyOut.address)
    // })

    // test('should return a EXACT INPUT quote on Arbitrum for ARB - ETH', async () => {
    //   const currencyAmount = new TokenAmount(
    //     ARB[ChainId.ARBITRUM_ONE],
    //     parseUnits('1000', ARB[ChainId.ARBITRUM_ONE].decimals).toString(),
    //   )
    //   const currencyOut = Currency.getNative(ChainId.ARBITRUM_ONE)
    //   const trade = await OpenoceanTrade.getQuote({
    //     amount: currencyAmount,
    //     quoteCurrency: currencyOut,
    //     maximumSlippage,
    //     recipient,
    //     tradeType: TradeType.EXACT_INPUT,
    //   })

    //   expect(trade).toBeDefined()
    //   expect(trade).not.toBeNull()
    //   expect(trade?.chainId).toEqual(ChainId.ARBITRUM_ONE)
    //   expect(trade?.tradeType).toEqual(TradeType.EXACT_INPUT)
    //   expect(trade?.outputAmount.currency.address).toBe(currencyOut.address)
    // })

    // test('should return a EXACT INPUT quote on Optmism for DAI - ETH', async () => {
    //   const currencyAmount = new TokenAmount(
    //     DAI[ChainId.OPTIMISM_MAINNET],
    //     parseUnits('1000', DAI[ChainId.OPTIMISM_MAINNET].decimals).toString(),
    //   )
    //   const currencyOut = Currency.getNative(ChainId.OPTIMISM_MAINNET)
    //   const trade = await OpenoceanTrade.getQuote({
    //     amount: currencyAmount,
    //     quoteCurrency: currencyOut,
    //     maximumSlippage,
    //     recipient,
    //     tradeType: TradeType.EXACT_INPUT,
    //   })

    //   expect(trade).toBeDefined()
    //   expect(trade).not.toBeNull()
    //   expect(trade?.chainId).toEqual(ChainId.OPTIMISM_MAINNET)
    //   expect(trade?.tradeType).toEqual(TradeType.EXACT_INPUT)
    //   expect(trade?.outputAmount.currency.address).toBe(currencyOut.address)
    // })

    // test('should return a EXACT INPUT quote on Mainnet for WETH - USDT', async () => {
    //   const currencyAmount = new TokenAmount(
    //     WETH[ChainId.MAINNET],
    //     parseUnits('1000', WETH[ChainId.MAINNET].decimals).toString(),
    //   )
    //   const currencyOut = USDT[ChainId.MAINNET]
    //   const trade = await OpenoceanTrade.getQuote({
    //     amount: currencyAmount,
    //     quoteCurrency: currencyOut,
    //     maximumSlippage,
    //     recipient,
    //     tradeType: TradeType.EXACT_INPUT,
    //   })

    //   expect(trade).toBeDefined()
    //   expect(trade).not.toBeNull()
    //   expect(trade?.chainId).toEqual(ChainId.MAINNET)
    //   expect(trade?.tradeType).toEqual(TradeType.EXACT_INPUT)
    //   expect(trade?.outputAmount.currency.address).toBe(currencyOut.address)
    // })

    // test('should return a EXACT INPUT quote on Scroll for USDT - WETH', async () => {
    //   const currencyAmount = new TokenAmount(
    //     USDT[ChainId.SCROLL_MAINNET],
    //     parseUnits('1000000000', USDT[ChainId.SCROLL_MAINNET].decimals).toString(),
    //   )
    //   const trade = await OpenoceanTrade.getQuote({
    //     amount: currencyAmount,
    //     quoteCurrency: WETH[ChainId.SCROLL_MAINNET],
    //     maximumSlippage,
    //     recipient,
    //     tradeType: TradeType.EXACT_INPUT,
    //   })

    //   expect(trade).toBeDefined()
    //   expect(trade?.chainId).toEqual(ChainId.SCROLL_MAINNET)
    //   expect(trade?.tradeType).toEqual(TradeType.EXACT_INPUT)
    //   expect(trade?.outputAmount.currency.address).toBe(WETH[ChainId.SCROLL_MAINNET].address)
    // })
  })

  // describe('Swap', () => {
  //   test('should return a swap on Gnosis for USDC - WXDAI', async () => {
  //     const currencyAmount = new TokenAmount(USDC[ChainId.GNOSIS], parseUnits('2', 6).toString())

  //     const trade = await OpenoceanTrade.getQuote({
  //       quoteCurrency: WXDAI[ChainId.GNOSIS],
  //       amount: currencyAmount,
  //       maximumSlippage,
  //       recipient,
  //       tradeType: TradeType.EXACT_INPUT,
  //     })

  //     const swapOptions = {
  //       recipient,
  //       account: recipient,
  //     }

  //     const swap = await trade?.swapTransaction(swapOptions)
  //     expect(swap !== undefined)
  //   })

  //   test('should return a swap on Gnosis with native token USDC - XDAI', async () => {
  //     const currencyAmount = new TokenAmount(USDC[ChainId.GNOSIS], parseUnits('2', 6).toString())

  //     const trade = await OpenoceanTrade.getQuote({
  //       quoteCurrency: Currency.getNative(ChainId.GNOSIS),
  //       amount: currencyAmount,
  //       maximumSlippage,
  //       recipient,
  //       tradeType: TradeType.EXACT_INPUT,
  //     })

  //     const swapOptions = {
  //       recipient,
  //       account: recipient,
  //     }

  //     const swap = await trade?.swapTransaction(swapOptions)
  //     expect(swap !== undefined)
  //   })

  //   test('should return a swap on Scroll for USDT - WETH', async () => {
  //     const currencyAmount = new TokenAmount(
  //       USDT[ChainId.SCROLL_MAINNET],
  //       parseUnits('1000000000', USDT[ChainId.SCROLL_MAINNET].decimals).toString(),
  //     )
  //     const trade = await OpenoceanTrade.getQuote({
  //       quoteCurrency: WETH[ChainId.SCROLL_MAINNET],
  //       amount: currencyAmount,
  //       maximumSlippage,
  //       recipient,
  //       tradeType: TradeType.EXACT_INPUT,
  //     })

  //     const swapOptions = {
  //       recipient,
  //       account: recipient,
  //     }

  //     const swap = await trade?.swapTransaction(swapOptions)
  //     expect(swap !== undefined)
  //   })
  // })
})
