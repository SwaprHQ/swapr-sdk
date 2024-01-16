import { parseEther, parseUnits } from '@ethersproject/units'
import { SushiswapTrade } from './Sushiswap'

import { ChainId, TradeType } from '../../../constants'
import { CurrencyAmount, Percent, TokenAmount } from '../../fractions'
import { Token, CAKE, ARB, WETH } from '../../token'
import { Currency } from '../../currency'
import { DAI, USDT } from '../uniswap-v2'

const maximumSlippage = new Percent('3', '100')
const tokenWXDAIGnosis = new Token(ChainId.GNOSIS, '0xe91D153E0b41518A2Ce8Dd3D7944Fa863463a97d', 18, 'WXDAI', 'WXDAI')
const tokenUSDCGnosis = new Token(ChainId.GNOSIS, '0xDDAfbb505ad214D7b80b1f830fcCc89B60fb7A83', 6, 'USDC', 'USDC')
const tokenWETHGnosis = new Token(
  ChainId.GNOSIS,
  '0x6A023CCd1ff6F2045C3309768eAd9E68F978f6e1',
  18,
  'WETH',
  'Wrapped WETH'
)
const tokenSWPRGnosis = new Token(
  ChainId.GNOSIS,
  '0x532801ED6f82FFfD2DAB70A19fC2d7B2772C4f4b',
  18,
  'SWPR',
  'Swapr token'
)
const tokenGNOGnosis = new Token(
  ChainId.GNOSIS,
  '0x9C58BAcC331c9aa871AFD802DB6379a98e80CEdb',
  18,
  'GNO',
  'Gnosis token'
)
const tokenUSDTPolygon = new Token(
  ChainId.POLYGON,
  '0xc2132D05D31c914a87C6611C10748AEb04B58e8F',
  6,
  'USDT',
  'Tether USD'
)

const recipient = '0x0000000000000000000000000000000000000000'

