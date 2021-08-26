import { ChainId } from '../constants'
import invariant from 'tiny-invariant'

import { Currency } from './currency'
import { Token } from './token'
import { Price } from './fractions/price'
import { Percent } from './fractions'

export interface Platform {
  name: string
  percentage: Percent
}

export class Breakdown {
  public readonly chainId: ChainId
  public readonly platforms: Platform[]
  public readonly input: Currency
  public readonly output: Currency
  public readonly midPrice: Price

  public constructor(chainId: ChainId, platforms: Platform[], input: Currency, output: Currency, midPrice: Price) {
    invariant(platforms.length > 0, 'PLATFORMS')
    invariant(
      platforms
        .reduce((accumulator, platform) => accumulator.add(platform.percentage), new Percent('0', '100'))
        .toFixed(2) === '100.00',
      'PERCENT'
    )
    if (input instanceof Token && output instanceof Token) invariant(input.chainId === output.chainId, 'CHAIN_ID')

    this.chainId = chainId
    this.platforms = platforms
    this.midPrice = midPrice
    this.input = input
    this.output = output
  }
}
