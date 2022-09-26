import { ApiOrderStatus, SimpleGetQuoteResponse } from '@cowprotocol/cow-sdk';
import type { ChainId, TradeType } from '../../../constants';
import type { Currency } from '../../currency';
import type { CurrencyAmount } from '../../fractions/currencyAmount';
import type { Percent } from '../../fractions/percent';
export interface CoWTradeParams {
    inputAmount: CurrencyAmount;
    outputAmount: CurrencyAmount;
    maximumSlippage: Percent;
    tradeType: TradeType;
    chainId: ChainId;
    fee?: Percent;
    feeAmount: CurrencyAmount;
    quote: SimpleGetQuoteResponse;
}
export interface CoWTradeGetBestTradeExactInParams {
    currencyAmountIn: CurrencyAmount;
    currencyOut: Currency;
    maximumSlippage: Percent;
    receiver: string;
    user: string;
}
export interface CoWTradeGetBestTradeExactOutParams {
    currencyAmountOut: CurrencyAmount;
    currencyIn: Currency;
    maximumSlippage: Percent;
    receiver: string;
    user: string;
}
export declare type CoWTradeApiOrderStatus = ApiOrderStatus;
