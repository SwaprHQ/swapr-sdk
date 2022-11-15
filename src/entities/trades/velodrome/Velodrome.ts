import { AddressZero } from '@ethersproject/constants'
import { BaseProvider } from '@ethersproject/providers'
import { parseUnits } from '@ethersproject/units'

import debug from 'debug'
import { BigNumber, Contract, UnsignedTransaction } from 'ethers'

import invariant from 'tiny-invariant'

import { ONE, TradeType } from '../../../constants'
import { validateAndParseAddress } from '../../../utils'
import { Currency } from '../../currency'
import { CurrencyAmount, Fraction, Percent, Price, TokenAmount } from '../../fractions'

import { maximumSlippage as defaultMaximumSlippage } from '../constants'
import { Trade } from '../interfaces/trade'
import { TradeOptions } from '../interfaces/trade-options'
import { RoutablePlatform } from '../routable-platform'
import { toHex, ZERO_HEX } from '../uniswap-v2/utilts'
import { getProvider, tryGetChainId, wrappedCurrency } from '../utils'
import { LIBRARY_ABI, ROUTER_ABI } from './abi'
import { getBestRoute, routerAddress } from './contracts'

export interface VelodromeQuoteTypes {
  amount: CurrencyAmount
  quoteCurrency: Currency
  tradeType: TradeType
  maximumSlippage?: Percent
  recipient?: string
}

// Debuging logger. See documentation to enable logging.
const debugVelodromeGetQuote = debug('ecoRouter:velodrome:getQuote')

/**
 * UniswapTrade uses the AutoRouter to find best trade across V2 and V3 pools
 */
export class VelodromeTrade extends Trade {
  public constructor({
    maximumSlippage,
    currencyAmountIn,
    currencyAmountOut,
    tradeType,
    chainId,
    routes,
    priceImpact,
  }: any) {
    super({
      details: undefined,
      type: tradeType,
      inputAmount: currencyAmountIn,
      outputAmount: currencyAmountOut,
      maximumSlippage,
      platform: RoutablePlatform.VELODROME,
      chainId,
      executionPrice: new Price({
        baseCurrency: currencyAmountIn.currency,
        quoteCurrency: currencyAmountOut.currency,
        denominator: currencyAmountIn.raw,
        numerator: currencyAmountOut.raw,
      }),
      routes,
      priceImpact: priceImpact,
      fee: new Percent('2', '10000'),
      // Uniswap V3 Router v2 address
      approveAddress: routerAddress,
    })
  }

