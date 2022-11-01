import { Contract } from '@ethersproject/contracts'

import { ChainId } from '../../../constants'
import { getProvider } from '../utils'
import { ROUTER_ABI } from './abi'

export const routerAddress = '0x9c12939390052919aF3155f41Bf4160Fd3666A6f'
export const factoryAddress = '0x25CbdDb98b35ab1FF77413456B31EC81A6B6B746'

export async function getVelodromeRoutes({ amount, currencyIn, currencyOut, chainId }: any) {
  if (chainId !== ChainId.OPTIMISM_MAINNET) {
    throw new Error('Best Pool Find is only available on OptmismMainnet')
  }

  const addressProviderContract = new Contract(routerAddress, ROUTER_ABI, getProvider(chainId))
  console.log('amountInNOTSTRINGSSSSER', amount)
  console.log('tokenInd', currencyIn)
  console.log('tokenOut', currencyOut)

  const { amount: amountOut, stable } = await addressProviderContract.getAmountOut(
    amount.raw.toString(),
    currencyIn,
    currencyOut
  )
  // console.log('worksss', amountOut.toNumber())

  console.log('stable', stable)

  // const fee = await addressProviderContract.getFee(stable)
  // console.log('fee', fee)

  console.log('result', amountOut)

  return { amountOut, stable }
}
