import JSBI from 'jsbi'
import { Contract } from '@ethersproject/contracts'
import { getNetwork } from '@ethersproject/networks'
import { getDefaultProvider, Provider } from '@ethersproject/providers'
import { TokenAmount } from './entities/fractions/tokenAmount'
import { Pair } from './entities/pair'
import IDXswapPair from 'dxswap-core/build/IDXswapPair.json'
import IDXswapFactory from 'dxswap-core/build/IDXswapFactory.json'
import invariant from 'tiny-invariant'
import ERC20Abi from './abis/ERC20.json'
import TokenRegistryAbi from './abis/token-registry.json'
import {
  ChainId,
  BigintIsh,
  FACTORY_ADDRESS,
  PERMISSIVE_MULTICALL_ADDRESS,
  PERMISSIVE_MULTICALL_ABI,
  TOKEN_REGISTRY_ADDRESS,
  DXSWAP_TOKEN_LIST_ID
} from './constants'
import { Token } from './entities/token'
import { Currency } from './entities/currency'
import { Interface } from '@ethersproject/abi'
import { TokenList, TokenInfo } from 'entities/token-list'

const TOKEN_DATA_CACHE: {
  [chainId: number]: { [address: string]: Currency }
} = {
  [ChainId.MAINNET]: {
    '0xE0B7927c4aF23765Cb51314A0E0521A9645F0E2A': { decimals: 9, symbol: 'DGD', name: 'DigixDAO' } // DGD
  }
}

/**
 * Contains methods for constructing instances of pairs and tokens from on-chain data.
 */
export abstract class Fetcher {
  /**
   * Cannot be constructed.
   */
  private constructor() {}

  /**
   * Fetch information for a given token on the given chain, using the given ethers provider.
   * @param chainId chain of the token
   * @param address address of the token on the chain
   * @param provider provider used to fetch the token
   */
  public static async fetchTokenData(
    chainId: ChainId,
    address: string,
    provider: Provider = getDefaultProvider(getNetwork(chainId))
  ): Promise<Token> {
    let tokenData: Currency
    if (TOKEN_DATA_CACHE?.[chainId]?.[address]) {
      tokenData = TOKEN_DATA_CACHE[chainId][address]
    } else {
      const multicall = new Contract(PERMISSIVE_MULTICALL_ADDRESS[chainId], PERMISSIVE_MULTICALL_ABI, provider)
      const erc20Interface = new Contract(address, ERC20Abi, provider).interface
      const symbolFunction = erc20Interface.getFunction('symbol()')
      const nameFunction = erc20Interface.getFunction('name()')
      const decimalsFunction = erc20Interface.getFunction('decimals()')
      const result = await multicall.aggregate([
        [address, erc20Interface.encodeFunctionData(symbolFunction)],
        [address, erc20Interface.encodeFunctionData(nameFunction)],
        [address, erc20Interface.encodeFunctionData(decimalsFunction)]
      ])
      tokenData = {
        symbol: erc20Interface.decodeFunctionResult(symbolFunction, result.returnData[0])[0],
        name: erc20Interface.decodeFunctionResult(nameFunction, result.returnData[1])[0],
        decimals: erc20Interface.decodeFunctionResult(decimalsFunction, result.returnData[2])[0]
      }
      TOKEN_DATA_CACHE[chainId][address] = tokenData
    }
    return new Token(chainId, address, tokenData.decimals, tokenData.symbol, tokenData.name)
  }

