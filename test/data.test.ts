import { Contract } from '@ethersproject/contracts'
import { getNetwork } from '@ethersproject/networks'
import { getDefaultProvider } from '@ethersproject/providers'
import { TOKEN_REGISTRY_ADDRESS, TOKEN_REGISTRY_ABI, DXSWAP_TOKEN_LIST_ID } from '../src/constants'
import { ChainId, Fetcher, DXD } from '../src'
import { TokenInfo } from '../src/entities/token-list'
import { TEST_TOKENS } from './commons'

// TODO: replace the provider in these tests
describe('data', () => {
  it('Token', async () => {
    const token = await Fetcher.fetchTokenData(ChainId.MAINNET, TEST_TOKENS.WEENUS[ChainId.MAINNET].address) // DAI
    expect(token.decimals).toEqual(TEST_TOKENS.WEENUS[ChainId.MAINNET].decimals)
    expect(token.symbol).toEqual(TEST_TOKENS.WEENUS[ChainId.MAINNET].symbol)
    expect(token.name).toEqual(TEST_TOKENS.WEENUS[ChainId.MAINNET].name)
  })

  it('Token:multiple', async () => {
    const tokens = await Fetcher.fetchMultipleTokensData(ChainId.MAINNET, [
      TEST_TOKENS.WEENUS[ChainId.MAINNET].address,
      DXD[ChainId.MAINNET].address
    ])
    const [weenus, dxd] = tokens

    expect(weenus.decimals).toEqual(TEST_TOKENS.WEENUS[ChainId.MAINNET].decimals)
    expect(weenus.symbol).toEqual(TEST_TOKENS.WEENUS[ChainId.MAINNET].symbol)
    expect(weenus.name).toEqual(TEST_TOKENS.WEENUS[ChainId.MAINNET].name)

    expect(dxd.decimals).toEqual(DXD[ChainId.MAINNET].decimals)
    expect(dxd.symbol).toEqual(DXD[ChainId.MAINNET].symbol)
    expect(dxd.name).toEqual(DXD[ChainId.MAINNET].name)
  })

  it('TokenList', async () => {
    const provider = getDefaultProvider(getNetwork(ChainId.MAINNET))
    const tokenRegistryContract = new Contract(TOKEN_REGISTRY_ADDRESS[ChainId.MAINNET], TOKEN_REGISTRY_ABI, provider)
    const tokenAddresses = await tokenRegistryContract.getTokens(DXSWAP_TOKEN_LIST_ID[ChainId.MAINNET])
    const tokenList = await Fetcher.fetchDxDaoTokenList(ChainId.MAINNET)
    expect(tokenList.name).toBe('DXswap default token list')
    const { tokens } = tokenList
    expect(tokens.length <= tokenAddresses.length).toBe(true)
    const confirmedErc20Tokens = tokenAddresses.filter(
      (address: string) => !!tokens.find(token => token.address === address)
    )
    tokens.forEach((token: TokenInfo, index: number) => {
      expect(token.address).toBe(confirmedErc20Tokens[index])
    })
  })

  it('Token:CACHE', async () => {
    const token = await Fetcher.fetchTokenData(ChainId.MAINNET, TEST_TOKENS.WEENUS[ChainId.MAINNET].address)
    expect(token.decimals).toEqual(TEST_TOKENS.WEENUS[ChainId.MAINNET].decimals)
    const dxd = await Fetcher.fetchTokenData(ChainId.MAINNET, DXD[ChainId.MAINNET].address)
    expect(dxd.decimals).toEqual(DXD[ChainId.MAINNET].decimals)
  })
})
