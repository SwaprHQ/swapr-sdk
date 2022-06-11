import {
  Currency as UniswapCurrency,
  Ether as UniswapEther,
  NativeCurrency as UniswapNativeCurrency,
  Token as UniswapToken,
} from '@uniswap/sdk-core'
import { ChainId, WRAPPED_NATIVE_CURRENCY } from '@uniswap/smart-order-router'
import invariant from 'tiny-invariant'

function isMatic(chainId: number): chainId is ChainId.POLYGON | ChainId.POLYGON_MUMBAI {
  return chainId === ChainId.POLYGON_MUMBAI || chainId === ChainId.POLYGON
}

class MaticNativeCurrency extends UniswapNativeCurrency {
  equals(other: UniswapCurrency): boolean {
    return other.isNative && other.chainId === this.chainId
  }

  get wrapped(): UniswapToken {
    if (!isMatic(this.chainId)) throw new Error('Not matic')
    const wrapped = WRAPPED_NATIVE_CURRENCY[this.chainId]
    invariant(wrapped instanceof UniswapToken)
    return wrapped
  }

  public constructor(chainId: number) {
    if (!isMatic(chainId)) throw new Error('Not matic')
    super(chainId, 18, 'MATIC', 'Polygon Matic')
  }
}

export function getUniswapNativeCurrency(chainId: number): UniswapNativeCurrency {
  if (isMatic(chainId)) {
    return new MaticNativeCurrency(chainId)
  } else {
    return UniswapEther.onChain(chainId)
  }
}
