import { Interface } from '@ethersproject/abi'
import { Contract } from '@ethersproject/contracts'
import { BigNumber } from 'ethers'

import { MULTICALL2_ABI } from '../../../abis'
import { ChainId, MULTICALL2_ADDRESS } from '../../../constants'

import { CurrencyAmount } from '../../fractions'
import { Token } from '../../token'
import { toHex } from '../uniswap-v2/utilts'

import { ROUTER_ABI } from './abi'
import { ROUTER_ADDRESS } from './contants'

interface GetBestRoutesParams {
  currencyIn: Token
  currencyOut: Token
  amount: CurrencyAmount
  provider: any
  chainId: ChainId
}

interface BestRoute {
  finalValue: BigNumber
  receiveAmounts: BigNumber[]
  routes: { from: string; to: string; stable: boolean }[]
  routeAsset: any
}

interface VelodromAssetApi {
  price: number
  address: string
  name: string
  symbol: string
  decimals: number
  logoURI: string
}

export async function getBestRoute({
  currencyIn,
  currencyOut,
  amount,
  provider,
  chainId,
}: GetBestRoutesParams): Promise<BestRoute | null> {
  //fetch assets that are routable
  const routeAssetsResponse = await fetch('https://api.velodrome.finance/api/v1/routeAssets')

  if (!routeAssetsResponse.ok) throw new Error('response not ok')
  const routeAssets = (await routeAssetsResponse.json()).data as VelodromAssetApi[]

  const fromAsset = currencyIn
  const toAsset = currencyOut

  const fromAmountRaw = amount.raw.toString()
  const fromAmountHex = toHex(amount)

  if (!fromAsset || !toAsset || !fromAmountRaw || !fromAsset.address || !toAsset.address || fromAmountRaw === '') {
    return null
  }

  let fromAddress = fromAsset.address
  let toAddress = toAsset.address

  let amountOuts: any[] = []

  amountOuts = routeAssets
    .map((routeAsset) => {
      return [
        //pairs with one hop
        {
          routes: [
            {
              from: fromAddress,
              to: routeAsset.address,
              stable: true,
            },
            {
              from: routeAsset.address,
              to: toAddress,
              stable: true,
            },
          ],
          routeAsset: routeAsset,
        },
        {
          routes: [
            {
              from: fromAddress,
              to: routeAsset.address,
              stable: false,
            },
            {
              from: routeAsset.address,
              to: toAddress,
              stable: false,
            },
          ],
          routeAsset: routeAsset,
        },
        {
          routes: [
            {
              from: fromAddress,
              to: routeAsset.address,
              stable: true,
            },
            {
              from: routeAsset.address,
              to: toAddress,
              stable: false,
            },
          ],
          routeAsset: routeAsset,
        },
        {
          routes: [
            {
              from: fromAddress,
              to: routeAsset.address,
              stable: false,
            },
            {
              from: routeAsset.address,
              to: toAddress,
              stable: true,
            },
          ],
          routeAsset: routeAsset,
        },
        //direct pairs
        {
          routes: [{ from: fromAddress, to: toAddress, stable: true }],
          routeAsset: null,
        },
        {
          routes: [{ from: fromAddress, to: toAddress, stable: false }],
          routeAsset: null,
        },
      ]
    })
    .flat()

  const velodromRouterInterface = new Interface(ROUTER_ABI)

  //multicall for fetching output from all given pairs
  const multicall2CallData = amountOuts.map((route) => {
    return {
      target: ROUTER_ADDRESS,
      callData: velodromRouterInterface.encodeFunctionData('getAmountsOut', [fromAmountHex, route.routes]),
    }
  })

  const multicallContract = new Contract(MULTICALL2_ADDRESS[chainId], MULTICALL2_ABI, provider)
  const receiveAmounts = await multicallContract.callStatic.tryAggregate(false, multicall2CallData)

  //decoding multicall result into digestable form and modifing existing amounts out array
  for (let i = 0; i < receiveAmounts.length; i++) {
    if (receiveAmounts[i].success) {
      const { amounts } = velodromRouterInterface.decodeFunctionResult('getAmountsOut', receiveAmounts[i].returnData)

      amountOuts[i].receiveAmounts = amounts
      amountOuts[i].finalValue = amounts[amounts.length - 1]
    }
  }

  //comparing routes and returning the best one
  const bestAmountOut = amountOuts
    .filter((ret) => {
      return ret != null
    })
    .reduce((best, current) => {
      if (!best || !current.finalValue || !best.finalValue) {
        return current
      }

      return best.finalValue.gt(current.finalValue) ? best : current
    }, 0)

  return bestAmountOut
}
