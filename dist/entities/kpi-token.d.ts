import { BigintIsh, ChainId } from '../constants';
import { PricedTokenAmount, TokenAmount } from '../entities/fractions';
import { PricedToken } from './priced-token';
export declare class KpiToken extends PricedToken {
    readonly kpiId: string;
    readonly totalSupply: TokenAmount;
    readonly collateral: PricedTokenAmount;
    constructor(chainId: ChainId, address: string, totalSupply: BigintIsh, collateral: PricedTokenAmount, kpiId: string, symbol?: string, name?: string);
}
