import { ChainId } from '../../../constants'
import { BaseRoutablePlatform } from './BaseRoutablePlatform'

/**
 * A platform to which Swapr can route through.
 */
export class RoutablePlatform extends BaseRoutablePlatform {
  public static readonly ZEROX = new RoutablePlatform([ChainId.MAINNET, ChainId.POLYGON], '0x')
  public static readonly CURVE = new RoutablePlatform([ChainId.MAINNET, ChainId.ARBITRUM_ONE, ChainId.XDAI], 'Curve')
  /**
   * @deprecated Use {@link RoutablePlatform.COW} instead.
   */
  public static readonly GNOSIS_PROTOCOL = new RoutablePlatform([ChainId.MAINNET, ChainId.XDAI], 'CoW')
  public static readonly COW = new RoutablePlatform([ChainId.MAINNET, ChainId.XDAI], 'CoW')
  public static readonly UNISWAP = new RoutablePlatform(
    [ChainId.MAINNET, ChainId.ARBITRUM_ONE, ChainId.POLYGON],
    'Uniswap'
  )
}
