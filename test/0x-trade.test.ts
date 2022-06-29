import { parseUnits } from '@ethersproject/units'
import invariant from 'tiny-invariant'

// Jest
import { execAsync } from '../jest'
// Tets targets
import { ChainId, CurrencyAmount, Percent, Token, TokenAmount, ZeroXTrade } from '../src'
import { CODE_TO_PLATFORM_NAME } from '../src/entities/trades/0x/constants'
import { ApiSource } from '../src/entities/trades/0x/types'
import { decodePlatformName, decodeStringToPercent, platformsFromSources } from '../src/entities/trades/0x/utils'
import { TOKENS_MAINNET } from '../src/entities/trades/curve/tokens'

describe('ZeroXTrade', () => {
  const maximumSlippage = new Percent('3', '10000')

  describe('Ethereum', () => {
    // Enable debugging
    process.env.__SWAPR_SDK_DEBUG__ = 'true'

    const tokenStETH = new Token(
      ChainId.MAINNET,
      TOKENS_MAINNET.steth.address,
      TOKENS_MAINNET.steth.decimals,
      TOKENS_MAINNET.steth.symbol,
      TOKENS_MAINNET.steth.name
    )

    const tokenETH = new Token(
      ChainId.MAINNET,
      TOKENS_MAINNET.eth.address,
      TOKENS_MAINNET.eth.decimals,
      TOKENS_MAINNET.eth.symbol,
      TOKENS_MAINNET.eth.name
    )

    const tokenCRV = new Token(
      ChainId.MAINNET,
      TOKENS_MAINNET.crv.address,
      TOKENS_MAINNET.crv.decimals,
      TOKENS_MAINNET.crv.symbol,
      TOKENS_MAINNET.crv.name
    )

    const tokenRenBTC = new Token(
      ChainId.MAINNET,
      TOKENS_MAINNET.renbtc.address,
      TOKENS_MAINNET.renbtc.decimals,
      TOKENS_MAINNET.renbtc.symbol,
      TOKENS_MAINNET.renbtc.name
    )

    const tokenWBTC = new Token(
      ChainId.MAINNET,
      TOKENS_MAINNET.wbtc.address,
      TOKENS_MAINNET.wbtc.decimals,
      TOKENS_MAINNET.wbtc.symbol,
      TOKENS_MAINNET.wbtc.name
    )

    // Common token amounts
    const currencyAmountETH1 = new TokenAmount(
      tokenETH,
      parseUnits('1', tokenETH.decimals).toString()
    ) as CurrencyAmount
    const currencyAmountCRV = new TokenAmount(
      tokenCRV,
      parseUnits('1000', tokenCRV.decimals).toString()
    ) as CurrencyAmount
    const currencyAmountRenBTC1 = new TokenAmount(
      tokenRenBTC,
      parseUnits('1', tokenRenBTC.decimals).toString()
    ) as CurrencyAmount
    const currencyAmountWBTC = new TokenAmount(
      tokenWBTC,
      parseUnits('1', tokenWBTC.decimals).toString()
    ) as CurrencyAmount

    beforeAll(async () => {
      await execAsync('npm run docker:up')
    })

    afterAll(async () => {
      await execAsync('npm run docker:clean')
    })

    test('Should find a route from 1 stETH to ETH', async () => {
      const currencyAmountIn = new TokenAmount(
        tokenStETH,
        parseUnits('1', tokenStETH.decimals).toString()
      ) as CurrencyAmount
      const trade = await ZeroXTrade.bestTradeExactIn(currencyAmountIn, tokenETH, maximumSlippage)
      invariant(!!trade)
      const swapTransaction = await trade.swapTransaction()
      expect(swapTransaction.data).toBeDefined()
      expect(swapTransaction.to).toBeAddress()
      expect(swapTransaction?.value?.toString()).toEqual('0')
    })
    test('Should find a route from 1 ETH to stETH', async () => {
      const trade = await ZeroXTrade.bestTradeExactIn(currencyAmountETH1, tokenStETH, maximumSlippage)
      invariant(!!trade)
      const swapTransaction = await trade.swapTransaction()
      expect(swapTransaction.data).toBeDefined()
      expect(swapTransaction?.to).toBeAddress()
      expect(swapTransaction?.value?.toString()).toEqual(
        parseUnits('1', currencyAmountETH1.currency.decimals).toString()
      )
    })

    test('Should find a route from 1 ETH to CRV', async () => {
      const trade = await ZeroXTrade.bestTradeExactIn(currencyAmountETH1, tokenCRV, maximumSlippage)
      invariant(!!trade)
      const swapTransaction = await trade.swapTransaction()
      expect(swapTransaction.data).toBeDefined()
      expect(swapTransaction?.to).toBeAddress()
      expect(swapTransaction.value).toEqual(parseUnits('1'))
    })

    test('Should find a route from 1000 CRV to ETH', async () => {
      const trade = await ZeroXTrade.bestTradeExactOut(tokenETH, currencyAmountCRV, maximumSlippage)
      invariant(!!trade)
      const swapTransaction = await trade.swapTransaction()
      expect(swapTransaction.data).toBeDefined()
      expect(swapTransaction?.to).toBeAddress()
      expect(swapTransaction.value).toEqual(parseUnits('0'))
    })

    test('Should find a route from 1 renBTC to WBTC', async () => {
      const trade = await ZeroXTrade.bestTradeExactIn(currencyAmountRenBTC1, tokenWBTC, maximumSlippage)
      invariant(!!trade)
      const swapTransaction = await trade.swapTransaction()
      expect(swapTransaction.data).toBeDefined()
      expect(swapTransaction?.to).toBeAddress()

      expect(swapTransaction?.value?.toString()).toEqual('0')
    })
    test('Should find a route from 1 WBTC to renBTC ', async () => {
      const trade = await ZeroXTrade.bestTradeExactOut(tokenRenBTC, currencyAmountWBTC, maximumSlippage)
      invariant(!!trade)
      const swapTransaction = await trade.swapTransaction()
      expect(swapTransaction.data).toBeDefined()
      expect(swapTransaction?.to).toBeAddress()

      expect(swapTransaction?.value?.toString()).toEqual('0')
    })
  })

  describe('utils', () => {
    describe('decodePlatformName', () => {
      test('returns platform names from api', () => {
        expect(decodePlatformName(CODE_TO_PLATFORM_NAME['DODO_V2'])).toEqual('Dodo v2')
        expect(decodePlatformName('0x')).toEqual('0x')
      })
    })
    describe('decodeStringToPercent', () => {
      test('returns decoded strings to Percent', () => {
        expect(decodeStringToPercent('0.0072')).toEqual(new Percent('72', '10000'))
        expect(decodeStringToPercent('0.0072', true)).toEqual(new Percent('72', '1000000'))
        expect(decodeStringToPercent('72')).toEqual(new Percent('72', '1'))
        expect(decodeStringToPercent('72', true)).toEqual(new Percent('72', '100'))
      })
    })
    describe('platformsFromSources', () => {
      const onePlatformProportion: ApiSource[] = [
        {
          name: 'Uniswap v2',
          proportion: '1',
        },
        {
          name: 'Curve',
          proportion: '0',
        },
      ]
      const multiplyPlatformsProportion: ApiSource[] = [
        {
          name: 'Uniswap',
          proportion: '0.8',
        },
        {
          name: 'Curve',
          proportion: '0',
        },
        {
          name: '0X',
          proportion: '0.2',
        },
      ]
      test('returns list of platforms', () => {
        expect(platformsFromSources(onePlatformProportion)).toEqual([
          {
            name: 'Uniswap v2',
            percentage: new Percent('1'),
          },
        ])
        expect(platformsFromSources(multiplyPlatformsProportion)).toEqual([
          {
            name: 'Uniswap',
            percentage: new Percent('8', '10'),
          },
          {
            name: '0X',
            percentage: new Percent('2', '10'),
          },
        ])
      })
    })
  })
})
