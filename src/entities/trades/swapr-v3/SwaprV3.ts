import type { BaseProvider } from '@ethersproject/providers'
import dayjs from 'dayjs'

import { Currency, Fraction, Token, validateAndParseAddress } from '@uniswap/sdk-core'
import invariant from 'tiny-invariant'

import { CurrencyAmount, Percent, Price, TokenAmount } from '../../fractions'

import { TradeWithSwapTransaction } from '../interfaces/trade'
import { RoutablePlatform } from '../routable-platform'
import { getProvider, tryGetChainId } from '../utils'
import { ONE, TradeType } from '../../../constants'

import { UnsignedTransaction } from 'ethers'
import { TradeOptions } from '../interfaces/trade-options'
import { parseUnits } from '@ethersproject/units'
import { Route } from './entities/route'
import { SWAPR_ALGEBRA_CONTRACTS } from './constants'
import { getQuoterContract, getRouterContract } from './contracts'
import { getRoutes } from './routes'
import { maximumSlippage as defaultMaximumSlippage } from '../constants'

const WXDAI_ADDRESS = '0xe91D153E0b41518A2Ce8Dd3D7944Fa863463a97d'

const currencyAddress = (currency: Currency) => {
  return currency.isNative ? WXDAI_ADDRESS : currency.address
}

export const setupTokens = (currencyIn: Currency, currencyOut: Currency) => {
  const tokenIn = new Token(100, currencyAddress(currencyIn), currencyIn.decimals, currencyIn.symbol, currencyIn.name)

  const tokenOut = new Token(
    100,
    currencyAddress(currencyOut),
    currencyOut.decimals,
    currencyOut.symbol,
    currencyOut.name
  )

  const [tokenA, tokenB] = [tokenIn?.wrapped, tokenOut?.wrapped]

  return { tokenA, tokenB }
}

interface SwaprV3ConstructorParams {
  maximumSlippage: Percent
  inputAmount: CurrencyAmount
  outputAmount: CurrencyAmount
  tradeType: TradeType
  chainId: number
  priceImpact: Percent
  fee: Percent
}

export interface SwaprV3GetQuoteParams {
  amount: CurrencyAmount
  quoteCurrency: Currency
  tradeType: TradeType
  maximumSlippage?: Percent
  recipient?: string
}

export class SwaprV3Trade extends TradeWithSwapTransaction {
  public constructor({
    inputAmount,
    outputAmount,
    maximumSlippage,
    priceImpact,
    tradeType,
    chainId,
    fee,
  }: SwaprV3ConstructorParams) {
    super({
      details: undefined,
      type: tradeType,
      inputAmount,
      outputAmount,
      maximumSlippage,
      platform: RoutablePlatform.SWAPR_V3,
      chainId,
      executionPrice: new Price({
        baseCurrency: inputAmount.currency,
        quoteCurrency: outputAmount.currency,
        denominator: inputAmount.raw,
        numerator: outputAmount.raw,
      }),
      priceImpact,
      fee,
      approveAddress: SWAPR_ALGEBRA_CONTRACTS['router'],
    })
  }

