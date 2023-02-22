import { BaseProvider } from '@ethersproject/providers';
import type { UnsignedTransaction } from '@ethersproject/transactions';
import { ChainId, TradeType } from '../../../constants';
import { Currency } from '../../currency';
import { CurrencyAmount, Percent } from '../../fractions';
import { Trade } from '../interfaces/trade';
import { TradeOptions } from '../interfaces/trade-options';
export interface VelodromeQuoteTypes {
    amount: CurrencyAmount;
    quoteCurrency: Currency;
    tradeType: TradeType;
    maximumSlippage?: Percent;
    recipient?: string;
}
interface VelodromConstructorParams {
    maximumSlippage: Percent;
    currencyAmountIn: CurrencyAmount;
    currencyAmountOut: CurrencyAmount;
    tradeType: TradeType;
    chainId: ChainId;
    routes: {
        from: string;
        to: string;
        stable: boolean;
    }[];
    priceImpact: Percent;
}
/**
 * UniswapTrade uses the AutoRouter to find best trade across V2 and V3 pools
 */
export declare class VelodromeTrade extends Trade {
    /**
     * @property Route for trade to go through
     */
    readonly routes?: {
        from: string;
        to: string;
        stable: boolean;
    }[];
    constructor({ maximumSlippage, currencyAmountIn, currencyAmountOut, tradeType, chainId, routes, priceImpact, }: VelodromConstructorParams);
    static getQuote({ amount, quoteCurrency, tradeType, maximumSlippage, recipient }: VelodromeQuoteTypes, provider?: BaseProvider): Promise<VelodromeTrade | null>;
    minimumAmountOut(): CurrencyAmount;
    maximumAmountIn(): CurrencyAmount;
    /**
     * Returns unsigned transaction for the trade
     * @returns the unsigned transaction
     */
    swapTransaction(options: TradeOptions): Promise<UnsignedTransaction>;
}
export {};
