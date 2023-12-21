import type { BaseProvider } from '@ethersproject/providers';
import { CurrencyAmount, Percent } from '../../fractions';
import { TradeWithSwapTransaction } from '../interfaces/trade';
import { TradeType } from '../../../constants';
import { Contract, UnsignedTransaction } from 'ethers';
import { TradeOptions } from '../interfaces/trade-options';
export declare const GNOSIS_CONTRACTS: {
    quoter: string;
    router: string;
};
export declare function getPoolsContract(pool_address: string): Contract;
export declare function getRouterContract(): Contract;
export declare function getQuoterContract(): Contract;
interface SwaprV3ConstructorParams {
    maximumSlippage: Percent;
    inputAmount: CurrencyAmount;
    outputAmount: CurrencyAmount;
    tradeType: TradeType;
    chainId: number;
    priceImpact: Percent;
    fee: Percent;
}
export declare class SwaprV3Trade extends TradeWithSwapTransaction {
    constructor({ inputAmount, outputAmount, maximumSlippage, priceImpact, tradeType, chainId, fee, }: SwaprV3ConstructorParams);
    static getQuote({ amount, quoteCurrency, tradeType, recipient, maximumSlippage }: any, provider?: BaseProvider): Promise<SwaprV3Trade | null>;
    minimumAmountOut(): CurrencyAmount;
    maximumAmountIn(): CurrencyAmount;
    swapTransaction(options: TradeOptions): Promise<UnsignedTransaction>;
}
export {};
