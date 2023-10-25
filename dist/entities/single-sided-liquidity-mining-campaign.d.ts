import { BigintIsh } from '../constants';
import { PricedTokenAmount, Token, TokenAmount } from '../entities';
import { DistributionCampaignBase } from './DistributionCampaignBase';
export declare class SingleSidedLiquidityMiningCampaign extends DistributionCampaignBase {
    readonly stakeToken: Token;
    constructor(startsAt: BigintIsh, endsAt: BigintIsh, stakeToken: Token, rewards: PricedTokenAmount[], staked: PricedTokenAmount, locked: boolean, stakingCap: TokenAmount, address?: string);
}
