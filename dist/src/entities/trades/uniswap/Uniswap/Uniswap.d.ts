import type { BaseProvider } from '@ethersproject/providers';
import { UnsignedTransaction } from '@ethersproject/transactions';
import { SwapRoute } from '@uniswap/smart-order-router';
import { CurrencyAmount } from '../../../fractions';
import { TradeWithSwapTransaction } from '../../interfaces/trade';
import { UniswapTradeGetQuoteParams, UniswapTradeParams } from '../types/UniswapV3.types';
/**
 * UniswapTrade uses the AutoRouter to find best trade across V2 and V3 pools
 */
export declare class UniswapTrade extends TradeWithSwapTransaction {
    /**
     * An address the EOA must approve to spend its tokenIn
     */
    readonly approveAddress: string;
    /**
     * @property The original SwapRoute object from the Routing API
     */
    swapRoute: SwapRoute;
    constructor({ maximumSlippage, swapRoute }: UniswapTradeParams);
    static getQuote({ amount, quoteCurrency, tradeType, recipient, maximumSlippage }: UniswapTradeGetQuoteParams, provider?: BaseProvider): Promise<UniswapTrade | null>;
    minimumAmountOut(): CurrencyAmount;
    maximumAmountIn(): CurrencyAmount;
    swapTransaction(): Promise<UnsignedTransaction>;
}
