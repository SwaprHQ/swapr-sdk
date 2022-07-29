// eslint-disable-next-line no-restricted-imports
import contractNetworks from '@cowprotocol/contracts/networks.json'
import { CowSdk, OrderKind, SimpleGetQuoteResponse, SupportedChainId } from '@cowprotocol/cow-sdk'
// eslint-disable-next-line no-restricted-imports
import { CowContext } from '@cowprotocol/cow-sdk/dist/utils/context'
// eslint-disable-next-line no-restricted-imports
import { SigningResult, UnsignedOrder } from '@cowprotocol/cow-sdk/dist/utils/sign'
import { Signer } from '@ethersproject/abstract-signer'
import { parseUnits } from '@ethersproject/units'
import dayjs from 'dayjs'
import invariant from 'tiny-invariant'

import { ChainId, ONE, TradeType } from '../../../constants'
import { Currency } from '../../currency'
import { CurrencyAmount } from '../../fractions/currencyAmount'
import { Fraction } from '../../fractions/fraction'
import { Percent } from '../../fractions/percent'
import { Price } from '../../fractions/price'
import { TokenAmount } from '../../fractions/tokenAmount'
import { currencyEquals, Token } from '../../token'
import { Trade } from '../interfaces/trade'
import { RoutablePlatform } from '../routable-platform'
import { tryGetChainId, wrappedCurrency } from '../utils'
import cowAppData from './app-data.json'
import { CoWTradeError } from './CoWTradeError'
import { CoWTradeGetBestTradeExactInParams, CoWTradeGetBestTradeExactOutParams, CoWTradeParams } from './types'

/**
 * CoWTrade uses CowFi API to find and route trades through the MEV-protected Gnosis Protocol v2
 */
export class CoWTrade extends Trade {
  readonly inputAmountWithoutFee: CurrencyAmount
  readonly outputAmountWithoutFee: CurrencyAmount
  /**
   * The original quote from CoW
   */
  public readonly quote: SimpleGetQuoteResponse

  /**
   * Order signature
   */
  private orderSignatureInfo?: SigningResult

  /**
   * The order
   */
  public readonly order: Omit<UnsignedOrder, 'appData'>

  /**
   * The execution price of the trade without CoW fee
   */
  public readonly executionPriceWithoutFee: Price

  /**
   * The Order Id. Obtained and set from after submitting the order from API
   */
  public orderId?: string

  /**
   * The trade fee amount. Fees are paid in sell token
   */
  public readonly feeAmount: CurrencyAmount

