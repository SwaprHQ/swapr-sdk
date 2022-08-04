import { Signer } from '@ethersproject/abstract-signer';
import { Order, OrderCancellation as OrderCancellationGp } from '@gnosis.pm/gp-v2-contracts/lib/commonjs/order';
import { SigningScheme } from '@gnosis.pm/gp-v2-contracts/lib/commonjs/sign';
import { ChainId } from '../../../constants';
export declare type UnsignedOrder = Omit<Order, 'receiver'> & {
    receiver: string;
};
export interface SignOrderParams {
    chainId: ChainId;
    signer: Signer;
    order: UnsignedOrder;
    signingScheme: SigningScheme;
}
export interface OrderCreation extends UnsignedOrder {
    signingScheme: SigningScheme;
    signature: string;
}
export interface SingOrderCancellationParams {
    chainId: ChainId;
    signer: Signer;
    orderId: string;
    signingScheme: SigningScheme;
}
export interface OrderCancellation extends OrderCancellationGp {
    signature: string;
    signingScheme: SigningScheme;
}
export declare type SigningSchemeValue = 'eip712' | 'ethsign' | 'eip1271' | 'presign';
export declare function getSigningSchemeLibValue(ecdaSigningScheme: SigningScheme): number;
declare type SigningResult = {
    signature: string;
    signingScheme: SigningScheme;
};
export declare function signOrder(order: UnsignedOrder, chainId: ChainId, signer: Signer): Promise<SigningResult>;
export declare function signOrderCancellation(orderId: string, chainId: ChainId, signer: Signer): Promise<SigningResult>;
export {};