  static async getQuote(
    { amount, quoteCurrency, tradeType, maximumSlippage }: any,
    provider?: BaseProvider
  ): Promise<SwaprV3Trade | null> {
    const chainId = tryGetChainId(amount, quoteCurrency)
    invariant(chainId, 'SwaprV3Trade.getQuote: chainId is required')

    maximumSlippage = maximumSlippage ?? defaultMaximumSlippage
    provider = provider ?? getProvider(chainId)

    const tokenIn = amount.currency
    const tokenOut = quoteCurrency

    invariant(
      (await provider.getNetwork()).chainId == chainId,
      `SwaprV3Trade.getQuote: currencies chainId does not match provider's chainId`
    )

    const routes: Route<Currency, Currency>[] = await getRoutes(tokenIn, tokenOut, chainId)

    const fee =
      routes?.length > 0 && routes[0].pools.length > 0
        ? new Percent(routes[0].pools[0].fee.toString(), '1000000')
        : new Percent('0', '0')

    if (tradeType === TradeType.EXACT_INPUT) {
      const quotedAmountOut = await getQuoterContract()
        .callStatic.quoteExactInputSingle(
          tokenIn.address,
          tokenOut.address,
          parseUnits(amount.toSignificant(), amount.currency.decimals),
          0
        )
        .catch((error) => {
          console.error(`Error sending quoteExactInputSingle transaction: ${error}`)
          return null
        })

      if (quotedAmountOut) {
        return new SwaprV3Trade({
          maximumSlippage,
          inputAmount: amount,
          outputAmount: new TokenAmount(quoteCurrency, quotedAmountOut),
          tradeType: tradeType,
          chainId: chainId,
          priceImpact: new Percent('0', '1000'),
          fee,
        })
      }
    } else {
      const quotedAmountIn = await getQuoterContract()
        .callStatic.quoteExactOutputSingle(
          quoteCurrency.address,
          amount.currency.address,
          parseUnits(amount.toSignificant(), amount.currency.decimals),
          0
        )
        .catch((error) => {
          console.error(`Error sending quoteExactOutputSingle transaction: ${error}`)
          return null
        })

      if (quotedAmountIn) {
        return new SwaprV3Trade({
          maximumSlippage,
          inputAmount: new TokenAmount(quoteCurrency, quotedAmountIn),
          outputAmount: amount,
          tradeType: tradeType,
          chainId: chainId,
          priceImpact: new Percent('0', '1000'),
          fee: fee,
        })
      }
    }

    return null
  }

  public minimumAmountOut(): CurrencyAmount {
    if (this.tradeType === TradeType.EXACT_OUTPUT) {
      return this.outputAmount
    } else {
      const slippageAdjustedAmountOut = new Fraction(ONE)
        .add(this.maximumSlippage as Fraction)
        .invert()
        .multiply(this.outputAmount.raw).quotient
      return this.outputAmount instanceof TokenAmount
        ? new TokenAmount(this.outputAmount.token, slippageAdjustedAmountOut)
        : CurrencyAmount.nativeCurrency(slippageAdjustedAmountOut, this.chainId)
    }
  }

  public maximumAmountIn(): CurrencyAmount {
    if (this.tradeType === TradeType.EXACT_INPUT) {
      return this.inputAmount
    } else {
      const slippageAdjustedAmountIn = new Fraction(ONE)
        .add(this.maximumSlippage as Fraction)
        .multiply(this.inputAmount.raw).quotient
      return this.inputAmount instanceof TokenAmount
        ? new TokenAmount(this.inputAmount.token, slippageAdjustedAmountIn)
        : CurrencyAmount.nativeCurrency(slippageAdjustedAmountIn, this.chainId)
    }
  }

  public async swapTransaction(options: TradeOptions): Promise<UnsignedTransaction> {
    const to: string = validateAndParseAddress(options.recipient)
    const amountIn: string = toHex(this.maximumAmountIn())
    const amountOut: string = toHex(this.minimumAmountOut())
    const isTradeExactInput = this.tradeType === TradeType.EXACT_INPUT
    const routerContract = getRouterContract()

    const baseParams = {
      tokenIn: this.inputAmount.currency.address,
      tokenOut: this.outputAmount.currency.address,
      recipient: to,
      deadline: dayjs().add(30, 'm').unix(),
      sqrtPriceLimitX96: 0,
      fee: this.fee,
    }

    const exactInputSingleParams = {
      ...baseParams,
      amountIn: amountIn,
      amountOutMinimum: amountOut,
    }

    const exactOutputSingleParams = {
      ...baseParams,
      amountOut: amountOut,
      amountInMaximum: amountIn,
    }

    const methodName = isTradeExactInput ? 'exactInputSingle' : 'exactOutputSingle'
    const params = isTradeExactInput ? exactInputSingleParams : exactOutputSingleParams
    const populatedTransaction = await routerContract.populateTransaction[methodName](params)

    return populatedTransaction
  }
}

function toHex(currencyAmount: CurrencyAmount) {
  return `0x${currencyAmount.raw.toString(16)}`
}
