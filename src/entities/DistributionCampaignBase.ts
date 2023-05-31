import { parseUnits } from '@ethersproject/units'
import JSBI from 'jsbi'
import invariant from 'tiny-invariant'

import { BigintIsh, ChainId, SECONDS_IN_YEAR } from '../constants'
import { parseBigintIsh } from '../utils'
import { CurrencyAmount, Fraction, Percent, TokenAmount } from './fractions'
import { PricedTokenAmount } from './fractions/priced-token-amount'
import { Token } from './token'

const MINIMUM_STAKED_AMOUNT_NATIVE_CURRENCY: Record<ChainId, CurrencyAmount> = {
  [ChainId.RINKEBY]: CurrencyAmount.nativeCurrency(
    parseUnits('0.05', Token.getNative(ChainId.RINKEBY).decimals).toString(),
    ChainId.RINKEBY
  ),
  [ChainId.MAINNET]: CurrencyAmount.nativeCurrency(
    parseUnits('0.1', Token.getNative(ChainId.MAINNET).decimals).toString(),
    ChainId.MAINNET
  ),
  [ChainId.XDAI]: CurrencyAmount.nativeCurrency(
    parseUnits('1000', Token.getNative(ChainId.XDAI).decimals).toString(),
    ChainId.XDAI
  ),
  [ChainId.ARBITRUM_ONE]: CurrencyAmount.nativeCurrency(
    parseUnits('0.1', Token.getNative(ChainId.ARBITRUM_ONE).decimals).toString(),
    ChainId.ARBITRUM_ONE
  ),
  [ChainId.ARBITRUM_RINKEBY]: CurrencyAmount.nativeCurrency(
    parseUnits('0.05', Token.getNative(ChainId.ARBITRUM_RINKEBY).decimals).toString(),
    ChainId.ARBITRUM_RINKEBY
  ),
  [ChainId.ARBITRUM_GOERLI]: CurrencyAmount.nativeCurrency(
    parseUnits('0.05', Token.getNative(ChainId.ARBITRUM_GOERLI).decimals).toString(),
    ChainId.ARBITRUM_GOERLI
  ),
  [ChainId.POLYGON]: CurrencyAmount.nativeCurrency(
    parseUnits('0', Token.getNative(ChainId.POLYGON).decimals).toString(),
    ChainId.POLYGON
  ),
  [ChainId.GOERLI]: CurrencyAmount.nativeCurrency(
    parseUnits('0.05', Token.getNative(ChainId.GOERLI).decimals).toString(),
    ChainId.GOERLI
  ),
  [ChainId.OPTIMISM_MAINNET]: CurrencyAmount.nativeCurrency(
    parseUnits('0.05', Token.getNative(ChainId.OPTIMISM_MAINNET).decimals).toString(),
    ChainId.OPTIMISM_MAINNET
  ),
  [ChainId.OPTIMISM_GOERLI]: CurrencyAmount.nativeCurrency(
    parseUnits('0.05', Token.getNative(ChainId.OPTIMISM_GOERLI).decimals).toString(),
    ChainId.OPTIMISM_GOERLI
  ),
  [ChainId.BSC_MAINNET]: CurrencyAmount.nativeCurrency(
    parseUnits('0.05', Token.getNative(ChainId.BSC_MAINNET).decimals).toString(),
    ChainId.BSC_MAINNET
  ),
  [ChainId.BSC_TESTNET]: CurrencyAmount.nativeCurrency(
    parseUnits('0.05', Token.getNative(ChainId.BSC_TESTNET).decimals).toString(),
    ChainId.BSC_TESTNET
  ),
  [ChainId.ZK_SYNC_ERA_MAINNET]: CurrencyAmount.nativeCurrency(
    parseUnits('0', Token.getNative(ChainId.ZK_SYNC_ERA_MAINNET).decimals).toString(),
    ChainId.ZK_SYNC_ERA_MAINNET
  ),
  [ChainId.ZK_SYNC_ERA_TESTNET]: CurrencyAmount.nativeCurrency(
    parseUnits('0', Token.getNative(ChainId.ZK_SYNC_ERA_TESTNET).decimals).toString(),
    ChainId.ZK_SYNC_ERA_TESTNET
  ),
}

export interface DistributionCampaignBaseConstructoParams {
  startsAt: BigintIsh
  endsAt: BigintIsh
  rewards: PricedTokenAmount[]
  staked: PricedTokenAmount
  locked: boolean
  stakingCap: TokenAmount
  address?: string
}

