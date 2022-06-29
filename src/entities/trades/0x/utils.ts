import Decimal from 'decimal.js-light'

import { Percent } from '../../fractions/percent'
import { Platform } from '../../platforms-breakdown'
import { CODE_TO_PLATFORM_NAME } from './constants'
import { ApiSource } from './types'

export const decodePlatformName = (apiName: string): string => CODE_TO_PLATFORM_NAME[apiName] || apiName

export const decodeStringToPercent = (value: string, isStringPercent?: boolean): Percent => {
  const proportion = new Decimal(value)
  const denominator = new Decimal('10').pow(proportion.decimalPlaces())
  const percent = isStringPercent ? new Decimal('10').pow(2) : 1
  const numerator = proportion.times(denominator)
  return new Percent(numerator.toString(), denominator.times(percent).toString())
}

export const platformsFromSources = (sources: ApiSource[]): Platform[] => {
  return sources
    .map((source) => {
      return {
        name: decodePlatformName(source.name),
        percentage: decodeStringToPercent(source.proportion),
      }
    })
    .filter((platform) => platform.percentage.greaterThan('0'))
    .sort((a, b) => (a.percentage.greaterThan(b.percentage) ? -1 : a.percentage.equalTo(b.percentage) ? 0 : 1))
}
