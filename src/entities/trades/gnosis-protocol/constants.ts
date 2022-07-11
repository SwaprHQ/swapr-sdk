/**
 * Default App Data for submitting orders to GPv2 API
 */
export const ORDER_APP_DATA = '0xE0B7067C7AE666FECBFE5780C62FA58CEA3C6DAA8968015BAF11D0AB4C568650'

/**
 * Default placeholder address for fetching quotes from GPV2 API when a wallet is not connected
 */
export const ORDER_PLACEHOLDER_ADDRESS = '0xAb5801a7D398351b8bE11C439e05C5B3259aeC9B'

/**
 * A mapping for the GPv2 API class constructor
 */
export const CHAIN_ID_TO_NETWORK = {
  1: 'mainnet',
  100: 'xdai',
  4: 'rinkeby',
}

export const appDataContent = {
  version: '0.1.0',
  appCode: 'Swapr',
  metadata: {
    environment: 'production',
    referrer: {
      version: '0.1.0',
      kind: 'Referrer',
      referrer: '0x519b70055af55A007110B4Ff99b0eA33071c720a',
    },
  },
}
