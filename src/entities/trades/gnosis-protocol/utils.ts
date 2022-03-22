import { GPv2Settlement as GPv2SettlementList  } from '@gnosis.pm/gp-v2-contracts/networks.json'
import type { _TypedDataEncoder } from "@ethersproject/hash";

/**
 * EIP-712 typed data domain.
 */
export type TypedDataDomain = Parameters<
  typeof _TypedDataEncoder.hashDomain
>[0];


/**
 * Return the Gnosis Protocol v2 domain used for signing.
 * [Source](https://github.com/gnosis/gp-v2-contracts/blob/da33a66662ab46e573da6f194144bace18526db9/src/ts/index.ts#L3-L21)
 * @param chainId The EIP-155 chain ID.
 * signature.
 * @return An EIP-712 compatible typed domain data.
 */
export function getDomain(chainId: number): TypedDataDomain {
    // Get settlement contract address
  const verifyingContract = GPv2SettlementList[(chainId as unknown) as keyof typeof GPv2SettlementList].address

  if (!verifyingContract) {
    throw new Error('Unsupported network. Settlement contract is not deployed')
  }

  return {
    name: 'Gnosis Protocol',
    version: 'v2',
    chainId,
    verifyingContract
  }
}

