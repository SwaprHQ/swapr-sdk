import { Interface } from '@ethersproject/abi'
import { ethers } from 'ethers'
import { TradeType } from '../../../../constants'
import { UNISWAP_ROUTER_ABI } from '../abi'

export * from './nativeCurrency'

export function encodeRecipient(tradeType: TradeType, recipient: string, callData?: string) {
  if (!callData) return undefined
  const routerFunction = tradeType === TradeType.EXACT_INPUT ? 'exactInputSingle' : 'exactOutputSingle'
  const routerInterface = new Interface(UNISWAP_ROUTER_ABI)
  const data = routerInterface.decodeFunctionData('multicall(uint256,bytes[])', callData)

  const { params } = routerInterface.decodeFunctionData(routerFunction, data.data[0])

  const routerFunctionCallData = routerInterface.encodeFunctionData(routerFunction, [
    [
      params.tokenIn,
      params.tokenOut,
      params.fee,
      recipient,
      params.amountIn.toString(),
      params.amountOutMinimum.toString(),
      params.sqrtPriceLimitX96.toString(),
    ],
  ])
  const dataFormatted = ethers.utils.arrayify(routerFunctionCallData)
  const newEncodedCallData = routerInterface.encodeFunctionData('multicall(uint256,bytes[])', [
    data.deadline.toString(),
    [dataFormatted],
  ])
  return newEncodedCallData
}
