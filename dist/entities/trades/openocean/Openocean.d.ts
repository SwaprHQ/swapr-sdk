import { BaseProvider } from '@ethersproject/providers';
import { UnsignedTransaction } from '@ethersproject/transactions';
import { ChainId, TradeType } from '../../../constants';
import { Currency } from '../../currency';
import { CurrencyAmount, Percent } from '../../fractions';
import { Trade } from '../interfaces/trade';
import { TradeOptions } from '../interfaces/trade-options';
export interface OpenoceanQuoteTypes {
    amount: CurrencyAmount;
    quoteCurrency: Currency;
    tradeType: TradeType;
    maximumSlippage?: Percent;
    recipient?: string;
}
interface OpenoceanConstructorParams {
    maximumSlippage: Percent;
    inputAmount: CurrencyAmount;
    outputAmount: CurrencyAmount;
    tradeType: TradeType;
    chainId: ChainId;
    approveAddress: string;
    priceImpact: Percent;
}
export declare class OpenoceanTrade extends Trade {
    constructor({ maximumSlippage, inputAmount, outputAmount, tradeType, chainId, approveAddress, priceImpact, }: OpenoceanConstructorParams);
    private static getGas;
    static getQuote({ amount, quoteCurrency, maximumSlippage, tradeType }: OpenoceanQuoteTypes, provider?: BaseProvider): Promise<OpenoceanTrade | null>;
    minimumAmountOut(): CurrencyAmount;
    maximumAmountIn(): CurrencyAmount;
    /**
     * Returns unsigned transaction for the trade
     * @returns the unsigned transaction
     */
    swapTransaction(options: TradeOptions): Promise<UnsignedTransaction>;
}
export {};
