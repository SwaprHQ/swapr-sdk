import { BigintIsh } from '../constants';
import { Pair, PricedTokenAmount, TokenAmount } from '../entities';
import { DistributionCampaignBase } from './DistributionCampaignBase';
export interface LiquidityMiningCampaignConstructorParams {
    startsAt: BigintIsh;
    endsAt: BigintIsh;
    targetedPair: Pair;
    rewards: PricedTokenAmount[];
    staked: PricedTokenAmount;
    locked: boolean;
    stakingCap: TokenAmount;
    address?: string;
}
export declare class LiquidityMiningCampaign extends DistributionCampaignBase {
    readonly targetedPair: Pair;
    constructor({ startsAt, endsAt, targetedPair, rewards, staked, locked, stakingCap, address, }: LiquidityMiningCampaignConstructorParams);
}
