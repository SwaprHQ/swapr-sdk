import { parseUnits } from '@ethersproject/units'
import Decimal from 'decimal.js-light'
import invariant from 'tiny-invariant'

import { BigintIsh, ChainId } from '../constants'
import { Currency } from '../entities/currency'
import { Price, PricedTokenAmount, TokenAmount } from '../entities/fractions'
import { Token } from '../entities/token'
import { PricedToken } from './priced-token'

export class KpiToken extends PricedToken {
  public readonly kpiId: string
  public readonly totalSupply: TokenAmount
  public readonly collateral: PricedTokenAmount

  constructor(
    chainId: ChainId,
    address: string,
    totalSupply: BigintIsh,
    collateral: PricedTokenAmount,
    kpiId: string,
    symbol?: string,
    name?: string,
  ) {
    const collateralTokenNativeCurrency = collateral.nativeCurrencyAmount
    const kpiTokenPrice = new Decimal(collateralTokenNativeCurrency.raw.toString()).dividedBy(totalSupply.toString())
    const nativeCurrency = Currency.getNative(chainId)
    const token = new Token(chainId, address, 18, symbol, name)
    super(
      chainId,
      address,
      18,
      new Price({
        baseCurrency: token,
        quoteCurrency: nativeCurrency,
        denominator: parseUnits('1', nativeCurrency.decimals).toString(),
        numerator: parseUnits(kpiTokenPrice.toFixed(nativeCurrency.decimals), nativeCurrency.decimals).toString(),
      }),
      symbol,
      name,
    ) // decimals are always 18 for kpi tokens
    invariant(collateral.token.chainId === chainId, 'inconsistent chain id in collateral')
    this.totalSupply = new TokenAmount(this, totalSupply)
    this.collateral = collateral
    this.kpiId = kpiId
  }
}
