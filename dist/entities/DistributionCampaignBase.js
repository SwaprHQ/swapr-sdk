"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DistributionCampaignBase = void 0;
const tslib_1 = require("tslib");
const units_1 = require("@ethersproject/units");
const jsbi_1 = tslib_1.__importDefault(require("jsbi"));
const tiny_invariant_1 = tslib_1.__importDefault(require("tiny-invariant"));
const constants_1 = require("../constants");
const utils_1 = require("../utils");
const fractions_1 = require("./fractions");
const priced_token_amount_1 = require("./fractions/priced-token-amount");
const token_1 = require("./token");
const MINIMUM_STAKED_AMOUNT_NATIVE_CURRENCY = {
    [constants_1.ChainId.ARBITRUM_GOERLI]: fractions_1.CurrencyAmount.nativeCurrency((0, units_1.parseUnits)('0.05', token_1.Token.getNative(constants_1.ChainId.ARBITRUM_GOERLI).decimals).toString(), constants_1.ChainId.ARBITRUM_GOERLI),
    [constants_1.ChainId.ARBITRUM_ONE]: fractions_1.CurrencyAmount.nativeCurrency((0, units_1.parseUnits)('0.1', token_1.Token.getNative(constants_1.ChainId.ARBITRUM_ONE).decimals).toString(), constants_1.ChainId.ARBITRUM_ONE),
    [constants_1.ChainId.ARBITRUM_RINKEBY]: fractions_1.CurrencyAmount.nativeCurrency((0, units_1.parseUnits)('0.05', token_1.Token.getNative(constants_1.ChainId.ARBITRUM_RINKEBY).decimals).toString(), constants_1.ChainId.ARBITRUM_RINKEBY),
    [constants_1.ChainId.BSC_MAINNET]: fractions_1.CurrencyAmount.nativeCurrency((0, units_1.parseUnits)('0.05', token_1.Token.getNative(constants_1.ChainId.BSC_MAINNET).decimals).toString(), constants_1.ChainId.BSC_MAINNET),
    [constants_1.ChainId.BSC_TESTNET]: fractions_1.CurrencyAmount.nativeCurrency((0, units_1.parseUnits)('0.05', token_1.Token.getNative(constants_1.ChainId.BSC_TESTNET).decimals).toString(), constants_1.ChainId.BSC_TESTNET),
    [constants_1.ChainId.GOERLI]: fractions_1.CurrencyAmount.nativeCurrency((0, units_1.parseUnits)('0.05', token_1.Token.getNative(constants_1.ChainId.GOERLI).decimals).toString(), constants_1.ChainId.GOERLI),
    [constants_1.ChainId.MAINNET]: fractions_1.CurrencyAmount.nativeCurrency((0, units_1.parseUnits)('0.1', token_1.Token.getNative(constants_1.ChainId.MAINNET).decimals).toString(), constants_1.ChainId.MAINNET),
    [constants_1.ChainId.OPTIMISM_GOERLI]: fractions_1.CurrencyAmount.nativeCurrency((0, units_1.parseUnits)('0.05', token_1.Token.getNative(constants_1.ChainId.OPTIMISM_GOERLI).decimals).toString(), constants_1.ChainId.OPTIMISM_GOERLI),
    [constants_1.ChainId.OPTIMISM_MAINNET]: fractions_1.CurrencyAmount.nativeCurrency((0, units_1.parseUnits)('0.05', token_1.Token.getNative(constants_1.ChainId.OPTIMISM_MAINNET).decimals).toString(), constants_1.ChainId.OPTIMISM_MAINNET),
    [constants_1.ChainId.POLYGON]: fractions_1.CurrencyAmount.nativeCurrency((0, units_1.parseUnits)('0', token_1.Token.getNative(constants_1.ChainId.POLYGON).decimals).toString(), constants_1.ChainId.POLYGON),
    [constants_1.ChainId.RINKEBY]: fractions_1.CurrencyAmount.nativeCurrency((0, units_1.parseUnits)('0.05', token_1.Token.getNative(constants_1.ChainId.RINKEBY).decimals).toString(), constants_1.ChainId.RINKEBY),
    [constants_1.ChainId.SCROLL_MAINNET]: fractions_1.CurrencyAmount.nativeCurrency((0, units_1.parseUnits)('0', token_1.Token.getNative(constants_1.ChainId.SCROLL_MAINNET).decimals).toString(), constants_1.ChainId.SCROLL_MAINNET),
    [constants_1.ChainId.XDAI]: fractions_1.CurrencyAmount.nativeCurrency((0, units_1.parseUnits)('1000', token_1.Token.getNative(constants_1.ChainId.XDAI).decimals).toString(), constants_1.ChainId.XDAI),
    [constants_1.ChainId.ZK_SYNC_ERA_MAINNET]: fractions_1.CurrencyAmount.nativeCurrency((0, units_1.parseUnits)('0', token_1.Token.getNative(constants_1.ChainId.ZK_SYNC_ERA_MAINNET).decimals).toString(), constants_1.ChainId.ZK_SYNC_ERA_MAINNET),
    [constants_1.ChainId.ZK_SYNC_ERA_TESTNET]: fractions_1.CurrencyAmount.nativeCurrency((0, units_1.parseUnits)('0', token_1.Token.getNative(constants_1.ChainId.ZK_SYNC_ERA_TESTNET).decimals).toString(), constants_1.ChainId.ZK_SYNC_ERA_TESTNET),
};
class DistributionCampaignBase {
    constructor({ startsAt, endsAt, rewards, staked, locked, stakingCap, address, }) {
        (0, tiny_invariant_1.default)(jsbi_1.default.lessThan((0, utils_1.parseBigintIsh)(startsAt), (0, utils_1.parseBigintIsh)(endsAt)), 'INCONSISTENT_DATES');
        for (const reward of rewards) {
            (0, tiny_invariant_1.default)(staked.token.chainId === reward.token.chainId, 'CHAIN_ID');
        }
        this.chainId = staked.token.chainId;
        this.startsAt = startsAt;
        this.endsAt = endsAt;
        this.rewards = rewards;
        this.staked = staked;
        this.duration = jsbi_1.default.subtract((0, utils_1.parseBigintIsh)(endsAt), (0, utils_1.parseBigintIsh)(startsAt));
        this.locked = locked;
        this.stakingCap = stakingCap;
        this.address = address;
    }
    get remainingDuration() {
        const now = jsbi_1.default.BigInt(Math.floor(Date.now() / 1000));
        const jsbiStartsAt = (0, utils_1.parseBigintIsh)(this.startsAt);
        const jsbiEndsAt = (0, utils_1.parseBigintIsh)(this.endsAt);
        if (jsbi_1.default.lessThan(now, jsbiStartsAt))
            return jsbi_1.default.subtract(jsbiEndsAt, jsbiStartsAt);
        if (jsbi_1.default.greaterThanOrEqual(now, jsbiEndsAt))
            return jsbi_1.default.BigInt('0');
        return jsbi_1.default.subtract(jsbiEndsAt, now);
    }
    get remainingDistributionPercentage() {
        const now = jsbi_1.default.BigInt(Math.floor(Date.now() / 1000));
        const jsbiStartsAt = (0, utils_1.parseBigintIsh)(this.startsAt);
        const jsbiEndsAt = (0, utils_1.parseBigintIsh)(this.endsAt);
        if (jsbi_1.default.lessThan(now, jsbiStartsAt))
            return new fractions_1.Percent('100', '100');
        if (jsbi_1.default.greaterThanOrEqual(now, jsbiEndsAt))
            return new fractions_1.Percent('0', '100');
        return new fractions_1.Percent(jsbi_1.default.subtract(jsbiEndsAt, now), this.duration);
    }
    get remainingRewards() {
        const remainingDistributionPercentage = this.remainingDistributionPercentage;
        return this.rewards.map((reward) => {
            return new priced_token_amount_1.PricedTokenAmount(reward.token, remainingDistributionPercentage.multiply(reward.raw).toFixed(0));
        });
    }
    get apy() {
        // when the campaign has ended, apy is returned as 0
        if (this.remainingDuration.toString() === '0')
            return new fractions_1.Percent('0', '1');
        const remainingRewards = this.remainingRewards;
        let stakedValueNativeCurrency = this.staked.nativeCurrencyAmount;
        if (stakedValueNativeCurrency.lessThan(MINIMUM_STAKED_AMOUNT_NATIVE_CURRENCY[this.chainId])) {
            stakedValueNativeCurrency = MINIMUM_STAKED_AMOUNT_NATIVE_CURRENCY[this.chainId];
        }
        const cumulativeRemainingRewardAmountNativeCurrency = remainingRewards.reduce((accumulator, remainingRewardAmount) => {
            return accumulator.add(remainingRewardAmount.nativeCurrencyAmount);
        }, fractions_1.CurrencyAmount.nativeCurrency('0', this.chainId));
        const yieldInPeriod = cumulativeRemainingRewardAmountNativeCurrency.divide(stakedValueNativeCurrency);
        const annualizationMultiplier = new fractions_1.Fraction(constants_1.SECONDS_IN_YEAR.toString(), this.remainingDuration.toString());
        const rawApy = yieldInPeriod.multiply(annualizationMultiplier);
        return new fractions_1.Percent(rawApy.numerator, rawApy.denominator);
    }
    get currentlyActive() {
        const now = jsbi_1.default.BigInt(Math.floor(Date.now() / 1000));
        return (jsbi_1.default.lessThanOrEqual((0, utils_1.parseBigintIsh)(this.startsAt), now) && jsbi_1.default.greaterThan((0, utils_1.parseBigintIsh)(this.endsAt), now));
    }
    get ended() {
        return jsbi_1.default.greaterThan(jsbi_1.default.BigInt(Math.floor(Date.now() / 1000)), (0, utils_1.parseBigintIsh)(this.endsAt));
    }
}
exports.DistributionCampaignBase = DistributionCampaignBase;
//# sourceMappingURL=DistributionCampaignBase.js.map