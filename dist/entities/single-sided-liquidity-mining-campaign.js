"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SingleSidedLiquidityMiningCampaign = void 0;
const tslib_1 = require("tslib");
const tiny_invariant_1 = tslib_1.__importDefault(require("tiny-invariant"));
const DistributionCampaignBase_1 = require("./DistributionCampaignBase");
class SingleSidedLiquidityMiningCampaign extends DistributionCampaignBase_1.DistributionCampaignBase {
    constructor(startsAt, endsAt, stakeToken, rewards, staked, locked, stakingCap, address) {
        (0, tiny_invariant_1.default)(staked.token.equals(stakeToken), 'STAKED_LP_TOKEN');
        super({
            startsAt,
            endsAt,
            rewards,
            staked,
            locked,
            stakingCap,
            address,
        });
        this.stakeToken = stakeToken;
    }
}
exports.SingleSidedLiquidityMiningCampaign = SingleSidedLiquidityMiningCampaign;
//# sourceMappingURL=single-sided-liquidity-mining-campaign.js.map