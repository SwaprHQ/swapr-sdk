import type { ContractInterface } from '@ethersproject/contracts';
/**
 * Token type
 */
export declare enum TokenType {
    USD = "usd",
    EUR = "eur",
    BTC = "btc",
    ETH = "eth",
    LINK = "link",
    GOLD = "gold",
    CRV = "crv",
    CVX = "cvx",
    SPELL = "spell",
    T = "t",
    CRYPTO = "crypto",
    OTHER = "other"
}
/**
 * Curve Token interface
 */
export interface CurveToken {
    isLPToken?: boolean;
    address: string;
    symbol: string;
    name: string;
    decimals: number;
    type: TokenType;
}
export interface CurvePool {
    id: string;
    name: string;
    address: string;
    abi: ContractInterface;
    approveAddress?: string;
    tokens: CurveToken[];
    underlyingTokens?: CurveToken[];
    metaTokens?: CurveToken[];
    riskLevel?: number;
    isMeta?: boolean;
    allowsTradingETH?: boolean;
}
