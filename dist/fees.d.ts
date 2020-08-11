import { BigintIsh, ChainId } from './constants';
import { Token } from './entities/token';
export declare class Fees {
    static fetchSwapFee(tokenPair: Token, provider?: import("@ethersproject/providers").BaseProvider): Promise<{
        fee: BigintIsh;
        owner: string;
    }>;
    static fetchSwapFees(tokenPairs: Token[], provider?: import("@ethersproject/providers").BaseProvider): Promise<{
        fee: BigintIsh;
        owner: string;
    }[]>;
    static fetchAllSwapFees(chainId: ChainId, swapFeesCache?: {
        [key: string]: {
            fee: BigintIsh;
            owner: string;
        };
    }, provider?: import("@ethersproject/providers").BaseProvider): Promise<{
        [key: string]: {
            fee: BigintIsh;
            owner: string;
        };
    }>;
    static fetchProtocolFee(chainId: ChainId, provider?: import("@ethersproject/providers").BaseProvider): Promise<{
        feeDenominator: BigintIsh;
        feeReceiver: string;
    }>;
}
