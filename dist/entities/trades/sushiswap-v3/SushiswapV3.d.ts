import { BaseProvider } from '@ethersproject/providers';
import { UnsignedTransaction } from '@ethersproject/transactions';
import { ChainId, TradeType } from '../../../constants';
import { Currency } from '../../currency';
import { CurrencyAmount, Percent } from '../../fractions';
import { Trade } from '../interfaces/trade';
import { TradeOptions } from '../interfaces/trade-options';
export interface SushiswapQuoteTypes {
    amount: CurrencyAmount;
    quoteCurrency: Currency;
    tradeType: TradeType;
    maximumSlippage?: Percent;
    recipient?: string;
}
interface ExtentendedTradeOptions extends TradeOptions {
    account: string;
}
interface SushiswapV3ConstructorParams {
    maximumSlippage: Percent;
    inputAmount: CurrencyAmount;
    outputAmount: CurrencyAmount;
    tradeType: TradeType;
    chainId: ChainId;
    approveAddress: string;
    routeCode: string;
}
export declare class SushiswapV3Trade extends Trade {
    readonly routeCode: string;
    constructor({ maximumSlippage, inputAmount, outputAmount, tradeType, chainId, approveAddress, routeCode, }: SushiswapV3ConstructorParams);
    static getQuote({ amount, quoteCurrency, tradeType, maximumSlippage, recipient }: SushiswapQuoteTypes, provider?: BaseProvider): Promise<SushiswapV3Trade | null>;
    minimumAmountOut(): CurrencyAmount;
    maximumAmountIn(): CurrencyAmount;
    /**
     * Returns unsigned transaction for the trade
     * @returns the unsigned transaction
     */
    swapTransaction(options: ExtentendedTradeOptions): Promise<UnsignedTransaction>;
}
export {};
