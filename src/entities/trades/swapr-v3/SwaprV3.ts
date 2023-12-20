import type { BaseProvider } from '@ethersproject/providers'
import dayjs from 'dayjs'

import { Currency, Fraction, validateAndParseAddress } from '@uniswap/sdk-core'
import invariant from 'tiny-invariant'

import { CurrencyAmount, Percent, Price, TokenAmount } from '../../fractions'

import { TradeWithSwapTransaction } from '../interfaces/trade'
import { RoutablePlatform } from '../routable-platform'
import { getProvider, tryGetChainId } from '../utils'
import { ONE, TradeType } from '../../../constants'

import { SWAPR_ALGEBRA_ROUTER_ABI, SWAPR_ALGEBRA_QUOTER_ABI, SWAPR_ALGEBRA_POOL_ABI } from './abi'
import { Contract, UnsignedTransaction } from 'ethers'
import { AddressZero } from '@ethersproject/constants'
import { TradeOptions } from '../interfaces/trade-options'
import { formatUnits, parseUnits } from '@ethersproject/units'
import { getRoutes } from './routes'
import { Route } from './route'

// const quoterInterface = new Interface(SWAPR_ALGEBRA_QUOTER_ABI)

// import { getBestV3TradeExactIn } from './algebra/getBestV3Trades'

// Constants
export const GNOSIS_CONTRACTS = {
  quoter: '0xcBaD9FDf0D2814659Eb26f600EFDeAF005Eda0F7',
  router: '0xfFB643E73f280B97809A8b41f7232AB401a04ee1',
}

export function getPoolsContract(pool_address: string) {
  return new Contract(pool_address, SWAPR_ALGEBRA_POOL_ABI, getProvider(100))
}

export function getRouterContract() {
  return new Contract(GNOSIS_CONTRACTS.router, SWAPR_ALGEBRA_ROUTER_ABI, getProvider(100))
}

export function getQuoterContract() {
  return new Contract(GNOSIS_CONTRACTS.quoter, SWAPR_ALGEBRA_QUOTER_ABI, getProvider(100))
}

interface SwaprV3ConstructorParams {
  maximumSlippage: Percent
  inputAmount: CurrencyAmount
  outputAmount: CurrencyAmount
  tradeType: TradeType
  chainId: number
  priceImpact: Percent
}

export class SwaprV3Trade extends TradeWithSwapTransaction {
  public constructor({
    inputAmount,
    outputAmount,
    maximumSlippage,
    priceImpact,
    tradeType,
    chainId,
  }: SwaprV3ConstructorParams) {
    super({
      details: undefined,
      type: tradeType,
      inputAmount,
      outputAmount,
      maximumSlippage,
      platform: RoutablePlatform.SWAPR_V3,
      chainId,
      executionPrice: new Price({
        baseCurrency: inputAmount.currency,
        quoteCurrency: outputAmount.currency,
        denominator: inputAmount.raw,
        numerator: outputAmount.raw,
      }),
      priceImpact,
      fee: new Percent('0', '100'),
      approveAddress: GNOSIS_CONTRACTS['router'],
    })
  }

  // SwaprV3Trade.getQuote({
  //   quoteCurrency: currencyOut,
  //   amount: currencyAmountIn,
  //   maximumSlippage,
  //   recipient: receiver,
  //   tradeType: TradeType.EXACT_INPUT,
  // })

