import { TradeType } from '../../../../constants';
export * from './nativeCurrency';
export declare function encodeRecipient(tradeType: TradeType, recipient: string, callData?: string): string | undefined;