  /**
   * Fetch on-chain, information on multiple given ERC20 token addresses, using the given ethers provider
   * (or a default one if not provided). The results are cached for efficient subsequent accesses.
   * @param chainId chain of the token
   * @param addresses addresses of the tokens for which the data is needed
   * @param provider provider used to fetch the token
   */
  public static async fetchMultipleTokensData(
    chainId: ChainId,
    addresses: string[],
    provider: Provider = getDefaultProvider(getNetwork(chainId))
  ): Promise<Token[]> {
    const { previouslyCachedTokens, missingTokens } = addresses.reduce<{
      previouslyCachedTokens: Token[]
      missingTokens: string[]
    }>(
      (
        accumulator: {
          previouslyCachedTokens: Token[]
          missingTokens: string[]
        },
        address: string,
        _currentIndex: number,
        _array: string[]
      ): { previouslyCachedTokens: Token[]; missingTokens: string[] } => {
        if (TOKEN_DATA_CACHE?.[chainId]?.[address]) {
          const cachedToken = TOKEN_DATA_CACHE[chainId][address]
          accumulator.previouslyCachedTokens.push(
            new Token(chainId, address, cachedToken.decimals, cachedToken.symbol, cachedToken.name)
          )
        } else {
          accumulator.missingTokens.push(address)
        }
        return accumulator
      },
      { previouslyCachedTokens: [], missingTokens: [] }
    )
    const tokenData = previouslyCachedTokens
    if (missingTokens.length > 0) {
      const erc20Interface = new Interface(ERC20Abi)
      const getSymbolFunction = erc20Interface.getFunction('symbol()')
      const getNameFunction = erc20Interface.getFunction('name()')
      const getDecimalsFunction = erc20Interface.getFunction('decimals()')
      const multicall = new Contract(PERMISSIVE_MULTICALL_ADDRESS[chainId], PERMISSIVE_MULTICALL_ABI, provider)
      const aggregatedCalls = missingTokens.reduce<[string, string][]>(
        (
          accumulator: [string, string][],
          address: string,
          _currentIndex: number,
          _array: string[]
        ): [string, string][] => {
          accumulator.push([address, erc20Interface.encodeFunctionData(getSymbolFunction)])
          accumulator.push([address, erc20Interface.encodeFunctionData(getNameFunction)])
          accumulator.push([address, erc20Interface.encodeFunctionData(getDecimalsFunction)])
          return accumulator
        },
        []
      )
      const result = await multicall.aggregateWithPermissiveness(aggregatedCalls)
      const returnData = result[1]
      missingTokens.forEach((address: string, index: number) => {
        const [wrappedSymbol, wrappedName, wrappedDecimals] = returnData.slice(index * 3, index * 3 + 3)
        if (!wrappedSymbol.success || !wrappedName.success || !wrappedDecimals.success) {
          console.warn(`could not fetch ERC20 data for address ${address}`)
          return
        }
        try {
          tokenData.push(
            new Token(
              chainId,
              address,
              erc20Interface.decodeFunctionResult(getDecimalsFunction, wrappedDecimals.data)[0],
              erc20Interface.decodeFunctionResult(getSymbolFunction, wrappedSymbol.data)[0],
              erc20Interface.decodeFunctionResult(getNameFunction, wrappedName.data)[0]
            )
          )
        } catch (error) {
          console.error(`error decoding ERC20 data for address ${address}`)
        }
      })
    }
    return tokenData
  }

  /**
   * Fetches information about a pair and constructs a pair from the given two tokens.
   * @param tokenA first token
   * @param tokenB second token
   * @param provider the provider to use to fetch the data
   */
  public static async fetchPairData(
    tokenA: Token,
    tokenB: Token,
    provider = getDefaultProvider(getNetwork(tokenA.chainId))
  ): Promise<Pair> {
    invariant(tokenA.chainId === tokenB.chainId, 'CHAIN_ID')
    const address = Pair.getAddress(tokenA, tokenB)
    const [reserves0, reserves1] = await new Contract(address, IDXswapPair.abi, provider).getReserves()
    const balances = tokenA.sortsBefore(tokenB) ? [reserves0, reserves1] : [reserves1, reserves0]
    const tokenAmountA = new TokenAmount(tokenA, balances[0])
    const tokenAmountB = new TokenAmount(tokenB, balances[1])
    const tokenAmounts = tokenAmountA.token.sortsBefore(tokenAmountB.token) // does safety checks
      ? [tokenAmountA, tokenAmountB]
      : [tokenAmountB, tokenAmountA]
    const liquidityToken = new Token(
      tokenAmounts[0].token.chainId,
      Pair.getAddress(tokenAmounts[0].token, tokenAmounts[1].token),
      18,
      'DXS',
      'DXswap'
    )
    const swapFee = JSBI.BigInt(await new Contract(liquidityToken.address, IDXswapPair.abi, provider).swapFee())
    const protocolFeeDenominator = JSBI.BigInt(
      await new Contract(
        FACTORY_ADDRESS[tokenAmountA.token.chainId],
        IDXswapFactory.abi,
        provider
      ).protocolFeeDenominator()
    )
    return new Pair(tokenAmountA, tokenAmountB, swapFee, protocolFeeDenominator)
  }

