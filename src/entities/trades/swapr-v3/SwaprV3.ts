import type { BaseProvider } from '@ethersproject/providers'
import { UnsignedTransaction } from '@ethersproject/transactions'
import { parseUnits } from '@ethersproject/units'
import { Fraction, validateAndParseAddress } from '@uniswap/sdk-core'
import dayjs from 'dayjs'
import invariant from 'tiny-invariant'

import { ChainId, ONE, TradeType } from '../../../constants'
import { Currency } from '../../currency'
import { CurrencyAmount, Percent, Price, TokenAmount } from '../../fractions'
import { TradeWithSwapTransaction } from '../interfaces/trade'
import { TradeOptions } from '../interfaces/trade-options'
import { RoutablePlatform } from '../routable-platform'
import { getProvider, tryGetChainId } from '../utils'
import { SWAPR_ALGEBRA_CONTRACTS } from './constants'
import { getQuoterContract, getRouterContract } from './contracts'
import { getRoutes } from './routes'
import { maximumSlippage as defaultMaximumSlippage } from '../constants'
import { Token, WXDAI } from '../../token'
import JSBI from 'jsbi'

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
const ALGEBRA_FEE_PARTS_PER_MILLION = JSBI.BigInt(1_000_000)

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
    { amount, quoteCurrency, tradeType, maximumSlippage }: SwaprV3GetQuoteParams,
    provider?: BaseProvider,
  ): Promise<SwaprV3Trade | null> {
    const chainId = tryGetChainId(amount, quoteCurrency)
    invariant(chainId, 'SwaprV3Trade.getQuote: chainId is required')

    maximumSlippage = maximumSlippage ?? defaultMaximumSlippage
    provider = provider ?? getProvider(chainId)

    invariant(
      (await provider.getNetwork()).chainId == chainId,
      `SwaprV3Trade.getQuote: currencies chainId does not match provider's chainId`,
    )

    invariant(amount.currency.address, `SwaprV3Trade.getQuote: amount.currency.address is required`)
    const setToken = Currency.isNative(amount.currency)
      ? WXDAI[ChainId.GNOSIS]
      : new Token(
          ChainId.GNOSIS,
          amount.currency.address,
          amount.currency.decimals,
          amount.currency.symbol,
          amount.currency.name,
        )

    invariant(quoteCurrency.address, `SwaprV3Trade.getQuote: quoteCurrency.address is required`)
    const quoteToken = Currency.isNative(quoteCurrency)
      ? WXDAI[ChainId.GNOSIS]
      : new Token(
          ChainId.GNOSIS,
          quoteCurrency.address,
          quoteCurrency.decimals,
          quoteCurrency.symbol,
          quoteCurrency.name,
        )

    const routes = await getRoutes(setToken, quoteToken, chainId)

    const fee =
      routes?.length > 0 && routes[0].pools.length > 0
        ? new Percent(routes[0].pools[0].fee.toString(), ALGEBRA_FEE_PARTS_PER_MILLION)
        : new Percent('0', '1')

    const parsedAmount = parseUnits(amount.toSignificant(), amount.currency.decimals)

    if (tradeType === TradeType.EXACT_INPUT) {
      const quotedAmountOut = await getQuoterContract()
        .callStatic.quoteExactInputSingle(setToken.address, quoteToken.address, parsedAmount, 0)
        .catch((error) => {
          console.error(`Error sending quoteExactInputSingle transaction: ${error}`)
          return null
        })

      if (quotedAmountOut) {
        return new SwaprV3Trade({
          maximumSlippage,
          inputAmount: amount,
          outputAmount: new TokenAmount(quoteToken, quotedAmountOut),
          tradeType,
          chainId,
          priceImpact: new Percent('0', '100'),
          fee,
        })
      }
    } else {
      const quotedAmountIn = await getQuoterContract()
        .callStatic.quoteExactOutputSingle(quoteToken.address, setToken.address, parsedAmount, 0)
        .catch((error) => {
          console.error(`Error sending quoteExactOutputSingle transaction: ${error}`)
          return null
        })

      if (quotedAmountIn) {
        return new SwaprV3Trade({
          maximumSlippage,
          inputAmount: new TokenAmount(quoteToken, quotedAmountIn),
          outputAmount: amount,
          tradeType,
          chainId,
          priceImpact: new Percent('0', '100'),
          fee,
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
    const isNativeIn = Currency.isNative(this.inputAmount.currency)
    const isNativeOut = Currency.isNative(this.outputAmount.currency)
    invariant(
      !(isNativeIn && isNativeOut),
      'SwaprV3Trade.swapTransaction: the router does not support both native in and out',
    )

    const recipient = validateAndParseAddress(options.recipient)
    const amountIn = `0x${this.maximumAmountIn().raw.toString(16)}`
    const amountOut = `0x${this.minimumAmountOut().raw.toString(16)}`

    const isTradeExactInput = this.tradeType === TradeType.EXACT_INPUT

    // Swapr Algebra Contract fee param is uint24 type
    const algebraFee = this.fee.multiply(ALGEBRA_FEE_PARTS_PER_MILLION).toSignificant(1)
    const baseParams = {
      tokenIn: isNativeIn ? WXDAI[ChainId.GNOSIS].address : this.inputAmount.currency.address,
      tokenOut: isNativeOut ? WXDAI[ChainId.GNOSIS].address : this.outputAmount.currency.address,
      recipient,
      deadline: dayjs().add(30, 'm').unix(),
      sqrtPriceLimitX96: 0,
      fee: algebraFee,
    }

    const value = isNativeIn ? amountIn : undefined

    const exactInputSingleParams = {
      ...baseParams,
      amountIn,
      amountOutMinimum: amountOut,
    }

    const exactOutputSingleParams = {
      ...baseParams,
      amountOut,
      amountInMaximum: amountIn,
    }

    const methodName = isTradeExactInput ? 'exactInputSingle' : 'exactOutputSingle'
    const params = isTradeExactInput ? exactInputSingleParams : exactOutputSingleParams
    const populatedTransaction = await getRouterContract().populateTransaction[methodName](params, { value })

    return populatedTransaction
  }
}
