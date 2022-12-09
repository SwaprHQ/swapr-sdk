import { Interface } from '@ethersproject/abi'
import { ethers } from 'ethers'

import { UNISWAP_ROUTER_ABI } from '../src/entities/trades/uniswap/abi'

describe('Decoding uniswap callData', () => {
  test('Should Not throw error', async () => {
    console.log('here')
    // const receipient = '0x162eb61A498c34676625CA3Aceb3f92508f49Aac'
    const callData =
      '0x5ae401dc00000000000000000000000000000000000000000000000000000000639250c600000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000e404e45aaf000000000000000000000000c02aaa39b223fe8d0a0e5c4f27ead9083c756cc20000000000000000000000006b175474e89094c44da98b954eedeac495271d0f00000000000000000000000000000000000000000000000000000000000001f400000000000000000000000026358e62c2eded350e311bfde51588b8383a931500000000000000000000000000000000000000000000000002e86e81b63624b200000000000000000000000000000000000000000000000e759601953c80a661000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000'

    const routerInterface = new Interface(UNISWAP_ROUTER_ABI)

    const data = routerInterface.decodeFunctionData('multicall(uint256,bytes[])', callData)

    console.log('data', data)
    // console.log('data2', data[3][0])
    let { params } = routerInterface.decodeFunctionData('exactInputSingle', data.data[0])
    console.log('data1', data.data[0])
    console.log('params', params)

    const nestedCallData = routerInterface.encodeFunctionData('exactInputSingle', [
      [
        params.tokenIn,
        params.tokenOut,
        params.fee,
        params.recipient,
        params.amountIn.toString(),
        params.amountOutMinimum.toString(),
        params.sqrtPriceLimitX96.toString(),
      ],
    ])
    console.log('nestedCallData', nestedCallData === data.data[0])
    const dataFormatted = ethers.utils.arrayify(nestedCallData)
    console.log('dataFormatted', dataFormatted)

    const encodedIntialData = routerInterface.encodeFunctionData('multicall(uint256,bytes[])', [
      data.deadline.toString(),
      [dataFormatted],
    ])
    console.log('finalDarta', encodedIntialData)
    console.log('finally', encodedIntialData === callData)
  })
})
