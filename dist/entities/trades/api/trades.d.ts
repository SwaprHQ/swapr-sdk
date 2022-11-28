import { StaticJsonRpcProvider } from '@ethersproject/providers';
import { Currency } from '../../currency';
import { CurrencyAmount, Percent } from '../../fractions';
import { EcoRouterResults } from './types';
export declare function getTradesPromise(parsedAmount: CurrencyAmount, inputCurrency: Currency, outputCurrency: Currency, isExactIn: boolean, commonParams: {
    maximumSlippage: Percent;
    receiver: string;
    user: string;
}, ecoRouterSourceOptionsParams: {
    uniswapV2: {
        useMultihops: boolean;
    };
}, staticJsonRpcProvider: StaticJsonRpcProvider | undefined, signal: AbortSignal): Promise<EcoRouterResults>;
