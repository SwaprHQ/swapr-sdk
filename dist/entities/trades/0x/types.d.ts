import { BigNumber } from '@ethersproject/bignumber';
import Decimal from 'decimal.js-light';
import { TradeType } from '../../../constants';
import { CurrencyAmount } from '../../fractions/currencyAmount';
import { Percent } from '../../fractions/percent';
import { Breakdown } from '../../platforms-breakdown';
export interface ApiSource {
    name: string;
    proportion: string;
}
export interface ApiResponse {
    price: string;
    estimatedPriceImpact: string;
    guaranteedPrice: string;
    to: string;
    data: string;
    value: string;
    gas: string;
    estimatedGas: string;
    gasPrice: string;
    protocolFee: string;
    minimumProtocolFee: string;
    buyTokenAddress: string;
    sellTokenAddress: string;
    buyAmount: string;
    sellAmount: string;
    estimatedGasTokenRefund: string;
    sources: ApiSource[];
}
export interface ZeroXTradeConstructorParams {
    breakdown: Breakdown;
    input: CurrencyAmount;
    output: CurrencyAmount;
    maximumSlippage: Percent;
    tradeType: TradeType;
    to: string;
    callData: string;
    value: string;
    priceImpact: Percent;
    estimatedGas: BigNumber;
}
export interface DecodeStringFractionReturn {
    numerator: Decimal;
    denominator: Decimal;
}
