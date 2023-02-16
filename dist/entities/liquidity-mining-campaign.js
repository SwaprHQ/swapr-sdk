"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LiquidityMiningCampaign = void 0;
const tslib_1 = require("tslib");
const tiny_invariant_1 = tslib_1.__importDefault(require("tiny-invariant"));
const DistributionCampaignBase_1 = require("./DistributionCampaignBase");
class LiquidityMiningCampaign extends DistributionCampaignBase_1.DistributionCampaignBase {
    constructor({ startsAt, endsAt, targetedPair, rewards, staked, locked, stakingCap, address, }) {
        (0, tiny_invariant_1.default)(staked.token.equals(targetedPair.liquidityToken), 'STAKED_LP_TOKEN');
        super({
            startsAt,
            endsAt,
            rewards,
            staked,
            locked,
            stakingCap,
            address,
        });
        this.targetedPair = targetedPair;
    }
}
exports.LiquidityMiningCampaign = LiquidityMiningCampaign;
//# sourceMappingURL=liquidity-mining-campaign.js.map