import { isAddress } from '@ethersproject/address'
import { Contract } from '@ethersproject/contracts'
import { formatEther, parseUnits } from '@ethersproject/units'
import JSBI from 'jsbi'

import { ChainId, Currency, CurrencyAmount, CurveTrade, Percent, RoutablePlatform, Token, TokenAmount } from '../src'
import { COINS_MAINNET, COINS_XDAI, DECIMALS } from '../src/entities/trades/curve-trade/constants'
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

  test('Should return the best trade from WXDAI to USDC on xDAI', async () => {
    const tokenXWDAI = new Token(ChainId.XDAI, COINS_XDAI.wxdai, DECIMALS[COINS_XDAI.wxdai], 'WXDAI', 'WXDAI')
    const tokenUSDC = new Token(ChainId.XDAI, COINS_XDAI.usdc, DECIMALS[COINS_XDAI.usdc], 'USDC', 'USDC')

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

  test('Should handle fractions like 1.5 WXDAI to USDC', async () => {
    const tokenXWDAI = new Token(ChainId.XDAI, COINS_XDAI.wxdai, DECIMALS[COINS_XDAI.wxdai], 'WXDAI', 'WXDAI')
    const tokenUSDC = new Token(ChainId.XDAI, COINS_XDAI.usdc, DECIMALS[COINS_XDAI.usdc], 'USDC', 'USDC')

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
