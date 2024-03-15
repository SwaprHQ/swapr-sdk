import { parseUnits } from '@ethersproject/units'

import { ChainId, TradeType } from '../../../constants'
import { Percent, TokenAmount } from '../../fractions'
import { ARB, SWPR, WBNB, WETH, WMATIC } from '../../token'
import { USDT } from '../uniswap-v2'
import { OpenoceanTrade } from './Openocean'

const maximumSlippage = new Percent('3', '1')
const recipient = '0x0000000000000000000000000000000000000000'

const QUOTE_TESTS = [
  { chainId: ChainId.ARBITRUM_ONE, chainName: 'Arbitrum One', quoteCurrency: ARB, quoteCurrencyName: 'ARB' },
  { chainId: ChainId.BSC_MAINNET, chainName: 'Binance Smart Chain', quoteCurrency: WBNB, quoteCurrencyName: 'WBNB' },
  { chainId: ChainId.GNOSIS, chainName: 'Gnosis', quoteCurrency: SWPR, quoteCurrencyName: 'SWPR' },
  // { chainId: ChainId.MAINNET, chainName: 'Ethereum', quoteCurrency: WETH, quoteCurrencyName: 'WETH' },
  { chainId: ChainId.OPTIMISM_MAINNET, chainName: 'Optimism', quoteCurrency: WETH, quoteCurrencyName: 'WETH' },
  { chainId: ChainId.POLYGON, chainName: 'Polygon', quoteCurrency: WMATIC, quoteCurrencyName: 'WMATIC' },
  { chainId: ChainId.SCROLL_MAINNET, chainName: 'Sroll', quoteCurrency: WETH, quoteCurrencyName: 'WETH' },
  { chainId: ChainId.ZK_SYNC_ERA_MAINNET, chainName: 'ZK Sync Era', quoteCurrency: WETH, quoteCurrencyName: 'WETH' },
]

const SWAP_TESTS = [
  { chainId: ChainId.ARBITRUM_ONE, chainName: 'Arbitrum One', quoteCurrency: ARB, quoteCurrencyName: 'ARB' },
  { chainId: ChainId.BSC_MAINNET, chainName: 'Binance Smart Chain', quoteCurrency: WBNB, quoteCurrencyName: 'WBNB' },
  { chainId: ChainId.GNOSIS, chainName: 'Gnosis', quoteCurrency: SWPR, quoteCurrencyName: 'SWPR' },
  // { chainId: ChainId.MAINNET, chainName: 'Ethereum', quoteCurrency: WETH, quoteCurrencyName: 'WETH' },
  { chainId: ChainId.OPTIMISM_MAINNET, chainName: 'Optimism', quoteCurrency: WETH, quoteCurrencyName: 'WETH' },
  { chainId: ChainId.POLYGON, chainName: 'Polygon', quoteCurrency: WMATIC, quoteCurrencyName: 'WMATIC' },
  { chainId: ChainId.SCROLL_MAINNET, chainName: 'Sroll', quoteCurrency: WETH, quoteCurrencyName: 'WETH' },
  { chainId: ChainId.ZK_SYNC_ERA_MAINNET, chainName: 'ZK Sync Era', quoteCurrency: WETH, quoteCurrencyName: 'WETH' },
]

describe('Openocean', () => {
  describe.skip('Quote', () => {
    it.each(QUOTE_TESTS)(
      'should return a EXACT INPUT quote on $chainName for USDT - $quoteCurrencyName',
      async ({ chainId, quoteCurrency }) => {
        const currencyAmount = new TokenAmount(USDT[chainId], parseUnits('100', 18).toString())
        const trade = await OpenoceanTrade.getQuote({
          amount: currencyAmount,
          quoteCurrency: quoteCurrency[chainId],
          maximumSlippage,
          recipient,
          tradeType: TradeType.EXACT_INPUT,
        })

        expect(trade).toBeDefined()
        expect(trade).not.toBeNull()
        expect(trade?.chainId).toEqual(chainId)
        expect(trade?.tradeType).toEqual(TradeType.EXACT_INPUT)
        expect(trade?.outputAmount.currency.address).toBe(quoteCurrency[chainId].address)
      },
    )
  })

  describe('Swap', () => {
    it.skip.each(SWAP_TESTS)(
      'should return a SWAP on $chainName for USDT - $quoteCurrencyName',
      async ({ chainId, quoteCurrency }) => {
        const currencyAmount = new TokenAmount(USDT[chainId], parseUnits('100', 18).toString())

        const trade = await OpenoceanTrade.getQuote({
          amount: currencyAmount,
          quoteCurrency: quoteCurrency[chainId],
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
      },
    )
    it('should return a SWAP on Arbitrum One for ARB - USDC', async () => {
      const currencyAmount = new TokenAmount(ARB[ChainId.ARBITRUM_ONE], parseUnits('1', 18).toString())

      const trade = await OpenoceanTrade.getQuote({
        amount: currencyAmount,
        quoteCurrency: USDT[ChainId.ARBITRUM_ONE],
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
