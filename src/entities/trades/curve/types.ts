import type { UnsignedTransaction } from '@ethersproject/transactions'
import type { CurrencyAmount } from '../../fractions/currencyAmount'
import type { ChainId, TradeType } from '../../../constants'
import type { Percent } from '../../fractions/percent'
import type { Currency } from '../../currency'

export interface CurveTradeConstructorParams {
  inputAmount: CurrencyAmount
  outputAmount: CurrencyAmount
  maximumSlippage: Percent
  tradeType: TradeType
  chainId: ChainId
  transactionRequest: UnsignedTransaction
  approveAddress?: string
  fee?: Percent
}

export interface CurveTradeGetQuoteParams {
  currencyAmountIn: CurrencyAmount
  currencyOut: Currency
  maximumSlippage: Percent
}

export interface CurveTradeQuote {
  fee: Percent
  to: string
  populatedTransaction: UnsignedTransaction
  currencyAmountIn: CurrencyAmount
  estimatedAmountOut: CurrencyAmount
  exchangeRate: number
  exchangeRateWithoutFee: number
  currencyOut: Currency
  maximumSlippage: Percent
}

export interface CurveTradeBestTradeExactInParams {
  currencyAmountIn: CurrencyAmount
  currencyOut: Currency
  maximumSlippage: Percent
}

export interface CurveTradeBestTradeExactOutParams {
  currencyIn: Currency
  currencyAmountOut: CurrencyAmount
  maximumSlippage: Percent
}
