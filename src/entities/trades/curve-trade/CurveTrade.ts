import { Contract as MulticallContract, Provider as MulticallProvider } from 'ethers-multicall'
import { UnsignedTransaction } from '@ethersproject/transactions'
import { BigNumber } from '@ethersproject/bignumber'
import { parseUnits } from '@ethersproject/units'
import { Contract } from '@ethersproject/contracts'
import { Provider } from '@ethersproject/providers'
import invariant from 'tiny-invariant'

import { RoutablePlatform } from '../routable-platform/routable-platform'
import { ChainId, ONE, TradeType } from '../../../constants'
import { CurrencyAmount } from '../../fractions/currencyAmount'
import { TokenAmount } from '../../fractions/tokenAmount'
import { Fraction } from '../../fractions/fraction'
import { currencyEquals, Token } from '../../token'
import { Percent } from '../../fractions/percent'
import { Price } from '../../fractions/price'
import { Trade } from '../interfaces/trade'
import { Currency } from '../../currency'

// Curve imports
import { CurvePool, CURVE_POOLS } from './constants'
import { getProvider, MAINNET_CONTRACTS } from './contracts'
import { CURVE_ROUTER_ABI } from './abi'
import { wrappedCurrency } from '../utils'

const ZERO_HEX = '0x0'

/**
 * Returns the token index of a token in a Curve pool
 * @param pool the Curve pool
 * @param tokenAddress the token address
 */
function getTokenIndex(pool: CurvePool, tokenAddress: string) {
  return pool.tokens.findIndex(({ address }) => address.toLowerCase() == tokenAddress.toLowerCase())
}

/**
 *
 * @param pools The list of Curve pools
 * @param tokenInAddress Token in address
 * @param tokenOutAddress Token out address
 * @returns List of potential pools at which the trade can be done
 */
function getRoutablePools(pools: CurvePool[], tokenInAddress: string, tokenOutAddress: string) {
  return pools.filter(({ tokens }) => {
    const hasTokenIn = tokens.some(token => token.address.toLowerCase() === tokenInAddress.toLowerCase())
    const hasTokenOut = tokens.some(token => token.address.toLowerCase() === tokenOutAddress.toLowerCase())
    return hasTokenIn && hasTokenOut
  })
}

/**
 * Represents a trade executed against a list of pairs.
 * Does not account for slippage, i.e. trades that front run this trade and move the price.
 */
export class CurveTrade extends Trade {
  /**
   * An address the EOA must approve to spend its tokenIn
   */
  public readonly approveAddress: string
  /**
   * The Unsigned transaction
   */
  public readonly transactionRequest: UnsignedTransaction

  /**
   *
   * @param input Input token
   * @param output Output token
   * @param maximumSlippage Maximum slippage indicated by the user
   * @param tradeType Trade type
   * @param to Address to to which transaction is send
   * @param callData Unsigned transaction signature
   * @param value ETH value
   * @param approveAddress Approve address, defaults to `to`
   */
  public constructor(
    input: CurrencyAmount,
    output: CurrencyAmount,
    maximumSlippage: Percent,
    tradeType: TradeType,
    chainId: ChainId,
    transactionRequest: UnsignedTransaction,
    approveAddress?: string
  ) {
    invariant(!currencyEquals(input.currency, output.currency), 'CURRENCY')
    super(
      undefined,
      tradeType,
      input,
      output,
      new Price(input.currency, output.currency, input.raw, output.raw),
      maximumSlippage,
      new Percent('0', '100'),
      chainId,
      RoutablePlatform.CURVE
    )
    this.transactionRequest = transactionRequest
    this.approveAddress = approveAddress || (transactionRequest.to as string)
  }

  public minimumAmountOut(): CurrencyAmount {
    if (this.tradeType === TradeType.EXACT_OUTPUT) {
      return this.outputAmount
    } else {
      const slippageAdjustedAmountOut = new Fraction(ONE)
        .add(this.maximumSlippage)
        .invert()
        .multiply(this.outputAmount.raw).quotient

      return this.outputAmount instanceof TokenAmount
        ? new TokenAmount(this.outputAmount.token, slippageAdjustedAmountOut)
        : CurrencyAmount.nativeCurrency(slippageAdjustedAmountOut, this.chainId)
    }
  }

