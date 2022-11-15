import { Interface } from '@ethersproject/abi'
import { Contract } from '@ethersproject/contracts'
import { BigNumber } from 'ethers'

import { MULTICALL2_ABI } from '../../../abis'
import { ChainId, MULTICALL2_ADDRESS } from '../../../constants'

import { CurrencyAmount } from '../../fractions'
import { Token } from '../../token'
import { toHex } from '../uniswap-v2/utilts'

import { ROUTER_ABI } from './abi'

export const routerAddress = '0x9c12939390052919aF3155f41Bf4160Fd3666A6f'

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
  const routeAssetsResponse = await fetch('https://api.velodrome.finance/api/v1/routeAssets')

  if (!routeAssetsResponse.ok) throw new Error('response not ok')
  const routeAssets = (await routeAssetsResponse.json()).data as VelodromAssetApi[]
  console.log('routeasset', routeAssets)
  const fromAsset = currencyIn
  const toAsset = currencyOut
  const fromAmount = amount.raw.toString()

  const sendFromAmount = toHex(amount)
  console.log('sendFromAmount', sendFromAmount)
  console.log('fromAmoutn', fromAmount)

  if (!fromAsset || !toAsset || !fromAmount || !fromAsset.address || !toAsset.address || fromAmount === '') {
    return null
  }

  let addy0 = fromAsset.address
  let addy1 = toAsset.address
  console.log('addy0', addy0)
  console.log('add1', addy1)

  const includesRouteAddress = routeAssets.filter((asset) => {
    return asset.address.toLowerCase() == addy0.toLowerCase() || asset.address.toLowerCase() == addy1.toLowerCase()
  })

  let amountOuts: any[] = []
  console.log('includes route asset', includesRouteAddress)
  if (includesRouteAddress.length === 0) {
    console.log('passes')
    amountOuts = routeAssets
      .map((routeAsset) => {
        return [
          {
            routes: [
              {
                from: addy0,
                to: routeAsset.address,
                stable: true,
              },
              {
                from: routeAsset.address,
                to: addy1,
                stable: true,
              },
            ],
            routeAsset: routeAsset,
          },
          {
            routes: [
              {
                from: addy0,
                to: routeAsset.address,
                stable: false,
              },
              {
                from: routeAsset.address,
                to: addy1,
                stable: false,
              },
            ],
            routeAsset: routeAsset,
          },
          {
            routes: [
              {
                from: addy0,
                to: routeAsset.address,
                stable: true,
              },
              {
                from: routeAsset.address,
                to: addy1,
                stable: false,
              },
            ],
            routeAsset: routeAsset,
          },
          {
            routes: [
              {
                from: addy0,
                to: routeAsset.address,
                stable: false,
              },
              {
                from: routeAsset.address,
                to: addy1,
                stable: true,
              },
            ],
            routeAsset: routeAsset,
          },
        ]
      })
      .flat()
  }

  amountOuts.push({
    routes: [{ from: addy0, to: addy1, stable: true }],
    routeAsset: null,
  })

  amountOuts.push({
    routes: [{ from: addy0, to: addy1, stable: false }],
    routeAsset: null,
  })

  const velodromRouterInterface = new Interface(ROUTER_ABI)

  console.log('multiCall', amountOuts)
  const multicall2CallData = amountOuts.map((route) => {
    return {
      target: routerAddress,
      callData: velodromRouterInterface.encodeFunctionData('getAmountsOut', [sendFromAmount, route.routes]),
    }
  })
  console.log('multicallData', multicall2CallData)

  const multicallContract = new Contract(MULTICALL2_ADDRESS[chainId], MULTICALL2_ABI, provider)
  const receiveAmounts = await multicallContract.callStatic.tryAggregate(false, multicall2CallData)
  console.log('recieveAmoutns', receiveAmounts)

  for (let i = 0; i < receiveAmounts.length; i++) {
    if (receiveAmounts[i].success) {
      const { amounts } = velodromRouterInterface.decodeFunctionResult('getAmountsOut', receiveAmounts[i].returnData)
      console.log('amounts', amounts)
      amountOuts[i].receiveAmounts = amounts
      amountOuts[i].finalValue = amounts[amounts.length - 1]
    }
  }

  console.log('amountsOutFormatted', amountOuts)

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
