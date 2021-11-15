import { BigintIsh, ChainId } from '../constants'
import { TokenAmount } from './'
import invariant from 'tiny-invariant'
import { Currency, Price, PricedToken, PricedTokenAmount, Token } from '..'
import { parseUnits } from 'ethers/utils'
import Decimal from 'decimal.js-light'

export class KpiToken extends PricedToken {
  public readonly totalSupply: TokenAmount
  public readonly collateral: PricedTokenAmount

  constructor(
    chainId: ChainId,
    address: string,
    totalSupply: BigintIsh,
    collateral: PricedTokenAmount,
    symbol?: string,
    name?: string
  ) {
    const collateralTokenNativeCurrency = collateral.nativeCurrencyAmount
    const kpiTokenPrice = new Decimal(collateralTokenNativeCurrency.raw.toString()).dividedBy(totalSupply.toString())
    const nativeCurrency = Currency.getNative(chainId)
    const token = new Token(chainId, address, 18, symbol, name)
    super(
      chainId,
      address,
      18,
      new Price(
        token,
        nativeCurrency,
        parseUnits('1', nativeCurrency.decimals).toString(),
        parseUnits(kpiTokenPrice.toFixed(nativeCurrency.decimals), nativeCurrency.decimals).toString()
      ),
      symbol,
      name
    ) // decimals are always 18 for kpi tokens
    invariant(collateral.token.chainId === chainId, 'inconsistent chain id in collateral')
    this.totalSupply = new TokenAmount(this, totalSupply)
    this.collateral = collateral
  }
}