describe('SwaprV3', () => {
  describe('Quote', () => {
    test('should return a EXACT INPUT quote on Gnosis for USDC - WXDAI', async () => {
      const currencyAmount = new TokenAmount(tokenUSDCGnosis, parseUnits('2879.59', 6).toString())
      const trade = await SushiswapTrade.getQuote({
        amount: currencyAmount,
        quoteCurrency: tokenWXDAIGnosis,
        maximumSlippage,
        recipient,
        tradeType: TradeType.EXACT_INPUT,
      })

      expect(trade).toBeDefined()
      expect(trade).not.toBeNull()
      expect(trade?.chainId).toEqual(ChainId.GNOSIS)
      expect(trade?.tradeType).toEqual(TradeType.EXACT_INPUT)
      expect(trade?.outputAmount.currency.address).toBe(tokenWXDAIGnosis.address)
    })

    test('should return a EXACT INPUT quote on Gnosis for SWPR - WXDAI', async () => {
      const currencyAmount = new TokenAmount(tokenWXDAIGnosis, parseUnits('1000', 18).toString())
      const trade = await SushiswapTrade.getQuote({
        amount: currencyAmount,
        quoteCurrency: tokenSWPRGnosis,
        maximumSlippage,
        recipient,
        tradeType: TradeType.EXACT_INPUT,
      })

      expect(trade).toBeDefined()
      expect(trade).not.toBeNull()
      expect(trade?.chainId).toEqual(ChainId.GNOSIS)
      expect(trade?.tradeType).toEqual(TradeType.EXACT_INPUT)
      expect(trade?.outputAmount.currency.address).toBe(tokenSWPRGnosis.address)
    })

    test('should return a EXACT INPUT quote on Gnosis for XDAI - WETH', async () => {
      const currencyAmount = CurrencyAmount.nativeCurrency(parseEther('1000').toString(), ChainId.GNOSIS)
      const trade = await SushiswapTrade.getQuote({
        amount: currencyAmount,
        quoteCurrency: tokenWETHGnosis,
        maximumSlippage,
        recipient,
        tradeType: TradeType.EXACT_INPUT,
      })

      expect(trade).toBeDefined()
      expect(trade).not.toBeNull()
      expect(trade?.chainId).toEqual(ChainId.GNOSIS)
      expect(trade?.tradeType).toEqual(TradeType.EXACT_INPUT)
      expect(trade?.outputAmount.currency.address).toBe(tokenWETHGnosis.address)
    })

    test('should return a EXACT INPUT quote on Gnosis for GNO - WETH', async () => {
      const currencyAmount = new TokenAmount(tokenGNOGnosis, parseEther('1000000000').toString())
      const trade = await SushiswapTrade.getQuote({
        amount: currencyAmount,
        quoteCurrency: tokenWETHGnosis,
        maximumSlippage,
        recipient,
        tradeType: TradeType.EXACT_INPUT,
      })

      expect(trade).toBeDefined()
      expect(trade?.chainId).toEqual(ChainId.GNOSIS)
      expect(trade?.tradeType).toEqual(TradeType.EXACT_INPUT)
      expect(trade?.outputAmount.currency.address).toBe(tokenWETHGnosis.address)
    })

    test('should return a EXACT INPUT quote on Polygon for USDT - MATIC', async () => {
      const currencyAmount = new TokenAmount(tokenUSDTPolygon, parseUnits('1000000000', 6).toString())
      const currencyOut = Currency.getNative(ChainId.POLYGON)
      const trade = await SushiswapTrade.getQuote({
        amount: currencyAmount,
        quoteCurrency: currencyOut,
        maximumSlippage,
        recipient,
        tradeType: TradeType.EXACT_INPUT,
      })

      expect(trade).toBeDefined()
      expect(trade).not.toBeNull()
      expect(trade?.chainId).toEqual(ChainId.POLYGON)
      expect(trade?.tradeType).toEqual(TradeType.EXACT_INPUT)
      expect(trade?.outputAmount.currency.address).toBe(currencyOut.address)
    })

    test('should return a EXACT INPUT quote on BSC for CAKE - BNB', async () => {
      const currencyAmount = new TokenAmount(
        CAKE[ChainId.BSC_MAINNET],
        parseUnits('1000', CAKE[ChainId.BSC_MAINNET].decimals).toString()
      )
      const currencyOut = Currency.getNative(ChainId.BSC_MAINNET)
      const trade = await SushiswapTrade.getQuote({
        amount: currencyAmount,
        quoteCurrency: currencyOut,
        maximumSlippage,
        recipient,
        tradeType: TradeType.EXACT_INPUT,
      })

      expect(trade).toBeDefined()
      expect(trade).not.toBeNull()
      expect(trade?.chainId).toEqual(ChainId.BSC_MAINNET)
      expect(trade?.tradeType).toEqual(TradeType.EXACT_INPUT)
      expect(trade?.outputAmount.currency.address).toBe(currencyOut.address)
    })

    test('should return a EXACT INPUT quote on Arbitrum for ARB - ETH', async () => {
      const currencyAmount = new TokenAmount(
        ARB[ChainId.ARBITRUM_ONE],
        parseUnits('1000', ARB[ChainId.ARBITRUM_ONE].decimals).toString()
      )
      const currencyOut = Currency.getNative(ChainId.ARBITRUM_ONE)
      const trade = await SushiswapTrade.getQuote({
        amount: currencyAmount,
        quoteCurrency: currencyOut,
        maximumSlippage,
        recipient,
        tradeType: TradeType.EXACT_INPUT,
      })

      expect(trade).toBeDefined()
      expect(trade).not.toBeNull()
      expect(trade?.chainId).toEqual(ChainId.ARBITRUM_ONE)
      expect(trade?.tradeType).toEqual(TradeType.EXACT_INPUT)
      expect(trade?.outputAmount.currency.address).toBe(currencyOut.address)
    })

    test('should return a EXACT INPUT quote on Optmism for DAI - ETH', async () => {
      const currencyAmount = new TokenAmount(
        DAI[ChainId.OPTIMISM_MAINNET],
        parseUnits('1000', DAI[ChainId.OPTIMISM_MAINNET].decimals).toString()
      )
      const currencyOut = Currency.getNative(ChainId.OPTIMISM_MAINNET)
      const trade = await SushiswapTrade.getQuote({
        amount: currencyAmount,
        quoteCurrency: currencyOut,
        maximumSlippage,
        recipient,
        tradeType: TradeType.EXACT_INPUT,
      })

      expect(trade).toBeDefined()
      expect(trade).not.toBeNull()
      expect(trade?.chainId).toEqual(ChainId.OPTIMISM_MAINNET)
      expect(trade?.tradeType).toEqual(TradeType.EXACT_INPUT)
      expect(trade?.outputAmount.currency.address).toBe(currencyOut.address)
    })

    test('should return a EXACT INPUT quote on Mainnet for WETH - USDT', async () => {
      const currencyAmount = new TokenAmount(
        WETH[ChainId.MAINNET],
        parseUnits('1000', WETH[ChainId.MAINNET].decimals).toString()
      )
      const currencyOut = USDT[ChainId.MAINNET]
      const trade = await SushiswapTrade.getQuote({
        amount: currencyAmount,
        quoteCurrency: currencyOut,
        maximumSlippage,
        recipient,
        tradeType: TradeType.EXACT_INPUT,
      })

      expect(trade).toBeDefined()
      expect(trade).not.toBeNull()
      expect(trade?.chainId).toEqual(ChainId.MAINNET)
      expect(trade?.tradeType).toEqual(TradeType.EXACT_INPUT)
      expect(trade?.outputAmount.currency.address).toBe(currencyOut.address)
    })
  })

  describe('Swap', () => {
    test('should return a swap for Gnosis for USDC - WXDAI', async () => {
      const currencyAmount = new TokenAmount(tokenUSDCGnosis, parseUnits('2', 6).toString())

      const trade = await SushiswapTrade.getQuote({
        quoteCurrency: tokenWXDAIGnosis,
        amount: currencyAmount,
        maximumSlippage,
        recipient,
        tradeType: TradeType.EXACT_INPUT,
      })

      const swapOptions = {
        recipient: recipient,
        account: recipient,
      }

      const swap = await trade?.swapTransaction(swapOptions)
      expect(swap !== undefined)
    })
    test('should return a swap on gnosis with native token USDC - XDAI', async () => {
      const currencyAmount = new TokenAmount(tokenUSDCGnosis, parseUnits('2', 6).toString())

      const trade = await SushiswapTrade.getQuote({
        quoteCurrency: Currency.getNative(ChainId.GNOSIS),
        amount: currencyAmount,
        maximumSlippage,
        recipient,
        tradeType: TradeType.EXACT_INPUT,
      })

      const swapOptions = {
        recipient: recipient,
        account: recipient,
      }

      const swap = await trade?.swapTransaction(swapOptions)
      expect(swap !== undefined)
    })
  })
})
