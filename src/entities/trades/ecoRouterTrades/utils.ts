import { ChainId } from '../../../constants'
import { Trade } from '../interfaces/trade'
import { UniswapV2RoutablePlatform } from '../routable-platform'

/**
 * Sort trades by price in descending order. Best trades are first.
 * @param trades list of trades
 * @returns sorted list of trades in descending order
 */
export function sortTradesByExecutionPrice(trades: Trade[]) {
  return trades.sort((a, b) => {
    if (a === undefined || a === null) {
      return 1
    }
    if (b === undefined || b === null) {
      return -1
    }

    if (a.executionPrice.lessThan(b.executionPrice)) {
      return 1
    } else if (a.executionPrice.equalTo(b.executionPrice)) {
      return 0
    } else {
      return -1
    }
  })
}

/**
 * List of Uniswap V2 platform that support current chain
 */
export function getUniswapV2PlatformList(chainId: ChainId): UniswapV2RoutablePlatform[] {
  return [
    UniswapV2RoutablePlatform.SWAPR,
    UniswapV2RoutablePlatform.SUSHISWAP,
    UniswapV2RoutablePlatform.HONEYSWAP,
    UniswapV2RoutablePlatform.LEVINSWAP,
    UniswapV2RoutablePlatform.DFYN,
    UniswapV2RoutablePlatform.QUICKSWAP,
    UniswapV2RoutablePlatform.PANCAKESWAP,
  ].filter((platform) => platform.supportsChain(chainId))
}
