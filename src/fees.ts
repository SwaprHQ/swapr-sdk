import { getNetwork } from '@ethersproject/networks'
import { getDefaultProvider } from '@ethersproject/providers'
import { Contract } from '@ethersproject/contracts'
import IDXswapPair from 'dxswap-core/build/contracts/IDXswapPair.json'
import IDXswapFactory from 'dxswap-core/build/contracts/IDXswapFactory.json'

import {
  BigintIsh,
  FACTORY_ADDRESS,
  MULTICALL_ADDRESS,
  MULTICALL_ABI,
  ChainId
} from './constants'
import { Token } from './entities/token'

export interface Fee {
  fee: BigintIsh
  owner: string
}

export interface Fees {
  [key: string] : Fee
}

export class Fees {

  static async fetchSwapFee(
    tokenPair: Token,
    provider = getDefaultProvider(getNetwork(tokenPair.chainId)),
  ) : Promise<Fee> {
    return {
      fee: await new Contract(tokenPair.address, IDXswapPair.abi, provider).swapFee(),
      owner: await new Contract(
        FACTORY_ADDRESS[tokenPair.chainId],
        IDXswapFactory.abi,
        provider
      ).feeToSetter()
    }
  }
  
  static async fetchSwapFees(
    tokenPairs: Token[],
    provider = getDefaultProvider(getNetwork(tokenPairs[0].chainId)),
  ) : Promise<Fee[]> {
    const multicall = new Contract(MULTICALL_ADDRESS[tokenPairs[0].chainId], MULTICALL_ABI, provider)
    const factoryContract = new Contract(FACTORY_ADDRESS[tokenPairs[0].chainId], IDXswapFactory.abi, provider);
    const tokenPairContract = new Contract(tokenPairs[0].address, IDXswapPair.abi, provider)
    let calls = []
    calls.push({
      address: factoryContract.address,
      callData: factoryContract.interface.encodeFunctionData(factoryContract.interface.getFunction('feeToSetter()'))
    })
    for (let tokenPairsIndex = 0; tokenPairsIndex < tokenPairs.length; tokenPairsIndex++) {
      calls.push({
        address: tokenPairs[tokenPairsIndex].address,
        callData: tokenPairContract.interface.encodeFunctionData(tokenPairContract.interface.getFunction('swapFee()'))
      })
    }
    const result = await multicall.aggregate(calls.map(call => [call.address, call.callData]))
    const owner = factoryContract.interface.decodeFunctionResult(
      factoryContract.interface.getFunction('feeToSetter()'),
      result.returnData[0]
    )[0];
    let fees = [];
    for (let resultIndex = 1; resultIndex < result.returnData.length; resultIndex++) {
      fees.push({
        fee: tokenPairContract.interface.decodeFunctionResult(
          tokenPairContract.interface.getFunction('swapFee()'),
          result.returnData[resultIndex]
        )[0],
        owner
      })
    }
    return fees
  }
  
  static async fetchAllSwapFees(
    chainId: ChainId,
  ) : Promise<Fees> {
    const provider = getDefaultProvider(getNetwork(chainId))
    const multicall = new Contract(MULTICALL_ADDRESS[chainId], MULTICALL_ABI, provider)
    const factoryContract = new Contract(FACTORY_ADDRESS[chainId], IDXswapFactory.abi, provider);
    const allPairsLength = await factoryContract.allPairsLength()
    let calls = []
    for (let pairIndex = 0; pairIndex < allPairsLength; pairIndex++)
      calls.push({
        address: factoryContract.address,
        callData: factoryContract.interface.encodeFunctionData(factoryContract.interface.getFunction('allPairs(uint)'), [pairIndex])
      })
    const result = await multicall.aggregate(calls.map(call => [call.address, call.callData]))
    let tokenPairs = [];
    for (let resultIndex = 0; resultIndex < result.returnData.length; resultIndex++)
      tokenPairs.push( new Token(
        chainId,
        factoryContract.interface.decodeFunctionResult(
          factoryContract.interface.getFunction('allPairs(uint256)'),
          result.returnData[resultIndex]
        )[0],
        18,
        'DXS',
        'DXswap'
      ))
    const swapFees = await this.fetchSwapFees(tokenPairs);
    let fees: Fees = {}
    for (let tokenPairsIndex = 0; tokenPairsIndex < tokenPairs.length; tokenPairsIndex++)
      fees[tokenPairs[tokenPairsIndex].address] = swapFees[tokenPairsIndex]
      
    return fees
  }
  
  static async fetchProtocolFee(
    chainId: ChainId,
    provider = getDefaultProvider(getNetwork(chainId)),
  ) : Promise<{
    feeDenominator: BigintIsh,
    feeReceiver: string
  }> {
    const factoryContract = await new Contract(
      FACTORY_ADDRESS[chainId],
      IDXswapFactory.abi,
      provider
    );
    const feeDenominator = await factoryContract.protocolFeeDenominator()
    const feeReceiver = await factoryContract.feeTo()
    return { feeDenominator, feeReceiver }
  }

}
