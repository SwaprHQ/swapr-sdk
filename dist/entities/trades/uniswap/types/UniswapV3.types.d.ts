import { SwapRoute } from '@uniswap/smart-order-router';
import type { TradeType } from '../../../../constants';
import type { Currency } from '../../../currency';
import type { CurrencyAmount } from '../../../fractions/currencyAmount';
import type { Percent } from '../../../fractions/percent';
export interface UniswapTradeGetQuoteParams {
    amount: CurrencyAmount;
    quoteCurrency: Currency;
    tradeType: TradeType;
    maximumSlippage?: Percent;
    recipient?: string;
}
export interface UniswapTradeParams {
    swapRoute: SwapRoute;
    maximumSlippage: Percent;
}
