import { BigNumber } from '@ethersproject/bignumber'
import { AddressZero } from '@ethersproject/constants'
import type { BaseProvider } from '@ethersproject/providers'
import { UnsignedTransaction } from '@ethersproject/transactions'
import { parseUnits } from '@ethersproject/units'
import { Protocol } from '@uniswap/router-sdk'
import {
  CurrencyAmount as UniswapCurrencyAmount,
  Percent as UniswapPercent,
  Token as UniswapToken,
} from '@uniswap/sdk-core'
import { AlphaRouter, SwapRoute } from '@uniswap/smart-order-router'
import { Pair as UniswapV2Pair } from '@uniswap/v2-sdk'
import dayjs from 'dayjs'
import debug from 'debug'
import JSBI from 'jsbi'
import invariant from 'tiny-invariant'

import { ONE, TradeType } from '../../../../constants'
import { Currency } from '../../../currency'
import { CurrencyAmount, Fraction, Percent, Price, TokenAmount } from '../../../fractions'
import { Token } from '../../../token'
import { maximumSlippage as defaultMaximumSlippage } from '../../constants'
import { TradeWithSwapTransaction } from '../../interfaces/trade'
import { TradeOptions } from '../../interfaces/trade-options'
import { RoutablePlatform } from '../../routable-platform'
import { getProvider, tryGetChainId } from '../../utils'
import { UniswapTradeGetQuoteParams, UniswapTradeParams } from '../types/UniswapV3.types'
import { encodeRecipient, getUniswapNativeCurrency } from '../utils'

// Debuging logger. See documentation to enable logging.
const debugUniswapTradeGetQuote = debug('ecoRouter:uniswap:getQuote')

/**
 * UniswapTrade uses the AutoRouter to find best trade across V2 and V3 pools
 */
export class UniswapTrade extends TradeWithSwapTransaction {
  /**
   * @property The original SwapRoute object from the Routing API
   */
  swapRoute: SwapRoute

  public constructor({ maximumSlippage, swapRoute }: UniswapTradeParams) {
    const chainId = swapRoute.trade.inputAmount.currency.chainId
    // Require chainId
    invariant(chainId, 'UniswapTrade.constructor: chainId is required')

    const inputCurrency = swapRoute.trade.inputAmount.currency
    const outpuCurrency = swapRoute.trade.outputAmount.currency

    const inputAmountBN = parseUnits(swapRoute.trade.inputAmount.toSignificant(), inputCurrency.decimals)
    const outputAmountBN = parseUnits(swapRoute.trade.outputAmount.toSignificant(), outpuCurrency.decimals)

    // Make the Uniswap SDK types compatible with the Trade types
    const inputAmount = inputCurrency.isNative
      ? CurrencyAmount.nativeCurrency(inputAmountBN.toBigInt(), chainId)
      : new TokenAmount(inputCurrency as Token, inputAmountBN.toBigInt())

    const outputAmount = outpuCurrency.isNative
      ? CurrencyAmount.nativeCurrency(outputAmountBN.toBigInt(), chainId)
      : new TokenAmount(outpuCurrency as Token, outputAmountBN.toBigInt())

    const executionPrice = new Price({
      baseCurrency: swapRoute.trade.executionPrice.baseCurrency,
      quoteCurrency: swapRoute.trade.executionPrice.quoteCurrency,
      denominator: swapRoute.trade.executionPrice.denominator,
      numerator: swapRoute.trade.executionPrice.numerator,
    })

    const priceImpact = new Percent(swapRoute.trade.priceImpact.numerator, swapRoute.trade.priceImpact.denominator)

    // Calculate the total fee percentage as basis point by summing all v3 and v2 pools from the AutoRouter routes
    // Then, divide by 100 because Uniswap uses hundredths of basis points
    const fee =
      swapRoute.trade.swaps.reduce((acc, { route: { pools } }) => {
        for (let i = 0; i < pools.length; i++) {
          const nextPool = pools[i]
          acc = acc + (nextPool instanceof UniswapV2Pair ? 3000 : nextPool.fee) // default V2 fee is 0.3% while v3 can be 0.01% to 1%
        }
        return acc
      }, 0) / 100

    super({
      details: undefined,
      type: swapRoute.trade.tradeType,
      inputAmount,
      outputAmount,
      maximumSlippage,
      platform: RoutablePlatform.UNISWAP,
      chainId,
      executionPrice,
      priceImpact,
      fee: new Percent(JSBI.BigInt(fee), '10000'),
      // Uniswap V3 Router v2 address
      approveAddress: '0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45',
      estimatedGas: swapRoute.estimatedGasUsed,
    })
    this.swapRoute = swapRoute
  }

