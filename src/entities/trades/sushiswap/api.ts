import { ChainId } from '../../../constants'
import { isRouteProcessor3_1ChainId, isRouteProcessor3_2ChainId } from './constants'

export const SWAP_BASE_URL = 'https://production.sushi.com/swap'

export const getApiVersion = (chainId: ChainId) => {
  if (isRouteProcessor3_2ChainId(chainId)) {
    return '/v3.2'
  }
  if (isRouteProcessor3_1ChainId(chainId)) {
    return '/v3.1'
  }
  return ''
}
