import type { ContractInterface } from '@ethersproject/contracts'
export * from './abi'

export const CURVE_ROUTER: ContractInterface = [
  {
    stateMutability: 'payable',
    type: 'function',
    name: 'exchange',
    inputs: [
      { type: 'uint256', name: '_amount' },
      { type: 'address[6]', name: '_route' },
      { type: 'uint256[8]', name: '_indices' },
      { type: 'uint256', name: '_min_received' },
    ],
    outputs: [],
    gas: '4577395',
  },
  {
    stateMutability: 'view',
    type: 'function',
    name: 'get_exchange_routing',
    inputs: [
      { type: 'address', name: '_initial' },
      { type: 'address', name: '_target' },
      { type: 'uint256', name: '_amount' },
    ],
    outputs: [
      { type: 'address[6]', name: '' },
      { type: 'uint256[8]', name: '' },
      { type: 'uint256', name: '' },
    ],
  },
  {
    stateMutability: 'view',
    type: 'function',
    name: 'can_route',
    inputs: [
      { type: 'address', name: '_initial' },
      { type: 'address', name: '_target' },
    ],
    outputs: [{ name: '', type: 'bool' }],
    gas: '26664',
  },
  {
    stateMutability: 'view',
    type: 'function',
    name: 'crypto_coins',
    inputs: [{ type: 'uint256', name: 'arg0' }],
    outputs: [{ type: 'address', name: '' }],
    gas: '2763',
  },
]

export const REGISTRY_EXCHANGE: ContractInterface = [
  {
    stateMutability: 'view',
    type: 'function',
    name: 'get_best_rate',
    inputs: [
      {
        name: '_from',
        type: 'address',
      },
      {
        name: '_to',
        type: 'address',
      },
      {
        name: '_amount',
        type: 'uint256',
      },
    ],
    outputs: [
      {
        name: '',
        type: 'address',
      },
      {
        name: '',
        type: 'uint256',
      },
    ],
    gas: '395840312',
  },
]

export const ADDRESS_PROVIDER: ContractInterface = [
  {
    name: 'get_address',
    outputs: [{ type: 'address', name: '' }],
    inputs: [{ type: 'uint256', name: '_id' }],
    stateMutability: 'view',
    type: 'function',
    gas: '1308',
  },
]
