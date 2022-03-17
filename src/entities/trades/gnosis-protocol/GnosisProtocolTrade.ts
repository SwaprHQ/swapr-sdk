import { Api as GnosisProtcolApi, Environment } from '@gnosis.pm/gp-v2-contracts/lib/commonjs/api'
import { GPv2VaultRelayer as GPv2VaultRelayerList } from '@gnosis.pm/gp-v2-contracts/networks.json'
import { Order, OrderKind } from '@gnosis.pm/gp-v2-contracts/lib/commonjs/order'
import { SigningScheme } from '@gnosis.pm/gp-v2-contracts/lib/commonjs/sign'
import { Signer } from '@ethersproject/abstract-signer'
import { signOrder as signOrderGP, signOrderCancellation as signOrderCancellationGP } from './signatures'
import { parseUnits } from '@ethersproject/units'
import invariant from 'tiny-invariant'
import dayjs from 'dayjs'
import { RoutablePlatform } from '../routable-platform/routable-platform'
import { CurrencyAmount } from '../../fractions/currencyAmount'
import { ChainId, ONE, TradeType } from '../../../constants'
import { tryGetChainId, wrappedCurrency } from '../utils'
import { TokenAmount } from '../../fractions/tokenAmount'
import { Fraction } from '../../fractions/fraction'
import { Percent } from '../../fractions/percent'
import { Price } from '../../fractions/price'
import { currencyEquals } from '../../token'
import { Trade } from '../interfaces/trade'
import { Currency } from '../../currency'

import { ORDER_APP_DATA, CHAIN_ID_TO_NETWORK, ORDER_PLACEHOLDER_ADDRESS } from './constants'
import {
  GnosisProtocolTradeBestTradeExactInParams,
  GnosisProtocolTradeBestTradeExactOutParams,
  GnosisProtocolTradeConstructorParams,
  GnosisProtocolTradeSwapOrderParams,
  GnosisProtocolTradeOrderMetadata,
} from './types'

/**
 * Gnosis Protcol Trade uses CowFi API to find and route trades through the MEV-protected Gnosis Protocol v2
 */
export class GnosisProtocolTrade extends Trade {
  /**
   * CowFi order details. The payload is signed and sent to CowFi API
   */
  public order: Order

  /**
   * An address the EOA must approve to spend its tokenIn
   */
  public readonly approveAddress: string

  /**
   * Order signature
   */
  private orderSignatureInfo?: {
    signingScheme: SigningScheme
    signature: string | null
  }

  /**
   * The Order Id. Obtained and set from after submitting the order from API
   */
  public orderId?: string

  /**
   * The trade fee amount. Fees are paid in sell token
   */
  public readonly feeAmount: CurrencyAmount

