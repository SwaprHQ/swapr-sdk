import type { BaseProvider } from '@ethersproject/providers';
import { UnsignedTransaction } from '@ethersproject/transactions';
import { TradeType } from '../../../constants';
import { Currency } from '../../currency';
import { CurrencyAmount, Percent } from '../../fractions';
import { TradeWithSwapTransaction } from '../interfaces/trade';
import { TradeOptions } from '../interfaces/trade-options';
interface SwaprV3ConstructorParams {
    maximumSlippage: Percent;
    inputAmount: CurrencyAmount;
    outputAmount: CurrencyAmount;
    tradeType: TradeType;
    chainId: number;
    priceImpact: Percent;
    fee: Percent;
}
export interface SwaprV3GetQuoteParams {
    amount: CurrencyAmount;
    quoteCurrency: Currency;
    tradeType: TradeType;
    maximumSlippage?: Percent;
    recipient?: string;
}
export declare class SwaprV3Trade extends TradeWithSwapTransaction {
    constructor({ inputAmount, outputAmount, maximumSlippage, priceImpact, tradeType, chainId, fee, }: SwaprV3ConstructorParams);
    static getQuote({ amount, quoteCurrency, tradeType, maximumSlippage }: SwaprV3GetQuoteParams, provider?: BaseProvider): Promise<SwaprV3Trade | null>;
    minimumAmountOut(): CurrencyAmount;
    maximumAmountIn(): CurrencyAmount;
    swapTransaction(options: TradeOptions): Promise<UnsignedTransaction>;
}
export {};
