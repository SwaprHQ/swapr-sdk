import { JsonRpcProvider } from '@ethersproject/providers'
import { BigNumber } from '@ethersproject/bignumber'
import { Contract } from '@ethersproject/contracts'

import { ChainId, ZERO_ADDRESS } from '../../../constants'
import { TOKENS_MAINNET, TOKENS_XDAI } from './constants'
// ABIs: trimmed for bundle size
import { ADDRESS_PROVIDER_ABI, REGISTRY_EXCHANGE_ABI } from './abi'

// Constants
export const MAINNET_CONTRACTS = {
  addressProvider: '0x0000000022d53366457f9d5e68ec105046fc4383',
  router: '0xfA9a30350048B2BF66865ee20363067c66f67e58'
} as const

export const RPC_PROVIDER_LIST = {
  [ChainId.MAINNET as ChainId]: 'https://mainnet.infura.io/v3/e1a3bfc40093494ca4f36b286ab36f2d',
  [ChainId.XDAI as ChainId]: 'https://rpc.xdaichain.com/',
  [ChainId.ARBITRUM_ONE as ChainId]: 'https://arb1.arbitrum.io/rpc'
}

/**
 *  Construct a new read-only Provider
 */
export const getProvider = (chainId: ChainId) => {
  const host = RPC_PROVIDER_LIST[chainId]
  return new JsonRpcProvider(host)
}

/**
 * Returns list of coins avaialble for on Curve for a given chainId
 * @param chainId the target chain ID
 */
export function getCoinList(chainId: ChainId) {
  if (chainId == ChainId.XDAI) {
    return TOKENS_XDAI
  }

  return TOKENS_MAINNET
}

export interface GetBestPoolAndOutputParams {
  tokenInAddress: string
  tokenOutAddress: string
  amountIn: BigNumber
  chainId: ChainId
}
export type GetExchangeRoutingInfoParams = GetBestPoolAndOutputParams

export interface GetBestPoolAndOutputResult {
  expectedAmountOut: BigNumber
  poolAddress: string
}

export interface GetExchangeRoutingInfoResults {
  routes: string[]
  indices: BigNumber[]
  expectedAmountOut: BigNumber
}

/**
 * Returns the best pool to route a trade through
 * @param param
 * @returns
 */
export async function getBestCurvePoolAndOutput({
  amountIn,
  tokenInAddress,
  tokenOutAddress,
  chainId
}: GetBestPoolAndOutputParams): Promise<GetBestPoolAndOutputResult> {
  const addressProviderContract = new Contract(
    MAINNET_CONTRACTS.addressProvider,
    ADDRESS_PROVIDER_ABI,
    getProvider(chainId)
  )
  const coinList = getCoinList(chainId)

  // Curve V2 pools
  const tricryptoCoins = [
    coinList.usdt.address.toLowerCase(),
    coinList.wbtc.address.toLowerCase(),
    coinList.weth.address.toLowerCase()
  ]
  if (tricryptoCoins.includes(tokenInAddress.toLowerCase()) && tricryptoCoins.includes(tokenOutAddress.toLowerCase())) {
    throw new Error("This pair can't be exchanged")
  }

  const registryExchangeAddress = await addressProviderContract.get_address(2, {
    gasLimit: 100000 // due to Berlin upgrade. See https://github.com/ethers-io/ethers.js/issues/1474
  })
  const registryExchangeContract = new Contract(registryExchangeAddress, REGISTRY_EXCHANGE_ABI, getProvider(chainId))
  const [poolAddress, expectedAmountOut] = await registryExchangeContract.get_best_rate(
    tokenInAddress,
    tokenOutAddress,
    amountIn.toString()
  )

  return {
    poolAddress,
    expectedAmountOut
  }
}

export async function getExchangeRoutingInfo({
  amountIn,
  chainId,
  tokenInAddress,
  tokenOutAddress
}: GetExchangeRoutingInfoParams): Promise<GetExchangeRoutingInfoResults> {
  // Get router
  const routerContract = new Contract(MAINNET_CONTRACTS.addressProvider, ADDRESS_PROVIDER_ABI, getProvider(chainId))

  const [routes, indices, expectedAmountOut] = await routerContract.get_exchange_routing(
    tokenInAddress,
    tokenOutAddress,
    amountIn.toString(),
    {
      from: ZERO_ADDRESS
    }
  )

  return {
    expectedAmountOut,
    indices,
    routes
  }
}