  constructor({
    chainId,
    inputAmount,
    maximumSlippage,
    outputAmount,
    tradeType,
    order,
    fee,
    feeAmount,
  }: GnosisProtocolTradeConstructorParams) {
    invariant(!currencyEquals(inputAmount.currency, outputAmount.currency), 'SAME_TOKEN')
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
      platform: RoutablePlatform.GNOSIS_PROTOCOL,
      fee,
    })
    this.order = order
    this.approveAddress = GPv2VaultRelayerList[chainId as unknown as keyof typeof GPv2VaultRelayerList].address
    // The fee token and amount are sell token
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
  public static getApi(chainId = ChainId.MAINNET) {
    return new GnosisProtcolApi(CHAIN_ID_TO_NETWORK[chainId as keyof typeof CHAIN_ID_TO_NETWORK], Environment.Prod)
  }

  /**
   * Fetches the order metadata from the API
   * @param orderId The order ID
   * @param chainId The chainId, defaults to Mainnet (1)
   */
  public static async getOrderMetadata(
    orderId: string,
    chainId: ChainId = ChainId.MAINNET
  ): Promise<GnosisProtocolTradeOrderMetadata> {
    const response = await fetch(`${GnosisProtocolTrade.getApi(chainId).baseUrl}/api/v1/orders/${orderId}`)

    if (!response.ok) {
      throw new Error('GnosisProtocolTrade: Failed to fetch order metadata')
    }

    return response.json()
  }

  /**
   * Computes and returns the best trade from Gnosis Protocol API
   * @param {object} obj options
   * @param {CurrencyAmount} obj.currencyAmountIn the amount of curreny in - sell token
   * @param {Currency} obj.currencyOut the currency out - buy token
   * @param {Percent} obj.maximumSlippage Maximum slippage
   * @param {Percent} obj.receiver The receiver
   * @param {Provider} provider an optional provider, the router defaults public providers
   * @returns the best trade if found
   */
  public static async bestTradeExactIn({
    currencyAmountIn,
    currencyOut,
    maximumSlippage,
    receiver = ORDER_PLACEHOLDER_ADDRESS,
  }: GnosisProtocolTradeBestTradeExactInParams): Promise<GnosisProtocolTrade | undefined> {
    // Try to extract the chain ID from the tokens
    const chainId = tryGetChainId(currencyAmountIn, currencyOut)
    // Require the chain ID
    invariant(chainId !== undefined && RoutablePlatform.GNOSIS_PROTOCOL.supportsChain(chainId), 'CHAIN_ID')
    const tokenIn = wrappedCurrency(currencyAmountIn.currency, chainId)
    const tokenOut = wrappedCurrency(currencyOut, chainId)
    const amountInBN = parseUnits(currencyAmountIn.toSignificant(), tokenIn.decimals)
    invariant(!tokenIn.equals(tokenOut), 'CURRENCY')

    // const etherOut = this.outputAmount.currency === nativeCurrency
    // // the router does not support both ether in and out
    // invariant(!(etherIn && etherOut), 'ETHER_IN_OUT')
    try {
      const { quote } = await GnosisProtocolTrade.getApi(chainId).getQuote({
        kind: OrderKind.SELL,
        sellAmountAfterFee: amountInBN.toString(),
        sellToken: tokenIn.address,
        buyToken: tokenOut.address,
        from: receiver ?? ORDER_PLACEHOLDER_ADDRESS,
        receiver,
        appData: ORDER_APP_DATA,
        validTo: dayjs().add(1, 'h').unix(), // Order expires in 1 hour
        partiallyFillable: false,
      })

      // Calculate the fee in terms of percentages
      const feeAmountBN = parseUnits(quote.feeAmount.toString(), tokenIn.decimals)
        .div(quote.sellAmount.toString())
        .mul(100)
      const tokenInDenominator = parseUnits('100', tokenIn.decimals).toBigInt()
      const fee = new Percent(feeAmountBN.toBigInt(), tokenInDenominator)

      return new GnosisProtocolTrade({
        chainId,
        maximumSlippage,
        tradeType: TradeType.EXACT_INPUT,
        inputAmount: currencyAmountIn,
        outputAmount: Currency.isNative(currencyOut)
          ? CurrencyAmount.nativeCurrency(quote.buyAmount.toString(), chainId)
          : new TokenAmount(tokenOut, quote.buyAmount.toString()),
        fee,
        order: quote,
        feeAmount: new TokenAmount(tokenIn, quote.feeAmount.toString()),
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
   * @param {Provider} provider an optional provider, the router defaults public providers
   * @returns the best trade if found
   */
  public static async bestTradeExactOut({
    currencyAmountOut,
    currencyIn,
    maximumSlippage,
    receiver = ORDER_PLACEHOLDER_ADDRESS,
  }: GnosisProtocolTradeBestTradeExactOutParams): Promise<GnosisProtocolTrade | undefined> {
    // Try to extract the chain ID from the tokens
    const chainId = tryGetChainId(currencyAmountOut, currencyIn)
    // Require the chain ID
    invariant(chainId !== undefined && RoutablePlatform.GNOSIS_PROTOCOL.supportsChain(chainId), 'CHAIN_ID')
    const tokenIn = wrappedCurrency(currencyIn, chainId)
    const tokenOut = wrappedCurrency(currencyAmountOut.currency, chainId)
    const amountOutBN = parseUnits(currencyAmountOut.toSignificant(), tokenOut.decimals)
    invariant(!tokenIn.equals(tokenOut), 'CURRENCY')

    // the router does not support both ether in and out
    // invariant(!(etherIn && etherOut), 'ETHER_IN_OUT')
    try {
      const { quote } = await GnosisProtocolTrade.getApi(chainId).getQuote({
        kind: OrderKind.BUY,
        buyAmountAfterFee: amountOutBN.toString(),
        sellToken: tokenIn.address,
        buyToken: tokenOut.address,
        from: receiver ?? ORDER_PLACEHOLDER_ADDRESS,
        receiver,
        appData: ORDER_APP_DATA,
        validTo: dayjs().add(1, 'h').unix(), // Order expires in 1 hour
        partiallyFillable: false,
      })

      // Calculate the fee in terms of percentages
      const feeAmountBN = parseUnits(quote.feeAmount.toString(), tokenIn.decimals)
        .div(quote.sellAmount.toString())
        .mul(100)
      const tokenInDenominator = parseUnits('100', tokenIn.decimals).toBigInt()
      const fee = new Percent(feeAmountBN.toBigInt(), tokenInDenominator)

      const inputAmount = Currency.isNative(tokenIn)
        ? CurrencyAmount.nativeCurrency(quote.sellAmount.toString(), chainId)
        : new TokenAmount(tokenIn, quote.sellAmount.toString())

      const outputAmount = Currency.isNative(currencyIn)
        ? CurrencyAmount.nativeCurrency(quote.buyAmount.toString(), chainId)
        : new TokenAmount(tokenOut, quote.buyAmount.toString())

      return new GnosisProtocolTrade({
        chainId,
        maximumSlippage,
        tradeType: TradeType.EXACT_OUTPUT,
        inputAmount,
        outputAmount,
        fee,
        feeAmount: new TokenAmount(tokenIn, quote.feeAmount.toString()),
        order: quote,
      })
    } catch (error) {
      console.error('could not fetch COW trade', error)
      return
    }
  }

  /**
   * Returns the order payload. The order must be signed
   * @param options
   * @returns
   */
  public swapOrder({ receiver }: GnosisProtocolTradeSwapOrderParams): Order {
    return {
      ...this.order,
      receiver,
    }
  }

  /**
   * Signs the order by adding signature
   * @param signature
   */
  public async signOrder(signer: Signer) {
    const { receiver } = this.order

    if (!receiver) {
      throw new Error('GnosisProtocolTrade: Missing order receiver')
    }

    // assign signature info and return instance
    this.orderSignatureInfo = await signOrderGP({ ...this.order, receiver }, this.chainId, signer)
    return this
  }

  /**
   *
   * @returns
   */
  public async cancelOrder(signer: Signer) {
    if (!this.orderId) {
      throw new Error('GnosisProtocolTrade: Missing order ID')
    }

    return signOrderCancellationGP(this.orderId, this.chainId, signer)
  }

  /**
   * Submits the order to GPv2 API
   * @returns The order ID from GPv2
   */
  public async submitOrder(): Promise<string> {
    if (!this.orderSignatureInfo) {
      throw new Error('GnosisProtocolTrade: Missing order signature')
    }

    console.log({
      orderSignatureInfo: this.orderSignatureInfo,
    })

    this.orderId = await GnosisProtocolTrade.getApi(this.chainId).placeOrder({
      order: this.order,
      signature: {
        data: this.orderSignatureInfo.signature as any,
        scheme: this.orderSignatureInfo.signingScheme,
      },
    })

    return this.orderId
  }

  /**
   * Fetches the order status from the API
   */
  public getOrderMetadata(): Promise<GnosisProtocolTradeOrderMetadata> {
    return GnosisProtocolTrade.getOrderMetadata(this.orderId as string, this.chainId)
  }
}
