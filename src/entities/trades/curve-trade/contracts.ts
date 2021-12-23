import { JsonRpcProvider } from '@ethersproject/providers'
import { BigNumber } from '@ethersproject/bignumber'
import { Contract } from '@ethersproject/contracts'

import { ChainId, ZERO_ADDRESS } from '../../../constants'
import { COINS_MAINNET, COINS_XDAI } from './constants'
// ABIs: trimmed for bundle size
import { ADDRESS_PROVIDER_ABI, CURVE_ROUTER_ABI, REGISTRY_EXCHANGE_ABI, XDAI_CURVE_ROUTER_ABI } from './abi'

// Constants
export const MAINNET_CONTRACTS = {
  addressProvider: '0x0000000022d53366457f9d5e68ec105046fc4383',
  router: '0xfA9a30350048B2BF66865ee20363067c66f67e58'
} as const

/**
 * @todo find the addresses
 */
export const XDAI_CONTRACTS = {
  addressProvider: ZERO_ADDRESS, // only USDC, USDT and WXDAI can be swapped on xDAI
  router: '0x7f90122BF0700F9E7e1F688fe926940E8839F353'
} as const

export type CurveCoreContracts = Record<keyof typeof MAINNET_CONTRACTS, Contract>

/**
 * CurveFi Router address for each Supported ChainId
 *
 */
export const ALIASES = {
  [ChainId.MAINNET as ChainId]: MAINNET_CONTRACTS,
  [ChainId.XDAI as ChainId]: XDAI_CONTRACTS
}

export const ProviderUrlList = {
  [ChainId.MAINNET as ChainId]: 'https://mainnet.infura.io/v3/e1a3bfc40093494ca4f36b286ab36f2d',
  [ChainId.XDAI as ChainId]: 'https://rpc.xdaichain.com/',
  [ChainId.ARBITRUM_ONE as ChainId]: 'https://arb1.arbitrum.io/rpc'
}

/**
 *  Construct a new read-only Provider
 */
export const getProvider = (chainId: ChainId) => {
  const host = ProviderUrlList[chainId]
  return new JsonRpcProvider(host)
}

/**
 *
 * @param ChainId
 * @returns
 */
export /**
 *
 * @param providerOrSigner
 * @returns
 */
async function getCurveContracts(chainId: ChainId): Promise<CurveCoreContracts> {
  const provider = getProvider(chainId)

  return {
    addressProvider: new Contract(ALIASES[chainId].addressProvider, ADDRESS_PROVIDER_ABI, provider),
    router: new Contract(
      ALIASES[chainId].router,
      chainId == ChainId.XDAI ? XDAI_CURVE_ROUTER_ABI : CURVE_ROUTER_ABI,
      provider
    )
  }
}

/**
 * Returns list of coins avaialble for on Curve for a given chainId
 * @param chainId the target chain ID
 */
export function getCoinList(chainId: ChainId): Record<string, string> {
  if (chainId == ChainId.XDAI) {
    return COINS_XDAI
  }

  return COINS_MAINNET
}

/**
 * Maps a coin symbol to its contract address for a given chain
 * @param tokenAddres the token address
 * @param chainId the chain ID, default is Ethereum; 1
 * @returns
 */
export function mapTokenSymbolToAddress(tokenAddres: CurveCurrency, chainId: ChainId = ChainId.MAINNET): string {
  // Default to mainnet
  const coinList = getCoinList(chainId)
  // @ts-ignore
  return coinList[tokenAddres.toLowerCase() as any]
}

/**
 * A CurveFi currency
 */
export type CurveCurrency = keyof typeof COINS_MAINNET | string

export interface GetBestPoolAndOutputParams {
  tokenInSymbol: string
  tokenOutSymbol: string
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
  tokenInSymbol,
  tokenOutSymbol,
  chainId
}: GetBestPoolAndOutputParams): Promise<GetBestPoolAndOutputResult> {
  const { addressProvider: addressProviderContract } = await getCurveContracts(chainId)
  // Map symbols to address
  const currencyInAddress = mapTokenSymbolToAddress(tokenInSymbol, chainId)
  const currencyOutAddress = mapTokenSymbolToAddress(tokenOutSymbol, chainId)
  const coinList = getCoinList(chainId)

  if (chainId == ChainId.MAINNET) {
    // Curve V2 pools
    const tricryptoCoins = [coinList.usdt.toLowerCase(), coinList.wbtc.toLowerCase(), coinList.weth.toLowerCase()]
    if (
      tricryptoCoins.includes(currencyInAddress.toLowerCase()) &&
      tricryptoCoins.includes(currencyOutAddress.toLowerCase())
    ) {
      throw new Error("This pair can't be exchanged")
    }
  }

  const registryExchangeAddress = await addressProviderContract.get_address(2, {
    gasLimit: 100000 // due to Berlin upgrade. See https://github.com/ethers-io/ethers.js/issues/1474
  })
  const registryExchangeContract = new Contract(registryExchangeAddress, REGISTRY_EXCHANGE_ABI, getProvider(chainId))
  const [poolAddress, expectedAmountOut] = await registryExchangeContract.get_best_rate(
    currencyInAddress,
    currencyOutAddress,
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
  tokenInSymbol,
  tokenOutSymbol
}: GetExchangeRoutingInfoParams): Promise<GetExchangeRoutingInfoResults> {
  // Get router
  const { router: routerContract } = await getCurveContracts(chainId)
  // Map symbols to address
  const currencyInAddress = mapTokenSymbolToAddress(tokenInSymbol, chainId)
  const currencyOutAddress = mapTokenSymbolToAddress(tokenOutSymbol, chainId)

  const [routes, indices, expectedAmountOut] = await routerContract.get_exchange_routing(
    currencyInAddress,
    currencyOutAddress,
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
