import { UnsignedTransaction } from '@ethersproject/transactions'
import { BigNumber } from '@ethersproject/bignumber'
import { parseUnits } from '@ethersproject/units'
import { Contract } from '@ethersproject/contracts'
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
import { getCurveContracts, getProvider, mapTokenSymbolToAddress } from './contracts'
import { CURVE_POOLS } from './constants'

const ZERO_HEX = '0x0'

export function wrappedAmount(currencyAmount: CurrencyAmount, chainId: ChainId): TokenAmount {
  if (currencyAmount instanceof TokenAmount) return currencyAmount
  if (Currency.isNative(currencyAmount.currency))
    return new TokenAmount(Token.getNativeWrapper(chainId), currencyAmount.raw)
  invariant(false, 'CURRENCY')
}

function wrappedCurrency(currency: Currency, chainId: ChainId): Token {
  if (currency instanceof Token) return currency
  if (Currency.isNative(currency)) return Token.getNativeWrapper(chainId)
  invariant(false, 'CURRENCY')
}

/**
 * Represents a trade executed against a list of pairs.
 * Does not account for slippage, i.e. trades that front run this trade and move the price.
 */
export class CurveTrade extends Trade {
  /**
   *  Router that will handle the swap logic
   */
  private readonly to: string

  /**
   * The unsigned transaction calldata
   */
  private readonly callData: string
  /**
   * Amount of ETH/native value to be submitted with the trade
   */
  private readonly value: string
  /**
   * An address the EOA must approve to spend its tokenIn
   */
  public readonly approveAddress: string

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
    to: string,
    callData: string,
    value: string,
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
      ChainId.MAINNET,
      RoutablePlatform.CURVE
    )
    this.to = to
    this.callData = callData
    this.value = value
    this.approveAddress = approveAddress || to
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
    // Map symbols to address
    const currencyInAddress = mapTokenSymbolToAddress(tokenIn.symbol as string, chainId)
    const currencyOutAddress = mapTokenSymbolToAddress(tokenOut.symbol as string, chainId)
    // Get the the router an pass arguments
    return (await getCurveContracts(chainId)).router.canRoute(currencyInAddress, currencyOutAddress)
  }

  public static async bestTradeExactIn(
    currencyAmountIn: CurrencyAmount,
    currencyOut: Currency,
    maximumSlippage: Percent
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

    let bestTrade
    try {
      const value = ZERO_HEX // With Curve, most value exchanged is ERC20
      // Baisc trade information
      const amountInBN = parseUnits(currencyAmountIn.toExact(), currencyAmountIn.currency.decimals)
      const tokenInSymbol = currencyAmountIn.currency.symbol as string
      const tokenOutSymbol = currencyOut.symbol as string
      // Get the Router contract to populate the unsigned transaction
      // Get all Curve pools for the chain
      const curvePools = CURVE_POOLS[chainId]
      // Gnosis Chain / xDAI
      if (chainId == ChainId.XDAI) {
        // Curve's 3pool: WXDAI+USDC+USDT
        const curve3Pool = curvePools[0]
        const curve3PoolContract = new Contract(curve3Pool.swapAddress, curve3Pool.abi, getProvider(chainId))
        // Map token address to index
        const tokenInIndex = curve3Pool.tokens.findIndex(({ symbol }) => symbol == tokenInSymbol)
        const tokenOutIndex = curve3Pool.tokens.findIndex(({ symbol }) => symbol == tokenOutSymbol)
        const expectedAmountOut = (await curve3PoolContract.get_dy(
          tokenInIndex.toString(),
          tokenOutIndex.toString(),
          amountInBN.toString()
        )) as BigNumber
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
        const args: (string | string[])[] = [
          tokenInIndex.toString(),
          tokenOutIndex.toString(),
          amountInBN.toString(),
          expectedAmountOut.toString()
        ]
        const populatedTransaction = await curve3PoolContract.populateTransaction[exchangeMethodSignature](...args, {
          value
        })
        // Assign the CurveTrade
        bestTrade = new CurveTrade(
          currencyAmountIn,
          Currency.isNative(currencyOut)
            ? CurrencyAmount.nativeCurrency(expectedAmountOut.toBigInt(), chainId)
            : new TokenAmount(tokenOut, expectedAmountOut.toBigInt()),
          maximumSlippage,
          TradeType.EXACT_INPUT,
          curve3PoolContract.address,
          populatedTransaction.data as string,
          value
        )
      }
      // Arbitrum One
      else if (chainId == ChainId.ARBITRUM_ONE) {
        // Find all pools that the trade can go through
        const routablePools = curvePools.filter(({ tokens }) =>
          tokens.some(token => token.address.toLowerCase() === tokenIn.address.toLowerCase())
        )
        // For each pool, find the best outcome
        const trades = []
        for await (const pool of routablePools) {
          try {
            const poolContract = new Contract(pool.swapAddress, pool.abi, getProvider(chainId))
            // Map token address to index
            const tokenInIndex = pool.tokens.findIndex(({ symbol }) => symbol == tokenInSymbol)
            const tokenOutIndex = pool.tokens.findIndex(({ symbol }) => symbol == tokenOutSymbol)
            // Get expected output from the pool
            const dyMethodSignature = pool.isMeta ? 'get_dy_underlying' : 'get_dy'
            const expectedAmountOut = (await poolContract[dyMethodSignature](
              tokenInIndex.toString(),
              tokenOutIndex.toString(),
              amountInBN.toString()
            )) as BigNumber
            // Construct the unsigned transaction
            const exchangeMethodSignature = 'exchange_underlying(uint256,uint256,uint256,uint256)'
            const args: (string | string[])[] = [
              tokenInIndex.toString(),
              tokenOutIndex.toString(),
              amountInBN.toString(),
              expectedAmountOut.toString()
            ]
            const populatedTransaction = await poolContract.populateTransaction[exchangeMethodSignature](...args, {
              value
            })
            // Return the CurveTrade
            trades.push(
              new CurveTrade(
                currencyAmountIn,
                Currency.isNative(currencyOut)
                  ? CurrencyAmount.nativeCurrency(expectedAmountOut.toBigInt(), chainId)
                  : new TokenAmount(tokenOut, expectedAmountOut.toBigInt()),
                maximumSlippage,
                TradeType.EXACT_INPUT,
                poolContract.address,
                populatedTransaction.data as string,
                value
              )
            )
          } catch (e) {}
        }

        bestTrade = trades.find(trade => trade != undefined)
      }
      // Ethereum WIP
      else if (chainId == ChainId.MAINNET) {
      }
    } catch (error) {
      console.error('could not fetch Curve trade', error)
    }
    return bestTrade
  }

  public async swapTransaction(): Promise<UnsignedTransaction> {
    return {
      to: this.to,
      data: this.callData,
      value: BigNumber.from(this.value)
    }
  }
}
