import { StaticJsonRpcProvider } from '@ethersproject/providers'

import { Currency } from '../../currency'
import { CurrencyAmount, Percent } from '../../fractions'
import { getExactIn, getExactOut } from './tradeTypes'
import { EcoRouterResults } from './types'

export async function getTradesPromise(
  parsedAmount: CurrencyAmount,
  inputCurrency: Currency,
  outputCurrency: Currency,
  isExactIn: boolean,
  commonParams: { maximumSlippage: Percent; receiver: string; user: string },
  ecoRouterSourceOptionsParams: { uniswapV2: { useMultihops: boolean } },
  staticJsonRpcProvider: StaticJsonRpcProvider | undefined,
  signal: AbortSignal
): Promise<EcoRouterResults> {
  const abortPromise = new Promise<EcoRouterResults>((_, reject) => {
    signal.onabort = () => {
      reject(new DOMException('Aborted', 'AbortError'))
    }
  })

  const ecoRouterPromise = isExactIn
    ? getExactIn(
        {
          currencyAmountIn: parsedAmount,
          currencyOut: outputCurrency,
          ...commonParams,
        },
        ecoRouterSourceOptionsParams,
        staticJsonRpcProvider
      )
    : getExactOut(
        {
          currencyAmountOut: parsedAmount,
          currencyIn: inputCurrency,
          ...commonParams,
        },
        ecoRouterSourceOptionsParams,
        staticJsonRpcProvider
      )

  return await Promise.race([abortPromise, ecoRouterPromise])
}
