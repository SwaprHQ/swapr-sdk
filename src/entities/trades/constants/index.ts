import { ChainId } from '../../../constants'
import { Percent } from '../../../entities/fractions'

/**
 * Default maximum slippage tolerance at 3%
 */
export const maximumSlippage = new Percent('3', '100')

export const REFFERER_ADDRESS_CHAIN_MAPPING: Partial<Record<ChainId, string>> = {
  [ChainId.MAINNET]: '0x424F2fc764aFFaE340021d65EF0343af1847Cf1d',
  [ChainId.POLYGON]: '0x6810B7D3FEF83A37fF39501d03A42d9f57DF1df1',
  [ChainId.ARBITRUM_ONE]: '0x654a8A1B2ee4F0B4470c5C7db9794664BA70E076',
  [ChainId.BSC_MAINNET]: '0x09D4B6C9c1Cb8Cf2d49C928d0109ba19931eC3c2',
  [ChainId.OPTIMISM_MAINNET]: '0x78C90A9f0e457278350D8BFfb4ee8be28238f891',
  [ChainId.GNOSIS]: '0xfe0da679F5DC5732CF6E6522026B7f2ea2856597',
}
