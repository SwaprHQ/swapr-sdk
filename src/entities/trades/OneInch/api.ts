import { ChainId } from '../../../constants'
import { REFFERER_ADDRESS_CHAIN_MAPPING } from '../constants'

const apiBaseUrl = (chainId: number) => 'https://api.1inch.io/v5.0/' + chainId

export enum RequestType {
  QUOTE = '/quote',
  SWAP = '/swap',
}

interface ApiRequestUrlParams {
  methodName: RequestType
  queryParams: Record<string, string>
  chainId: ChainId
}

//0.1% fee here is link to api https://docs.1inch.io/docs/aggregation-protocol/api/swap-params

const ONE_INCH_REFFERER_FEE = '0.1' //MIN-> 0 MAX-> 3

export function generateApiRequestUrl({ methodName, queryParams, chainId }: ApiRequestUrlParams) {
  if (REFFERER_ADDRESS_CHAIN_MAPPING[chainId]) {
    queryParams.referrerAddress = REFFERER_ADDRESS_CHAIN_MAPPING[chainId] ?? ''
    queryParams.fee = ONE_INCH_REFFERER_FEE
  }

  return apiBaseUrl(chainId) + methodName + '?' + new URLSearchParams(queryParams).toString()
}

export function approveAddressUrl(chainId: ChainId) {
  return apiBaseUrl(chainId) + '/approve/spender'
}
