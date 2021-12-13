import { Pair, PricedTokenAmount, TokenAmount } from "entities"
import invariant from "tiny-invariant"

import { BigintIsh } from ".."
import { DistributionCampaignBase } from "./DistributionCampaignBase"

export class LiquidityMiningCampaign extends DistributionCampaignBase {
  public readonly targetedPair: Pair

  constructor(
    startsAt: BigintIsh,
    endsAt: BigintIsh,
    targetedPair: Pair,
    rewards: PricedTokenAmount[],
    staked: PricedTokenAmount,
    locked: boolean,
    stakingCap: TokenAmount,
    address?: string
  ) {
    invariant(staked.token.equals(targetedPair.liquidityToken), 'STAKED_LP_TOKEN')
   
    super(
      startsAt,
      endsAt,
      rewards,
      staked,
      locked,
      stakingCap,
      address 
    )

    this.targetedPair = targetedPair
  }
}