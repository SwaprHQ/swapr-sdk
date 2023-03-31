import { BigNumber } from '@ethersproject/bignumber';
import { BaseProvider } from '@ethersproject/providers';
import { UnsignedTransaction } from '@ethersproject/transactions';
import { ChainId, TradeType } from '../../../constants';
import { Currency } from '../../currency';
import { CurrencyAmount, Percent } from '../../fractions';
import { Trade } from '../interfaces/trade';
import { TradeOptions } from '../interfaces/trade-options';
export interface OneInchQuoteTypes {
    amount: CurrencyAmount;
    quoteCurrency: Currency;
    tradeType: TradeType;
    maximumSlippage?: Percent;
    recipient?: string;
}
interface ExtentendedTradeOptions extends TradeOptions {
    account: string;
}
interface OneInchConstructorParams {
    maximumSlippage: Percent;
    currencyAmountIn: CurrencyAmount;
    currencyAmountOut: CurrencyAmount;
    tradeType: TradeType;
    chainId: ChainId;
    approveAddress: string;
    estimatedGas: BigNumber;
}
/**
 * 1Inch trade
 */
export declare class OneInchTrade extends Trade {
    constructor({ maximumSlippage, currencyAmountIn, currencyAmountOut, tradeType, chainId, approveAddress, estimatedGas, }: OneInchConstructorParams);
    static getQuote({ amount, quoteCurrency, tradeType, maximumSlippage }: OneInchQuoteTypes, provider?: BaseProvider): Promise<OneInchTrade | null>;
    minimumAmountOut(): CurrencyAmount;
    maximumAmountIn(): CurrencyAmount;
    /**
     * Returns unsigned transaction for the trade
     * @returns the unsigned transaction
     */
    swapTransaction(options: ExtentendedTradeOptions): Promise<UnsignedTransaction>;
}
export {};
