import { JsonRpcProvider } from '@ethersproject/providers';
import { ChainId } from '../../constants';
import { Currency } from '../currency';
import { CurrencyAmount } from '../fractions/currencyAmount';
import { TokenAmount } from '../fractions/tokenAmount';
import { Token } from '../token';
/**
 * Same as `wrappedCurrency` util functiom, but for `TokenAmount`
 * @param currencyAmount The currency amount to wrap
 * @param chainId The chain ID
 * @returns The wrapped currency amount if it is native, otherwise the currency itself
 * @throws an error
 */
export declare function wrappedAmount(currencyAmount: CurrencyAmount, chainId: ChainId): TokenAmount;
/**
 * Returns the wrapped currency for the given currency if it is native
 * @param currency The currency to wrap
 * @param chainId The chain ID
 * @returns The wrapped currency if it is native, otherwise the currency itself
 * @throws an error
 */
export declare function wrappedCurrency(currency: Currency, chainId: ChainId): Token;
/**
 * Attempts to find the chain ID of the given currencies
 * @param currencyAmount The currency amount to find the chain ID for
 * @param currency The currency to find the chain ID for
 * @returns
 */
export declare function tryGetChainId(currencyAmount: CurrencyAmount, currency: Currency): ChainId | undefined;
/**
 * List of RPC provider URLs for different chains.
 * @see https://chainlist.org/ lookup Chain info
 */
/**
 * @TODO in https://linear.app/swaprdev/issue/SWA-65/provide-a-single-source-of-truth-for-chain-rpcs-from-the-sdk
 * Make `RPC_PROVIDER_LIST` exportable from this repo
 */
export declare const RPC_PROVIDER_LIST: Record<ChainId, string>;
/**
 * Returns a RPC provider for the given chainId.
 * @param chainId The chainId
 * @returns The RPC provider
 */
export declare function getProvider(chainId: ChainId): JsonRpcProvider;