export class DistributionCampaignBase {
  public readonly chainId: ChainId
  public readonly address?: string
  public readonly startsAt: BigintIsh
  public readonly endsAt: BigintIsh
  public readonly rewards: PricedTokenAmount[]
  public readonly staked: PricedTokenAmount
  public readonly duration: BigintIsh
  public readonly locked: boolean
  public readonly stakingCap: TokenAmount

  constructor({
    startsAt,
    endsAt,
    rewards,
    staked,
    locked,
    stakingCap,
    address,
  }: DistributionCampaignBaseConstructoParams) {
    invariant(JSBI.lessThan(parseBigintIsh(startsAt), parseBigintIsh(endsAt)), 'INCONSISTENT_DATES')
    for (const reward of rewards) {
      invariant(staked.token.chainId === reward.token.chainId, 'CHAIN_ID')
    }
    this.chainId = staked.token.chainId
    this.startsAt = startsAt
    this.endsAt = endsAt
    this.rewards = rewards
    this.staked = staked
    this.duration = JSBI.subtract(parseBigintIsh(endsAt), parseBigintIsh(startsAt))
    this.locked = locked
    this.stakingCap = stakingCap
    this.address = address
  }

  public get remainingDuration(): JSBI {
    const now = JSBI.BigInt(Math.floor(Date.now() / 1000))
    const jsbiStartsAt = parseBigintIsh(this.startsAt)
    const jsbiEndsAt = parseBigintIsh(this.endsAt)
    if (JSBI.lessThan(now, jsbiStartsAt)) return JSBI.subtract(jsbiEndsAt, jsbiStartsAt)
    if (JSBI.greaterThanOrEqual(now, jsbiEndsAt)) return JSBI.BigInt('0')
    return JSBI.subtract(jsbiEndsAt, now)
  }

  public get remainingDistributionPercentage(): Percent {
    const now = JSBI.BigInt(Math.floor(Date.now() / 1000))
    const jsbiStartsAt = parseBigintIsh(this.startsAt)
    const jsbiEndsAt = parseBigintIsh(this.endsAt)
    if (JSBI.lessThan(now, jsbiStartsAt)) return new Percent('100', '100')
    if (JSBI.greaterThanOrEqual(now, jsbiEndsAt)) return new Percent('0', '100')
    return new Percent(JSBI.subtract(jsbiEndsAt, now), this.duration)
  }

  public get remainingRewards(): PricedTokenAmount[] {
    const remainingDistributionPercentage = this.remainingDistributionPercentage
    return this.rewards.map((reward) => {
      return new PricedTokenAmount(reward.token, remainingDistributionPercentage.multiply(reward.raw).toFixed(0))
    })
  }

  public get apy(): Percent {
    // when the campaign has ended, apy is returned as 0
    if (this.remainingDuration.toString() === '0') return new Percent('0', '1')

    const remainingRewards = this.remainingRewards

    let stakedValueNativeCurrency = this.staked.nativeCurrencyAmount

    if (stakedValueNativeCurrency.lessThan(MINIMUM_STAKED_AMOUNT_NATIVE_CURRENCY[this.chainId])) {
      stakedValueNativeCurrency = MINIMUM_STAKED_AMOUNT_NATIVE_CURRENCY[this.chainId]
    }
    const cumulativeRemainingRewardAmountNativeCurrency = remainingRewards.reduce(
      (accumulator, remainingRewardAmount) => {
        return accumulator.add(remainingRewardAmount.nativeCurrencyAmount)
      },
      CurrencyAmount.nativeCurrency('0', this.chainId)
    )

    const yieldInPeriod = cumulativeRemainingRewardAmountNativeCurrency.divide(stakedValueNativeCurrency)
    const annualizationMultiplier = new Fraction(SECONDS_IN_YEAR.toString(), this.remainingDuration.toString())
    const rawApy = yieldInPeriod.multiply(annualizationMultiplier)
    return new Percent(rawApy.numerator, rawApy.denominator)
  }

  public get currentlyActive(): boolean {
    const now = JSBI.BigInt(Math.floor(Date.now() / 1000))
    return (
      JSBI.lessThanOrEqual(parseBigintIsh(this.startsAt), now) && JSBI.greaterThan(parseBigintIsh(this.endsAt), now)
    )
  }

  public get ended(): boolean {
    return JSBI.greaterThan(JSBI.BigInt(Math.floor(Date.now() / 1000)), parseBigintIsh(this.endsAt))
  }
}
