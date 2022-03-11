import { Order, OrderKind } from '@gnosis.pm/gp-v2-contracts/lib/esm/order'
import { CurrencyAmount } from '../../fractions/currencyAmount'
import { ChainId, TradeType } from '../../../constants'
import { Percent } from '../../fractions/percent'
import { SigningSchemeValue } from './signatures'
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
export type GnosisProtocolTradeOrder = Order

export enum GnosisProtocolTradeOrderOrderStatus {
  UNKNOWN = 'unknown',
  OPEN = 'open',
  PRESIGNATURE_PENDING = 'presignaturePending',
  FULFILLED = 'fulfilled',
  EXPIRED = 'expired',
  CANCELLED = 'cancelled'
}

export type GnosisProtocolTradeApiOrderOrderStatus =
  | 'fulfilled'
  | 'expired'
  | 'cancelled'
  | 'presignaturePending'
  | 'open'

export interface GnosisProtocolTradeOrderMetadata {
  creationDate: string
  owner: string
  uid: string
  availableBalance: string
  executedBuyAmount: string
  executedSellAmount: string
  executedSellAmountBeforeFees: string
  executedFeeAmount: string
  invalidated: false
  sellToken: string
  buyToken: string
  sellAmount: string
  buyAmount: string
  validTo: number
  appData: number
  feeAmount: string
  kind: OrderKind
  partiallyFillable: false
  signature: string
  signingScheme: SigningSchemeValue
  status: GnosisProtocolTradeApiOrderOrderStatus
  receiver: string
}
