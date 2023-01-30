import Decimal from 'decimal.js-light'

import { Percent } from '../../fractions/percent'
import { Platform } from '../../platforms-breakdown'
import { ApiSource, DecodeStringFractionReturn } from './types'

export const decodePlatformName = (apiName: string): string => apiName.replace(/_/g, ' ')

export const decodeStringFraction = (value: string): DecodeStringFractionReturn => {
  const proportion = new Decimal(value)
  const denominator = new Decimal('10').pow(proportion.decimalPlaces())
  const numerator = proportion.times(denominator)
  return { numerator, denominator }
}

export const decodeStringToPercent = (value: string, isStringPercent?: boolean): Percent => {
  const { numerator, denominator } = decodeStringFraction(value)
  const percent = isStringPercent ? new Decimal('10').pow(2) : 1
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
