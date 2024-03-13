import { parseUnits } from '@ethersproject/units'

import { ChainId, TradeType } from '../../../constants'
import { Percent, TokenAmount } from '../../fractions'
import { ARB, SWPR, WBNB, WETH, WMATIC } from '../../token'
import { USDC } from '../uniswap-v2'
import { OpenoceanTrade } from './Openocean'

const maximumSlippage = new Percent('3', '100')
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
  // { chainId: ChainId.ARBITRUM_ONE, chainName: 'Arbitrum One', quoteCurrency: ARB, quoteCurrencyName: 'ARB' },
  // { chainId: ChainId.BSC_MAINNET, chainName: 'Binance Smart Chain', quoteCurrency: WBNB, quoteCurrencyName: 'WBNB' },
  { chainId: ChainId.GNOSIS, chainName: 'Gnosis', quoteCurrency: SWPR, quoteCurrencyName: 'SWPR' },
  // { chainId: ChainId.MAINNET, chainName: 'Ethereum', quoteCurrency: WETH, quoteCurrencyName: 'WETH' },
  // { chainId: ChainId.OPTIMISM_MAINNET, chainName: 'Optimism', quoteCurrency: WETH, quoteCurrencyName: 'WETH' },
  // { chainId: ChainId.POLYGON, chainName: 'Polygon', quoteCurrency: WMATIC, quoteCurrencyName: 'WMATIC' },
  // { chainId: ChainId.SCROLL_MAINNET, chainName: 'Sroll', quoteCurrency: WETH, quoteCurrencyName: 'WETH' },
  // { chainId: ChainId.ZK_SYNC_ERA_MAINNET, chainName: 'ZK Sync Era', quoteCurrency: WETH, quoteCurrencyName: 'WETH' },
]

describe('Openocean', () => {
  describe('Quote', () => {
    it.each(QUOTE_TESTS)(
      'should return a EXACT INPUT quote on $chainName for USDC - $quoteCurrencyName',
      async ({ chainId, quoteCurrency }) => {
        const currencyAmount = new TokenAmount(USDC[chainId], parseUnits('1000', 18).toString())
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
    it.each(SWAP_TESTS)(
      'should return a SWAP on $chainName for USDC - $quoteCurrencyName',
      async ({ chainId, quoteCurrency }) => {
        const currencyAmount = new TokenAmount(USDC[chainId], parseUnits('2', 6).toString())

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
  })
})
