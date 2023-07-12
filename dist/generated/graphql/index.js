"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSdk = exports.GetAllCommonPairsBetweenTokenAAndTokenBDocument = exports.PairDetailsFragmentDoc = exports.TokenDetailsFragmentDoc = exports._SubgraphErrorPolicy_ = exports.Withdrawal_OrderBy = exports.User_OrderBy = exports.Transaction_OrderBy = exports.Token_OrderBy = exports.TokenDayData_OrderBy = exports.SwaprStakingRewardsFactory_OrderBy = exports.SwaprFactory_OrderBy = exports.SwaprDayData_OrderBy = exports.Swap_OrderBy = exports.SingleSidedStakingCampaign_OrderBy = exports.SingleSidedStakingCampaignWithdrawal_OrderBy = exports.SingleSidedStakingCampaignReward_OrderBy = exports.SingleSidedStakingCampaignRecovery_OrderBy = exports.SingleSidedStakingCampaignPosition_OrderBy = exports.SingleSidedStakingCampaignDeposit_OrderBy = exports.SingleSidedStakingCampaignClaim_OrderBy = exports.Recovery_OrderBy = exports.Pair_OrderBy = exports.PairHourData_OrderBy = exports.PairDayData_OrderBy = exports.OrderDirection = exports.Mint_OrderBy = exports.LiquidityPosition_OrderBy = exports.LiquidityPositionSnapshot_OrderBy = exports.LiquidityMiningPosition_OrderBy = exports.LiquidityMiningPositionSnapshot_OrderBy = exports.LiquidityMiningCampaign_OrderBy = exports.LiquidityMiningCampaignReward_OrderBy = exports.Deposit_OrderBy = exports.Claim_OrderBy = exports.Burn_OrderBy = exports.Bundle_OrderBy = void 0;
const tslib_1 = require("tslib");
const graphql_tag_1 = tslib_1.__importDefault(require("graphql-tag"));
var Bundle_OrderBy;
(function (Bundle_OrderBy) {
    Bundle_OrderBy["Id"] = "id";
    Bundle_OrderBy["NativeCurrencyPrice"] = "nativeCurrencyPrice";
})(Bundle_OrderBy = exports.Bundle_OrderBy || (exports.Bundle_OrderBy = {}));
var Burn_OrderBy;
(function (Burn_OrderBy) {
    Burn_OrderBy["Amount0"] = "amount0";
    Burn_OrderBy["Amount1"] = "amount1";
    Burn_OrderBy["AmountUsd"] = "amountUSD";
    Burn_OrderBy["FeeLiquidity"] = "feeLiquidity";
    Burn_OrderBy["FeeTo"] = "feeTo";
    Burn_OrderBy["Id"] = "id";
    Burn_OrderBy["Liquidity"] = "liquidity";
    Burn_OrderBy["LogIndex"] = "logIndex";
    Burn_OrderBy["NeedsComplete"] = "needsComplete";
    Burn_OrderBy["Pair"] = "pair";
    Burn_OrderBy["Sender"] = "sender";
    Burn_OrderBy["Timestamp"] = "timestamp";
    Burn_OrderBy["To"] = "to";
    Burn_OrderBy["Transaction"] = "transaction";
})(Burn_OrderBy = exports.Burn_OrderBy || (exports.Burn_OrderBy = {}));
var Claim_OrderBy;
(function (Claim_OrderBy) {
    Claim_OrderBy["Amounts"] = "amounts";
    Claim_OrderBy["Id"] = "id";
    Claim_OrderBy["LiquidityMiningCampaign"] = "liquidityMiningCampaign";
    Claim_OrderBy["Timestamp"] = "timestamp";
    Claim_OrderBy["User"] = "user";
})(Claim_OrderBy = exports.Claim_OrderBy || (exports.Claim_OrderBy = {}));
var Deposit_OrderBy;
(function (Deposit_OrderBy) {
    Deposit_OrderBy["Amount"] = "amount";
    Deposit_OrderBy["Id"] = "id";
    Deposit_OrderBy["LiquidityMiningCampaign"] = "liquidityMiningCampaign";
    Deposit_OrderBy["Timestamp"] = "timestamp";
    Deposit_OrderBy["User"] = "user";
})(Deposit_OrderBy = exports.Deposit_OrderBy || (exports.Deposit_OrderBy = {}));
var LiquidityMiningCampaignReward_OrderBy;
(function (LiquidityMiningCampaignReward_OrderBy) {
    LiquidityMiningCampaignReward_OrderBy["Amount"] = "amount";
    LiquidityMiningCampaignReward_OrderBy["Id"] = "id";
    LiquidityMiningCampaignReward_OrderBy["Token"] = "token";
})(LiquidityMiningCampaignReward_OrderBy = exports.LiquidityMiningCampaignReward_OrderBy || (exports.LiquidityMiningCampaignReward_OrderBy = {}));
var LiquidityMiningCampaign_OrderBy;
(function (LiquidityMiningCampaign_OrderBy) {
    LiquidityMiningCampaign_OrderBy["Claims"] = "claims";
    LiquidityMiningCampaign_OrderBy["Deposits"] = "deposits";
    LiquidityMiningCampaign_OrderBy["Duration"] = "duration";
    LiquidityMiningCampaign_OrderBy["EndsAt"] = "endsAt";
    LiquidityMiningCampaign_OrderBy["Id"] = "id";
    LiquidityMiningCampaign_OrderBy["Initialized"] = "initialized";
    LiquidityMiningCampaign_OrderBy["LiquidityMiningPositionSnapshots"] = "liquidityMiningPositionSnapshots";
    LiquidityMiningCampaign_OrderBy["LiquidityMiningPositions"] = "liquidityMiningPositions";
    LiquidityMiningCampaign_OrderBy["Locked"] = "locked";
    LiquidityMiningCampaign_OrderBy["Owner"] = "owner";
    LiquidityMiningCampaign_OrderBy["Recoveries"] = "recoveries";
    LiquidityMiningCampaign_OrderBy["Rewards"] = "rewards";
    LiquidityMiningCampaign_OrderBy["StakablePair"] = "stakablePair";
    LiquidityMiningCampaign_OrderBy["StakedAmount"] = "stakedAmount";
    LiquidityMiningCampaign_OrderBy["StakingCap"] = "stakingCap";
    LiquidityMiningCampaign_OrderBy["StartsAt"] = "startsAt";
    LiquidityMiningCampaign_OrderBy["Withdrawals"] = "withdrawals";
})(LiquidityMiningCampaign_OrderBy = exports.LiquidityMiningCampaign_OrderBy || (exports.LiquidityMiningCampaign_OrderBy = {}));
var LiquidityMiningPositionSnapshot_OrderBy;
(function (LiquidityMiningPositionSnapshot_OrderBy) {
    LiquidityMiningPositionSnapshot_OrderBy["Block"] = "block";
    LiquidityMiningPositionSnapshot_OrderBy["Id"] = "id";
    LiquidityMiningPositionSnapshot_OrderBy["LiquidityMiningCampaign"] = "liquidityMiningCampaign";
    LiquidityMiningPositionSnapshot_OrderBy["LiquidityMiningPosition"] = "liquidityMiningPosition";
    LiquidityMiningPositionSnapshot_OrderBy["Pair"] = "pair";
    LiquidityMiningPositionSnapshot_OrderBy["Reserve0"] = "reserve0";
    LiquidityMiningPositionSnapshot_OrderBy["Reserve1"] = "reserve1";
    LiquidityMiningPositionSnapshot_OrderBy["ReserveUsd"] = "reserveUSD";
    LiquidityMiningPositionSnapshot_OrderBy["StakedLiquidityTokenBalance"] = "stakedLiquidityTokenBalance";
    LiquidityMiningPositionSnapshot_OrderBy["Timestamp"] = "timestamp";
    LiquidityMiningPositionSnapshot_OrderBy["Token0PriceUsd"] = "token0PriceUSD";
    LiquidityMiningPositionSnapshot_OrderBy["Token1PriceUsd"] = "token1PriceUSD";
    LiquidityMiningPositionSnapshot_OrderBy["TotalStakedLiquidityToken"] = "totalStakedLiquidityToken";
    LiquidityMiningPositionSnapshot_OrderBy["User"] = "user";
})(LiquidityMiningPositionSnapshot_OrderBy = exports.LiquidityMiningPositionSnapshot_OrderBy || (exports.LiquidityMiningPositionSnapshot_OrderBy = {}));
var LiquidityMiningPosition_OrderBy;
(function (LiquidityMiningPosition_OrderBy) {
    LiquidityMiningPosition_OrderBy["Id"] = "id";
    LiquidityMiningPosition_OrderBy["LiquidityMiningCampaign"] = "liquidityMiningCampaign";
    LiquidityMiningPosition_OrderBy["StakedAmount"] = "stakedAmount";
    LiquidityMiningPosition_OrderBy["TargetedPair"] = "targetedPair";
    LiquidityMiningPosition_OrderBy["User"] = "user";
})(LiquidityMiningPosition_OrderBy = exports.LiquidityMiningPosition_OrderBy || (exports.LiquidityMiningPosition_OrderBy = {}));
var LiquidityPositionSnapshot_OrderBy;
(function (LiquidityPositionSnapshot_OrderBy) {
    LiquidityPositionSnapshot_OrderBy["Block"] = "block";
    LiquidityPositionSnapshot_OrderBy["Id"] = "id";
    LiquidityPositionSnapshot_OrderBy["LiquidityPosition"] = "liquidityPosition";
    LiquidityPositionSnapshot_OrderBy["LiquidityTokenBalance"] = "liquidityTokenBalance";
    LiquidityPositionSnapshot_OrderBy["LiquidityTokenTotalSupply"] = "liquidityTokenTotalSupply";
    LiquidityPositionSnapshot_OrderBy["Pair"] = "pair";
    LiquidityPositionSnapshot_OrderBy["Reserve0"] = "reserve0";
    LiquidityPositionSnapshot_OrderBy["Reserve1"] = "reserve1";
    LiquidityPositionSnapshot_OrderBy["ReserveUsd"] = "reserveUSD";
    LiquidityPositionSnapshot_OrderBy["Timestamp"] = "timestamp";
    LiquidityPositionSnapshot_OrderBy["Token0PriceUsd"] = "token0PriceUSD";
    LiquidityPositionSnapshot_OrderBy["Token1PriceUsd"] = "token1PriceUSD";
    LiquidityPositionSnapshot_OrderBy["User"] = "user";
})(LiquidityPositionSnapshot_OrderBy = exports.LiquidityPositionSnapshot_OrderBy || (exports.LiquidityPositionSnapshot_OrderBy = {}));
var LiquidityPosition_OrderBy;
(function (LiquidityPosition_OrderBy) {
    LiquidityPosition_OrderBy["Id"] = "id";
    LiquidityPosition_OrderBy["LiquidityTokenBalance"] = "liquidityTokenBalance";
    LiquidityPosition_OrderBy["Pair"] = "pair";
    LiquidityPosition_OrderBy["User"] = "user";
})(LiquidityPosition_OrderBy = exports.LiquidityPosition_OrderBy || (exports.LiquidityPosition_OrderBy = {}));
var Mint_OrderBy;
(function (Mint_OrderBy) {
    Mint_OrderBy["Amount0"] = "amount0";
    Mint_OrderBy["Amount1"] = "amount1";
    Mint_OrderBy["AmountUsd"] = "amountUSD";
    Mint_OrderBy["FeeLiquidity"] = "feeLiquidity";
    Mint_OrderBy["FeeTo"] = "feeTo";
    Mint_OrderBy["Id"] = "id";
    Mint_OrderBy["Liquidity"] = "liquidity";
    Mint_OrderBy["LogIndex"] = "logIndex";
    Mint_OrderBy["Pair"] = "pair";
    Mint_OrderBy["Sender"] = "sender";
    Mint_OrderBy["Timestamp"] = "timestamp";
    Mint_OrderBy["To"] = "to";
    Mint_OrderBy["Transaction"] = "transaction";
})(Mint_OrderBy = exports.Mint_OrderBy || (exports.Mint_OrderBy = {}));
/** Defines the order direction, either ascending or descending */
var OrderDirection;
(function (OrderDirection) {
    OrderDirection["Asc"] = "asc";
    OrderDirection["Desc"] = "desc";
})(OrderDirection = exports.OrderDirection || (exports.OrderDirection = {}));
var PairDayData_OrderBy;
(function (PairDayData_OrderBy) {
    PairDayData_OrderBy["DailyTxns"] = "dailyTxns";
    PairDayData_OrderBy["DailyVolumeToken0"] = "dailyVolumeToken0";
    PairDayData_OrderBy["DailyVolumeToken1"] = "dailyVolumeToken1";
    PairDayData_OrderBy["DailyVolumeUsd"] = "dailyVolumeUSD";
    PairDayData_OrderBy["Date"] = "date";
    PairDayData_OrderBy["Id"] = "id";
    PairDayData_OrderBy["PairAddress"] = "pairAddress";
    PairDayData_OrderBy["Reserve0"] = "reserve0";
    PairDayData_OrderBy["Reserve1"] = "reserve1";
    PairDayData_OrderBy["ReserveUsd"] = "reserveUSD";
    PairDayData_OrderBy["Token0"] = "token0";
    PairDayData_OrderBy["Token1"] = "token1";
    PairDayData_OrderBy["TotalSupply"] = "totalSupply";
})(PairDayData_OrderBy = exports.PairDayData_OrderBy || (exports.PairDayData_OrderBy = {}));
var PairHourData_OrderBy;
(function (PairHourData_OrderBy) {
    PairHourData_OrderBy["HourStartUnix"] = "hourStartUnix";
    PairHourData_OrderBy["HourlyTxns"] = "hourlyTxns";
    PairHourData_OrderBy["HourlyVolumeToken0"] = "hourlyVolumeToken0";
    PairHourData_OrderBy["HourlyVolumeToken1"] = "hourlyVolumeToken1";
    PairHourData_OrderBy["HourlyVolumeUsd"] = "hourlyVolumeUSD";
    PairHourData_OrderBy["Id"] = "id";
    PairHourData_OrderBy["Pair"] = "pair";
    PairHourData_OrderBy["Reserve0"] = "reserve0";
    PairHourData_OrderBy["Reserve1"] = "reserve1";
    PairHourData_OrderBy["ReserveUsd"] = "reserveUSD";
})(PairHourData_OrderBy = exports.PairHourData_OrderBy || (exports.PairHourData_OrderBy = {}));
var Pair_OrderBy;
(function (Pair_OrderBy) {
    Pair_OrderBy["Burns"] = "burns";
    Pair_OrderBy["CreatedAtBlockNumber"] = "createdAtBlockNumber";
    Pair_OrderBy["CreatedAtTimestamp"] = "createdAtTimestamp";
    Pair_OrderBy["Id"] = "id";
    Pair_OrderBy["LiquidityMiningCampaigns"] = "liquidityMiningCampaigns";
    Pair_OrderBy["LiquidityPositionSnapshots"] = "liquidityPositionSnapshots";
    Pair_OrderBy["LiquidityPositions"] = "liquidityPositions";
    Pair_OrderBy["LiquidityProviderCount"] = "liquidityProviderCount";
    Pair_OrderBy["Mints"] = "mints";
    Pair_OrderBy["PairHourData"] = "pairHourData";
    Pair_OrderBy["Reserve0"] = "reserve0";
    Pair_OrderBy["Reserve1"] = "reserve1";
    Pair_OrderBy["ReserveNativeCurrency"] = "reserveNativeCurrency";
    Pair_OrderBy["ReserveUsd"] = "reserveUSD";
    Pair_OrderBy["Swaps"] = "swaps";
    Pair_OrderBy["Token0"] = "token0";
    Pair_OrderBy["Token0Price"] = "token0Price";
    Pair_OrderBy["Token1"] = "token1";
    Pair_OrderBy["Token1Price"] = "token1Price";
    Pair_OrderBy["TotalSupply"] = "totalSupply";
    Pair_OrderBy["TrackedReserveNativeCurrency"] = "trackedReserveNativeCurrency";
    Pair_OrderBy["TxCount"] = "txCount";
    Pair_OrderBy["UntrackedVolumeUsd"] = "untrackedVolumeUSD";
    Pair_OrderBy["VolumeToken0"] = "volumeToken0";
    Pair_OrderBy["VolumeToken1"] = "volumeToken1";
    Pair_OrderBy["VolumeUsd"] = "volumeUSD";
})(Pair_OrderBy = exports.Pair_OrderBy || (exports.Pair_OrderBy = {}));
var Recovery_OrderBy;
(function (Recovery_OrderBy) {
    Recovery_OrderBy["Amounts"] = "amounts";
    Recovery_OrderBy["Id"] = "id";
    Recovery_OrderBy["LiquidityMiningCampaign"] = "liquidityMiningCampaign";
    Recovery_OrderBy["Timestamp"] = "timestamp";
})(Recovery_OrderBy = exports.Recovery_OrderBy || (exports.Recovery_OrderBy = {}));
var SingleSidedStakingCampaignClaim_OrderBy;
(function (SingleSidedStakingCampaignClaim_OrderBy) {
    SingleSidedStakingCampaignClaim_OrderBy["Amounts"] = "amounts";
    SingleSidedStakingCampaignClaim_OrderBy["Id"] = "id";
    SingleSidedStakingCampaignClaim_OrderBy["SingleSidedStakingCampaign"] = "singleSidedStakingCampaign";
    SingleSidedStakingCampaignClaim_OrderBy["Timestamp"] = "timestamp";
    SingleSidedStakingCampaignClaim_OrderBy["User"] = "user";
})(SingleSidedStakingCampaignClaim_OrderBy = exports.SingleSidedStakingCampaignClaim_OrderBy || (exports.SingleSidedStakingCampaignClaim_OrderBy = {}));
var SingleSidedStakingCampaignDeposit_OrderBy;
(function (SingleSidedStakingCampaignDeposit_OrderBy) {
    SingleSidedStakingCampaignDeposit_OrderBy["Amount"] = "amount";
    SingleSidedStakingCampaignDeposit_OrderBy["Id"] = "id";
    SingleSidedStakingCampaignDeposit_OrderBy["SingleSidedStakingCampaign"] = "singleSidedStakingCampaign";
    SingleSidedStakingCampaignDeposit_OrderBy["Timestamp"] = "timestamp";
    SingleSidedStakingCampaignDeposit_OrderBy["User"] = "user";
})(SingleSidedStakingCampaignDeposit_OrderBy = exports.SingleSidedStakingCampaignDeposit_OrderBy || (exports.SingleSidedStakingCampaignDeposit_OrderBy = {}));
var SingleSidedStakingCampaignPosition_OrderBy;
(function (SingleSidedStakingCampaignPosition_OrderBy) {
    SingleSidedStakingCampaignPosition_OrderBy["Id"] = "id";
    SingleSidedStakingCampaignPosition_OrderBy["SingleSidedStakingCampaign"] = "singleSidedStakingCampaign";
    SingleSidedStakingCampaignPosition_OrderBy["StakedAmount"] = "stakedAmount";
    SingleSidedStakingCampaignPosition_OrderBy["User"] = "user";
})(SingleSidedStakingCampaignPosition_OrderBy = exports.SingleSidedStakingCampaignPosition_OrderBy || (exports.SingleSidedStakingCampaignPosition_OrderBy = {}));
var SingleSidedStakingCampaignRecovery_OrderBy;
(function (SingleSidedStakingCampaignRecovery_OrderBy) {
    SingleSidedStakingCampaignRecovery_OrderBy["Amounts"] = "amounts";
    SingleSidedStakingCampaignRecovery_OrderBy["Id"] = "id";
    SingleSidedStakingCampaignRecovery_OrderBy["SingleSidedStakingCampaign"] = "singleSidedStakingCampaign";
    SingleSidedStakingCampaignRecovery_OrderBy["Timestamp"] = "timestamp";
})(SingleSidedStakingCampaignRecovery_OrderBy = exports.SingleSidedStakingCampaignRecovery_OrderBy || (exports.SingleSidedStakingCampaignRecovery_OrderBy = {}));
var SingleSidedStakingCampaignReward_OrderBy;
(function (SingleSidedStakingCampaignReward_OrderBy) {
    SingleSidedStakingCampaignReward_OrderBy["Amount"] = "amount";
    SingleSidedStakingCampaignReward_OrderBy["Id"] = "id";
    SingleSidedStakingCampaignReward_OrderBy["Token"] = "token";
})(SingleSidedStakingCampaignReward_OrderBy = exports.SingleSidedStakingCampaignReward_OrderBy || (exports.SingleSidedStakingCampaignReward_OrderBy = {}));
var SingleSidedStakingCampaignWithdrawal_OrderBy;
(function (SingleSidedStakingCampaignWithdrawal_OrderBy) {
    SingleSidedStakingCampaignWithdrawal_OrderBy["Amount"] = "amount";
    SingleSidedStakingCampaignWithdrawal_OrderBy["Id"] = "id";
    SingleSidedStakingCampaignWithdrawal_OrderBy["SingleSidedStakingCampaign"] = "singleSidedStakingCampaign";
    SingleSidedStakingCampaignWithdrawal_OrderBy["Timestamp"] = "timestamp";
    SingleSidedStakingCampaignWithdrawal_OrderBy["User"] = "user";
})(SingleSidedStakingCampaignWithdrawal_OrderBy = exports.SingleSidedStakingCampaignWithdrawal_OrderBy || (exports.SingleSidedStakingCampaignWithdrawal_OrderBy = {}));
var SingleSidedStakingCampaign_OrderBy;
(function (SingleSidedStakingCampaign_OrderBy) {
    SingleSidedStakingCampaign_OrderBy["Claims"] = "claims";
    SingleSidedStakingCampaign_OrderBy["Deposits"] = "deposits";
    SingleSidedStakingCampaign_OrderBy["Duration"] = "duration";
    SingleSidedStakingCampaign_OrderBy["EndsAt"] = "endsAt";
    SingleSidedStakingCampaign_OrderBy["Id"] = "id";
    SingleSidedStakingCampaign_OrderBy["Initialized"] = "initialized";
    SingleSidedStakingCampaign_OrderBy["Locked"] = "locked";
    SingleSidedStakingCampaign_OrderBy["Owner"] = "owner";
    SingleSidedStakingCampaign_OrderBy["Recoveries"] = "recoveries";
    SingleSidedStakingCampaign_OrderBy["Rewards"] = "rewards";
    SingleSidedStakingCampaign_OrderBy["SingleSidedStakingPositions"] = "singleSidedStakingPositions";
    SingleSidedStakingCampaign_OrderBy["StakeToken"] = "stakeToken";
    SingleSidedStakingCampaign_OrderBy["StakedAmount"] = "stakedAmount";
    SingleSidedStakingCampaign_OrderBy["StakingCap"] = "stakingCap";
    SingleSidedStakingCampaign_OrderBy["StartsAt"] = "startsAt";
    SingleSidedStakingCampaign_OrderBy["Withdrawals"] = "withdrawals";
})(SingleSidedStakingCampaign_OrderBy = exports.SingleSidedStakingCampaign_OrderBy || (exports.SingleSidedStakingCampaign_OrderBy = {}));
var Swap_OrderBy;
(function (Swap_OrderBy) {
    Swap_OrderBy["Amount0In"] = "amount0In";
    Swap_OrderBy["Amount0Out"] = "amount0Out";
    Swap_OrderBy["Amount1In"] = "amount1In";
    Swap_OrderBy["Amount1Out"] = "amount1Out";
    Swap_OrderBy["AmountUsd"] = "amountUSD";
    Swap_OrderBy["From"] = "from";
    Swap_OrderBy["Id"] = "id";
    Swap_OrderBy["LogIndex"] = "logIndex";
    Swap_OrderBy["Pair"] = "pair";
    Swap_OrderBy["Sender"] = "sender";
    Swap_OrderBy["Timestamp"] = "timestamp";
    Swap_OrderBy["To"] = "to";
    Swap_OrderBy["Transaction"] = "transaction";
})(Swap_OrderBy = exports.Swap_OrderBy || (exports.Swap_OrderBy = {}));
var SwaprDayData_OrderBy;
(function (SwaprDayData_OrderBy) {
    SwaprDayData_OrderBy["DailyVolumeNativeCurrency"] = "dailyVolumeNativeCurrency";
    SwaprDayData_OrderBy["DailyVolumeUsd"] = "dailyVolumeUSD";
    SwaprDayData_OrderBy["DailyVolumeUntracked"] = "dailyVolumeUntracked";
    SwaprDayData_OrderBy["Date"] = "date";
    SwaprDayData_OrderBy["Id"] = "id";
    SwaprDayData_OrderBy["TotalLiquidityNativeCurrency"] = "totalLiquidityNativeCurrency";
    SwaprDayData_OrderBy["TotalLiquidityUsd"] = "totalLiquidityUSD";
    SwaprDayData_OrderBy["TotalVolumeNativeCurrency"] = "totalVolumeNativeCurrency";
    SwaprDayData_OrderBy["TotalVolumeUsd"] = "totalVolumeUSD";
    SwaprDayData_OrderBy["TxCount"] = "txCount";
})(SwaprDayData_OrderBy = exports.SwaprDayData_OrderBy || (exports.SwaprDayData_OrderBy = {}));
var SwaprFactory_OrderBy;
(function (SwaprFactory_OrderBy) {
    SwaprFactory_OrderBy["Id"] = "id";
    SwaprFactory_OrderBy["PairCount"] = "pairCount";
    SwaprFactory_OrderBy["TotalLiquidityNativeCurrency"] = "totalLiquidityNativeCurrency";
    SwaprFactory_OrderBy["TotalLiquidityUsd"] = "totalLiquidityUSD";
    SwaprFactory_OrderBy["TotalVolumeNativeCurrency"] = "totalVolumeNativeCurrency";
    SwaprFactory_OrderBy["TotalVolumeUsd"] = "totalVolumeUSD";
    SwaprFactory_OrderBy["TxCount"] = "txCount";
    SwaprFactory_OrderBy["UntrackedVolumeUsd"] = "untrackedVolumeUSD";
})(SwaprFactory_OrderBy = exports.SwaprFactory_OrderBy || (exports.SwaprFactory_OrderBy = {}));
var SwaprStakingRewardsFactory_OrderBy;
(function (SwaprStakingRewardsFactory_OrderBy) {
    SwaprStakingRewardsFactory_OrderBy["Id"] = "id";
    SwaprStakingRewardsFactory_OrderBy["InitializedCampaignsCount"] = "initializedCampaignsCount";
})(SwaprStakingRewardsFactory_OrderBy = exports.SwaprStakingRewardsFactory_OrderBy || (exports.SwaprStakingRewardsFactory_OrderBy = {}));
var TokenDayData_OrderBy;
(function (TokenDayData_OrderBy) {
    TokenDayData_OrderBy["DailyTxns"] = "dailyTxns";
    TokenDayData_OrderBy["DailyVolumeNativeCurrency"] = "dailyVolumeNativeCurrency";
    TokenDayData_OrderBy["DailyVolumeToken"] = "dailyVolumeToken";
    TokenDayData_OrderBy["DailyVolumeUsd"] = "dailyVolumeUSD";
    TokenDayData_OrderBy["Date"] = "date";
    TokenDayData_OrderBy["Id"] = "id";
    TokenDayData_OrderBy["PriceUsd"] = "priceUSD";
    TokenDayData_OrderBy["Token"] = "token";
    TokenDayData_OrderBy["TotalLiquidityNativeCurrency"] = "totalLiquidityNativeCurrency";
    TokenDayData_OrderBy["TotalLiquidityToken"] = "totalLiquidityToken";
    TokenDayData_OrderBy["TotalLiquidityUsd"] = "totalLiquidityUSD";
})(TokenDayData_OrderBy = exports.TokenDayData_OrderBy || (exports.TokenDayData_OrderBy = {}));
var Token_OrderBy;
(function (Token_OrderBy) {
    Token_OrderBy["Decimals"] = "decimals";
    Token_OrderBy["DerivedNativeCurrency"] = "derivedNativeCurrency";
    Token_OrderBy["Id"] = "id";
    Token_OrderBy["Name"] = "name";
    Token_OrderBy["PairBase"] = "pairBase";
    Token_OrderBy["PairDayDataBase"] = "pairDayDataBase";
    Token_OrderBy["PairDayDataQuote"] = "pairDayDataQuote";
    Token_OrderBy["PairQuote"] = "pairQuote";
    Token_OrderBy["Symbol"] = "symbol";
    Token_OrderBy["TokenDayData"] = "tokenDayData";
    Token_OrderBy["TotalLiquidity"] = "totalLiquidity";
    Token_OrderBy["TotalSupply"] = "totalSupply";
    Token_OrderBy["TradeVolume"] = "tradeVolume";
    Token_OrderBy["TradeVolumeUsd"] = "tradeVolumeUSD";
    Token_OrderBy["TxCount"] = "txCount";
    Token_OrderBy["UntrackedVolumeUsd"] = "untrackedVolumeUSD";
    Token_OrderBy["WhitelistPairs"] = "whitelistPairs";
})(Token_OrderBy = exports.Token_OrderBy || (exports.Token_OrderBy = {}));
var Transaction_OrderBy;
(function (Transaction_OrderBy) {
    Transaction_OrderBy["BlockNumber"] = "blockNumber";
    Transaction_OrderBy["Burns"] = "burns";
    Transaction_OrderBy["Id"] = "id";
    Transaction_OrderBy["Mints"] = "mints";
    Transaction_OrderBy["Swaps"] = "swaps";
    Transaction_OrderBy["Timestamp"] = "timestamp";
})(Transaction_OrderBy = exports.Transaction_OrderBy || (exports.Transaction_OrderBy = {}));
var User_OrderBy;
(function (User_OrderBy) {
    User_OrderBy["Id"] = "id";
    User_OrderBy["LiquidityPositions"] = "liquidityPositions";
    User_OrderBy["UsdSwapped"] = "usdSwapped";
})(User_OrderBy = exports.User_OrderBy || (exports.User_OrderBy = {}));
var Withdrawal_OrderBy;
(function (Withdrawal_OrderBy) {
    Withdrawal_OrderBy["Amount"] = "amount";
    Withdrawal_OrderBy["Id"] = "id";
    Withdrawal_OrderBy["LiquidityMiningCampaign"] = "liquidityMiningCampaign";
    Withdrawal_OrderBy["Timestamp"] = "timestamp";
    Withdrawal_OrderBy["User"] = "user";
})(Withdrawal_OrderBy = exports.Withdrawal_OrderBy || (exports.Withdrawal_OrderBy = {}));
var _SubgraphErrorPolicy_;
(function (_SubgraphErrorPolicy_) {
    /** Data will be returned even if the subgraph has indexing errors */
    _SubgraphErrorPolicy_["Allow"] = "allow";
    /** If the subgraph has indexing errors, data will be omitted. The default. */
    _SubgraphErrorPolicy_["Deny"] = "deny";
})(_SubgraphErrorPolicy_ = exports._SubgraphErrorPolicy_ || (exports._SubgraphErrorPolicy_ = {}));
exports.TokenDetailsFragmentDoc = (0, graphql_tag_1.default) `
  fragment TokenDetails on Token {
    id
    name
    symbol
    decimals
  }
`;
exports.PairDetailsFragmentDoc = (0, graphql_tag_1.default) `
  fragment PairDetails on Pair {
    id
    reserve0
    reserve1
    token0 {
      ...TokenDetails
    }
    token1 {
      ...TokenDetails
    }
  }
  ${exports.TokenDetailsFragmentDoc}
`;
exports.GetAllCommonPairsBetweenTokenAAndTokenBDocument = (0, graphql_tag_1.default) `
  query GetAllCommonPairsBetweenTokenAAndTokenB($tokenA: String!, $tokenB: String!) {
    pairsWithTokenA: pairs(where: { token0_in: [$tokenA, $tokenB] }) {
      ...PairDetails
    }
    pairsWithTokenB: pairs(where: { token1_in: [$tokenB, $tokenA] }) {
      ...PairDetails
    }
  }
  ${exports.PairDetailsFragmentDoc}
`;
const defaultWrapper = (action, _operationName, _operationType) => action();
function getSdk(client, withWrapper = defaultWrapper) {
    return {
        GetAllCommonPairsBetweenTokenAAndTokenB(variables, requestHeaders) {
            return withWrapper((wrappedRequestHeaders) => client.request(exports.GetAllCommonPairsBetweenTokenAAndTokenBDocument, variables, Object.assign(Object.assign({}, requestHeaders), wrappedRequestHeaders)), 'GetAllCommonPairsBetweenTokenAAndTokenB', 'query');
        },
    };
}
exports.getSdk = getSdk;
//# sourceMappingURL=index.js.map