import { ChainId, WETH, Token, Fetcher } from '../src'

// TODO: replace the provider in these tests
describe.skip('data', () => {
  it('Token', async () => {
    const token = await Fetcher.fetchTokenData(ChainId.MAINNET, '0x6B175474E89094C44Da98b954EedeAC495271d0F') // DAI
    expect(token.decimals).toEqual(18)
  })

  it('Token:multiple', async () => {
    const tokens = await Fetcher.fetchMultipleTokensData(ChainId.MAINNET, [
      '0x6B175474E89094C44Da98b954EedeAC495271d0F', // DAI
      '0xa1d65E8fB6e87b60FECCBc582F7f97804B725521' // DXD
    ])
    const [dai, dxd] = tokens

    expect(dai.decimals).toEqual(18)
    expect(dai.symbol).toEqual('DAI')
    expect(dai.name).toEqual('Dai Stablecoin')

    expect(dxd.decimals).toEqual(18)
    expect(dxd.symbol).toEqual('DXD')
    expect(dxd.name).toEqual('DXdao')
  })

  /* it.only('TokenList', async () => {
    const tokenList = await Fetcher.fetchDxDaoTokenList(ChainId.MAINNET)
    console.log(tokenList)
  }) */

  it('Token:CACHE', async () => {
    const token = await Fetcher.fetchTokenData(ChainId.MAINNET, '0xE0B7927c4aF23765Cb51314A0E0521A9645F0E2A') // DGD
    expect(token.decimals).toEqual(9)
    const dxd = await Fetcher.fetchTokenData(ChainId.KOVAN, '0xDd25BaE0659fC06a8d00CD06C7f5A98D71bfB715') // DD
    expect(dxd.decimals).toEqual(18)
  })

  it('Pair', async () => {
    const token = new Token(ChainId.RINKEBY, '0xc7AD46e0b8a400Bb3C915120d284AafbA8fc4735', 18) // DAI
    const pair = await Fetcher.fetchPairData(WETH[ChainId.RINKEBY], token)
    expect(pair.liquidityToken.address).toEqual('0x8B22F85d0c844Cf793690F6D9DFE9F11Ddb35449')
  })
})
