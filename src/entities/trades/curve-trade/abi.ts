// ABIs
export const XDAI_CURVE_ROUTER_ABI = JSON.stringify([
  {
    type: 'function',
    stateMutability: 'nonpayable',
    outputs: [{ type: 'uint256', name: '' }],
    name: 'exchange',
    inputs: [
      { type: 'int128', name: 'i' },
      { type: 'int128', name: 'j' },
      { type: 'uint256', name: '_dx' },
      { type: 'uint256', name: '_min_dy' }
    ]
  },
  {
    type: 'function',
    stateMutability: 'view',
    outputs: [{ type: 'uint256', name: '' }],
    name: 'get_dy',
    inputs: [
      { type: 'int128', name: 'i' },
      { type: 'int128', name: 'j' },
      { type: 'uint256', name: '_dx' }
    ]
  }
])

export const CURVE_ROUTER_ABI = JSON.stringify([
  {
    stateMutability: 'view',
    type: 'function',
    name: 'get_exchange_routing',
    inputs: [
      { name: '_initial', type: 'address' },
      { name: '_target', type: 'address' },
      { name: '_amount', type: 'uint256' }
    ],
    outputs: [
      { name: '', type: 'address[6]' },
      { name: '', type: 'uint256[8]' },
      { name: '', type: 'uint256' }
    ]
  }
])

export const REGISTRY_EXCHANGE_ABI = JSON.stringify([
  {
    stateMutability: 'view',
    type: 'function',
    name: 'get_best_rate',
    inputs: [
      {
        name: '_from',
        type: 'address'
      },
      {
        name: '_to',
        type: 'address'
      },
      {
        name: '_amount',
        type: 'uint256'
      }
    ],
    outputs: [
      {
        name: '',
        type: 'address'
      },
      {
        name: '',
        type: 'uint256'
      }
    ],
    gas: '395840312'
  }
])

export const ADDRESS_PROVIDER_ABI = JSON.stringify([
  {
    name: 'get_address',
    outputs: [{ type: 'address', name: '' }],
    inputs: [{ type: 'uint256', name: '_id' }],
    stateMutability: 'view',
    type: 'function',
    gas: '1308'
  }
])
