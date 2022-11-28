import { CowSdk, SimpleGetQuoteResponse } from '@cowprotocol/cow-sdk';
import { CowContext } from '@cowprotocol/cow-sdk/dist/utils/context';
import { UnsignedOrder } from '@cowprotocol/cow-sdk/dist/utils/sign';
import { Signer } from '@ethersproject/abstract-signer';
import { ChainId } from '../../../constants';
import { CurrencyAmount } from '../../fractions/currencyAmount';
import { Price } from '../../fractions/price';
import { Trade } from '../interfaces/trade';
import { CoWTradeGetBestTradeExactInParams, CoWTradeGetBestTradeExactOutParams, CoWTradeParams } from './types';
/**
 * CoWTrade uses CowFi API to find and route trades through the MEV-protected Gnosis Protocol v2
 */
export declare class CoWTrade extends Trade {
    readonly inputAmountWithoutFee: CurrencyAmount;
    readonly outputAmountWithoutFee: CurrencyAmount;
    /**
     * The original quote from CoW
     */
    readonly quote: SimpleGetQuoteResponse;
    /**
     * Order signature
     */
    private orderSignatureInfo?;
    /**
     * The order
     */
    readonly order: Omit<UnsignedOrder, 'appData'>;
    /**
     * The execution price of the trade without CoW fee
     */
    readonly executionPriceWithoutFee: Price;
    /**
     * The Order Id. Obtained and set from after submitting the order from API
     */
    orderId?: string;
    /**
     * The trade fee amount. Fees are paid in sell token
     */
    readonly feeAmount: CurrencyAmount;
    constructor(params: CoWTradeParams);
    minimumAmountOut(): CurrencyAmount;
    maximumAmountIn(): CurrencyAmount;
    /**
     * Returns the Gnosis Protocol API, with access to low level methods.
     * @param quote Quote query params
     * @param chainId The chainId, defaults to Mainnet (1)
     * @returns
     */
    static getCowSdk(chainId?: ChainId, cowContext?: CowContext): CowSdk<number>;
    /**
     * Fetches the order metadata from the API
     * @param orderId The order ID
     * @param chainId The chainId, defaults to Mainnet (1)
     */
    static getOrderMetadata(orderId: string, chainId?: ChainId): Promise<import("@cowprotocol/cow-sdk").OrderMetaData | null>;
    /**
     * Computes and returns the best trade from Gnosis Protocol API
     * @param {object} obj options
     * @param {CurrencyAmount} obj.currencyAmountIn the amount of curreny in - sell token
     * @param {Currency} obj.currencyOut the currency out - buy token
     * @param {Percent} obj.maximumSlippage Maximum slippage
     * @param {Percent} obj.receiver The receiver
     * @returns A GPv2 trade if found, otherwise undefined
     */
    static bestTradeExactIn({ currencyAmountIn, currencyOut, maximumSlippage, receiver, user, }: CoWTradeGetBestTradeExactInParams): Promise<CoWTrade | undefined>;
    /**
     * Computes and returns the best trade from Gnosis Protocol API
     * @param {object} obj options
     * @param {CurrencyAmount} obj.currencyAmountIn the amount of curreny in - sell token
     * @param {Currency} obj.currencyOut the currency out - buy token
     * @param {Percent} obj.maximumSlippage Maximum slippage
     * @returns A GPv2 trade if found, otherwise undefined
     */
    static bestTradeExactOut({ currencyAmountOut, currencyIn, maximumSlippage, receiver, user, }: CoWTradeGetBestTradeExactOutParams): Promise<CoWTrade | undefined>;
    /**
     * Signs the order by adding signature
     * @param signer The signer
     * @returns The current instance
     * @throws {CoWTradeError} If the order is missing a receiver
     */
    signOrder(signer: Signer): Promise<this>;
    /**
     * Cancels the current instance order, if submitted
     * @param signer The signer
     * @returns True if the order was cancelled, false otherwise
     * @throws {CoWTradeError} If the order is yet to be submitted
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
     * @throws {CoWTradeError} If the order is missing a signature
     */
    submitOrder(): Promise<string>;
    /**
     * Fetches the order status from the API
     * @throws {CoWTradeError} if the order ID is missing
     */
    getOrderMetadata(): Promise<import("@cowprotocol/cow-sdk").OrderMetaData | null>;
    /**
     * Gets the app data for Swapr's CoW trade
     * @param chainId The chain Id
     */
    static getAppData(chainId: ChainId): {
        ipfsHashInfo: {
            cidV0: string;
            appDataHash: string;
        };
        content: {
            version: string;
            appCode: string;
            metadata: {
                referrer: {
                    address: string;
                    version: string;
                };
            };
        };
    } | {
        ipfsHashInfo: {
            cidV0: string;
            appDataHash: string;
        };
        content: {
            version: string;
            appCode: string;
            metadata: {
                referrer: {
                    address: string;
                    version: string;
                };
            };
        };
    };
    /**
     * Returns the vault relayer contract address for the given chain.
     * ERC20 tokens must approve this address.
     * @param chainId The chain Id
     * @returns The vault relayer address
     */
    static getVaultRelayerAddress(chainId: ChainId): string;
    /**
     * Returns the settlement contract address for the given chain
     * @param chainId The chain Id
     * @returns The settlement address
     */
    static getSettlementAddress(chainId: ChainId): string;
}
/**
 * @deprecated use CoWTrade instead
 */
export declare class GnosisProtocolTrade extends CoWTrade {
}
