import invariant from 'tiny-invariant'

import { BigintIsh } from '../constants'
import { Pair, PricedTokenAmount, TokenAmount } from '../entities'
import { DistributionCampaignBase } from './DistributionCampaignBase'

export interface LiquidityMiningCampaignConstructorParams {
  startsAt: BigintIsh
  endsAt: BigintIsh
  targetedPair: Pair
  rewards: PricedTokenAmount[]
  staked: PricedTokenAmount
  locked: boolean
  stakingCap: TokenAmount
  address?: string
}

export class LiquidityMiningCampaign extends DistributionCampaignBase {
  public readonly targetedPair: Pair

  constructor({
    startsAt,
    endsAt,
    targetedPair,
    rewards,
    staked,
    locked,
    stakingCap,
    address,
  }: LiquidityMiningCampaignConstructorParams) {
    invariant(staked.token.equals(targetedPair.liquidityToken), 'STAKED_LP_TOKEN')

    super({
      startsAt,
      endsAt,
      rewards,
      staked,
      locked,
      stakingCap,
      address,
    })

    this.targetedPair = targetedPair
  }
}
