import type { Provider } from '@ethersproject/providers'

import type { ChainId } from '../../../../constants'
import type { Currency } from '../../../currency'
import type { UniswapV2RoutablePlatform } from '../../routable-platform/uniswap-v2-routable-platform'

export interface GetAllCommonUniswapV2Pairs {
  currencyA: Currency
  currencyB: Currency
  platform: UniswapV2RoutablePlatform
  provider?: Provider
}

export interface GetAllCommonUniswapV2PairsFromSubgraphParams {
  currencyA: Currency
  currencyB: Currency
  platform: UniswapV2RoutablePlatform
}

export interface UniswapV2PairSwapFee {
  pairAddress: string
  swapFee: number
}

export interface GetUniswapV2PairSwapFeeParams {
  chainId: ChainId
  pairAddressList: string[]
  provider?: Provider
}
