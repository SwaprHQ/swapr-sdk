import { 
  ChainId, Pair, WETH, DXD, Fees, TEST_TOKENS,
  fetchSwapFee, fetchSwapFees, fetchAllSwapFees, fetchProtocolFee
} from '../src'
import { ZERO_ADDRESS } from '../src/constants'

describe('fees', () => {
  describe('fetchSwapFee', () => {
    it('Get WETH-DXD kovan fee', async () => {
      const WETH_DXD_KOVAN = await Pair.fetchData(WETH[ChainId.KOVAN], DXD[ChainId.KOVAN])
      const DXD_WEENUS_KOVAN = await Pair.fetchData(DXD[ChainId.KOVAN], TEST_TOKENS.WEENUS[ChainId.KOVAN])
      const DXDKovanFee = await fetchSwapFee(WETH_DXD_KOVAN.liquidityToken)
      expect(DXDKovanFee.fee).toEqual(20)
      const DXD_WEENUS_KOVAN_FEES = await fetchSwapFee(DXD_WEENUS_KOVAN.liquidityToken)
      expect(DXD_WEENUS_KOVAN_fee).toEqual(30)
    })
  })
  
  describe('fetchSwapFees', () => {
    it('Get WETH-DXD kovan fee', async () => {
      const WETH_DXD_KOVAN = await Pair.fetchData(WETH[ChainId.KOVAN], DXD[ChainId.KOVAN])
      const DXD_WEENUS_KOVAN = await Pair.fetchData(DXD[ChainId.KOVAN], TEST_TOKENS.WEENUS[ChainId.KOVAN])
      const fees = await fetchSwapFees([WETH_DXD_KOVAN.liquidityToken, DXD_WEENUS_KOVAN.liquidityToken])
      expect(fees[0].fee).toEqual(20)
      expect(fees[1].fee).toEqual(30)
    })
  })
  
  describe('fetchAllSwapFees', () => {
    it('Get WETH-DXD kovan fee', async () => {
      const fees = await fetchAllSwapFees(ChainId.KOVAN)
      console.log(fees)
    })
  })
  
  describe('fetchProtocolFee', () => {
    it('Get WETH-DXD kovan fee', async () => {
      const protocolFee = await fetchProtocolFee(ChainId.KOVAN)
      expect(protocolFee.feeDenominator).toEqual(5)
      expect(protocolFee.feeReceiver).toEqual(ZERO_ADDRESS)
    })
  })
})
