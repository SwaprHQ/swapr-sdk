import { isAddress } from '@ethersproject/address'
import { Contract } from '@ethersproject/contracts'
import { formatEther, parseUnits } from '@ethersproject/units'
import JSBI from 'jsbi'

import { ChainId, Currency, CurrencyAmount, CurveTrade, Percent, RoutablePlatform, Token, TokenAmount } from '../src'
import { COINS_MAINNET, TOKENS_XDAI, DECIMALS, TOKENS_ARBITRUM_ONE } from '../src/entities/trades/curve-trade/constants'
import { getCurveContracts } from '../src/entities/trades/curve-trade/contracts'

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
  test('Should return the Curve contracts', async () => {
    const contracts = await getCurveContracts(ChainId.MAINNET)
    expect(contracts.addressProvider).toBeInstanceOf(Contract)
    expect(contracts.router).toBeInstanceOf(Contract)
  })

  test('Should retunrn the best trade from USDT to USDC on Ethereum', async () => {
    const tokenUSDT = new Token(ChainId.MAINNET, COINS_MAINNET.usdt, DECIMALS[COINS_MAINNET.usdt], 'USDT', 'USDT')
    const tokenUSDC = new Token(ChainId.MAINNET, COINS_MAINNET.usdc, DECIMALS[COINS_MAINNET.usdc], 'USDC', 'USDC')

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
    expect(swapTransaction?.value).toBeDefined()
    expect(isAddress(swapTransaction?.to as string)).toBeTruthy()
  })

  test('Should retunrn the best trade from renBTC to wBTC on Ethereum', async () => {
    const tokenUSDT = new Token(
      ChainId.MAINNET,
      COINS_MAINNET.wbtc,
      DECIMALS[COINS_MAINNET.wbtc],
      'Wrapped BTC',
      'WBTC'
    )
    const tokenUSDC = new Token(
      ChainId.MAINNET,
      COINS_MAINNET.renbtc,
      DECIMALS[COINS_MAINNET.renbtc],
      'renBTC',
      'renBTC'
    )

    const currencyAmountIn = tryParseAmount(formatEther(parseUnits('0.5')), tokenUSDT)

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
    expect(swapTransaction?.value).toBeDefined()
    expect(isAddress(swapTransaction?.to as string)).toBeTruthy()
  })

  test('Should retunrn the best trade from renBTC to wBTC on Ethereum', async () => {
    const tokenUSDT = new Token(ChainId.MAINNET, COINS_MAINNET.usdt, DECIMALS[COINS_MAINNET.usdt], 'USDT', 'USDT')
    const tokenUSDC = new Token(ChainId.MAINNET, COINS_MAINNET.usdc, DECIMALS[COINS_MAINNET.usdc], 'USDC', 'USDC')

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
    expect(swapTransaction?.value).toBeDefined()
    expect(isAddress(swapTransaction?.to as string)).toBeTruthy()
  })

  test('Should return the best trade from WXDAI to USDC on xDAI', async () => {
    const tokenXWDAI = new Token(ChainId.XDAI, TOKENS_XDAI.wxdai.address, TOKENS_XDAI.wxdai.decimals, 'WXDAI', 'WXDAI')
    const tokenUSDC = new Token(ChainId.XDAI, TOKENS_XDAI.usdc.address, TOKENS_XDAI.usdc.decimals, 'USDC', 'USDC')

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
    expect(swapTransaction?.value).toBeDefined()
    expect(isAddress(swapTransaction?.to as string)).toBeTruthy()
  })

  test('Should return the best trade from EURs to USDC on Arbitrum One', async () => {
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

    const currencyAmountIn = tryParseAmount(parseUnits('1', tokenEURs.decimals).toString(), tokenEURs)

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
    expect(swapTransaction?.value).toBeDefined()
    expect(isAddress(swapTransaction?.to as string)).toBeTruthy()
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
    expect(swapTransaction?.value).toBeDefined()
    expect(isAddress(swapTransaction?.to as string)).toBeTruthy()
  })
})
