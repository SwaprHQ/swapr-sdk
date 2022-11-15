import { Interface } from '@ethersproject/abi'
import { AddressZero } from '@ethersproject/constants'
import { BaseProvider } from '@ethersproject/providers'
import { parseUnits } from '@ethersproject/units'

import debug from 'debug'
import { BigNumber, Contract, UnsignedTransaction } from 'ethers'

import fetch from 'node-fetch'
import invariant from 'tiny-invariant'

import { MULTICALL2_ABI } from '../../../abis'

import { MULTICALL2_ADDRESS, ONE, TradeType } from '../../../constants'
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
import { routerAddress } from './contracts'

export interface VelodromeQuoteTypes {
  amount: CurrencyAmount
  quoteCurrency: Currency
  tradeType: TradeType
  maximumSlippage?: Percent
  recipient?: string
}
interface VelodromAssetApi {
  price: number
  address: string
  name: string
  symbol: string
  decimals: number
  logoURI: string
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
      fee: new Percent('2', '10000000000'),
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

    // const { amountOut, stable } = await getVelodromeRoutes({
    //   amount,
    //   currencyIn: wrappedCurrencyIn.address,
    //   currencyOut: wrappedCurrencyOut.address,
    //   chainId,
    // })
    // console.log('amountOut', amountOut.toString())

    //handle if quote cant be directly fetched through router ie quoteSwap function

    try {
      // if (!provider || chainId) return null

      // some path logic. Have a base asset (FTM) swap from start asset to FTM, swap from FTM back to out asset. Don't know.
      const routeAssetsResponse = await fetch('https://api.velodrome.finance/api/v1/routeAssets')

      if (!routeAssetsResponse.ok) throw new Error('response not ok')
      const routeAssets = (await routeAssetsResponse.json()).data as VelodromAssetApi[]
      console.log('routeasset', routeAssets)
      const fromAsset = wrappedCurrencyIn
      const toAsset = wrappedCurrencyOut
      const fromAmount = amount.raw.toString()

      const sendFromAmount = toHex(amount)
      console.log('sendFromAmount', sendFromAmount)
      console.log('fromAmoutn', fromAmount)

      if (!fromAsset || !toAsset || !fromAmount || !fromAsset.address || !toAsset.address || fromAmount === '') {
        return null
      }

      let addy0 = fromAsset.address
      let addy1 = toAsset.address
      console.log('addy0', addy0)
      console.log('add1', addy1)

      const includesRouteAddress = routeAssets.filter((asset) => {
        return asset.address.toLowerCase() == addy0.toLowerCase() || asset.address.toLowerCase() == addy1.toLowerCase()
      })

      let amountOuts: any[] = []
      console.log('includes route asset', includesRouteAddress)
      if (includesRouteAddress.length === 0) {
        console.log('passes')
        amountOuts = routeAssets
          .map((routeAsset) => {
            return [
              {
                routes: [
                  {
                    from: addy0,
                    to: routeAsset.address,
                    stable: true,
                  },
                  {
                    from: routeAsset.address,
                    to: addy1,
                    stable: true,
                  },
                ],
                routeAsset: routeAsset,
              },
              {
                routes: [
                  {
                    from: addy0,
                    to: routeAsset.address,
                    stable: false,
                  },
                  {
                    from: routeAsset.address,
                    to: addy1,
                    stable: false,
                  },
                ],
                routeAsset: routeAsset,
              },
              {
                routes: [
                  {
                    from: addy0,
                    to: routeAsset.address,
                    stable: true,
                  },
                  {
                    from: routeAsset.address,
                    to: addy1,
                    stable: false,
                  },
                ],
                routeAsset: routeAsset,
              },
              {
                routes: [
                  {
                    from: addy0,
                    to: routeAsset.address,
                    stable: false,
                  },
                  {
                    from: routeAsset.address,
                    to: addy1,
                    stable: true,
                  },
                ],
                routeAsset: routeAsset,
              },
            ]
          })
          .flat()
      }

      amountOuts.push({
        routes: [{ from: addy0, to: addy1, stable: true }],
        routeAsset: null,
      })

      amountOuts.push({
        routes: [{ from: addy0, to: addy1, stable: false }],
        routeAsset: null,
      })

      const velodromRouterInterface = new Interface(ROUTER_ABI)

      console.log('multiCall', amountOuts)
      const multicall2CallData = amountOuts.map((route) => {
        return {
          target: routerAddress,
          callData: velodromRouterInterface.encodeFunctionData('getAmountsOut', [sendFromAmount, route.routes]),
        }
      })
      console.log('multicallData', multicall2CallData)

      const multicallContract = new Contract(MULTICALL2_ADDRESS[chainId], MULTICALL2_ABI, provider)
      const receiveAmounts = await multicallContract.callStatic.tryAggregate(false, multicall2CallData)
      console.log('recieveAmoutns', receiveAmounts)

      for (let i = 0; i < receiveAmounts.length; i++) {
        if (receiveAmounts[i].success) {
          const { amounts } = velodromRouterInterface.decodeFunctionResult(
            'getAmountsOut',
            receiveAmounts[i].returnData
          )
          console.log('amounts', amounts)
          amountOuts[i].receiveAmounts = amounts
          amountOuts[i].finalValue = amounts[amounts.length - 1]
        }
      }

      console.log('amountsOutFormatted', amountOuts)

      const bestAmountOut = amountOuts
        .filter((ret) => {
          return ret != null
        })
        .reduce((best, current) => {
          if (!best || !current.finalValue || !best.finalValue) {
            return current
          }

          return best.finalValue.gt(current.finalValue) ? best : current
        }, 0)

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
        console.log('ttotalRatio', totalRatio)
      }
      console.log('totalRatio', totalRatio.toString())

      const priceImpact = new Percent(parseUnits('1').toString(), totalRatio.toString())

      console.log('rpiceimpact', priceImpact.toString())
      console.log('other', priceImpact)
      const returnValue = {
        inputs: {
          fromAmount: fromAmount,
          fromAsset: fromAsset,
          toAsset: toAsset,
        },
        output: bestAmountOut,
        priceImpact: priceImpact,
      }

      const wrappedQuote = wrappedCurrency(quoteCurrency, chainId)
      const currencyAmountIn =
        tradeType === TradeType.EXACT_INPUT ? amount : new TokenAmount(wrappedQuote, bestAmountOut.finalValue)
      const currencyAmountOut =
        tradeType === TradeType.EXACT_INPUT ? new TokenAmount(wrappedQuote, bestAmountOut.finalValue) : amount
      console.log('return Value', returnValue)
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

    // console.log('WORKIN?', amountOut)
    // // const parsedAmount = parseUnits(amountOut.toString(), quoteCurrency.decimals).toString()
    // const parsedAmount = amountOut.toString()
    // console.log('parsedAmount', parsedAmount)

    // console.log('currencyAmountIn', currencyAmountIn)
    // console.log('currencyOut', currencyAmountOut)

    // return null
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
