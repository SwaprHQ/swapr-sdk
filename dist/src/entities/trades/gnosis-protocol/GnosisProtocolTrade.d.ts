import { Signer } from '@ethersproject/abstract-signer';
import { Api as GnosisProtcolApi } from '@gnosis.pm/gp-v2-contracts/lib/commonjs/api';
import { Order } from '@gnosis.pm/gp-v2-contracts/lib/commonjs/order';
import { ChainId } from '../../../constants';
import { CurrencyAmount } from '../../fractions/currencyAmount';
import { Trade } from '../interfaces/trade';
import { GnosisProtocolTradeBestTradeExactInParams, GnosisProtocolTradeBestTradeExactOutParams, GnosisProtocolTradeConstructorParams, GnosisProtocolTradeOrderMetadata, GnosisProtocolTradeSwapOrderParams } from './types';
/**
 * Gnosis Protcol Trade uses CowFi API to find and route trades through the MEV-protected Gnosis Protocol v2
 */
export declare class GnosisProtocolTrade extends Trade {
    /**
     * CowFi order details. The payload is signed and sent to CowFi API
     */
    order: Order;
    /**
     * An address the EOA must approve to spend its tokenIn
     */
    readonly approveAddress: string;
    /**
     * Order signature
     */
    private orderSignatureInfo?;
    /**
     * The Order Id. Obtained and set from after submitting the order from API
     */
    orderId?: string;
    /**
     * The trade fee amount. Fees are paid in sell token
     */
    readonly feeAmount: CurrencyAmount;
    constructor({ chainId, inputAmount, maximumSlippage, outputAmount, tradeType, order, fee, feeAmount, }: GnosisProtocolTradeConstructorParams);
    minimumAmountOut(): CurrencyAmount;
    maximumAmountIn(): CurrencyAmount;
    /**
     * Returns the Gnosis Protocol API, with access to low level methods.
     * @param quote Quote query params
     * @param chainId The chainId, defaults to Mainnet (1)
     * @returns
     */
    static getApi(chainId?: ChainId): GnosisProtcolApi;
    /**
     * Fetches the order metadata from the API
     * @param orderId The order ID
     * @param chainId The chainId, defaults to Mainnet (1)
     */
    static getOrderMetadata(orderId: string, chainId?: ChainId): Promise<GnosisProtocolTradeOrderMetadata>;
    /**
     * Computes and returns the best trade from Gnosis Protocol API
     * @param {object} obj options
     * @param {CurrencyAmount} obj.currencyAmountIn the amount of curreny in - sell token
     * @param {Currency} obj.currencyOut the currency out - buy token
     * @param {Percent} obj.maximumSlippage Maximum slippage
     * @param {Percent} obj.receiver The receiver
     * @returns A GPv2 trade if found, otherwise undefined
     */
    static bestTradeExactIn({ currencyAmountIn, currencyOut, maximumSlippage, receiver, }: GnosisProtocolTradeBestTradeExactInParams): Promise<GnosisProtocolTrade | undefined>;
    /**
     * Computes and returns the best trade from Gnosis Protocol API
     * @param {object} obj options
     * @param {CurrencyAmount} obj.currencyAmountIn the amount of curreny in - sell token
     * @param {Currency} obj.currencyOut the currency out - buy token
     * @param {Percent} obj.maximumSlippage Maximum slippage
     * @returns A GPv2 trade if found, otherwise undefined
     */
    static bestTradeExactOut({ currencyAmountOut, currencyIn, maximumSlippage, receiver, }: GnosisProtocolTradeBestTradeExactOutParams): Promise<GnosisProtocolTrade | undefined>;
    /**
     * Returns the order payload. The order must be signed
     * @param options
     * @returns
     */
    swapOrder({ receiver }: GnosisProtocolTradeSwapOrderParams): Order;
    /**
     * Signs the order by adding signature
     * @param signature
     */
    signOrder(signer: Signer): Promise<this>;
    /**
     * Cancels the current instance order, if submitted
     */
    cancelOrder(signer: Signer): Promise<boolean>;
    /**
     * Cancels the current instance order, if submitted
     * @param orderId The order ID from GPv2
     * @param chainId The chain Id on which the order exists
     * @param signer A Signer with ability to sign the payload
     * @returns the signing results
     */
    static cancelOrder(orderId: string, chainId: ChainId, signer: Signer): Promise<boolean>;
    /**
     * Submits the order to GPv2 API
     * @returns The order ID from GPv2
     */
    submitOrder(): Promise<string>;
    /**
     * Fetches the order status from the API
     */
    getOrderMetadata(): Promise<GnosisProtocolTradeOrderMetadata>;
}
