import { BigNumber } from '@ethersproject/bignumber'
import { utils } from 'ethers'
import { BTC_COINS, ETH_COINS, LINK_COINS } from './constants'

export const toBN = (n: BigNumber, decimals = 18): BigNumber => {
  // @ts-ignore
  return BigNumber.from(utils.formatUnits(n, decimals)).mul(decimals)
}

export const toLowerCase = (str: string) => str.toLocaleLowerCase()

/**
 * Get the smallest possible
 * @todo: refactor using live price
 * @param coinAddress
 * @returns
 */
export function getSmallAmountForCoin(coinAddress: string) {
  coinAddress = coinAddress.toLowerCase()
  let smallAmount = '10' // $10 or €10
  if (
    Object.values(BTC_COINS)
      .map(toLowerCase)
      .includes(coinAddress)
  ) {
    smallAmount = '0.00025' // = 10$ when BTC = $40k
  } else if (
    Object.values(ETH_COINS)
      .map(toLowerCase)
      .includes(coinAddress)
  ) {
    smallAmount = '0.004' // = $10 when ETH = $2.5k
  } else if (
    Object.values(LINK_COINS)
      .map(toLowerCase)
      .includes(coinAddress)
  ) {
    smallAmount = '0.5' // = $10 when LINK = $20
  }

  return smallAmount
}
