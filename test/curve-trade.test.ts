import { isAddress } from '@ethersproject/address'
import { formatEther, parseUnits } from '@ethersproject/units'
import JSBI from 'jsbi'

import { ChainId, Currency, CurrencyAmount, CurveTrade, Percent, RoutablePlatform, Token, TokenAmount } from '../src'
import {
  COINS_MAINNET,
  TOKENS_XDAI,
  DECIMALS,
  TOKENS_ARBITRUM_ONE,
  CURVE_POOLS
} from '../src/entities/trades/curve-trade/constants'

// try to parse a user entered amount for a given token
export function tryParseAmount(value?: string, currency?: Currency, chainId?: number): CurrencyAmount | undefined {
  if (!value || !currency) {
    return undefined
  }

  try {
    const typedValueParsed = parseUnits(value, currency.decimals).toString()
    if (typedValueParsed !== '0') {
      if (currency instanceof Token) return new TokenAmount(currency, JSBI.BigInt(typedValueParsed))
      else if (chainId) return CurrencyAmount.nativeCurrency(JSBI.BigInt(typedValueParsed), chainId)
      else return undefined
    }
  } catch (error) {
    // should fail if the user specifies too many decimal places of precision (or maybe exceed max uint?)
    console.debug(`Failed to parse input amount: "${value}"`, error)
  }
  // necessary for all paths to return a value
  return undefined
}

