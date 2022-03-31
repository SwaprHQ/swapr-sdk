import type { UnsignedTransaction } from '@ethersproject/transactions'
import invariant from 'tiny-invariant'

import { ONE, TradeType, ZERO } from '../../../constants'
import { sortedInsert, validateAndParseAddress } from '../../../utils'
import { Currency } from '../../currency'
import { CurrencyAmount } from '../../fractions/currencyAmount'
import { Fraction } from '../../fractions/fraction'
import { Percent } from '../../fractions/percent'
import { Price } from '../../fractions/price'
import { TokenAmount } from '../../fractions/tokenAmount'
import { Pair } from '../../pair'
import { Route } from '../../route'
import { currencyEquals, Token } from '../../token'
import { TradeWithSwapTransaction } from '../interfaces/trade'
import ROUTER_ABI from '../../../abis/router.json'
import { TradeOptions } from '../interfaces/trade-options'
import { Contract } from '@ethersproject/contracts'
import { UniswapV2RoutablePlatform } from '../routable-platform/uniswap-v2-routable-platform'
import { wrappedAmount, wrappedCurrency } from '../utils'

import {
  UniswapV2TradeBestTradeExactInParams,
  UniswapV2TradeBestTradeExactOutParams,
  UniswapV2TradeComputeTradesExactInParams,
  UniswapV2TradeComputeTradesExactOutParams,
} from './types'
import { computePriceImpact, inputOutputComparator, toHex, ZERO_HEX } from './utilts'
import { getAllCommonPairs } from './contracts'

/**
 * Represents a trade executed against a list of pairs.
 * Does not account for slippage, i.e. trades that front run this trade and move the price.
 */
