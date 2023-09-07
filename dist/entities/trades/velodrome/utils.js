"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBestRoute = void 0;
const tslib_1 = require("tslib");
const abi_1 = require("@ethersproject/abi");
const contracts_1 = require("@ethersproject/contracts");
const abis_1 = require("../../../abis");
const constants_1 = require("../../../constants");
const utilts_1 = require("../uniswap-v2/utilts");
const abi_2 = require("./abi");
const contants_1 = require("./contants");
function getBestRoute({ currencyIn, currencyOut, amount, provider, chainId, }) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        //fetch assets that are routable
        const routeAssetsResponse = yield fetch('https://api.velodrome.finance/api/v1/routeAssets');
        if (!routeAssetsResponse.ok)
            throw new Error('response not ok');
        const routeAssets = (yield routeAssetsResponse.json()).data;
        const fromAsset = currencyIn;
        const toAsset = currencyOut;
        const fromAmountRaw = amount.raw.toString();
        const fromAmountHex = (0, utilts_1.toHex)(amount);
        if (!fromAsset || !toAsset || !fromAmountRaw || !fromAsset.address || !toAsset.address || fromAmountRaw === '') {
            return null;
        }
        const fromAddress = fromAsset.address;
        const toAddress = toAsset.address;
        let amountOuts = [];
        amountOuts = routeAssets
            .map((routeAsset) => {
            return [
                //pairs with one hop
                {
                    routes: [
                        {
                            from: fromAddress,
                            to: routeAsset.address,
                            stable: true,
                        },
                        {
                            from: routeAsset.address,
                            to: toAddress,
                            stable: true,
                        },
                    ],
                    routeAsset,
                },
                {
                    routes: [
                        {
                            from: fromAddress,
                            to: routeAsset.address,
                            stable: false,
                        },
                        {
                            from: routeAsset.address,
                            to: toAddress,
                            stable: false,
                        },
                    ],
                    routeAsset,
                },
                {
                    routes: [
                        {
                            from: fromAddress,
                            to: routeAsset.address,
                            stable: true,
                        },
                        {
                            from: routeAsset.address,
                            to: toAddress,
                            stable: false,
                        },
                    ],
                    routeAsset,
                },
                {
                    routes: [
                        {
                            from: fromAddress,
                            to: routeAsset.address,
                            stable: false,
                        },
                        {
                            from: routeAsset.address,
                            to: toAddress,
                            stable: true,
                        },
                    ],
                    routeAsset,
                },
                //direct pairs
                {
                    routes: [{ from: fromAddress, to: toAddress, stable: true }],
                    routeAsset: null,
                },
                {
                    routes: [{ from: fromAddress, to: toAddress, stable: false }],
                    routeAsset: null,
                },
            ];
        })
            .flat();
        const velodromRouterInterface = new abi_1.Interface(abi_2.ROUTER_ABI);
        //multicall for fetching output from all given pairs
        const multicall2CallData = amountOuts.map((route) => {
            return {
                target: contants_1.ROUTER_ADDRESS,
                callData: velodromRouterInterface.encodeFunctionData('getAmountsOut', [fromAmountHex, route.routes]),
            };
        });
        const multicallContract = new contracts_1.Contract(constants_1.MULTICALL2_ADDRESS[chainId], abis_1.MULTICALL2_ABI, provider);
        const receiveAmounts = yield multicallContract.callStatic.tryAggregate(false, multicall2CallData);
        //decoding multicall result into digestable form and modifing existing amounts out array
        for (let i = 0; i < receiveAmounts.length; i++) {
            if (receiveAmounts[i].success) {
                const { amounts } = velodromRouterInterface.decodeFunctionResult('getAmountsOut', receiveAmounts[i].returnData);
                amountOuts[i].receiveAmounts = amounts;
                amountOuts[i].finalValue = amounts[amounts.length - 1];
            }
        }
        //comparing routes and returning the best one
        const bestAmountOut = amountOuts
            .filter((ret) => {
            return ret != null;
        })
            .reduce((best, current) => {
            if (!best || !current.finalValue || !best.finalValue) {
                return current;
            }
            return best.finalValue.gt(current.finalValue) ? best : current;
        }, 0);
        return bestAmountOut;
    });
}
exports.getBestRoute = getBestRoute;
//# sourceMappingURL=utils.js.map