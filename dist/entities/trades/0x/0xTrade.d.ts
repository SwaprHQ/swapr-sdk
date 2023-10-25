import type { UnsignedTransaction } from '@ethersproject/transactions';
import { Currency } from '../../currency';
import { CurrencyAmount } from '../../fractions/currencyAmount';
import { Percent } from '../../fractions/percent';
import { TradeWithSwapTransaction } from '../interfaces/trade';
import { ZeroXTradeConstructorParams } from './types';
/**
 * Represents a trade executed against a list of pairs.
 * Does not account for slippage, i.e. trades that front run this trade and move the price.
 */
export declare class ZeroXTrade extends TradeWithSwapTransaction {
    readonly to: string;
    readonly callData: string;
    readonly value: string;
    constructor({ breakdown, input, output, maximumSlippage, tradeType, to, callData, value, priceImpact, }: ZeroXTradeConstructorParams);
    minimumAmountOut(): CurrencyAmount;
    maximumAmountIn(): CurrencyAmount;
    static bestTradeExactIn(currencyAmountIn: CurrencyAmount, currencyOut: Currency, maximumSlippage: Percent): Promise<ZeroXTrade | undefined>;
    static bestTradeExactOut(currencyIn: Currency, currencyAmountOut: CurrencyAmount, maximumSlippage: Percent): Promise<ZeroXTrade | undefined>;
    swapTransaction(): Promise<UnsignedTransaction>;
}
