import { ChainId } from '../../../constants';
export declare const OO_API_BASE_URL = "https://open-api.openocean.finance/v3";
export declare enum OO_API_ENDPOINTS {
    GET_GAS = "gasPrice",
    GAS_PRICE = "gas-price",
    QUOTE = "quote",
    SWAP_QUOTE = "swap_quote",
    SWAP = "swap"
}
export type TestChainIds = ChainId.ARBITRUM_GOERLI | ChainId.ARBITRUM_RINKEBY | ChainId.BSC_TESTNET | ChainId.GOERLI | ChainId.OPTIMISM_GOERLI | ChainId.ZK_SYNC_ERA_TESTNET | ChainId.RINKEBY;
export type MainnetChainIds = Exclude<ChainId, TestChainIds>;
export declare const getBaseUrlWithChainCode: (chainId: MainnetChainIds) => string;
