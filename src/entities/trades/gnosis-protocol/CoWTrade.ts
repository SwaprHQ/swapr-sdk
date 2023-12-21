// eslint-disable-next-line no-restricted-imports
import contractNetworks from '@cowprotocol/contracts/networks.json'
import { CowSdk, OrderKind, SimpleGetQuoteResponse } from '@cowprotocol/cow-sdk'
// eslint-disable-next-line no-restricted-imports
import { CowContext } from '@cowprotocol/cow-sdk/dist/utils/context'
// eslint-disable-next-line no-restricted-imports
import { SigningResult, UnsignedOrder } from '@cowprotocol/cow-sdk/dist/utils/sign'
import { Signer } from '@ethersproject/abstract-signer'
import { parseUnits } from '@ethersproject/units'
import dayjs from 'dayjs'
import invariant from 'tiny-invariant'

import { ChainId, ONE, TradeType, ZERO } from '../../../constants'
import { Currency } from '../../currency'
import { CurrencyAmount } from '../../fractions/currencyAmount'
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

const ZERO_PERCENT = new Percent(ZERO, ONE)

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

    const approveAddress = CoWTrade.getVaultRelayerAddress(chainId)

    invariant(approveAddress, 'Missing GPv2VaultRelayer address')

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
    return this.outputAmount
  }

  public maximumAmountIn(): CurrencyAmount {
    return this.inputAmount
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
    // the router does not support both ether in and out
    // invariant(!(etherIn && etherOut), 'ETHER_IN_OUT')
    try {
      const quoteResponse = await CoWTrade.getCowSdk(chainId).cowApi.getQuote({
        appData: CoWTrade.getAppData(chainId).ipfsHashInfo.appDataHash, // App data hash,
        buyToken: tokenOut.address,
        kind: OrderKind.SELL,
        from: user,
        receiver,
        validTo: dayjs().add(1, 'h').unix(), // Order expires in 1 hour
        partiallyFillable: false,
        sellAmountBeforeFee: amountInBN.toString(),
        sellToken: tokenIn.address,
      })

      // CoW Swap doesn't charge any fee
      const fee = ZERO_PERCENT

      const feeAmount = Currency.isNative(currencyAmountIn.currency)
        ? CurrencyAmount.nativeCurrency(ZERO, chainId)
        : new TokenAmount(currencyAmountIn.currency as Token, ZERO)

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
        appData: CoWTrade.getAppData(chainId).ipfsHashInfo.appDataHash, // App data hash,
        buyAmountAfterFee: amountOutBN.toString(),
        buyToken: tokenOut.address,
        from: user,
        kind: OrderKind.BUY,
        sellToken: tokenIn.address,
        partiallyFillable: false,
        receiver,
        validTo: dayjs().add(1, 'h').unix(), // Order expires in 1 hour
      })

      const inputAmount = Currency.isNative(tokenIn)
        ? CurrencyAmount.nativeCurrency(quoteResponse.quote.sellAmount.toString(), chainId)
        : new TokenAmount(tokenIn, quoteResponse.quote.sellAmount.toString())

      const outputAmount = Currency.isNative(currencyAmountOut.currency)
        ? CurrencyAmount.nativeCurrency(quoteResponse.quote.buyAmount.toString(), chainId)
        : new TokenAmount(tokenOut, quoteResponse.quote.buyAmount.toString())

      // CoW Swap doesn't charge any fee
      const fee = ZERO_PERCENT

      const feeAmount = Currency.isNative(currencyIn)
        ? CurrencyAmount.nativeCurrency(ZERO, chainId)
        : new TokenAmount(currencyIn as Token, ZERO)

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
  public async signOrder(signer: Signer, recipient: string) {
    if (!recipient && !this.order.receiver) {
      throw new CoWTradeError('Missing order receiver')
    }
    if (recipient) this.order.receiver = recipient

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

    if (!orderCancellationSignature.signature) {
      throw new CoWTradeError('Order cancellation was not signed')
    }

    return cowSdk.cowApi.sendSignedOrderCancellation({
      cancellation: {
        signature: orderCancellationSignature.signature,
        signingScheme: orderCancellationSignature.signingScheme,
        orderUid: '',
      },
      chainId: chainId as any,
      owner: await signer.getAddress(),
    })
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

  /**
   * Returns the vault relayer contract address for the given chain.
   * ERC20 tokens must approve this address.
   * @param chainId The chain Id
   * @returns The vault relayer address
   */
  public static getVaultRelayerAddress(chainId: ChainId) {
    const GPv2VaultRelayer = contractNetworks.GPv2VaultRelayer as Record<
      ChainId,
      Record<'transactionHash' | 'address', string>
    >

    return GPv2VaultRelayer[chainId]?.address
  }

  /**
   * Returns the settlement contract address for the given chain
   * @param chainId The chain Id
   * @returns The settlement address
   */
  public static getSettlementAddress(chainId: ChainId) {
    const GPv2Settlement = contractNetworks.GPv2Settlement as Record<
      ChainId,
      Record<'transactionHash' | 'address', string>
    >

    return GPv2Settlement[chainId]?.address
  }
}

/**
 * @deprecated use CoWTrade instead
 */
export class GnosisProtocolTrade extends CoWTrade {}
