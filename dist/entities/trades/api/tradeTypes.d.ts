import { Provider } from '@ethersproject/providers';
import { EcoRouterBestExactInParams, EcoRouterBestExactOutParams, EcoRouterResults, EcoRouterSourceOptionsParams } from './types';
/**
 * Low-level function to fetch from Eco Router sources
 * @returns {Promise<EcoRouterResults>} List of unsorted trade sources
 */
export declare function getExactIn({ currencyAmountIn, currencyOut, maximumSlippage, receiver, user }: EcoRouterBestExactInParams, { uniswapV2 }: EcoRouterSourceOptionsParams, provider?: Provider): Promise<EcoRouterResults>;
/**
 * Low-level function to fetch from Eco Router sources
 * @returns {Promise<EcoRouterResults>} List of unsorted trade sources
 */
export declare function getExactOut({ currencyAmountOut, currencyIn, maximumSlippage, receiver, user }: EcoRouterBestExactOutParams, { uniswapV2 }: EcoRouterSourceOptionsParams, provider?: Provider): Promise<EcoRouterResults>;
