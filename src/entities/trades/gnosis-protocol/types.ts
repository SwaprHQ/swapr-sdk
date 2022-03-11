import { Order } from '@gnosis.pm/gp-v2-contracts/lib/esm/order'
import { CurrencyAmount } from '../../fractions/currencyAmount'
import { ChainId, TradeType } from '../../../constants'
import { Percent } from '../../fractions/percent'
import { Currency } from '../../currency'

export enum GnosisProtocolTradeOrderStatus {
  UNKNOWN = 'unknown',
  PENDING = 'pending',
  PRESIGNATURE_PENDING = 'presignaturePending',
  FULFILLED = 'fulfilled',
  EXPIRED = 'expired',
  CANCELLED = 'cancelled'
}

export interface GnosisProtocolTradeConstructorParams {
  inputAmount: CurrencyAmount
  outputAmount: CurrencyAmount
  maximumSlippage: Percent
  tradeType: TradeType
  chainId: ChainId
  order: Order
  fee?: Percent
}

export interface GnosisProtocolTradeBestTradeExactInParams {
  currencyAmountIn: CurrencyAmount
  currencyOut: Currency
  maximumSlippage: Percent
  receiver?: string
}

export interface GnosisProtocolTradeBestTradeExactOutParams {
  currencyAmountOut: CurrencyAmount
  currencyIn: Currency
  maximumSlippage: Percent
  receiver?: string
}

export type GnosisProtocolTradeSwapOrderParams = Required<Pick<Order, 'receiver'>>
