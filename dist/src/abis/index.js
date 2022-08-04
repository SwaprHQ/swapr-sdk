"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SWPR_CLAIMER_ABI = exports.STAKING_REWARDS_FACTORY_ABI = exports.STAKING_REWARDS_DISTRIBUTION_ABI = exports.ROUTER_ABI = exports.MULTICALL2_ABI = exports.ERC20_ABI = void 0;
const tslib_1 = require("tslib");
const ERC20_json_1 = tslib_1.__importDefault(require("./source/ERC20.json"));
exports.ERC20_ABI = ERC20_json_1.default;
const multicall2_json_1 = tslib_1.__importDefault(require("./source/multicall2.json"));
exports.MULTICALL2_ABI = multicall2_json_1.default;
const router_json_1 = tslib_1.__importDefault(require("./source/router.json"));
exports.ROUTER_ABI = router_json_1.default;
const staking_rewards_distribution_json_1 = tslib_1.__importDefault(require("./source/staking-rewards-distribution.json"));
exports.STAKING_REWARDS_DISTRIBUTION_ABI = staking_rewards_distribution_json_1.default;
const staking_rewards_distribution_factory_json_1 = tslib_1.__importDefault(require("./source/staking-rewards-distribution-factory.json"));
exports.STAKING_REWARDS_FACTORY_ABI = staking_rewards_distribution_factory_json_1.default;
const swpr_claimer_json_1 = tslib_1.__importDefault(require("./source/swpr-claimer.json"));
exports.SWPR_CLAIMER_ABI = swpr_claimer_json_1.default;
//# sourceMappingURL=index.js.map