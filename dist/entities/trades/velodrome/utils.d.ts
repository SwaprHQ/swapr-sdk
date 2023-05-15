import { BigNumber } from '@ethersproject/bignumber';
import { ChainId } from '../../../constants';
import { CurrencyAmount } from '../../fractions';
import { Token } from '../../token';
interface GetBestRoutesParams {
    currencyIn: Token;
    currencyOut: Token;
    amount: CurrencyAmount;
    provider: any;
    chainId: ChainId;
}
interface BestRoute {
    finalValue: BigNumber;
    receiveAmounts: BigNumber[];
    routes: {
        from: string;
        to: string;
        stable: boolean;
    }[];
    routeAsset: any;
}
export declare function getBestRoute({ currencyIn, currencyOut, amount, provider, chainId, }: GetBestRoutesParams): Promise<BestRoute | null>;
export {};
