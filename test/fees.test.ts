import { ChainId, WETH, DXD, Fetcher, TEST_TOKENS, JSBI } from '../src'
import { ZERO_ADDRESS } from '../src/constants'

describe('fees', () => {
  // skip because uses old implementations, update tests with new local deployment
  describe('fetchSwapFee', () => {
    it.skip('Get WETH-DXD kovan fee', async () => {
      const WETH_DXD_KOVAN = await Fetcher.fetchPairData(WETH[ChainId.KOVAN], DXD[ChainId.KOVAN])
      const DXD_WEENUS_KOVAN = await Fetcher.fetchPairData(DXD[ChainId.KOVAN], TEST_TOKENS.WEENUS[ChainId.KOVAN])
      const DXDKovanFee = await Fetcher.fetchSwapFee(WETH_DXD_KOVAN.liquidityToken)
      expect(DXDKovanFee.fee).toEqual(JSBI.BigInt(20))
      const DXD_WEENUS_KOVAN_FEES = await Fetcher.fetchSwapFee(DXD_WEENUS_KOVAN.liquidityToken)
      expect(DXD_WEENUS_KOVAN_FEES.fee).toEqual(JSBI.BigInt(30))
    })
  })
  
  describe('fetchSwapFees', () => {
    it.skip('Get WETH-DXD kovan fee', async () => {
      const WETH_DXD_KOVAN = await Fetcher.fetchPairData(WETH[ChainId.KOVAN], DXD[ChainId.KOVAN])
      const DXD_WEENUS_KOVAN = await Fetcher.fetchPairData(DXD[ChainId.KOVAN], TEST_TOKENS.WEENUS[ChainId.KOVAN])
      const fees = await Fetcher.fetchSwapFees([WETH_DXD_KOVAN.liquidityToken, DXD_WEENUS_KOVAN.liquidityToken])
      expect(fees[0].fee).toEqual(JSBI.BigInt(20))
      expect(fees[1].fee).toEqual(JSBI.BigInt(30))
    })
  })
  
  describe('fetchAllSwapFees', () => {
    it.skip('Get all kovan fees', async () => {
      const WETH_DXD_KOVAN = await Fetcher.fetchPairData(WETH[ChainId.KOVAN], DXD[ChainId.KOVAN])
      const WETH_WEENUS_KOVAN = await Fetcher.fetchPairData(WETH[ChainId.KOVAN], TEST_TOKENS.WEENUS[ChainId.KOVAN])
      const DXD_WEENUS_KOVAN = await Fetcher.fetchPairData(DXD[ChainId.KOVAN], TEST_TOKENS.WEENUS[ChainId.KOVAN])
      const fees = await Fetcher.fetchAllSwapFees(ChainId.KOVAN)
      expect(fees[WETH_DXD_KOVAN.liquidityToken.address].fee).toEqual(JSBI.BigInt(20))
      expect(fees[WETH_WEENUS_KOVAN.liquidityToken.address].fee).toEqual(JSBI.BigInt(30))
      expect(fees[DXD_WEENUS_KOVAN.liquidityToken.address].fee).toEqual(JSBI.BigInt(30))
    })

    it.skip('Get kovan fees with cache', async () => {
      const WETH_DXD_KOVAN = await Fetcher.fetchPairData(WETH[ChainId.KOVAN], DXD[ChainId.KOVAN])
      const WETH_WEENUS_KOVAN = await Fetcher.fetchPairData(WETH[ChainId.KOVAN], TEST_TOKENS.WEENUS[ChainId.KOVAN])
      const DXD_WEENUS_KOVAN = await Fetcher.fetchPairData(DXD[ChainId.KOVAN], TEST_TOKENS.WEENUS[ChainId.KOVAN])
      const fees = await Fetcher.fetchAllSwapFees(ChainId.KOVAN, {
        [WETH_DXD_KOVAN.liquidityToken.address] : {
          fee: JSBI.BigInt(20),
          owner: ZERO_ADDRESS
        },
        [WETH_WEENUS_KOVAN.liquidityToken.address] : {
          fee: JSBI.BigInt(30),
          owner: ZERO_ADDRESS
        }
      })
      expect(fees[WETH_DXD_KOVAN.liquidityToken.address].fee).toEqual(JSBI.BigInt(20))
      expect(fees[WETH_WEENUS_KOVAN.liquidityToken.address].fee).toEqual(JSBI.BigInt(30))
      expect(fees[DXD_WEENUS_KOVAN.liquidityToken.address].fee).toEqual(JSBI.BigInt(30))
    })
  })
  
  describe('fetchProtocolFee', () => {
    it.skip('Get WETH-DXD kovan fee', async () => {
      const protocolFee = await Fetcher.fetchProtocolFee(ChainId.KOVAN)
      expect(protocolFee.feeDenominator).toEqual(5)
      expect(protocolFee.feeReceiver).toEqual(ZERO_ADDRESS)
    })
  })
})
