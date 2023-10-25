import { ChainId } from '../../../constants';
import { Trade } from '../interfaces/trade';
import { UniswapV2RoutablePlatform } from '../routable-platform';
/**
 * Sort trades by price in descending order. Best trades are first.
 * @param trades list of trades
 * @returns sorted list of trades in descending order
 */
export declare function sortTradesByExecutionPrice(trades: Trade[]): Trade[];
/**
 * List of Uniswap V2 platform that support current chain
 */
export declare function getUniswapV2PlatformList(chainId: ChainId): UniswapV2RoutablePlatform[];
