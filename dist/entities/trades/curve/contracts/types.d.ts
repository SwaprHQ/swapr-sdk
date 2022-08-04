import type { BigNumber, BigNumberish } from '@ethersproject/bignumber';
import type { ChainId } from '../../../../constants';
export interface GetBestPoolAndOutputParams {
    tokenInAddress: string;
    tokenOutAddress: string;
    amountIn: BigNumberish;
    chainId: ChainId;
}
export declare type GetExchangeRoutingInfoParams = GetBestPoolAndOutputParams;
export interface GetBestPoolAndOutputResult {
    expectedAmountOut: BigNumber;
    poolAddress: string;
    registryExchangeAddress: string;
}
export interface GetExchangeRoutingInfoResults {
    routes: string[];
    indices: BigNumber[];
    expectedAmountOut: BigNumber;
}
