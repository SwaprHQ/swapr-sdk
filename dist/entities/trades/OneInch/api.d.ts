import { ChainId } from '../../../constants';
export declare enum RequestType {
    QUOTE = "/quote",
    SWAP = "/swap"
}
interface ApiRequestUrlParams {
    methodName: RequestType;
    queryParams: Record<string, string>;
    chainId: ChainId;
}
export declare function generateApiRequestUrl({ methodName, queryParams, chainId }: ApiRequestUrlParams): string;
export declare function approveAddressUrl(chainId: ChainId): string;
export {};
