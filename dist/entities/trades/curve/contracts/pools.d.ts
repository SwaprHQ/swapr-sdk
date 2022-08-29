import { Provider } from '@ethersproject/providers';
import { ChainId } from '../../../../constants';
interface PoolToken {
    index: number;
    address: string;
    isUnderlying?: boolean;
}
interface GetPoolTokenListResults {
    allTokens: PoolToken[];
    mainTokens: PoolToken[];
    underlyingTokens: PoolToken[];
}
interface GetPoolTokenListParams {
    poolAddress: string;
    chainId: ChainId;
    provider?: Provider;
}
/**
 * Fetches and returns tokens from given pool address
 */
export declare function getPoolTokenList({ chainId, poolAddress, provider, }: GetPoolTokenListParams): Promise<GetPoolTokenListResults>;
export {};
