import { Interface } from '@ethersproject/abi'
import { AddressZero } from '@ethersproject/constants'
import { BaseProvider } from '@ethersproject/providers'
import { parseUnits } from '@ethersproject/units'

import debug from 'debug'
import { Contract, UnsignedTransaction } from 'ethers'

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
import { getVelodromeRoutes, routerAddress } from './contracts'

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
  public constructor({ maximumSlippage, currencyAmountIn, currencyAmountOut, tradeType, chainId }: any) {
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
      priceImpact: new Percent('0', '10000000000'),
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

    // Must match the currencies provided
    invariant(
      (await provider.getNetwork()).chainId == chainId,
      `UniswapTrade.getQuote: currencies chainId does not match provider's chainId`
    )

    const currencyIn = tradeType === TradeType.EXACT_INPUT ? amount.currency : quoteCurrency
    const currencyOut = tradeType === TradeType.EXACT_INPUT ? quoteCurrency : amount.currency

    debugVelodromeGetQuote({
      amount,
      quoteCurrency,
      currencyIn,
      currencyOut,
      tradeType,
      recipient,
      maximumSlippage,
    })

    const { amountOut, stable } = await getVelodromeRoutes({
      amount,
      currencyIn: currencyIn.address,
      currencyOut: currencyOut.address,
      chainId,
    })
    console.log('amountOut', amountOut.toString())

    //handle if quote cant be directly fetched through router ie quoteSwap function

    try {
      // if (!provider || chainId) return null

      // some path logic. Have a base asset (FTM) swap from start asset to FTM, swap from FTM back to out asset. Don't know.
      const routeAssetsResponse = await fetch('https://api.velodrome.finance/api/v1/routeAssets')

      if (!routeAssetsResponse.ok) throw new Error('response not ok')
      const routeAssets = (await routeAssetsResponse.json()).data as VelodromAssetApi[]
      console.log('routeasset', routeAssets)
      const fromAsset = currencyIn
      const toAsset = currencyOut
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
        routes: [[addy0, addy1, true]],
        routeAsset: null,
      })

      amountOuts.push({
        routes: [[addy0, addy1, false]],
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
        let amountIn = bestAmountOut.receiveAmounts[i]
        // let amountOut = bestAmountOut.receiveAmounts[i + 1]

        const res = await libraryContract['getTradeDiff(uint256,address,address,bool)'](
          amountIn,
          bestAmountOut.routes[i].from,
          bestAmountOut.routes[i].to,
          bestAmountOut.routes[i].stable
        )

        const ratio = res.b.div(res.a)

        totalRatio = totalRatio.mul(ratio)
      }

      const priceImpact = parseUnits('1').sub(totalRatio).mul(100).toString()
      console.log('rpiceimpact', priceImpact.toString())
      const returnValue = {
        inputs: {
          fromAmount: fromAmount,
          fromAsset: fromAsset,
          toAsset: toAsset,
        },
        output: bestAmountOut,
        priceImpact: priceImpact,
      }
      console.log('return Value', returnValue)
      // return returnValue
    } catch (ex) {
      console.log('Non zero error', ex)
      console.error(ex)
    }

    const wrappedQuote = wrappedCurrency(quoteCurrency, chainId)
    console.log('WORKIN?', amountOut)
    // const parsedAmount = parseUnits(amountOut.toString(), quoteCurrency.decimals).toString()
    const parsedAmount = amountOut.toString()
    console.log('parsedAmount', parsedAmount)
    const currencyAmountIn = tradeType === TradeType.EXACT_INPUT ? amount : new TokenAmount(wrappedQuote, parsedAmount)
    const currencyAmountOut = tradeType === TradeType.EXACT_INPUT ? new TokenAmount(wrappedQuote, parsedAmount) : amount
    console.log('currencyAmountIn', currencyAmountIn)
    console.log('currencyOut', currencyAmountOut)
    return new VelodromeTrade({ maximumSlippage, currencyAmountIn, currencyAmountOut, tradeType, chainId, stable })

    // Debug
    debugVelodromeGetQuote(amountOut, stable)

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
  /**
   * Returns unsigned transaction for the trade
   * @returns the unsigned transaction
   */
  public async swapTransaction(options: TradeOptions): Promise<UnsignedTransaction> {
    const nativeCurrency = Currency.getNative(this.chainId)
    const etherIn = this.inputAmount.currency === nativeCurrency
    const etherOut = this.outputAmount.currency === nativeCurrency
    // the router does not support both ether in and out
    invariant(!(etherIn && etherOut), 'ETHER_IN_OUT')
    invariant(options.ttl && options.ttl > 0, 'TTL')
    invariant(this.inputAmount.currency.address && this.outputAmount.currency.address, 'No currency')

    const to: string = validateAndParseAddress(options.recipient)
    const amountIn: string = toHex(this.maximumAmountIn())
    const amountOut: string = toHex(this.minimumAmountOut())
    const route: string[][] = [[this.inputAmount.currency.address, this.outputAmount.currency.address]]
    const deadline = `0x${(Math.floor(new Date().getTime() / 1000) + options.ttl).toString(16)}`

    let methodName: string
    let args: (string | string[][])[]
    let value: string = ZERO_HEX
    switch (this.tradeType) {
      case TradeType.EXACT_INPUT:
        if (etherIn) {
          methodName = 'swapExactETHForTokens'
          // (uint amountOutMin, address[] calldata path, address to, uint deadline)
          args = [amountOut, route, to, deadline]
          value = amountIn
        } else if (etherOut) {
          methodName = 'swapExactTokensForETH'
          // (uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline)
          args = [amountIn, amountOut, route, to, deadline]
          value = ZERO_HEX
        } else {
          methodName = 'swapExactTokensForTokens'
          // (uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline)
          args = [amountIn, amountOut, route, to, deadline]
          value = ZERO_HEX
        }
        break
      case TradeType.EXACT_OUTPUT:
        if (etherIn) {
          methodName = 'swapETHForExactTokens'
          // (uint amountOut, address[] calldata path, address to, uint deadline)
          args = [amountOut, route, to, deadline]
          value = amountIn
        } else if (etherOut) {
          methodName = 'swapTokensForExactETH'
          // (uint amountOut, uint amountInMax, address[] calldata path, address to, uint deadline)
          args = [amountOut, amountIn, route, to, deadline]
          value = ZERO_HEX
        } else {
          methodName = 'swapTokensForExactTokens'
          // (uint amountOut, uint amountInMax, address[] calldata path, address to, uint deadline)
          args = [amountOut, amountIn, route, to, deadline]
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
  // /**
  //  * Returns quote for given pair when router cant find it
  //  * @returns the best trade
  //  */
  // public async quoteSwap(provider: Provider | undefined) {
  //   try {
  //     if (!provider || this.chainId) return null
  //     // some path logic. Have a base asset (FTM) swap from start asset to FTM, swap from FTM back to out asset. Don't know.
  //     const routeAssetsResponse = await fetch('https://api.velodrome.finance/api/v1/routeAssets')

  //     if (!routeAssetsResponse.ok) throw new Error('response not ok')
  //     const routeAssets = (await routeAssetsResponse.json()) as VelodromAssetApi[]
  //     console.log('routeasset', routeAssets)
  //     const fromAsset = this.inputAmount.currency
  //     const toAsset = this.outputAmount.currency
  //     const fromAmount = this.inputAmount.raw.toString()

  //     const sendFromAmount = this.inputAmount.raw

  //     if (!fromAsset || !toAsset || !fromAmount || !fromAsset.address || !toAsset.address || fromAmount === '') {
  //       return null
  //     }

  //     let addy0 = fromAsset.address
  //     let addy1 = toAsset.address

  //     const includesRouteAddress = routeAssets.filter((asset) => {
  //       return asset.address.toLowerCase() == addy0.toLowerCase() || asset.address.toLowerCase() == addy1.toLowerCase()
  //     })

  //     let amountOuts: any[] = []

  //     if (includesRouteAddress.length === 0) {
  //       amountOuts = routeAssets
  //         .map((routeAsset) => {
  //           return [
  //             {
  //               routes: [
  //                 {
  //                   from: addy0,
  //                   to: routeAsset.address,
  //                   stable: true,
  //                 },
  //                 {
  //                   from: routeAsset.address,
  //                   to: addy1,
  //                   stable: true,
  //                 },
  //               ],
  //               routeAsset: routeAsset,
  //             },
  //             {
  //               routes: [
  //                 {
  //                   from: addy0,
  //                   to: routeAsset.address,
  //                   stable: false,
  //                 },
  //                 {
  //                   from: routeAsset.address,
  //                   to: addy1,
  //                   stable: false,
  //                 },
  //               ],
  //               routeAsset: routeAsset,
  //             },
  //             {
  //               routes: [
  //                 {
  //                   from: addy0,
  //                   to: routeAsset.address,
  //                   stable: true,
  //                 },
  //                 {
  //                   from: routeAsset.address,
  //                   to: addy1,
  //                   stable: false,
  //                 },
  //               ],
  //               routeAsset: routeAsset,
  //             },
  //             {
  //               routes: [
  //                 {
  //                   from: addy0,
  //                   to: routeAsset.address,
  //                   stable: false,
  //                 },
  //                 {
  //                   from: routeAsset.address,
  //                   to: addy1,
  //                   stable: true,
  //                 },
  //               ],
  //               routeAsset: routeAsset,
  //             },
  //           ]
  //         })
  //         .flat()
  //     }

  //     amountOuts.push({
  //       routes: [
  //         {
  //           from: addy0,
  //           to: addy1,
  //           stable: true,
  //         },
  //       ],
  //       routeAsset: null,
  //     })

  //     amountOuts.push({
  //       routes: [
  //         {
  //           from: addy0,
  //           to: addy1,
  //           stable: false,
  //         },
  //       ],
  //       routeAsset: null,
  //     })

  //     const multicallContract = new Contract(MULTICALL2_ADDRESS[this.chainId], MULTICALL2_ABI, provider)

  //     const velodromRouterInterface = new Interface(ROUTER_ABI)

  //     const milticall2CallData = amountOuts.map((route) => {
  //       return {
  //         target: routerAddress,
  //         callData: velodromRouterInterface.encodeFunctionData('getAmountsOut', [sendFromAmount, route.routes]),
  //       }
  //     })
  //     // {        velodromRouterInterface.encodeFunctionData('getAmountsOut', parameters)}

  //     const receiveAmounts = await multicallContract.callStatic.tryAggregate(false, milticall2CallData)
  //     console.log('recieveAmoutns', receiveAmounts)

  //     for (let i = 0; i < receiveAmounts.length; i++) {
  //       amountOuts[i].receiveAmounts = receiveAmounts[i]
  //       amountOuts[i].finalValue = parseUnits(receiveAmounts[i][receiveAmounts[i].length - 1], toAsset.decimals)
  //         .div(10 ** toAsset.decimals)
  //         .toString()
  //     }
  //     console.log('amountsOutFormatted', amountOuts)

  //     const bestAmountOut = amountOuts
  //       .filter((ret) => {
  //         return ret != null
  //       })
  //       .reduce((best, current) => {
  //         if (!best) {
  //           return current
  //         }
  //         return parseUnits(best.finalValue, toAsset.decimals).gt(current.finalValue) ? best : current
  //       }, 0)

  //     if (!bestAmountOut) {
  //       return null
  //     }

  //     const libraryContract = new Contract('0x0f68551237a7effe35600524c0dd4989bf8208e9', LIBRARY_ABI)
  //     let totalRatio = 1

  //     for (let i = 0; i < bestAmountOut.routes.length; i++) {
  //       let amountIn = bestAmountOut.receiveAmounts[i]
  //       // let amountOut = bestAmountOut.receiveAmounts[i + 1]

  //       const res = await libraryContract.getTradeDiff(
  //         amountIn,
  //         bestAmountOut.routes[i].from,
  //         bestAmountOut.routes[i].to,
  //         bestAmountOut.routes[i].stable
  //       )

  //       const ratio = parseUnits(res.b, toAsset.decimals).div(res.a)
  //       totalRatio = parseUnits(totalRatio.toString(), toAsset.decimals).mul(ratio).toNumber()
  //     }

  //     const priceImpact = parseUnits('1', toAsset.decimals).sub(totalRatio).mul(100).toString()

  //     const returnValue = {
  //       inputs: {
  //         fromAmount: fromAmount,
  //         fromAsset: fromAsset,
  //         toAsset: toAsset,
  //       },
  //       output: bestAmountOut,
  //       priceImpact: priceImpact,
  //     }
  //     console.log('return Value', returnValue)
  //     return returnValue
  //   } catch (ex) {
  //     console.error(ex)
  //   }
  // }
}
