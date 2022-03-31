import type { BytesLike } from '@ethersproject/bytes'

import type { CurrencyAmount } from '../../fractions/currencyAmount'
import type { Percent } from '../../fractions/percent'
import type { Currency } from '../../currency'
import type { Pair } from '../../pair'
import type { UniswapV2Trade } from './UniswapV2'
import { UniswapV2RoutablePlatform } from '../routable-platform/uniswap-v2-routable-platform'

export type Multicall2TryAggregateResult = {
  success: boolean
  returnData: BytesLike
}

export interface BestTradeOptions {
  // how many results to return
  maxNumResults?: number
  // the maximum number of hops a trade should contain
  maxHops?: number
}

/**
 * Base interface
 */
export interface UniswapV2TradeBestTradeExactCommonParams {
  maxHops?: BestTradeOptions
  maximumSlippage: Percent
  platform: UniswapV2RoutablePlatform
}

export interface UniswapV2TradeBestTradeExactInParams extends UniswapV2TradeBestTradeExactCommonParams {
  currencyAmountIn: CurrencyAmount
  currencyOut: Currency
}

export interface UniswapV2TradeBestTradeExactOutParams extends UniswapV2TradeBestTradeExactCommonParams {
  currencyIn: Currency
  currencyAmountOut: CurrencyAmount
}

/**
 * Common params for computing trade routes
 */
export interface UniswapV2TradeComputeTradeCommonParams {
  // used in recursion.
  pairs: Pair[]
  currentPairs?: Pair[]
  bestTrades?: UniswapV2Trade[]
}

export type UniswapV2TradeComputeTradesExactInParams = UniswapV2TradeComputeTradeCommonParams &
  Omit<UniswapV2TradeBestTradeExactInParams, 'platform'> & {
    originalAmountIn?: CurrencyAmount
  }

export type UniswapV2TradeComputeTradesExactOutParams = UniswapV2TradeComputeTradeCommonParams &
  Omit<UniswapV2TradeBestTradeExactOutParams, 'platform'> & {
    originalAmountOut?: CurrencyAmount
  }
