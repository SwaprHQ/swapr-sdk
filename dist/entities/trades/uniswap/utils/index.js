"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.encodeRecipient = void 0;
const tslib_1 = require("tslib");
const abi_1 = require("@ethersproject/abi");
const ethers_1 = require("ethers");
const constants_1 = require("../../../../constants");
const abi_2 = require("../abi");
tslib_1.__exportStar(require("./nativeCurrency"), exports);
function encodeRecipient(tradeType, recipient, callData) {
    if (!callData)
        return undefined;
    const routerFunction = tradeType === constants_1.TradeType.EXACT_INPUT ? 'exactInputSingle' : 'exactOutputSingle';
    const routerInterface = new abi_1.Interface(abi_2.UNISWAP_ROUTER_ABI);
    const data = routerInterface.decodeFunctionData('multicall(uint256,bytes[])', callData);
    const decodedData = routerInterface.decodeFunctionData(routerFunction, data.data[0]);
    const { params } = decodedData;
    console.log('params', params);
    console.log('decodedData', decodedData[0]);
    console.log('pure', decodedData);
    const routerFunctionCallData = routerInterface.encodeFunctionData(routerFunction, [
        [
            params.tokenIn,
            params.tokenOut,
            params.fee,
            recipient,
            //amountIn or amountOut
            decodedData[0][4].toString(),
            //amountInMaximum or amountOutMaximum
            decodedData[0][5].toString(),
            params.sqrtPriceLimitX96.toString(),
        ],
    ]);
    const dataFormatted = ethers_1.ethers.utils.arrayify(routerFunctionCallData);
    const newEncodedCallData = routerInterface.encodeFunctionData('multicall(uint256,bytes[])', [
        data.deadline.toString(),
        [dataFormatted],
    ]);
    return newEncodedCallData;
}
exports.encodeRecipient = encodeRecipient;
//# sourceMappingURL=index.js.map