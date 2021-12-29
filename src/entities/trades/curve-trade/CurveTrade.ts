import { UnsignedTransaction } from '@ethersproject/transactions'
import { BigNumber } from '@ethersproject/bignumber'
import { parseUnits } from '@ethersproject/units'
import { Contract } from '@ethersproject/contracts'
import invariant from 'tiny-invariant'

import { RoutablePlatform } from '../routable-platform/routable-platform'
import { ChainId, ONE, TradeType, ZERO_ADDRESS } from '../../../constants'
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
import { POOLS_XDAI } from './constants'

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

      console.log({
        slippageAdjustedAmountOut: slippageAdjustedAmountOut.toString(),
        maximumSlippage: this.maximumSlippage,
        outputAmount: this.outputAmount
      })

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
      const { router: routerContract } = await getCurveContracts(chainId)
      // Map symbols to address
      const currencyInAddress = mapTokenSymbolToAddress(tokenInSymbol, chainId)
      const currencyOutAddress = mapTokenSymbolToAddress(tokenOutSymbol, chainId)

      if (chainId == ChainId.XDAI) {
        /**
         * Gnosis Chain / xDAI
         */
        /**
         * Curve's 3pool: WXDAI+USDC+USDT
         */
        const curve3Pool = POOLS_XDAI[0]
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
        const methodSignatureName = 'exchange(int128,int128,uint256,uint256)'
        const args: (string | string[])[] = [
          tokenInIndex.toString(),
          tokenOutIndex.toString(),
          amountInBN.toString(),
          expectedAmountOut.toString()
        ]
        const populatedTransaction = await curve3PoolContract.populateTransaction[methodSignatureName](...args, {
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
          routerContract.address,
          populatedTransaction.data as string,
          value
        )
      } else if (chainId == ChainId.ARBITRUM_ONE) {
        /**
         * Arbitrum WIP
         */
      } else if (chainId == ChainId.MAINNET) {
        /**
         * Ethereum WIP
         */
        const [routes, indices, expectedAmountOut] = await routerContract.get_exchange_routing(
          currencyInAddress,
          currencyOutAddress,
          amountInBN.toString(),
          {
            from: ZERO_ADDRESS
          }
        )
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
        let methodSignatureName = 'exchange(uint256,address[6],uint256[8],uint256)'
        const args: (string | string[])[] = [
          amountInBN.toString(),
          routes,
          indices.map((index: string) => index.toString()),
          expectedAmountOut.toString()
        ]

        const populatedTransaction = await routerContract.populateTransaction[methodSignatureName](...args, {
          value
        })
        // Return the CurveTrade
        bestTrade = new CurveTrade(
          currencyAmountIn,
          Currency.isNative(currencyOut)
            ? CurrencyAmount.nativeCurrency(expectedAmountOut.toBigInt(), chainId)
            : new TokenAmount(tokenOut, expectedAmountOut.toBigInt()),
          maximumSlippage,
          TradeType.EXACT_INPUT,
          routerContract.address,
          populatedTransaction.data as string,
          value
        )
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