export class UniswapV2Trade extends TradeWithSwapTransaction {
  public constructor(route: Route, amount: CurrencyAmount, maximumSlippage: Percent, tradeType: TradeType) {
    invariant(maximumSlippage.greaterThan('0'), 'MAXIMUM_SLIPPAGE')
    const amounts: TokenAmount[] = new Array(route.path.length)
    const nextPairs: Pair[] = new Array(route.pairs.length)
    if (tradeType === TradeType.EXACT_INPUT) {
      invariant(currencyEquals(amount.currency, route.input), 'INPUT')
      amounts[0] = wrappedAmount(amount, route.chainId)
      for (let i = 0; i < route.path.length - 1; i++) {
        const pair = route.pairs[i]
        const [outputAmount, nextPair] = pair.getOutputAmount(amounts[i])
        amounts[i + 1] = outputAmount
        nextPairs[i] = nextPair
      }
    } else {
      invariant(currencyEquals(amount.currency, route.output), 'OUTPUT')
      amounts[amounts.length - 1] = wrappedAmount(amount, route.chainId)
      for (let i = route.path.length - 1; i > 0; i--) {
        const pair = route.pairs[i - 1]
        const [inputAmount, nextPair] = pair.getInputAmount(amounts[i])
        amounts[i - 1] = inputAmount
        nextPairs[i - 1] = nextPair
      }
    }
    const chainId = route.chainId
    const inputAmount =
      tradeType === TradeType.EXACT_INPUT
        ? amount
        : Currency.isNative(route.input)
        ? CurrencyAmount.nativeCurrency(amounts[0].raw, chainId)
        : amounts[0]
    const outputAmount =
      tradeType === TradeType.EXACT_OUTPUT
        ? amount
        : Currency.isNative(route.output)
        ? CurrencyAmount.nativeCurrency(amounts[amounts.length - 1].raw, chainId)
        : amounts[amounts.length - 1]
    super({
      details: route,
      type: tradeType,
      inputAmount,
      outputAmount,
      executionPrice: new Price({
        baseCurrency: inputAmount.currency,
        quoteCurrency: outputAmount.currency,
        denominator: inputAmount.raw,
        numerator: outputAmount.raw,
      }),
      maximumSlippage,
      priceImpact: computePriceImpact(route.midPrice, inputAmount, outputAmount),
      chainId: route.chainId,
      platform: route.pairs[0].platform,
    })
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
      const slippageAdjustedAmountIn = new Fraction(ONE).add(this.maximumSlippage).multiply(this.inputAmount.raw)
        .quotient
      return this.inputAmount instanceof TokenAmount
        ? new TokenAmount(this.inputAmount.token, slippageAdjustedAmountIn)
        : CurrencyAmount.nativeCurrency(slippageAdjustedAmountIn, this.chainId)
    }
  }

  /**
   * Computes the best trade for the given input and output amounts.
   * @param {UniswapV2TradeBestTradeExactInParams} params the pairs to consider in finding the best trade
   */
  public static async bestTradeExactIn({
    currencyAmountIn,
    currencyOut,
    maximumSlippage,
    maxHops: { maxNumResults = 3, maxHops = 3 } = {},
    platform,
  }: UniswapV2TradeBestTradeExactInParams): Promise<UniswapV2Trade | undefined> {
    let bestTrade: UniswapV2Trade | undefined
    try {
      // Fetch the commons pairs between A and B
      const commonPairsBetweenCurrenyInAndOut = await getAllCommonPairs(
        currencyAmountIn.currency,
        currencyOut,
        platform
      )
      // Compare and sort all routes from A to B
      const tradeRoutes = UniswapV2Trade.computeTradeExactIn({
        currencyAmountIn,
        currencyOut,
        maximumSlippage,
        pairs: commonPairsBetweenCurrenyInAndOut,
        maxHops: { maxNumResults, maxHops },
      })

      bestTrade = tradeRoutes.at(0)
    } catch (error) {
      // tslint:disable-next-line:no-console
    }

    return bestTrade
  }

  /**
   * similar to the `bestTradeExactIn` method, but instead targets a fixed output amount
   * given a list of pairs, and a fixed amount out, returns the top `maxNumResults` trades that go from an input token
   * to an output token amount, making at most `maxHops` hops
   * note this does not consider aggregation, as routes are linear. it's possible a better route exists by splitting
   * the amount in among multiple routes.
   * @param {UniswapV2TradeBestTradeExactOutParams} params the parameters to use
   */
  public static async bestTradeExactOut({
    currencyIn,
    currencyAmountOut,
    maximumSlippage,
    maxHops: { maxNumResults = 3, maxHops = 3 } = {},
    platform,
  }: UniswapV2TradeBestTradeExactOutParams): Promise<UniswapV2Trade | undefined> {
    let bestTrade: UniswapV2Trade | undefined
    try {
      // Fetch the commons pairs between A and B
      const commonPairsBetweenCurrenyInAndOut = await getAllCommonPairs(
        currencyIn,
        currencyAmountOut.currency,
        platform
      )
      // Compare and sort all routes from A to B
      const tradeRoutes = UniswapV2Trade.computeTradeExactOut({
        currencyAmountOut,
        currencyIn,
        maximumSlippage,
        pairs: commonPairsBetweenCurrenyInAndOut,
        maxHops: { maxNumResults, maxHops },
      })
      // Return the best route
      bestTrade = tradeRoutes.at(0)
    } catch (error) {
      // tslint:disable-next-line:no-console
    }

    return bestTrade
  }

  /**
   * Given a list of pairs, and a fixed amount in, returns the top `maxNumResults` trades that go from an input token
   * amount to an output token, making at most `maxHops` hops.
   * Note this does not consider aggregation, as routes are linear. It's possible a better route exists by splitting
   * the amount in among multiple routes.
   * @param {UniswapV2TradeComputeTradesExactInParams} param0
   * @returns list of trades that go from an input token amount to an output token, making at most `maxHops` hops
   */
  public static computeTradeExactIn({
    currencyAmountIn,
    currencyOut,
    maximumSlippage,
    pairs,
    maxHops: { maxNumResults = 3, maxHops = 3 } = {},
    // used in recursion.
    currentPairs = [],
    originalAmountIn = currencyAmountIn,
    bestTrades = [],
  }: UniswapV2TradeComputeTradesExactInParams): UniswapV2Trade[] {
    invariant(maximumSlippage.greaterThan('0'), 'MAXIMUM_SLIPPAGE')
    invariant(pairs && pairs.length > 0, 'PAIRS')
    invariant(maxHops > 0, 'MAX_HOPS')
    invariant(originalAmountIn === currencyAmountIn || currentPairs.length > 0, 'INVALID_RECURSION')

    // Validate chain ID
    const chainId = (currencyAmountIn.currency as Token).chainId ?? (currencyOut as Token).chainId
    invariant(chainId !== undefined, 'CHAIN_ID')

    const amountIn = wrappedAmount(currencyAmountIn, chainId)
    const tokenOut = wrappedCurrency(currencyOut, chainId)

    // Find connecting pairs from token in to token out
    for (let i = 0; i < pairs.length; i++) {
      const pair = pairs[i]
      // pair irrelevant
      if (!pair.token0.equals(amountIn.token) && !pair.token1.equals(amountIn.token)) continue
      if (pair.reserve0.equalTo(ZERO) || pair.reserve1.equalTo(ZERO)) continue

      let amountOut: TokenAmount
      try {
        amountOut = pair.getOutputAmount(amountIn)[0]
      } catch (error) {
        // input too low
        if (error.isInsufficientInputAmountError) {
          continue
        }
        throw error
      }
      // we have arrived at the output token, so this is the final trade of one of the paths
      if (amountOut.token.equals(tokenOut)) {
        sortedInsert(
          bestTrades,
          new UniswapV2Trade(
            new Route([...currentPairs, pair], originalAmountIn.currency, currencyOut),
            originalAmountIn,
            maximumSlippage,
            TradeType.EXACT_INPUT
          ),
          maxNumResults,
          UniswapV2Trade.tradeComparator
        )
      } else if (maxHops > 1 && pairs.length > 1) {
        const pairsExcludingThisPair = pairs.slice(0, i).concat(pairs.slice(i + 1, pairs.length))

        // otherwise, consider all the other paths that lead from this token as long as we have not exceeded maxHops
        UniswapV2Trade.computeTradeExactIn({
          currencyAmountIn: amountOut,
          currencyOut,
          maximumSlippage,
          pairs: pairsExcludingThisPair,
          maxHops: {
            maxNumResults,
            maxHops: maxHops - 1,
          },
          currentPairs: [...currentPairs, pair],
          originalAmountIn,
          bestTrades,
        })
      }
    }

    return bestTrades
  }

  /**
   * similar to the above method but instead targets a fixed output amount
   * given a list of pairs, and a fixed amount out, returns the top `maxNumResults` trades that go from an input token
   * to an output token amount, making at most `maxHops` hops
   * note this does not consider aggregation, as routes are linear. it's possible a better route exists by splitting
   * the amount in among multiple routes.
   * @param {UniswapV2TradeBestTradeExactOutParams} params the parameters to use
   * @returns list of trades that go from an input token to an output token amount, making at most `maxHops` hops
   */
  public static computeTradeExactOut({
    currencyAmountOut,
    currencyIn,
    maximumSlippage,
    pairs,
    maxHops: { maxNumResults = 3, maxHops = 3 } = {},
    // used in recursion.
    currentPairs = [],
    originalAmountOut = currencyAmountOut,
    bestTrades = [],
  }: UniswapV2TradeComputeTradesExactOutParams): UniswapV2Trade[] {
    // Validate params
    invariant(maximumSlippage.greaterThan('0'), 'MAXIMUM_SLIPPAGE')
    invariant(pairs && pairs.length > 0, 'PAIRS')
    invariant(maxHops > 0, 'MAX_HOPS')
    invariant(originalAmountOut === currencyAmountOut || currentPairs.length > 0, 'INVALID_RECURSION')

    // Validate chain ID
    const chainId = (currencyAmountOut.currency as Token).chainId ?? (currencyIn as Token).chainId
    invariant(chainId !== undefined, 'CHAIN_ID')

    const amountOut = wrappedAmount(currencyAmountOut, chainId)
    const tokenIn = wrappedCurrency(currencyIn, chainId)

    // Find connecting pairs from token in to token out
    for (let i = 0; i < pairs.length; i++) {
      const pair = pairs[i]
      // pair irrelevant
      if (!pair.token0.equals(amountOut.token) && !pair.token1.equals(amountOut.token)) continue
      if (pair.reserve0.equalTo(ZERO) || pair.reserve1.equalTo(ZERO)) continue

      let amountIn: TokenAmount
      try {
        amountIn = pair.getInputAmount(amountOut)[0]
      } catch (error) {
        // not enough liquidity in this pair
        if (error.isInsufficientReservesError) {
          continue
        }
        throw error
      }
      // we have arrived at the input token, so this is the first trade of one of the paths
      if (amountIn.token.equals(tokenIn)) {
        sortedInsert(
          bestTrades,
          new UniswapV2Trade(
            new Route([pair, ...currentPairs], currencyIn, originalAmountOut.currency),
            originalAmountOut,
            maximumSlippage,
            TradeType.EXACT_OUTPUT
          ),
          maxNumResults,
          UniswapV2Trade.tradeComparator
        )
      } else if (maxHops > 1 && pairs.length > 1) {
        const pairsExcludingThisPair = pairs.slice(0, i).concat(pairs.slice(i + 1, pairs.length))

        // otherwise, consider all the other paths that arrive at this token as long as we have not exceeded maxHops
        UniswapV2Trade.computeTradeExactOut({
          currencyIn,
          currencyAmountOut: amountIn,
          maximumSlippage,
          pairs: pairsExcludingThisPair,
          maxHops: {
            maxNumResults,
            maxHops: maxHops - 1,
          },
          currentPairs: [pair, ...currentPairs],
          originalAmountOut,
          bestTrades,
        })
      }
    }

    return bestTrades
  }

  public async swapTransaction(options: TradeOptions): Promise<UnsignedTransaction> {
    const nativeCurrency = Currency.getNative(this.chainId)
    const etherIn = this.inputAmount.currency === nativeCurrency
    const etherOut = this.outputAmount.currency === nativeCurrency
    // the router does not support both ether in and out
    invariant(!(etherIn && etherOut), 'ETHER_IN_OUT')
    invariant(options.ttl && options.ttl > 0, 'TTL')
    const routerAddress = (this.platform as UniswapV2RoutablePlatform).routerAddress[this.chainId] as string
    invariant(!!routerAddress, 'ROUTER_ADDRESS_IN_CHAIN')

    const to: string = validateAndParseAddress(options.recipient)
    const amountIn: string = toHex(this.maximumAmountIn())
    const amountOut: string = toHex(this.minimumAmountOut())
    const path: string[] = this.route.path.map((token) => token.address)
    const deadline = `0x${(Math.floor(new Date().getTime() / 1000) + options.ttl).toString(16)}`

    let methodName: string
    let args: (string | string[])[]
    let value: string = ZERO_HEX
    switch (this.tradeType) {
      case TradeType.EXACT_INPUT:
        if (etherIn) {
          methodName = 'swapExactETHForTokens'
          // (uint amountOutMin, address[] calldata path, address to, uint deadline)
          args = [amountOut, path, to, deadline]
          value = amountIn
        } else if (etherOut) {
          methodName = 'swapExactTokensForETH'
          // (uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline)
          args = [amountIn, amountOut, path, to, deadline]
          value = ZERO_HEX
        } else {
          methodName = 'swapExactTokensForTokens'
          // (uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline)
          args = [amountIn, amountOut, path, to, deadline]
          value = ZERO_HEX
        }
        break
      case TradeType.EXACT_OUTPUT:
        if (etherIn) {
          methodName = 'swapETHForExactTokens'
          // (uint amountOut, address[] calldata path, address to, uint deadline)
          args = [amountOut, path, to, deadline]
          value = amountIn
        } else if (etherOut) {
          methodName = 'swapTokensForExactETH'
          // (uint amountOut, uint amountInMax, address[] calldata path, address to, uint deadline)
          args = [amountOut, amountIn, path, to, deadline]
          value = ZERO_HEX
        } else {
          methodName = 'swapTokensForExactTokens'
          // (uint amountOut, uint amountInMax, address[] calldata path, address to, uint deadline)
          args = [amountOut, amountIn, path, to, deadline]
          value = ZERO_HEX
        }
        break
    }

    return new Contract(routerAddress, ROUTER_ABI).populateTransaction[methodName](...args, { value })
  }

  public get route() {
    return this.details as Route
  }

  // extension of the input output comparator that also considers other dimensions of the trade in ranking them
  static tradeComparator(a: UniswapV2Trade, b: UniswapV2Trade) {
    const ioComp = inputOutputComparator(a, b)
    if (ioComp !== 0) {
      return ioComp
    }

    // consider lowest slippage next, since these are less likely to fail
    if (a.priceImpact.lessThan(b.priceImpact)) {
      return -1
    } else if (a.priceImpact.greaterThan(b.priceImpact)) {
      return 1
    }

    // finally consider the number of hops since each hop costs gas
    return a.route.path.length - b.route.path.length
  }
}