  constructor(params: CoWTradeParams) {
    const { chainId, feeAmount, inputAmount, maximumSlippage, outputAmount, quote, tradeType, fee } = params

    invariant(!currencyEquals(inputAmount.currency, outputAmount.currency), 'SAME_TOKEN')

    const GPv2Settlement = contractNetworks.GPv2Settlement as Record<
      ChainId,
      Record<'transactionHash' | 'address', string>
    >

    const approveAddress = GPv2Settlement[chainId]?.address

    invariant(approveAddress, 'Missing GPv2Settlement address')

    super({
      details: undefined,
      type: tradeType,
      inputAmount,
      outputAmount,
      executionPrice: new Price({
        baseCurrency: inputAmount.currency,
        quoteCurrency: outputAmount.currency,
        denominator: inputAmount.raw,
        numerator: outputAmount.raw,
      }),
      maximumSlippage,
      chainId,
      priceImpact: new Percent('0'),
      platform: RoutablePlatform.COW,
      fee,
      approveAddress,
    })
    this.quote = quote
    // construct the order
    this.order = {
      ...quote.quote,
      validTo: parseInt(quote.quote.validTo),
      receiver: quote.quote.receiver ?? quote.from,
    }

    this.executionPriceWithoutFee = new Price({
      baseCurrency: inputAmount.currency,
      quoteCurrency: outputAmount.currency,
      denominator: inputAmount.subtract(feeAmount).raw,
      numerator: outputAmount.raw,
    })

    this.inputAmountWithoutFee = this.inputAmount.subtract(feeAmount)
    this.outputAmountWithoutFee = this.outputAmount
    this.feeAmount = feeAmount
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
      const slippageAdjustedAmountIn = new Fraction(ONE)
        .add(this.maximumSlippage)
        .multiply(this.inputAmount.raw).quotient
      return this.inputAmount instanceof TokenAmount
        ? new TokenAmount(this.inputAmount.token, slippageAdjustedAmountIn)
        : CurrencyAmount.nativeCurrency(slippageAdjustedAmountIn, this.chainId)
    }
  }

  /**
   * Returns the Gnosis Protocol API, with access to low level methods.
   * @param quote Quote query params
   * @param chainId The chainId, defaults to Mainnet (1)
   * @returns
   */
  public static getCowSdk(chainId = ChainId.MAINNET, cowContext?: CowContext) {
    return new CowSdk(
      chainId as number,
      {
        ...cowContext,
        // Always append correct app data
        appDataHash: CoWTrade.getAppData(chainId).ipfsHashInfo.appDataHash,
      },
      {
        loglevel: 'debug',
      }
    )
  }

  /**
   * Fetches the order metadata from the API
   * @param orderId The order ID
   * @param chainId The chainId, defaults to Mainnet (1)
   */
  public static async getOrderMetadata(orderId: string, chainId: ChainId = ChainId.MAINNET) {
    return CoWTrade.getCowSdk(chainId).cowApi.getOrder(orderId)
  }

  /**
   * Computes and returns the best trade from Gnosis Protocol API
   * @param {object} obj options
   * @param {CurrencyAmount} obj.currencyAmountIn the amount of curreny in - sell token
   * @param {Currency} obj.currencyOut the currency out - buy token
   * @param {Percent} obj.maximumSlippage Maximum slippage
   * @param {Percent} obj.receiver The receiver
   * @returns A GPv2 trade if found, otherwise undefined
   */
  public static async bestTradeExactIn({
    currencyAmountIn,
    currencyOut,
    maximumSlippage,
    receiver,
    user,
  }: CoWTradeGetBestTradeExactInParams): Promise<CoWTrade | undefined> {
    // Try to extract the chain ID from the tokens
    const chainId = tryGetChainId(currencyAmountIn, currencyOut)
    // Require the chain ID
    invariant(chainId !== undefined && RoutablePlatform.COW.supportsChain(chainId), 'CHAIN_ID')
    const tokenIn = wrappedCurrency(currencyAmountIn.currency, chainId)
    const tokenOut = currencyOut as Token
    const amountInBN = parseUnits(currencyAmountIn.toSignificant(), tokenIn.decimals)
    invariant(!tokenIn.equals(tokenOut), 'CURRENCY')

    // const etherOut = this.outputAmount.currency === nativeCurrency
    // // the router does not support both ether in and out
    // invariant(!(etherIn && etherOut), 'ETHER_IN_OUT')
    try {
      const quoteResponse = await CoWTrade.getCowSdk(chainId).cowApi.getQuote({
        kind: OrderKind.SELL,
        amount: amountInBN.toString(),
        sellToken: tokenIn.address,
        buyToken: tokenOut.address,
        userAddress: user.toLowerCase(),
        receiver,
        validTo: dayjs().add(1, 'h').unix(), // Order expires in 1 hour
      })

      // Calculate the fee in terms of percentages
      const feeAmountBN = parseUnits(quoteResponse.quote.feeAmount.toString(), tokenIn.decimals)
        .div(quoteResponse.quote.sellAmount.toString())
        .mul(100)
      const tokenInDenominator = parseUnits('100', tokenIn.decimals).toBigInt()
      const fee = new Percent(feeAmountBN.toBigInt(), tokenInDenominator)

      const feeAmount = Currency.isNative(currencyAmountIn.currency)
        ? CurrencyAmount.nativeCurrency(quoteResponse.quote.feeAmount.toString(), chainId)
        : new TokenAmount(currencyAmountIn.currency as Token, quoteResponse.quote.feeAmount.toString())

      return new CoWTrade({
        chainId,
        maximumSlippage,
        tradeType: TradeType.EXACT_INPUT,
        inputAmount: currencyAmountIn,
        outputAmount: Currency.isNative(currencyOut)
          ? CurrencyAmount.nativeCurrency(quoteResponse.quote.buyAmount.toString(), chainId)
          : new TokenAmount(tokenOut, quoteResponse.quote.buyAmount.toString()),
        fee,
        feeAmount,
        quote: quoteResponse,
      })
    } catch (error) {
      console.error('could not fetch Cow trade', error)
      return
    }
  }

  /**
   * Computes and returns the best trade from Gnosis Protocol API
   * @param {object} obj options
   * @param {CurrencyAmount} obj.currencyAmountIn the amount of curreny in - sell token
   * @param {Currency} obj.currencyOut the currency out - buy token
   * @param {Percent} obj.maximumSlippage Maximum slippage
   * @returns A GPv2 trade if found, otherwise undefined
   */
  public static async bestTradeExactOut({
    currencyAmountOut,
    currencyIn,
    maximumSlippage,
    receiver,
    user,
  }: CoWTradeGetBestTradeExactOutParams): Promise<CoWTrade | undefined> {
    // Try to extract the chain ID from the tokens
    const chainId = tryGetChainId(currencyAmountOut, currencyIn)
    // Require the chain ID
    invariant(chainId !== undefined && RoutablePlatform.COW.supportsChain(chainId), 'CHAIN_ID')
    const tokenIn = wrappedCurrency(currencyIn, chainId)
    const tokenOut = currencyAmountOut.currency as Token
    const amountOutBN = parseUnits(currencyAmountOut.toSignificant(), tokenOut.decimals)
    invariant(!tokenIn.equals(tokenOut), 'CURRENCY')

    try {
      const cowSdk = CoWTrade.getCowSdk(chainId)

      const quoteResponse = await cowSdk.cowApi.getQuote({
        kind: OrderKind.BUY,
        amount: amountOutBN.toString(),
        sellToken: tokenIn.address,
        buyToken: tokenOut.address,
        userAddress: user.toLowerCase(),
        receiver,
        validTo: dayjs().add(1, 'h').unix(), // Order expires in 1 hour
      })

      // Calculate the fee in terms of percentages
      const feeAmountBN = parseUnits(quoteResponse.quote.feeAmount.toString(), tokenIn.decimals)
        .div(quoteResponse.quote.sellAmount.toString())
        .mul(100)
      const tokenInDenominator = parseUnits('100', tokenIn.decimals).toBigInt()
      const fee = new Percent(feeAmountBN.toBigInt(), tokenInDenominator)

      const inputAmount = Currency.isNative(tokenIn)
        ? CurrencyAmount.nativeCurrency(quoteResponse.quote.sellAmount.toString(), chainId)
        : new TokenAmount(tokenIn, quoteResponse.quote.sellAmount.toString())

      const outputAmount = Currency.isNative(currencyAmountOut.currency)
        ? CurrencyAmount.nativeCurrency(quoteResponse.quote.buyAmount.toString(), chainId)
        : new TokenAmount(tokenOut, quoteResponse.quote.buyAmount.toString())

      const feeAmount = Currency.isNative(currencyIn)
        ? CurrencyAmount.nativeCurrency(quoteResponse.quote.feeAmount.toString(), chainId)
        : new TokenAmount(currencyIn as Token, quoteResponse.quote.feeAmount.toString())

      return new CoWTrade({
        chainId,
        maximumSlippage,
        tradeType: TradeType.EXACT_OUTPUT,
        inputAmount,
        outputAmount,
        fee,
        feeAmount,
        quote: quoteResponse,
      })
    } catch (error) {
      console.error('could not fetch COW trade', error)
      return
    }
  }

  /**
   * Signs the order by adding signature
   * @param signer The signer
   * @returns The current instance
   * @throws {CoWTradeError} If the order is missing a receiver
   */
  public async signOrder(signer: Signer) {
    const { receiver } = this.quote.quote

    if (!receiver) {
      throw new CoWTradeError('Missing order receiver')
    }

    const signOrderResults = await CoWTrade.getCowSdk(this.chainId, {
      signer,
    }).signOrder(this.order)

    if (!signOrderResults.signature) {
      throw new CoWTradeError('Order was not signed')
    }

    this.orderSignatureInfo = signOrderResults

    return this
  }

  /**
   * Cancels the current instance order, if submitted
   * @param signer The signer
   * @returns True if the order was cancelled, false otherwise
   * @throws {CoWTradeError} If the order is yet to be submitted
   */
  public async cancelOrder(signer: Signer) {
    if (!this.orderId) {
      throw new CoWTradeError('CoWTrade: Missing order ID')
    }

    return CoWTrade.cancelOrder(this.orderId, this.chainId, signer)
  }

  /**
   * Cancels the current instance order, if submitted
   * @param orderId The order ID from GPv2
   * @param chainId The chain Id on which the order exists
   * @param signer A Signer with ability to sign the payload
   * @returns the signing results
   */
  public static async cancelOrder(orderId: string, chainId: ChainId, signer: Signer) {
    const cowSdk = CoWTrade.getCowSdk(chainId, {
      signer,
    })

    const orderCancellationSignature = await cowSdk.signOrderCancellation(orderId)

    const url = `${cowSdk.cowApi.API_BASE_URL[chainId as unknown as SupportedChainId]}/api/v1/orders/${orderId}`

    const response = await fetch(url, {
      method: 'delete',
      body: JSON.stringify(orderCancellationSignature),
    })

    if (response.ok && response.status === 200) {
      return true
    }

    throw new CoWTradeError(`CoWTrade: Failed to cancel order. API Status code: ${response.status}`)
  }

  /**
   * Submits the order to GPv2 API
   * @returns The order ID from GPv2
   * @throws {CoWTradeError} If the order is missing a signature
   */
  public async submitOrder(): Promise<string> {
    if (!this.orderSignatureInfo) {
      throw new CoWTradeError('CoWTrade: Missing order signature')
    }

    const { from, id: quoteId } = this.quote

    const sendOrderParams = {
      order: {
        ...this.order,
        quoteId,
        signature: this.orderSignatureInfo.signature as any,
        signingScheme: this.orderSignatureInfo.signingScheme as any,
      },
      owner: from,
    }

    this.orderId = await CoWTrade.getCowSdk(this.chainId).cowApi.sendOrder(sendOrderParams)

    return this.orderId
  }

  /**
   * Fetches the order status from the API
   * @throws {CoWTradeError} if the order ID is missing
   */
  public getOrderMetadata() {
    if (!this.orderId) {
      throw new CoWTradeError('CoWTrade: Missing order ID')
    }

    return CoWTrade.getOrderMetadata(this.orderId, this.chainId)
  }

  /**
   * Gets the app data for Swapr's CoW trade
   * @param chainId The chain Id
   */
  public static getAppData(chainId: ChainId) {
    return cowAppData[chainId as unknown as keyof typeof cowAppData]
  }
}

/**
 * @deprecated use CoWTrade instead
 */
export class GnosisProtocolTrade extends CoWTrade {}
