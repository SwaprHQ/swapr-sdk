import { Token, Pair } from '../src/entities'
import { ChainId } from '../src/constants'

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
      const tokenA = new Token(ChainId.KOVAN, '0xd0a1e359811322d97991e03f863a0c30c2cf029c', 18)
      const tokenB = new Token(ChainId.KOVAN, '0xdd25bae0659fc06a8d00cd06c7f5a98d71bfb715', 18)
      const pairData = await Pair.fetchData(tokenA, tokenB)
      expect(pairData.swapFee).toEqual(20)
      expect(pairData.protocolFeeDenominator).toEqual(5)
      expect(pairData.liquidityToken.address).toEqual('0x2090339dc96Ad6366FaAfcb455FfF7D4f7c9F761')
      expect(pairData.liquidityToken.chainId).toEqual(ChainId.KOVAN)
      expect(pairData.liquidityToken.decimals).toEqual(18)
      expect(pairData.liquidityToken.symbol).toEqual('DXS')
      expect(pairData.liquidityToken.name).toEqual('DXswap')
    })
  })
})