describe('CurveTrade', () => {
  describe('Gnosis Chain', () => {
    const tokenXWDAI = new Token(ChainId.XDAI, TOKENS_XDAI.wxdai.address, TOKENS_XDAI.wxdai.decimals, 'WXDAI', 'WXDAI')
    const tokenUSDC = new Token(ChainId.XDAI, TOKENS_XDAI.usdc.address, TOKENS_XDAI.usdc.decimals, 'USDC', 'USDC')

    test('Should return the best trade from WXDAI to USDC', async () => {
      const currencyAmountIn = tryParseAmount(parseUnits('1', tokenXWDAI.decimals).toString(), tokenXWDAI)

      const trade = await CurveTrade.bestTradeExactIn(
        currencyAmountIn as CurrencyAmount,
        tokenUSDC,
        new Percent('3', '100')
      )

      expect(trade).toBeDefined()
      expect(trade?.platform.name).toEqual(RoutablePlatform.CURVE.name)

      // test swap transaction
      const swapTransaction = trade && (await trade.swapTransaction())
      expect(swapTransaction).toBeDefined()
      expect(swapTransaction?.data).toBeDefined()
      expect(isAddress(swapTransaction?.to as string)).toBeTruthy()
    })
  })

  describe('Ethereum', () => {
    const tokenUSDT = new Token(ChainId.MAINNET, COINS_MAINNET.usdt, DECIMALS[COINS_MAINNET.usdt], 'USDT', 'USDT')
    const tokenUSDC = new Token(ChainId.MAINNET, COINS_MAINNET.usdc, DECIMALS[COINS_MAINNET.usdc], 'USDC', 'USDC')

    const tokenWBTC = new Token(
      ChainId.MAINNET,
      COINS_MAINNET.wbtc,
      DECIMALS[COINS_MAINNET.wbtc],
      'Wrapped BTC',
      'WBTC'
    )
    const tokenRenBTC = new Token(
      ChainId.MAINNET,
      COINS_MAINNET.renbtc,
      DECIMALS[COINS_MAINNET.renbtc],
      'renBTC',
      'renBTC'
    )

    test('Should retunrn the best trade from USDT to USDC', async () => {
      const currencyAmountIn = tryParseAmount(formatEther(parseUnits('1')), tokenUSDT)
      const trade = await CurveTrade.bestTradeExactIn(
        currencyAmountIn as CurrencyAmount,
        tokenUSDC,
        new Percent('3', '100')
      )

      expect(trade).toBeDefined()
      expect(trade?.platform.name).toEqual(RoutablePlatform.CURVE.name)
      // test swap transaction
      const swapTransaction = trade && (await trade.swapTransaction())
      expect(swapTransaction).toBeDefined()
      expect(swapTransaction?.data).toBeDefined()
      expect(isAddress(swapTransaction?.to as string)).toBeTruthy()
    })
    test('Should retunrn the best trade from renBTC to WBTC', async () => {
      const currencyAmountIn = tryParseAmount(formatEther(parseUnits('0.5')), tokenRenBTC)

      const trade = await CurveTrade.bestTradeExactIn(
        currencyAmountIn as CurrencyAmount,
        tokenWBTC,
        new Percent('3', '100')
      )

      expect(trade).toBeDefined()
      expect(trade?.platform.name).toEqual(RoutablePlatform.CURVE.name)
      // test swap transaction
      const swapTransaction = trade && (await trade.swapTransaction())
      expect(swapTransaction).toBeDefined()
      expect(swapTransaction?.data).toBeDefined()
      expect(isAddress(swapTransaction?.to as string)).toBeTruthy()
    })
  })

  describe('Arbitrum One', () => {
    const tokenEURs = new Token(
      ChainId.ARBITRUM_ONE,
      TOKENS_ARBITRUM_ONE.eurs.address,
      TOKENS_ARBITRUM_ONE.eurs.decimals,
      TOKENS_ARBITRUM_ONE.eurs.symbol,
      TOKENS_ARBITRUM_ONE.eurs.name
    )
    const tokenUSDC = new Token(
      ChainId.ARBITRUM_ONE,
      TOKENS_ARBITRUM_ONE.usdc.address,
      TOKENS_ARBITRUM_ONE.usdc.decimals,
      TOKENS_ARBITRUM_ONE.usdc.symbol,
      TOKENS_ARBITRUM_ONE.usdc.name
    )

    const tokenUSDT = new Token(
      ChainId.ARBITRUM_ONE,
      TOKENS_ARBITRUM_ONE.usdt.address,
      TOKENS_ARBITRUM_ONE.usdt.decimals,
      TOKENS_ARBITRUM_ONE.usdt.symbol,
      TOKENS_ARBITRUM_ONE.usdt.name
    )

    test('Should return the best trade from USDC to USDT via 2pool', async () => {
      const currencyAmountIn = tryParseAmount(parseUnits('1', tokenUSDC.decimals).toString(), tokenUSDC)

      const trade = await CurveTrade.bestTradeExactIn(
        currencyAmountIn as CurrencyAmount,
        tokenUSDT,
        new Percent('3', '100')
      )

      const curve2Pool = CURVE_POOLS[ChainId.ARBITRUM_ONE].find(({ name }) => name.toLowerCase() == '2pool')

      expect(trade).toBeDefined()
      expect(trade?.platform.name).toEqual(RoutablePlatform.CURVE.name)
      // test swap transaction
      const swapTransaction = trade && (await trade.swapTransaction())
      expect(swapTransaction).toBeDefined()
      expect(swapTransaction?.data).toBeDefined()
      expect(isAddress(swapTransaction?.to as string)).toBeTruthy()
      expect(swapTransaction?.to).toBe(curve2Pool?.swapAddress)
    })

    test('Should return the best trade from USDC to EURs via eurusd', async () => {
      const currencyAmountIn = tryParseAmount(parseUnits('1', tokenUSDC.decimals).toString(), tokenUSDC)
      const trade = await CurveTrade.bestTradeExactIn(
        currencyAmountIn as CurrencyAmount,
        tokenEURs,
        new Percent('3', '100')
      )
      expect(trade).toBeDefined()
      expect(trade?.platform.name).toEqual(RoutablePlatform.CURVE.name)
      // test swap transaction
      const swapTransaction = trade && (await trade.swapTransaction())
      expect(swapTransaction).toBeDefined()
      expect(swapTransaction?.data).toBeDefined()
      expect(isAddress(swapTransaction?.to as string)).toBeTruthy()
    })
  })

  test('Should handle fractions like 1.5 WXDAI to USDC', async () => {
    const tokenXWDAI = new Token(ChainId.XDAI, TOKENS_XDAI.wxdai.address, TOKENS_XDAI.wxdai.decimals, 'WXDAI', 'WXDAI')
    const tokenUSDC = new Token(ChainId.XDAI, TOKENS_XDAI.usdc.address, TOKENS_XDAI.usdc.decimals, 'USDC', 'USDC')
    const currencyAmountIn = tryParseAmount(parseUnits('1.5', tokenXWDAI.decimals).toString(), tokenXWDAI)
    const trade = await CurveTrade.bestTradeExactIn(
      currencyAmountIn as CurrencyAmount,
      tokenUSDC,
      new Percent('3', '100')
    )
    expect(trade).toBeDefined()
    expect(trade?.platform.name).toEqual(RoutablePlatform.CURVE.name)
    // test swap transaction
    const swapTransaction = trade && (await trade.swapTransaction())
    expect(swapTransaction).toBeDefined()
    expect(swapTransaction?.data).toBeDefined()
    expect(isAddress(swapTransaction?.to as string)).toBeTruthy()
  })
})