  static async getQuote(
    { amount, quoteCurrency, tradeType, maximumSlippage, recipient }: VelodromeQuoteTypes,
    provider?: BaseProvider
  ): Promise<VelodromeTrade | null> {
    console.log('getQuoteVelodrome')
    const chainId = tryGetChainId(amount, quoteCurrency)
    invariant(chainId, 'VelodromeQuote.getQuote: chainId is required')

    // Defaults
    recipient = recipient || AddressZero
    maximumSlippage = maximumSlippage || defaultMaximumSlippage

    provider = provider || getProvider(chainId)
    console.log('provider', provider)

    // Must match the currencies provided
    invariant(
      (await provider.getNetwork()).chainId == chainId,
      `UniswapTrade.getQuote: currencies chainId does not match provider's chainId`
    )

    const currencyIn = tradeType === TradeType.EXACT_INPUT ? amount.currency : quoteCurrency
    const currencyOut = tradeType === TradeType.EXACT_INPUT ? quoteCurrency : amount.currency

    const wrappedCurrencyIn = wrappedCurrency(currencyIn, chainId)
    const wrappedCurrencyOut = wrappedCurrency(currencyOut, chainId)

    debugVelodromeGetQuote({
      amount,
      quoteCurrency,
      currencyIn,
      currencyOut,
      tradeType,
      recipient,
      maximumSlippage,
    })

    try {
      const bestAmountOut = await getBestRoute({
        currencyIn: wrappedCurrencyIn,
        currencyOut: wrappedCurrencyOut,
        amount,
        provider,
        chainId,
      })
      console.log('out of loop')
      if (!bestAmountOut) {
        return null
      }
      console.log('got the best amoutn?', bestAmountOut.toString())

      const libraryContract = new Contract('0xfb1Fc21D2937bF5a49D480189e7FEd42bF8282aD', LIBRARY_ABI, provider)
      let totalRatio = parseUnits('1')
      console.log('bestAmountOut', bestAmountOut)

      for (let i = 0; i < bestAmountOut.routes.length; i++) {
        console.log('Iterator', bestAmountOut.routes[i])
        let amountIn = bestAmountOut.receiveAmounts[i]
        console.log('AmountInItergarot', amountIn.toString())
        // let amountOut = bestAmountOut.receiveAmounts[i + 1]
        console.log('libraryContract', libraryContract['getTradeDiff(uint256,address,address,bool)'])
        const res = await libraryContract['getTradeDiff(uint256,address,address,bool)'](
          amountIn,
          bestAmountOut.routes[i].from,
          bestAmountOut.routes[i].to,
          bestAmountOut.routes[i].stable
        )
        console.log('res', res)
        console.log('resa', res.a.toString())
        console.log('res.b', res.b as BigNumber)

        const ratio = res.a.div(res.b)
        console.log('ratio', ratio.toString())

        totalRatio = totalRatio.mul(ratio)
        console.log('ttotalRatio', totalRatio.toString())
      }
      console.log('totalRatio', totalRatio.toString())

      const priceImpact = new Percent(parseUnits('1').sub(totalRatio).toString())

      console.log('rpiceimpact', priceImpact.toString())
      console.log('other', priceImpact)

      const wrappedQuote = wrappedCurrency(quoteCurrency, chainId)
      const currencyAmountIn =
        tradeType === TradeType.EXACT_INPUT
          ? amount
          : new TokenAmount(wrappedQuote, bestAmountOut.finalValue.toString())
      const currencyAmountOut =
        tradeType === TradeType.EXACT_INPUT
          ? new TokenAmount(wrappedQuote, bestAmountOut.finalValue.toString())
          : amount

      return new VelodromeTrade({
        maximumSlippage,
        currencyAmountIn,
        currencyAmountOut,
        tradeType,
        chainId,
        routes: bestAmountOut.routes,
        priceImpact,
      })
      // return returnValue
    } catch (ex) {
      console.log('Non zero error', ex)
      console.error(ex)
      return null
    }
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
  /**
   * Returns unsigned transaction for the trade
   * @returns the unsigned transaction
   */
  public async swapTransaction(options: TradeOptions): Promise<UnsignedTransaction> {
    const nativeCurrency = Currency.getNative(this.chainId)
    const etherIn = this.inputAmount.currency === nativeCurrency
    const etherOut = this.outputAmount.currency === nativeCurrency
    // the router does not support both ether in and out
    invariant(this.routes, 'No Avaliable routes')
    invariant(!(etherIn && etherOut), 'ETHER_IN_OUT')
    invariant(options.ttl && options.ttl > 0, 'TTL')
    invariant(this.inputAmount.currency.address && this.outputAmount.currency.address, 'No currency')

    const to: string = validateAndParseAddress(options.recipient)
    const amountIn: string = toHex(this.maximumAmountIn())
    const amountOut: string = toHex(this.minimumAmountOut())

    const deadline = `0x${(Math.floor(new Date().getTime() / 1000) + options.ttl).toString(16)}`

    let methodName: string
    let args: any
    let value: string = ZERO_HEX
    switch (this.tradeType) {
      case TradeType.EXACT_INPUT:
        if (etherIn) {
          methodName = 'swapExactETHForTokens'
          // (uint amountOutMin, address[] calldata path, address to, uint deadline)
          args = [amountOut, this.routes, to, deadline]
          value = amountIn
        } else if (etherOut) {
          methodName = 'swapExactTokensForETH'
          // (uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline)
          args = [amountIn, amountOut, this.routes, to, deadline]
          value = ZERO_HEX
        } else {
          methodName = 'swapExactTokensForTokens'
          // (uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline)
          args = [amountIn, amountOut, this.routes, to, deadline]
          value = ZERO_HEX
        }
        break
      case TradeType.EXACT_OUTPUT:
        if (etherIn) {
          methodName = 'swapETHForExactTokens'
          // (uint amountOut, address[] calldata path, address to, uint deadline)
          args = [amountOut, this.routes, to, deadline]
          value = amountIn
        } else if (etherOut) {
          methodName = 'swapTokensForExactETH'
          // (uint amountOut, uint amountInMax, address[] calldata path, address to, uint deadline)
          args = [amountOut, amountIn, this.routes, to, deadline]
          value = ZERO_HEX
        } else {
          methodName = 'swapTokensForExactTokens'
          // (uint amountOut, uint amountInMax, address[] calldata path, address to, uint deadline)
          args = [amountOut, amountIn, this.routes, to, deadline]
          value = ZERO_HEX
        }
        break
    }
    console.log('methodName', methodName)
    console.log('args', args)
    console.log('value', value)
    console.log('to', to)

    return new Contract(routerAddress, ROUTER_ABI).populateTransaction[methodName](...args, { value })
  }
}
