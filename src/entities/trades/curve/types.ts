import type { Contract } from '@ethersproject/contracts'
import type { UnsignedTransaction } from '@ethersproject/transactions'

import type { ChainId, TradeType } from '../../../constants'
import type { Currency } from '../../currency'
import type { CurrencyAmount } from '../../fractions/currencyAmount'
import type { Percent } from '../../fractions/percent'

export interface CurveTradeConstructorParams {
  inputAmount: CurrencyAmount
  outputAmount: CurrencyAmount
  maximumSlippage: Percent
  tradeType: TradeType
  chainId: ChainId
  transactionRequest: UnsignedTransaction
  approveAddress?: string
  fee?: Percent
  contract: Contract
}

export interface CurveTradeGetQuoteParams {
  currencyAmountIn: CurrencyAmount
  currencyOut: Currency
  maximumSlippage: Percent
  receiver?: string
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
  contract: Contract
}

interface CurveGetTradeCommonParams {
  maximumSlippage: Percent
  receiver?: string
}

export interface CurveTradeBestTradeExactInParams extends CurveGetTradeCommonParams {
  currencyAmountIn: CurrencyAmount
  currencyOut: Currency
}

export interface CurveTradeBestTradeExactOutParams extends CurveGetTradeCommonParams {
  currencyIn: Currency
  currencyAmountOut: CurrencyAmount
}
