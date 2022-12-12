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

  const decodedData = routerInterface.decodeFunctionData(routerFunction, data.data[0])
  const { params } = decodedData
  console.log('params', params)
  console.log('decodedData', decodedData[0])
  console.log('pure', decodedData)

  const routerFunctionCallData = routerInterface.encodeFunctionData(routerFunction, [
    [
      params.tokenIn,
      params.tokenOut,
      params.fee,
      recipient,
      //amountIn or amountOut
      decodedData[0][4].toString(),
      //amountInMaximum or amountOutMaximum
      decodedData[0][5].toString(),
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