  static async getQuote(
    { amount, quoteCurrency, tradeType, recipient, maximumSlippage }: any,
    provider?: BaseProvider,
  ): Promise<SwaprV3Trade | null> {
    const chainId = tryGetChainId(amount, quoteCurrency)
    invariant(chainId, 'SwaprV3Trade.getQuote: chainId is required')
    // Defaults

    recipient = recipient || AddressZero
    maximumSlippage = maximumSlippage || 0
    provider = provider || getProvider(chainId)

    const tokenIn = amount.currency
    const tokenOut = quoteCurrency

    invariant(
      (await provider.getNetwork()).chainId == chainId,
      `SwaprV3Trade.getQuote: currencies chainId does not match provider's chainId`,
    )

    if (tradeType === TradeType.EXACT_INPUT) {
      const routes: Route<Currency, Currency>[] = await getRoutes(tokenIn, tokenOut, chainId)
      console.log('routes:', routes)

      console.log('tokenIn:', tokenIn)
      console.log('tokenOut:', tokenOut)

      const quotedAmountOut = await getQuoterContract()
        .callStatic.quoteExactInputSingle(
          tokenIn.address,
          tokenOut.address,
          parseUnits(amount.toSignificant(), amount.currency.decimals),
          0,
        )
        .catch((error) => {
          console.error(`Error sending quoteExactInputSingle transaction: ${error}`)
        })

      const amountInReadable = amount.toSignificant()
      console.log('amountIn :', amountInReadable)
      const amountOutReadable = formatUnits(quotedAmountOut, tokenOut.decimals)
      console.log('amountOut:', amountOutReadable)

      if (quotedAmountOut) {
        return new SwaprV3Trade({
          maximumSlippage,
          inputAmount: amount,
          outputAmount: new TokenAmount(quoteCurrency, quotedAmountOut),
          tradeType: tradeType,
          chainId: chainId,
          priceImpact: new Percent('0', '1000'),
        })
      }
    } else {
      const quotedAmountIn = await getQuoterContract()
        .callStatic.quoteExactOutputSingle(
          amount.currency.address,
          quoteCurrency.address,
          parseUnits(amount.toSignificant(), amount.currency.decimals),
          0,
        )
        .catch((error) => {
          console.error(`Error sending quoteExactOutputSingle transaction: ${error}`)
        })

      console.log('====== SDK -> EXACT_OUTPUT ========')
      console.log('quoteCurrency', quoteCurrency)
      console.log('amount', amount)
      console.log('amount.toSignificant()', amount.toSignificant())
      console.log('amount.currency.decimals', amount.currency.decimals)
      console.log('quotedAmountIn:', quotedAmountIn.toString())

      // const amountIn: string = toHex(trade.maximumAmountIn(options.slippageTolerance, inputAmount).quotient)
      // const amountOut: string = toHex(trade.minimumAmountOut(options.slippageTolerance, outputAmount).quotient)

      if (quotedAmountIn) {
        return new SwaprV3Trade({
          maximumSlippage,
          inputAmount: new TokenAmount(quoteCurrency, quotedAmountIn),
          outputAmount: amount,
          tradeType: tradeType,
          chainId: chainId,
          priceImpact: new Percent('0', '1000'),
        })
      }
    }

    return null
  }

  public minimumAmountOut(): CurrencyAmount {
    if (this.tradeType === TradeType.EXACT_OUTPUT) {
      return this.outputAmount
    } else {
      const slippageAdjustedAmountOut = new Fraction(ONE)
        .add(this.maximumSlippage as Fraction)
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
      const slippageAdjustedAmountIn = new Fraction(ONE)
        .add(this.maximumSlippage as Fraction)
        .multiply(this.inputAmount.raw).quotient
      return this.inputAmount instanceof TokenAmount
        ? new TokenAmount(this.inputAmount.token, slippageAdjustedAmountIn)
        : CurrencyAmount.nativeCurrency(slippageAdjustedAmountIn, this.chainId)
    }
  }

  //   struct ExactInputSingleParams {
  //     uint256 amountIn;           // Amount of the input token to be swapped
  //     address recipient;          // Address that will receive the output tokens
  //     uint160 limitSqrtPrice;     // Limit on the square root price of the swap
  //     uint256 amountOutMinimum;   // Minimum amount of output tokens expected
  //     uint256 deadline;           // Timestamp by which the transaction must be mined
  //     address tokenIn;            // Address of the input token
  //     address tokenOut;           // Address of the output token
  // }

  public async swapTransaction(options: TradeOptions): Promise<UnsignedTransaction> {
    const to: string = validateAndParseAddress(options.recipient)
    const amountIn: string = toHex(this.maximumAmountIn())
    const amountOut: string = toHex(this.minimumAmountOut())
    const isTradeExactInput = this.tradeType === TradeType.EXACT_INPUT
    const routerContract = getRouterContract()

    const baseParams = {
      tokenIn: this.inputAmount.currency.address,
      tokenOut: this.outputAmount.currency.address,
      recipient: to,
      deadline: dayjs().add(30, 'm').unix(),
      sqrtPriceLimitX96: 0,
      // fee: this.fee --> route.pools[0].fee,
    }

    const exactInputSingleParams = {
      ...baseParams,
      amountIn: amountIn,
      amountOutMinimum: amountOut,
    }

    const exactOutputSingleParams = {
      ...baseParams,
      amountOut: amountOut,
      amountInMaximum: amountIn,
    }

    const methodName = isTradeExactInput ? 'exactInputSingle' : 'exactOutputSingle'
    const params = isTradeExactInput ? exactInputSingleParams : exactOutputSingleParams
    const populatedTransaction = await routerContract.populateTransaction[methodName](params)

    return populatedTransaction
  }
}

function toHex(currencyAmount: CurrencyAmount) {
  return `0x${currencyAmount.raw.toString(16)}`
}
