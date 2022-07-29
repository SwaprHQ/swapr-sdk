/**
 * Chain Id
 */
export enum ChainId {
  MAINNET = 1,
  /**
   * @deprecated Use GOERLI instead
   */
  RINKEBY = 4,
  GOERLI = 5,
  /**
   * @deprecated Use GNOSIS instead
   */
  XDAI = 100,
  GNOSIS = 100,
  POLYGON = 137,
  ARBITRUM_ONE = 42161,
  ARBITRUM_RINKEBY = 421611,
  ARBITRUM_GOERLI = 421613,

  /**
   * Optimism Mainnet
   */
  OPTIMISM_MAINNET = 10,
  /**
   * Optimism Göerli
   */
  OPTIMISM_GOERLI = 420,
}