  /**
   * Fetches swap fee information from a liquidity token of a token pair
   * @param liquidityToken the liquidity token from which the swap fee info will be fetched
   * @param provider the provider to use to fetch the data
   */
  public static async fetchSwapFee(
    liquidityToken: Token,
    provider = getDefaultProvider(getNetwork(liquidityToken.chainId))
  ): Promise<{
    fee: BigintIsh
    owner: string
  }> {
    return {
      fee: JSBI.BigInt(await new Contract(liquidityToken.address, IDXswapPair.abi, provider).swapFee()),
      owner: await new Contract(FACTORY_ADDRESS[liquidityToken.chainId], IDXswapFactory.abi, provider).feeToSetter()
    }
  }

  /**
   * Fetches swap fee information from liquidity tokens of token pairs
   * @param liquidityToken the liquidity tokens from which the swap fee info will be fetched
   * @param provider the provider to use to fetch the data
   */
  public static async fetchSwapFees(
    liquidityTokens: Token[],
    provider = getDefaultProvider(getNetwork(liquidityTokens[0].chainId))
  ): Promise<
    {
      fee: BigintIsh
      owner: string
    }[]
  > {
    const multicall = new Contract(
      PERMISSIVE_MULTICALL_ADDRESS[liquidityTokens[0].chainId],
      PERMISSIVE_MULTICALL_ABI,
      provider
    )
    const factoryContract = new Contract(FACTORY_ADDRESS[liquidityTokens[0].chainId], IDXswapFactory.abi, provider)
    const liquidityTokenContract = new Contract(liquidityTokens[0].address, IDXswapPair.abi, provider)
    let calls = []
    calls.push({
      address: factoryContract.address,
      callData: factoryContract.interface.encodeFunctionData(factoryContract.interface.getFunction('feeToSetter()'))
    })
    for (let tokenPairsIndex = 0; tokenPairsIndex < liquidityTokens.length; tokenPairsIndex++) {
      calls.push({
        address: liquidityTokens[tokenPairsIndex].address,
        callData: liquidityTokenContract.interface.encodeFunctionData(
          liquidityTokenContract.interface.getFunction('swapFee()')
        )
      })
    }
    const result = await multicall.aggregate(calls.map(call => [call.address, call.callData]))
    const owner = factoryContract.interface.decodeFunctionResult(
      factoryContract.interface.getFunction('feeToSetter()'),
      result.returnData[0]
    )[0]
    let fees = []
    for (let resultIndex = 1; resultIndex < result.returnData.length; resultIndex++) {
      fees.push({
        fee: JSBI.BigInt(
          liquidityTokenContract.interface.decodeFunctionResult(
            liquidityTokenContract.interface.getFunction('swapFee()'),
            result.returnData[resultIndex]
          )[0]
        ),
        owner
      })
    }
    return fees
  }