  public maximumAmountIn(): CurrencyAmount {
    if (this.tradeType === TradeType.EXACT_INPUT) {
      return this.inputAmount
    } else {
      const slippageAdjustedAmountIn = new Fraction(ONE).add(this.maximumSlippage).multiply(this.inputAmount.raw)
        .quotient
      return this.inputAmount instanceof TokenAmount
        ? new TokenAmount(this.inputAmount.token, slippageAdjustedAmountIn)
        : CurrencyAmount.nativeCurrency(slippageAdjustedAmountIn, this.chainId)
    }
  }

  /**
   * Checks if two tokens can be routed between on Curve Finance pools
   * @param tokenIn
   * @param tokenOut
   * @returns a `boolean` whether the tokens can be exchanged on Curve Finance pools
   */
  public static async canRoute(tokenIn: Token, tokenOut: Token): Promise<boolean> {
    // Validations
    const chainId: ChainId | undefined =
      tokenIn instanceof Token ? tokenIn.chainId : tokenOut instanceof Token ? tokenOut.chainId : undefined
    invariant(chainId !== undefined && RoutablePlatform.CURVE.supportsChain(chainId), 'CHAIN_ID')
    invariant(!tokenIn.equals(tokenOut), 'CURRENCY')
    const routerContract = new Contract(MAINNET_CONTRACTS.router, CURVE_ROUTER_ABI, getProvider(ChainId.MAINNET))
    // Get the the router an pass arguments
    return routerContract.canRoute(tokenIn.address, tokenOut.address)
  }

