import { ChainId } from '../../../constants'
import { REFFERER_ADDRESS_CHAIN_MAPPING } from '../constants'

export enum RequestType {
  QUOTE = '/quote',
  SWAP = '/swap',
}

enum ApiName {
  FUSION = '/fusion',
  SPOT_PRICE = '/price',
  SWAP = '/swap',
}

enum SubApiName {
  ORDERS = '/orders',
  QUOTER = '/quoter',
  RELAYER = '/relayer',
}

enum ApiVersion {
  FUSION = '/v1.0',
  SPOT_PRICE = '/v1.1',
  SWAP = '/v5.2',
}

interface ApiRequestUrlParams {
  methodName: RequestType
  queryParams: Record<string, string>
  chainId: ChainId
}

interface ApiUrlConfig {
  apiName: ApiName
  apiVersion: ApiVersion
  chainId: number
  subApiName?: SubApiName | ''
}

/**
 * @see https://portal.1inch.dev/documentation/swap/introduction
 */

const API_BASE_URL = process.env.REACT_APP_ONEINCH_BASE_API_URL ?? 'https://api.1inch.dev/'
const ONE_INCH_REFFERER_FEE = '0' //MIN-> 0 MAX-> 3

const getApiUrl = ({ apiName, apiVersion, chainId, subApiName = '' }: ApiUrlConfig) =>
  `${API_BASE_URL}${apiName}${subApiName}${apiVersion}/${chainId}`

export function generateApiRequestUrl({ methodName, queryParams, chainId }: ApiRequestUrlParams) {
  if (REFFERER_ADDRESS_CHAIN_MAPPING[chainId]) {
    queryParams.referrerAddress = REFFERER_ADDRESS_CHAIN_MAPPING[chainId] ?? ''
    queryParams.fee = ONE_INCH_REFFERER_FEE
  }

  return (
    getApiUrl({ apiName: ApiName.SWAP, apiVersion: ApiVersion.SWAP, chainId }) +
    methodName +
    '?' +
    new URLSearchParams(queryParams).toString()
  )
}

export function approveAddressUrl(chainId: ChainId) {
  return getApiUrl({ apiName: ApiName.SWAP, apiVersion: ApiVersion.SWAP, chainId }) + '/approve/spender'
}