  static async getQuote(
    { amount, quoteCurrency, tradeType, recipient, maximumSlippage }: UniswapTradeGetQuoteParams,
    provider?: BaseProvider
  ): Promise<UniswapTrade | null> {
    const chainId = tryGetChainId(amount, quoteCurrency)
    invariant(chainId, 'UniswapV3Trade.getQuote: chainId is required')

    // Defaults
    recipient = recipient || AddressZero
    maximumSlippage = maximumSlippage || defaultMaximumSlippage
    provider = provider || getProvider(chainId)

    // Must match the currencies provided
    invariant(
      (await provider.getNetwork()).chainId == chainId,
      `UniswapTrade.getQuote: currencies chainId does not match provider's chainId`
    )

    const alphaRouter = new AlphaRouter({ chainId: chainId as number, provider })

    // Map the current currencies to compatible types from the Uniswap SDK
    const amountV3 = UniswapCurrencyAmount.fromRawAmount(
      Currency.isNative(amount.currency)
        ? getUniswapNativeCurrency(chainId)
        : new UniswapToken(
            chainId,
            amount.currency.address as string,
            amount.currency.decimals,
            amount.currency.symbol,
            amount.currency.name
          ),
      amount.raw
    )

    const quoteCurrencyV3 = Currency.isNative(quoteCurrency)
      ? getUniswapNativeCurrency(chainId)
      : new UniswapToken(
          chainId,
          quoteCurrency.address as string,
          quoteCurrency.decimals,
          quoteCurrency.symbol,
          quoteCurrency.name
        )

    debugUniswapTradeGetQuote({
      amountV3,
      quoteCurrencyV3,
      tradeType,
      recipient,
      maximumSlippage,
      alphaRouter,
    })

    const routeResponse = await alphaRouter.route(
      amountV3,
      quoteCurrencyV3,
      tradeType,
      {
        recipient,
        slippageTolerance: new UniswapPercent(maximumSlippage.numerator, maximumSlippage.denominator),
        deadline: dayjs().add(30, 'm').unix(),
      },
      {
        protocols: [Protocol.V2, Protocol.V3],
      }
    )

    // Debug
    debugUniswapTradeGetQuote(routeResponse)

    console.log('routeResponseGAs', routeResponse?.estimatedGasUsed)

    if (routeResponse) {
      return new UniswapTrade({ maximumSlippage, swapRoute: routeResponse })
    }

    return null
  }

  public minimumAmountOut(): CurrencyAmount {
    if (this.tradeType === TradeType.EXACT_OUTPUT) {
      return this.outputAmount
    } else {
      const slippageAdjustedAmountOut = new Fraction(ONE)
        .add(this.maximumSlippage)
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
        .add(this.maximumSlippage)
        .multiply(this.inputAmount.raw).quotient
      return this.inputAmount instanceof TokenAmount
        ? new TokenAmount(this.inputAmount.token, slippageAdjustedAmountIn)
        : CurrencyAmount.nativeCurrency(slippageAdjustedAmountIn, this.chainId)
    }
  }

  public async swapTransaction(options: TradeOptions): Promise<UnsignedTransaction> {
    const callData = encodeRecipient(this.tradeType, options.recipient, this.swapRoute.methodParameters?.calldata)

    return {
      value: this.swapRoute.methodParameters?.value
        ? BigNumber.from(this.swapRoute.methodParameters?.value)
        : undefined,
      data: callData,
      to: this.approveAddress,
    }
  }
}
