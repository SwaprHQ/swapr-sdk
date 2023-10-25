"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUniswapV2PairSwapFee = void 0;
const tslib_1 = require("tslib");
const abi_1 = require("@ethersproject/abi");
const contracts_1 = require("@ethersproject/contracts");
const IDXswapPair_json_1 = require("@swapr/core/build/IDXswapPair.json");
const multicall2_json_1 = tslib_1.__importDefault(require("../../../../abis/source/multicall2.json"));
const constants_1 = require("../../../../constants");
const utils_1 = require("../../utils");
/**
 * Given a list of UniswapV2 pair address, it fetches pair fee from the contract via multicall contract
 * @returns the list of pair fee in basis points
 */
function getUniswapV2PairSwapFee({ pairAddressList, chainId, provider, }) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        provider = provider || (0, utils_1.getProvider)(chainId);
        // Fetch the pair reserves via multicall
        const multicallContract = new contracts_1.Contract(constants_1.MULTICALL2_ADDRESS[chainId], multicall2_json_1.default, provider);
        const uniswapPairInterface = new abi_1.Interface(IDXswapPair_json_1.abi);
        const callData = uniswapPairInterface.encodeFunctionData('swapFee', []);
        const swapFeeCallResults = (yield multicallContract.callStatic.tryAggregate(false, pairAddressList.map((target) => ({ target, callData }))));
        // Map the call results to the pair addresses
        return pairAddressList.reduce((acc, pairAddress, index) => {
            const { returnData, success } = swapFeeCallResults[index];
            // Push only the successful call results
            if (success) {
                const [swapFee] = uniswapPairInterface.decodeFunctionResult('swapFee', returnData);
                acc[pairAddress.toLowerCase()] = swapFee;
            }
            return acc;
        }, {});
    });
}
exports.getUniswapV2PairSwapFee = getUniswapV2PairSwapFee;
//# sourceMappingURL=fees.js.map