  public static async bestTradeExactIn(
    currencyAmountIn: CurrencyAmount,
    currencyOut: Currency,
    maximumSlippage: Percent,
    provider?: Provider
  ): Promise<CurveTrade | undefined> {
    const chainId: ChainId | undefined =
      currencyAmountIn instanceof TokenAmount
        ? currencyAmountIn.token.chainId
        : currencyOut instanceof Token
        ? currencyOut.chainId
        : undefined
    invariant(chainId !== undefined && RoutablePlatform.CURVE.supportsChain(chainId), 'CHAIN_ID')
    // const amountIn = wrappedAmount(currencyAmountIn, chainId)
    const tokenIn = wrappedCurrency(currencyAmountIn.currency, chainId)
    const tokenOut = wrappedCurrency(currencyOut, chainId)
    invariant(!tokenIn.equals(tokenOut), 'CURRENCY')

    // const etherOut = this.outputAmount.currency === nativeCurrency
    // // the router does not support both ether in and out
    // invariant(!(etherIn && etherOut), 'ETHER_IN_OUT')
    provider = provider || getProvider(chainId)

    let bestTrade
    try {
      // Use multicall provider
      const multicallProvider = new MulticallProvider(provider as any)
      await multicallProvider.init()

      let value = ZERO_HEX // With Curve, most value exchanged is ERC20
      // Get the Router contract to populate the unsigned transaction
      // Get all Curve pools for the chain
      const curvePools = CURVE_POOLS[chainId]
      // Find all pools that the trade can go through
      const routablePools = getRoutablePools(curvePools, tokenIn.address, tokenOut.address)
      // Gnosis Chain / xDAI
      if (chainId == ChainId.XDAI) {
        // Baisc trade information
        // const amountInBN = parseUnits(currencyAmountIn.toExact(), tokenIn.decimals)
        // Curve's 3pool: WXDAI+USDC+USDT
        const pool = curvePools[0]
        const poolContract = new Contract(pool.swapAddress, pool.abi, provider)
        const poolContractMulticall = new MulticallContract(pool.swapAddress, pool.abi as any)
        // Map token address to index
        const tokenInIndex = getTokenIndex(pool, tokenIn.address)
        const tokenOutIndex = getTokenIndex(pool, tokenOut.address)
        const [expectedAmountOut] = (await multicallProvider.all([
          poolContractMulticall.get_dy(
            tokenInIndex.toString(),
            tokenOutIndex.toString(),
            // amountInBN.toString()
            currencyAmountIn.toExact()
          )
        ])) as BigNumber[]
        /**
         * Construct the call data from router method exchange
         *
         * exchange(int128 i, int128 j, uint256_dx, uint256 _min_dy)
         * where:
         * { name: "_amount", type: "uint256" },
         * { name: "_route", type: "address[6]" },
         * { name: "_indices", type: "uint256[8]" },
         * { name: "_min_received", type: "uint256" }
         */
        const exchangeMethodSignature = 'exchange(int128,int128,uint256,uint256)'
        const exchangeMethodParams: (string | string[])[] = [
          tokenInIndex.toString(),
          tokenOutIndex.toString(),
          currencyAmountIn.toExact(),
          expectedAmountOut.toString()
        ]

        // Construct the populated transaction
        const populatedTransaction = await poolContract.populateTransaction[exchangeMethodSignature](
          ...exchangeMethodParams,
          {
            value
          }
        )

        // Assign the CurveTrade
        bestTrade = new CurveTrade(
          currencyAmountIn,
          Currency.isNative(currencyOut)
            ? CurrencyAmount.nativeCurrency(expectedAmountOut.toBigInt(), chainId)
            : new TokenAmount(tokenOut, expectedAmountOut.toBigInt()),
          maximumSlippage,
          TradeType.EXACT_INPUT,
          chainId,
          populatedTransaction,
          poolContract.address
        )
      }
      // Arbitrum One
      else if (chainId == ChainId.ARBITRUM_ONE) {
        const amountInBN = parseUnits(currencyAmountIn.toExact(), tokenIn.decimals)
        // For each pool, find the best outcome
        const trades = await Promise.all(
          routablePools.map(async pool => {
            try {
              const poolContract = new Contract(pool.swapAddress, pool.abi, provider)
              // Map token address to index
              const tokenInIndex = getTokenIndex(pool, tokenIn.address)
              const tokenOutIndex = getTokenIndex(pool, tokenOut.address)
              // Get expected output from the pool
              const dyMethodSignature = pool.isMeta ? 'get_dy_underlying' : 'get_dy'
              const expectedAmountOut = (await poolContract[dyMethodSignature](
                tokenInIndex.toString(),
                tokenOutIndex.toString(),
                amountInBN.toString()
              )) as BigNumber
              // Construct the unsigned transaction
              const exchangeSignature = pool.isMeta
                ? 'exchange_underlying(uint256,uint256,uint256,uint256)'
                : 'exchange(int128,int128,uint256,uint256)'
              const exchangeParams: (string | string[])[] = [
                tokenInIndex.toString(),
                tokenOutIndex.toString(),
                amountInBN.toString(),
                expectedAmountOut.toString()
              ]
              const populatedTransaction = await poolContract.populateTransaction[exchangeSignature](
                ...exchangeParams,
                {
                  value
                }
              )
              // Return the CurveTrade
              return new CurveTrade(
                currencyAmountIn,
                Currency.isNative(currencyOut)
                  ? CurrencyAmount.nativeCurrency(expectedAmountOut.toBigInt(), chainId)
                  : new TokenAmount(tokenOut, expectedAmountOut.toBigInt()),
                maximumSlippage,
                TradeType.EXACT_INPUT,
                chainId,
                populatedTransaction
              )
            } catch (e) {
              console.log('CurveTrade Error:', e)
            }
            return
          })
        )

        bestTrade = trades.find(trade => trade != undefined)
      }
      // Ethereum Mainnet
      else if (chainId == ChainId.MAINNET) {
        const nativeCurrency = Currency.getNative(chainId)
        // Determine if the currency sent is ETH
        // First using address
        // then, using symbol
        const etherIn =
          tokenIn.address.toLowerCase() == nativeCurrency.address?.toLowerCase()
            ? true
            : currencyAmountIn.currency.name?.toLowerCase() === nativeCurrency.name?.toLowerCase()
            ? true
            : currencyAmountIn.currency === nativeCurrency

        // Baisc trade information
        const amountInBN = parseUnits(currencyAmountIn.toExact(), tokenIn.decimals)

        // Find all pools that the trade can go through
        const routablePools = getRoutablePools(curvePools, tokenIn.address, tokenOut.address)
        // console.log({ etherIn, routablePools })

        // Compile all the output
        // Using Multicall contract
        const bestPoolOutputCalls = routablePools.map(pool => {
          const poolContractMulticall = new MulticallContract(pool.swapAddress, pool.abi as any)
          // Map token address to index
          const tokenInIndex = getTokenIndex(pool, tokenIn.address)
          const tokenOutIndex = getTokenIndex(pool, tokenOut.address)
          // Get expected output from the pool
          const dyMethodSignature = pool.isMeta ? 'get_dy_underlying' : 'get_dy'

          // // Debug
          // console.log('Fetching estimated output', dyMethodSignature, [
          //   tokenInIndex.toString(),
          //   tokenOutIndex.toString(),
          //   amountInBN.toString()
          // ])

          // Return the call bytes
          return poolContractMulticall[dyMethodSignature](
            tokenInIndex.toString(),
            tokenOutIndex.toString(),
            amountInBN.toString()
          )
        })

        // Get the estimated output
        const estimatedAmountOutPerPool = (await multicallProvider.all(bestPoolOutputCalls)) as BigNumber[]

        // Append back the pool list
        // Using the index
        const poolWithEstimatedAmountOut = estimatedAmountOutPerPool.map((estimatedAmountOut, index) => ({
          estimatedAmountOut,
          pool: curvePools[index]
        }))

        // Sort the pool by best output
        const poolWithEstimatedAmountOutSorted = poolWithEstimatedAmountOut.sort((poolA, poolB) =>
          poolA.estimatedAmountOut.gt(poolB.estimatedAmountOut)
            ? -1
            : poolA.estimatedAmountOut.eq(poolB.estimatedAmountOut)
            ? 0
            : 1
        )

        // Select the best (first) pool
        // among the sorted pools
        const { pool, estimatedAmountOut } = poolWithEstimatedAmountOutSorted[0]

        // Construct the contrac call
        const poolContract = new Contract(pool.swapAddress, pool.abi, provider)
        // Map token address to index
        const tokenInIndex = getTokenIndex(pool, tokenIn.address)
        const tokenOutIndex = getTokenIndex(pool, tokenOut.address)

        // console.log({ etherIn, tokenIn, tokenOut })

        // Construct the unsigned transaction
        // Default method signature
        // and params
        let exchangeSignature = 'exchange(int128,int128,uint256,uint256)'

        let exchangeParams: (string | string[] | boolean | boolean[])[] = [
          tokenInIndex.toString(),
          tokenOutIndex.toString(),
          amountInBN.toString(),
          estimatedAmountOut.toString()
        ]

        // If the pool has meta coins
        if (pool.isMeta) {
          exchangeSignature = 'exchange_underlying(uint256,uint256,uint256,uint256)'
        }

        // Pools that allow trading ETH
        if (pool.allowsTradingETH) {
          exchangeSignature = 'exchange(uint256,uint256,uint256,uint256,bool)'
          console.log(poolContract.populateTransaction)
          // Native currency ETH
          if (etherIn) {
            exchangeParams.push(true)
          }
        }

        // Determine if user has sent ETH
        if (etherIn) {
          value = currencyAmountIn.toExact()
        }

        const populatedTransaction = await poolContract.populateTransaction[exchangeSignature](...exchangeParams, {
          value
        })
        // Return the CurveTrade
        bestTrade = new CurveTrade(
          currencyAmountIn,
          Currency.isNative(currencyOut)
            ? CurrencyAmount.nativeCurrency(estimatedAmountOut.toBigInt(), chainId)
            : new TokenAmount(tokenOut, estimatedAmountOut.toBigInt()),
          maximumSlippage,
          TradeType.EXACT_INPUT,
          chainId,
          populatedTransaction
        )
      }
    } catch (error) {
      console.error('could not fetch Curve trade', error)
    }
    return bestTrade
  }

  public async swapTransaction(): Promise<UnsignedTransaction> {
    return {
      ...this.transactionRequest,
      gasLimit: this.transactionRequest.gasLimit ? BigNumber.from(this.transactionRequest.gasLimit) : undefined,
      value: BigNumber.from(this.transactionRequest.value)
    }
  }
}
