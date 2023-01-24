import { ChainId } from '../../../constants'

// const broadcastApiUrl = 'https://tx-gateway.1inch.io/v1.1/' + chainId + '/broadcast'
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

export function generateApiRequestUrl({ methodName, queryParams, chainId }: ApiRequestUrlParams) {
  return apiBaseUrl(chainId) + methodName + '?' + new URLSearchParams(queryParams).toString()
}

export function approveAddressUrl(chainId: ChainId) {
  return apiBaseUrl(chainId) + '/approve/spender'
}
