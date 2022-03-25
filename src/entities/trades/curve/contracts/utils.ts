import { JsonRpcProvider } from '@ethersproject/providers'
import { ChainId } from '../../../../constants'

export const RPC_PROVIDER_LIST = {
  [ChainId.MAINNET as ChainId]: 'https://mainnet.infura.io/v3/e1a3bfc40093494ca4f36b286ab36f2d',
  [ChainId.XDAI as ChainId]: 'https://rpc.xdaichain.com/',
  [ChainId.ARBITRUM_ONE as ChainId]: 'https://arb1.arbitrum.io/rpc',
}

/**
 *  Construct a new read-only Provider
 */
export const getProvider = (chainId: ChainId) => {
  const host = RPC_PROVIDER_LIST[chainId]
  return new JsonRpcProvider(host)
}
