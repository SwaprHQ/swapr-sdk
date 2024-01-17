import { parseUnits } from '@ethersproject/units'
import invariant from 'tiny-invariant'

// Jest
import { execAsync } from '../jest'
// Tets targets
import { ChainId, CurrencyAmount, Percent, Token, TokenAmount, ZeroXTrade } from '../src'
import { ApiSource } from '../src/entities/trades/0x/types'
import { decodePlatformName, decodeStringToPercent, platformsFromSources } from '../src/entities/trades/0x/utils'
import { TOKENS_MAINNET, TokenType } from '../src/entities/trades/curve/tokens'

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
      TOKENS_MAINNET.steth.name,
    )

    const tokenETH = new Token(
      ChainId.MAINNET,
      TOKENS_MAINNET.eth.address,
      TOKENS_MAINNET.eth.decimals,
      TOKENS_MAINNET.eth.symbol,
      TOKENS_MAINNET.eth.name,
    )

    const tokenCRV = new Token(
      ChainId.MAINNET,
      TOKENS_MAINNET.crv.address,
      TOKENS_MAINNET.crv.decimals,
      TOKENS_MAINNET.crv.symbol,
      TOKENS_MAINNET.crv.name,
    )

    const tokenRenBTC = new Token(
      ChainId.MAINNET,
      TOKENS_MAINNET.renbtc.address,
      TOKENS_MAINNET.renbtc.decimals,
      TOKENS_MAINNET.renbtc.symbol,
      TOKENS_MAINNET.renbtc.name,
    )

    const tokenWBTC = new Token(
      ChainId.MAINNET,
      TOKENS_MAINNET.wbtc.address,
      TOKENS_MAINNET.wbtc.decimals,
      TOKENS_MAINNET.wbtc.symbol,
      TOKENS_MAINNET.wbtc.name,
    )

    // Common token amounts
    const currencyAmountETH1 = new TokenAmount(
      tokenETH,
      parseUnits('1', tokenETH.decimals).toString(),
    ) as CurrencyAmount
    const currencyAmountCRV = new TokenAmount(
      tokenCRV,
      parseUnits('1000', tokenCRV.decimals).toString(),
    ) as CurrencyAmount
    const currencyAmountRenBTC1 = new TokenAmount(
      tokenRenBTC,
      parseUnits('1', tokenRenBTC.decimals).toString(),
    ) as CurrencyAmount
    const currencyAmountWBTC = new TokenAmount(
      tokenWBTC,
      parseUnits('1', tokenWBTC.decimals).toString(),
    ) as CurrencyAmount

    beforeAll(async () => {
      await execAsync('npm run docker:up')
    })

    afterAll(async () => {
      await execAsync('npm run docker:clean')
    })

    test.skip('Should find a route from 1.5 stETH to ETH', async () => {
      const currencyAmountIn = new TokenAmount(
        tokenStETH,
        parseUnits('1.5', tokenStETH.decimals).toString(),
      ) as CurrencyAmount
      const trade = await ZeroXTrade.bestTradeExactIn(currencyAmountIn, tokenETH, maximumSlippage)
      invariant(!!trade)
      const swapTransaction = await trade.swapTransaction({
        recipient: '0x0000000000000000000000000000000000000000',
      })
      expect(swapTransaction.data).toBeDefined()
      expect(swapTransaction.to).toBeAddress()
      expect(swapTransaction?.value?.toString()).toEqual('0')
    })
    test.skip('Should find a route from 1 ETH to stETH', async () => {
      const trade = await ZeroXTrade.bestTradeExactIn(currencyAmountETH1, tokenStETH, maximumSlippage)
      invariant(!!trade)
      const swapTransaction = await trade.swapTransaction({
        recipient: '0x0000000000000000000000000000000000000000',
      })
      expect(swapTransaction.data).toBeDefined()
      expect(swapTransaction?.to).toBeAddress()
      expect(swapTransaction?.value?.toString()).toEqual(
        parseUnits('1', currencyAmountETH1.currency.decimals).toString(),
      )
    })

    test('Should find a route from 1 ETH to CRV', async () => {
      const trade = await ZeroXTrade.bestTradeExactIn(currencyAmountETH1, tokenCRV, maximumSlippage)
      invariant(!!trade)
      const swapTransaction = await trade.swapTransaction({
        recipient: '0x0000000000000000000000000000000000000000',
      })
      expect(swapTransaction.data).toBeDefined()
      expect(swapTransaction?.to).toBeAddress()
      expect(swapTransaction.value).toEqual(parseUnits('1'))
    })

    test('Should find a route from 1000 CRV to ETH', async () => {
      const trade = await ZeroXTrade.bestTradeExactOut(tokenETH, currencyAmountCRV, maximumSlippage)
      invariant(!!trade)
      const swapTransaction = await trade.swapTransaction({
        recipient: '0x0000000000000000000000000000000000000000',
      })
      expect(swapTransaction.data).toBeDefined()
      expect(swapTransaction?.to).toBeAddress()
      expect(swapTransaction.value).toEqual(parseUnits('0'))
    })

    test('Should find a route from 1 renBTC to WBTC', async () => {
      const trade = await ZeroXTrade.bestTradeExactIn(currencyAmountRenBTC1, tokenWBTC, maximumSlippage)
      invariant(!!trade)
      const swapTransaction = await trade.swapTransaction({
        recipient: '0x0000000000000000000000000000000000000000',
      })
      expect(swapTransaction.data).toBeDefined()
      expect(swapTransaction?.to).toBeAddress()

      expect(swapTransaction?.value?.toString()).toEqual('0')
    })
    test('Should find a route from 1 WBTC to renBTC ', async () => {
      const trade = await ZeroXTrade.bestTradeExactOut(tokenRenBTC, currencyAmountWBTC, maximumSlippage)
      invariant(!!trade)
      const swapTransaction = await trade.swapTransaction({
        recipient: '0x0000000000000000000000000000000000000000',
      })
      expect(swapTransaction.data).toBeDefined()
      expect(swapTransaction?.to).toBeAddress()

      expect(swapTransaction?.value?.toString()).toEqual('0')
    })
  })
  describe('Polygon', () => {
    // Enable debugging
    process.env.__SWAPR_SDK_DEBUG__ = 'true'

    const TOKENS_POLYGON = {
      wmatic: {
        address: '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270',
        name: 'Wrapped Matic',
        symbol: 'WMATIC',
        decimals: 18,
        type: TokenType.ETH,
      },
      wbtc: {
        symbol: 'wBTC',
        name: 'wBTC',
        decimals: 8,
        address: '0x1BFD67037B42Cf73acF2047067bd4F2C47D9BfD6',
        type: TokenType.BTC,
      },
      usdt: {
        symbol: 'USDT',
        name: 'USDT',
        address: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F',
        decimals: 6,
        type: TokenType.USD,
      },
    }

    const tokenWMATIC = new Token(
      ChainId.POLYGON,
      TOKENS_POLYGON.wmatic.address,
      TOKENS_POLYGON.wmatic.decimals,
      TOKENS_POLYGON.wmatic.symbol,
      TOKENS_POLYGON.wmatic.name,
    )

    const tokenWBTC = new Token(
      ChainId.POLYGON,
      TOKENS_POLYGON.wbtc.address,
      TOKENS_POLYGON.wbtc.decimals,
      TOKENS_POLYGON.wbtc.symbol,
      TOKENS_POLYGON.wbtc.name,
    )

    const tokenUSDT = new Token(
      ChainId.POLYGON,
      TOKENS_POLYGON.usdt.address,
      TOKENS_POLYGON.usdt.decimals,
      TOKENS_POLYGON.usdt.symbol,
      TOKENS_POLYGON.usdt.name,
    )

    // Common token amounts
    const currencyAmountWMATIC = new TokenAmount(
      tokenWMATIC,
      parseUnits('1.2', tokenWMATIC.decimals).toString(),
    ) as CurrencyAmount

    const currencyAmountUSDT = new TokenAmount(
      tokenUSDT,
      parseUnits('0.2', tokenUSDT.decimals).toString(),
    ) as CurrencyAmount

    const currencyAmountWBTC = new TokenAmount(
      tokenWBTC,
      parseUnits('0.002', tokenWBTC.decimals).toString(),
    ) as CurrencyAmount

    beforeAll(async () => {
      await execAsync('npm run docker:up')
    })

    afterAll(async () => {
      await execAsync('npm run docker:clean')
    })

    test('Should find a route from 1.2 WMATIC to USDT', async () => {
      const trade = await ZeroXTrade.bestTradeExactIn(currencyAmountWMATIC, tokenUSDT, maximumSlippage)
      invariant(!!trade)
      const swapTransaction = await trade.swapTransaction({
        recipient: '0x0000000000000000000000000000000000000000',
      })
      expect(swapTransaction.data).toBeDefined()
      expect(swapTransaction.to).toBeAddress()
      expect(swapTransaction?.value?.toString()).toEqual('0')
    })
    test('Should find a route from 0.2 USDT to WBTC', async () => {
      const trade = await ZeroXTrade.bestTradeExactIn(currencyAmountUSDT, tokenWBTC, maximumSlippage)
      invariant(!!trade)
      const swapTransaction = await trade.swapTransaction({
        recipient: '0x0000000000000000000000000000000000000000',
      })
      expect(swapTransaction.data).toBeDefined()
      expect(swapTransaction?.to).toBeAddress()
      expect(swapTransaction?.value?.toString()).toEqual('0')
    })
    test('Should find a route from 0.002 WBTC to WMATIC', async () => {
      const trade = await ZeroXTrade.bestTradeExactIn(currencyAmountWBTC, tokenWMATIC, maximumSlippage)
      invariant(!!trade)
      const swapTransaction = await trade.swapTransaction({
        recipient: '0x0000000000000000000000000000000000000000',
      })
      expect(swapTransaction.data).toBeDefined()
      expect(swapTransaction?.to).toBeAddress()
      expect(swapTransaction?.value?.toString()).toEqual('0')
    })
    test('Should find a route from 0.002 WBTC to WMATIC', async () => {
      const trade = await ZeroXTrade.bestTradeExactOut(tokenWMATIC, currencyAmountWBTC, maximumSlippage)
      invariant(!!trade)
      const swapTransaction = await trade.swapTransaction({
        recipient: '0x0000000000000000000000000000000000000000',
      })
      expect(swapTransaction.data).toBeDefined()
      expect(swapTransaction?.to).toBeAddress()
      expect(swapTransaction?.value?.toString()).toEqual('0')
    })
  })

  describe('utils', () => {
    describe('decodePlatformName', () => {
      test('returns platform names from api', () => {
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
