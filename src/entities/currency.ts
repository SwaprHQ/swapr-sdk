import JSBI from 'jsbi'

import { ChainId, SolidityType } from '../constants'
import { validateSolidityTypeInstance } from '../utils'

const NULL_ADDRESS = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE'
/**
 * A currency is any fungible financial instrument on the target chain.
 *
 * The only instances of the base class `Currency` are native currencies such as Ether for Ethereum and xDAI for xDAI.
 */
export class Currency {
  public readonly decimals: number
  public readonly symbol?: string
  public readonly name?: string
  public readonly address?: string

  // fiat currencies used to represent countervalues
  public static readonly USD: Currency = new Currency(18, 'USD', 'US dollar')

  /**
   * Ethereum and Ethereum testnets native currency.
   */
  public static readonly ETHER: Currency = new Currency(18, 'ETH', 'Ether', NULL_ADDRESS)
  public static readonly OPTIMISM_ETHER: Currency = new Currency(
    18,
    'ETH',
    'Ether',
    '0xDeadDeAddeAddEAddeadDEaDDEAdDeaDDeAD0000'
  )
  public static readonly ZK_SYNC_ERA_ETHER: Currency = new Currency(
    18,
    'ETH',
    'Ether',
    '0x0000000000000000000000000000000000000000'
  )
  /**
   * Gnosis Chain native currency
   */
  public static readonly XDAI: Currency = new Currency(18, 'XDAI', 'xDAI', NULL_ADDRESS)

  /**
   * Polygon PoS native currency
   */
  public static readonly MATIC: Currency = new Currency(18, 'MATIC', 'Matic', NULL_ADDRESS)

  /**
   * BSC native currency
   */
  public static readonly BNB: Currency = new Currency(18, 'BNB', 'Binance Coin', NULL_ADDRESS)

  private static readonly NATIVE_CURRENCY: Record<ChainId, Currency> = {
    [ChainId.MAINNET]: Currency.ETHER,
    [ChainId.RINKEBY]: Currency.ETHER,
    [ChainId.ARBITRUM_ONE]: Currency.ETHER,
    [ChainId.ARBITRUM_RINKEBY]: Currency.ETHER,
    [ChainId.ARBITRUM_GOERLI]: Currency.ETHER,
    [ChainId.XDAI]: Currency.XDAI,
    [ChainId.POLYGON]: Currency.MATIC,
    [ChainId.GOERLI]: Currency.ETHER,
    [ChainId.OPTIMISM_MAINNET]: Currency.OPTIMISM_ETHER,
    [ChainId.OPTIMISM_GOERLI]: Currency.OPTIMISM_ETHER,
    [ChainId.BSC_MAINNET]: Currency.BNB,
    [ChainId.BSC_TESTNET]: Currency.BNB,
    [ChainId.ZK_SYNC_ERA_MAINNET]: Currency.ETHER,
    [ChainId.ZK_SYNC_ERA_TESTNET]: Currency.ETHER,
  }

  /**
   * Constructs an instance of the base class `Currency`. The only instance of the base class `Currency` is `Currency.ETHER`.
   * @param decimals decimals of the currency
   * @param symbol symbol of the currency
   * @param name of the currency
   */
  protected constructor(decimals: number, symbol?: string, name?: string, address?: string) {
    validateSolidityTypeInstance(JSBI.BigInt(decimals), SolidityType.uint8)

    this.decimals = decimals
    this.symbol = symbol
    this.name = name
    this.address = address
  }

  public static isNative(currency: Currency): boolean {
    return Object.values(Currency.NATIVE_CURRENCY).indexOf(currency) >= 0
  }

  public static getNative(chainId: ChainId): Currency {
    return Currency.NATIVE_CURRENCY[chainId]
  }
}

export const USD = Currency.USD

export const ETHER = Currency.ETHER
export const XDAI = Currency.XDAI
export const MATIC = Currency.MATIC
export const BNB = Currency.BNB
