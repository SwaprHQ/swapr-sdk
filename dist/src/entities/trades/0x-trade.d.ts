import type { UnsignedTransaction } from '@ethersproject/transactions';
import { TradeType } from '../../constants';
import { Currency } from '../currency';
import { CurrencyAmount } from '../fractions/currencyAmount';
import { Percent } from '../fractions/percent';
import { Breakdown } from '../platforms-breakdown';
import { TradeWithSwapTransaction } from './interfaces/trade';
export interface ZeroXTradeConstructorParams {
    breakdown: Breakdown;
    input: CurrencyAmount;
    output: CurrencyAmount;
    maximumSlippage: Percent;
    tradeType: TradeType;
    to: string;
    callData: string;
    value: string;
}
/**
 * Represents a trade executed against a list of pairs.
 * Does not account for slippage, i.e. trades that front run this trade and move the price.
 */
export declare class ZeroXTrade extends TradeWithSwapTransaction {
    private readonly to;
    private readonly callData;
    private readonly value;
    constructor({ breakdown, input, output, maximumSlippage, tradeType, to, callData, value, }: ZeroXTradeConstructorParams);
    minimumAmountOut(): CurrencyAmount;
    maximumAmountIn(): CurrencyAmount;
    static bestTradeExactIn(currencyAmountIn: CurrencyAmount, currencyOut: Currency, maximumSlippage: Percent): Promise<ZeroXTrade | undefined>;
    static bestTradeExactOut(currencyIn: Currency, currencyAmountOut: CurrencyAmount, maximumSlippage: Percent): Promise<ZeroXTrade | undefined>;
    swapTransaction(): Promise<UnsignedTransaction>;
}
