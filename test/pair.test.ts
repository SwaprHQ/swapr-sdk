import { Token, Pair } from '../src/entities'
import { ChainId } from '../src/constants'
import { WETH, DXD, JSBI } from '../src'


describe('Pair', () => {
  describe('#getAddress', () => {
    it('returns the correct address', () => {
      const usdc = new Token(ChainId.MAINNET, '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', 18, 'USDC', 'USD Coin')
      const dai = new Token(ChainId.MAINNET, '0x6B175474E89094C44Da98b954EedeAC495271d0F', 18, 'DAI', 'DAI Stablecoin')
      expect(Pair.getAddress(usdc, dai)).toEqual('0x80Ba11B91525d570089BDEb2A80498fB56bf2D15')
    })
  })
  
  describe('#fetchData', () => {
    it('returns the correct address', async () => {
      const pairData = await Pair.fetchData(WETH[ChainId.KOVAN], DXD[ChainId.KOVAN])
      expect(pairData.swapFee).toEqual(JSBI.BigInt(20))
      expect(pairData.protocolFeeDenominator).toEqual(JSBI.BigInt(5))
      expect(pairData.liquidityToken.address).toEqual('0x2090339dc96Ad6366FaAfcb455FfF7D4f7c9F761')
      expect(pairData.liquidityToken.chainId).toEqual(ChainId.KOVAN)
      expect(pairData.liquidityToken.decimals).toEqual(18)
      expect(pairData.liquidityToken.symbol).toEqual('DXS')
      expect(pairData.liquidityToken.name).toEqual('DXswap')
    })
  })
})
