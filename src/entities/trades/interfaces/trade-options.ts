import { Percent } from 'entities/fractions'

export interface TradeOptions {
  allowedSlippage: Percent
  ttl: number
  recipient: string
  feeOnTransfer?: boolean
}
