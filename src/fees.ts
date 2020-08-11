import JSBI from 'jsbi'
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

export class Fees {

  static async fetchSwapFee(
    tokenPair: Token,
    provider = getDefaultProvider(getNetwork(tokenPair.chainId)),
  ) : Promise<{
    fee: BigintIsh
    owner: string
  }> {
    return {
      fee: JSBI.BigInt(await new Contract(tokenPair.address, IDXswapPair.abi, provider).swapFee()),
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
  ) : Promise<{
    fee: BigintIsh
    owner: string
  }[]> {
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
        fee: JSBI.BigInt(tokenPairContract.interface.decodeFunctionResult(
          tokenPairContract.interface.getFunction('swapFee()'),
          result.returnData[resultIndex]
        )[0]),
        owner
      })
    }
    return fees
  }
  
  static async fetchAllSwapFees(
    chainId: ChainId,
    swapFeesCache: {
      [key: string] : {
        fee: BigintIsh
        owner: string
      }
    } = {},
    provider = getDefaultProvider(getNetwork(chainId))
  ) : Promise<{
    [key: string] : {
      fee: BigintIsh
      owner: string
    }
  }> {
    const multicall = new Contract(MULTICALL_ADDRESS[chainId], MULTICALL_ABI, provider)
    const factoryContract = new Contract(FACTORY_ADDRESS[chainId], IDXswapFactory.abi, provider);
    const allPairsLength = await factoryContract.allPairsLength()
    let allSwapPairs: {
      [key: string] : {
        fee: BigintIsh
        owner: string
      }
    } = {}
    
    // Get first token pairs from cache
    let tokenPairsCache = Object.keys(swapFeesCache);
    let tokenPairsToFetch: Token[] = []
    for (let tokenPaisCacheIndex = 0; tokenPaisCacheIndex < tokenPairsCache.length; tokenPaisCacheIndex++) {
        allSwapPairs[tokenPairsCache[tokenPaisCacheIndex]] = {
          fee: swapFeesCache[tokenPairsCache[tokenPaisCacheIndex]].fee,
          owner: swapFeesCache[tokenPairsCache[tokenPaisCacheIndex]].owner
        }
    }
    
    // Get rest of the token pairs that are not cached
    let calls = []
    for (let pairIndex = tokenPairsCache.length; pairIndex < allPairsLength; pairIndex++)
      calls.push({
        address: factoryContract.address,
        callData: factoryContract.interface.encodeFunctionData(factoryContract.interface.getFunction('allPairs(uint)'), [pairIndex])
      })
    const result = await multicall.aggregate(calls.map(call => [call.address, call.callData]))
    for (let resultIndex = 0; resultIndex < result.returnData.length; resultIndex++) {
      const tokenPairAddress = factoryContract.interface.decodeFunctionResult(
        factoryContract.interface.getFunction('allPairs(uint256)'),
        result.returnData[resultIndex]
      )[0]
      tokenPairsToFetch.push(new Token(chainId, tokenPairAddress, 18, 'DXS', 'DXswap'))
    }
    
    // Fetch the pairs that we dont have the fee and owner
    const swapFeesFetched = await this.fetchSwapFees(tokenPairsToFetch, provider);
    for (let tokenPairsToFetchIndex = 0; tokenPairsToFetchIndex < tokenPairsToFetch.length; tokenPairsToFetchIndex++)
      allSwapPairs[tokenPairsToFetch[tokenPairsToFetchIndex].address] = swapFeesFetched[tokenPairsToFetchIndex]
    return allSwapPairs
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
