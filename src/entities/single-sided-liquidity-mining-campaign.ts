import { PricedTokenAmount, Token, TokenAmount } from '../entities'
import invariant from 'tiny-invariant'

import { BigintIsh } from '../constants'
import { DistributionCampaignBase } from './DistributionCampaignBase'

export class SingleSidedLiquidityMiningCampaign extends DistributionCampaignBase {
  public readonly stakeToken: Token

  constructor(
    startsAt: BigintIsh,
    endsAt: BigintIsh,
    stakeToken: Token,
    rewards: PricedTokenAmount[],
    staked: PricedTokenAmount,
    locked: boolean,
    stakingCap: TokenAmount,
    address?: string
  ) {
    invariant(staked.token.equals(stakeToken), 'STAKED_LP_TOKEN')
    super({
      startsAt,
      endsAt,
      rewards,
      staked,
      locked,
      stakingCap,
      address,
    })

    this.stakeToken = stakeToken
  }
}
