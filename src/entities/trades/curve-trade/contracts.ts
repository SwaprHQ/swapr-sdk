import { JsonRpcProvider } from '@ethersproject/providers'
import { BigNumber, BigNumberish } from '@ethersproject/bignumber'
import { Contract } from '@ethersproject/contracts'

import { ZERO_ADDRESS } from '../../../constants'
import { ChainId } from '../../../constants'
import { TOKENS_MAINNET } from './constants'
// ABIs: trimmed for bundle size
import { ADDRESS_PROVIDER_ABI, CURVE_ROUTER_ABI, REGISTRY_EXCHANGE_ABI } from './abi'

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

export interface GetBestPoolAndOutputParams {
  tokenInAddress: string
  tokenOutAddress: string
  amountIn: BigNumberish
  chainId: ChainId
}
export type GetExchangeRoutingInfoParams = GetBestPoolAndOutputParams

export interface GetBestPoolAndOutputResult {
  expectedAmountOut: BigNumber
  poolAddress: string
  registryExchangeAddress: string
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
}: GetBestPoolAndOutputParams): Promise<GetBestPoolAndOutputResult | undefined> {
  if (chainId !== ChainId.MAINNET) {
    throw new Error('Best Pool Find is only available on Mainnet')
  }

  const addressProviderContract = new Contract(
    MAINNET_CONTRACTS.addressProvider,
    ADDRESS_PROVIDER_ABI,
    getProvider(chainId)
  )

  // Curve V2 pools
  const tricryptoCoins = [
    TOKENS_MAINNET.usdt.address.toLowerCase(),
    TOKENS_MAINNET.wbtc.address.toLowerCase(),
    TOKENS_MAINNET.weth.address.toLowerCase()
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

  if (poolAddress === ZERO_ADDRESS) {
    return
  }

  return {
    poolAddress,
    expectedAmountOut,
    registryExchangeAddress
  }
}

export async function getExchangeRoutingInfo({
  amountIn,
  tokenInAddress,
  tokenOutAddress
}: GetExchangeRoutingInfoParams): Promise<GetExchangeRoutingInfoResults | undefined> {
  // Get router
  const routerContract = new Contract(MAINNET_CONTRACTS.router, CURVE_ROUTER_ABI, getProvider(ChainId.MAINNET))

  try {
    const params = [tokenInAddress, tokenOutAddress, amountIn.toString()]

    const res = await routerContract.get_exchange_routing(...params, {
      from: ZERO_ADDRESS
    })

    const [routes, indices, expectedAmountOut] = res

    return {
      expectedAmountOut,
    indices,
    routes
}
  } catch (e) {
    // console.log(e)
    // if (e.message !== 'execution reverted') {
    //   throw e
    // } else {
    // }
  }
  return
}