  /**
   * Fetches swap fee information of all registered token pairs from factory
   * @param chainId the chainId of the network to fecth the swap fees
   * @param swapFeesCache a cache of already fetched fees to be skiped
   * @param provider the provider to use to fetch the data
   */
  public static async fetchAllSwapFees(
    chainId: ChainId,
    swapFeesCache: {
      [key: string]: {
        fee: BigintIsh
        owner: string
      }
    } = {},
    provider = getDefaultProvider(getNetwork(chainId))
  ): Promise<{
    [key: string]: {
      fee: BigintIsh
      owner: string
    }
  }> {
    const multicall = new Contract(PERMISSIVE_MULTICALL_ADDRESS[chainId], PERMISSIVE_MULTICALL_ABI, provider)
    const factoryContract = new Contract(FACTORY_ADDRESS[chainId], IDXswapFactory.abi, provider)
    const allPairsLength = await factoryContract.allPairsLength()
    let allSwapPairs: {
      [key: string]: {
        fee: BigintIsh
        owner: string
      }
    } = {}

    // Get first token pairs from cache
    let tokenPairsCache = Object.keys(swapFeesCache)
    let tokenPairsToFetch: Token[] = []
    for (let tokenPaisCacheIndex = 0; tokenPaisCacheIndex < tokenPairsCache.length; tokenPaisCacheIndex++) {
      allSwapPairs[tokenPairsCache[tokenPaisCacheIndex]] = {
        fee: swapFeesCache[tokenPairsCache[tokenPaisCacheIndex]].fee,
        owner: swapFeesCache[tokenPairsCache[tokenPaisCacheIndex]].owner
      }
    }

    // Get rest of the token pairs that are not cached
    let calls = []
    for (let pairIndex = tokenPairsCache.length; pairIndex < allPairsLength; pairIndex++)
      calls.push({
        address: factoryContract.address,
        callData: factoryContract.interface.encodeFunctionData(
          factoryContract.interface.getFunction('allPairs(uint)'),
          [pairIndex]
        )
      })
    const result = await multicall.aggregate(calls.map(call => [call.address, call.callData]))
    for (let resultIndex = 0; resultIndex < result.returnData.length; resultIndex++) {
      const tokenPairAddress = factoryContract.interface.decodeFunctionResult(
        factoryContract.interface.getFunction('allPairs(uint256)'),
        result.returnData[resultIndex]
      )[0]
      tokenPairsToFetch.push(new Token(chainId, tokenPairAddress, 18, 'DXS', 'DXswap'))
    }

    // Fetch the pairs that we dont have the fee and owner
    const swapFeesFetched = await this.fetchSwapFees(tokenPairsToFetch, provider)
    for (let tokenPairsToFetchIndex = 0; tokenPairsToFetchIndex < tokenPairsToFetch.length; tokenPairsToFetchIndex++)
      allSwapPairs[tokenPairsToFetch[tokenPairsToFetchIndex].address] = swapFeesFetched[tokenPairsToFetchIndex]
    return allSwapPairs
  }

  /**
   * Fetches protocol fee information from the token pair factory
   * @param chainId the chainId of the network to fecth the protocol fee
   * @param provider the provider to use to fetch the data
   */
  public static async fetchProtocolFee(
    chainId: ChainId,
    provider = getDefaultProvider(getNetwork(chainId))
  ): Promise<{
    feeDenominator: BigintIsh
    feeReceiver: string
  }> {
    const factoryContract = await new Contract(FACTORY_ADDRESS[chainId], IDXswapFactory.abi, provider)
    const feeDenominator = await factoryContract.protocolFeeDenominator()
    const feeReceiver = await factoryContract.feeTo()
    return { feeDenominator, feeReceiver }
  }

  /**
   * Fetches the default DXdao token list from the token registry scheme.
   * @param chainId the chainId of the network to fecth the protocol fee
   * @param provider the provider to use to fetch the data
   */
  public static async fetchDxDaoTokenList(
    chainId: ChainId,
    provider = getDefaultProvider(getNetwork(chainId))
  ): Promise<TokenList> {
    const tokenRegistryContract = new Contract(TOKEN_REGISTRY_ADDRESS[chainId], TokenRegistryAbi, provider)
    const tokenAddresses = await tokenRegistryContract.getTokens(DXSWAP_TOKEN_LIST_ID[chainId])
    const tokens = await this.fetchMultipleTokensData(chainId, tokenAddresses, provider)
    return {
      name: 'DXswap default token list',
      tokens: tokens.map(
        (token: Token): TokenInfo => ({
          chainId,
          address: token.address,
          name: token.name!,
          decimals: token.decimals,
          symbol: token.symbol!
        })
      )
    }
  }
}
