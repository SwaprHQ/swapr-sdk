import { ChainId } from '../../../constants'
import { DXD, Token, WETH, WMATIC, WXDAI } from '../../token'

// a list of tokens by chain
type ChainTokenList = {
  readonly [chainId in ChainId]: Token[]
}

export const ETH: Record<number, Token> = {
  [ChainId.BSC_MAINNET]: new Token(
    ChainId.BSC_MAINNET,
    '0x2170Ed0880ac9A755fd29B2688956BD959F933F8',
    18,
    'ETH',
    'Binance-Peg Ethereum'
  ),
}

export const DAI: Record<number, Token> = {
  [ChainId.MAINNET]: new Token(
    ChainId.MAINNET,
    '0x6B175474E89094C44Da98b954EedeAC495271d0F',
    18,
    'DAI',
    'Dai Stablecoin'
  ),
  [ChainId.OPTIMISM_MAINNET]: new Token(
    ChainId.OPTIMISM_MAINNET,
    '0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1',
    18,
    'DAI',
    'Dai Stablecoin'
  ),
  [ChainId.BSC_MAINNET]: new Token(
    ChainId.BSC_MAINNET,
    '0x1af3f329e8be154074d8769d1ffa4ee058b1dbc3',
    18,
    'DAI',
    'Binance-Peg Dai Stablecoin'
  ),
  [ChainId.BSC_TESTNET]: new Token(
    ChainId.BSC_TESTNET,
    '0xEC5dCb5Dbf4B114C9d0F65BcCAb49EC54F6A0867',
    18,
    'DAI',
    'Dai Token'
  ),
}
export const USDC: Record<number, Token> = {
  [ChainId.MAINNET]: new Token(ChainId.MAINNET, '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', 6, 'USDC', 'USD//C'),
  [ChainId.ARBITRUM_ONE]: new Token(
    ChainId.ARBITRUM_ONE,
    '0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8',
    6,
    'USDC',
    'USD//C'
  ),
  [ChainId.XDAI]: new Token(
    ChainId.XDAI,
    '0xDDAfbb505ad214D7b80b1f830fcCc89B60fb7A83',
    6,
    'USDC',
    'USD//C from Ethereum'
  ),
  [ChainId.POLYGON]: new Token(
    ChainId.POLYGON,
    '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
    6,
    'USDC',
    'USD//C from Ethereum'
  ),
  [ChainId.OPTIMISM_MAINNET]: new Token(
    ChainId.OPTIMISM_MAINNET,
    '0x7F5c764cBc14f9669B88837ca1490cCa17c31607',
    6,
    'USDC',
    'USD Coin'
  ),
  [ChainId.BSC_MAINNET]: new Token(
    ChainId.BSC_MAINNET,
    '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d',
    6,
    'USDC',
    'Binance-Peg USD Coin'
  ),
  [ChainId.BSC_TESTNET]: new Token(
    ChainId.BSC_TESTNET,
    '0x64544969ed7EBf5f083679233325356EbE738930',
    6,
    'USDC',
    'USDC Token'
  ),
}

export const USDT: Record<number, Token> = {
  [ChainId.MAINNET]: new Token(ChainId.MAINNET, '0xdAC17F958D2ee523a2206206994597C13D831ec7', 6, 'USDT', 'Tether USD'),
  [ChainId.XDAI]: new Token(
    ChainId.XDAI,
    '0x4ECaBa5870353805a9F068101A40E0f32ed605C6',
    6,
    'USDT',
    'Tether USD from Ethereum'
  ),
  [ChainId.ARBITRUM_ONE]: new Token(
    ChainId.ARBITRUM_ONE,
    '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9',
    6,
    'USDT',
    'Tether USD'
  ),
  [ChainId.POLYGON]: new Token(ChainId.POLYGON, '0xc2132D05D31c914a87C6611C10748AEb04B58e8F', 6, 'USDT', 'Tether USD'),
  [ChainId.OPTIMISM_MAINNET]: new Token(
    ChainId.OPTIMISM_MAINNET,
    '0x94b008aA00579c1307B0EF2c499aD98a8ce58e58',
    6,
    'USDT',
    'Tether USD'
  ),
  [ChainId.BSC_MAINNET]: new Token(
    ChainId.BSC_MAINNET,
    '0x55d398326f99059ff775485246999027b3197955',
    6,
    'USDT',
    'Binance-Peg BSC-USD (BSC-USD)'
  ),
  [ChainId.BSC_TESTNET]: new Token(
    ChainId.BSC_TESTNET,
    '0x337610d27c682E347C9cD60BD4b3b107C9d34dDd',
    6,
    'USDT',
    'USDT Token'
  ),
}

export const WBTC: Record<number, Token> = {
  [ChainId.MAINNET]: new Token(ChainId.MAINNET, '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599', 8, 'WBTC', 'Wrapped BTC'),
  [ChainId.ARBITRUM_ONE]: new Token(
    ChainId.ARBITRUM_ONE,
    '0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f',
    8,
    'WBTC',
    'Wrapped BTC'
  ),
  [ChainId.XDAI]: new Token(
    ChainId.XDAI,
    '0x8e5bBbb09Ed1ebdE8674Cda39A0c169401db4252',
    8,
    'WBTC',
    'Wrapped BTC from Ethereum'
  ),
  [ChainId.POLYGON]: new Token(
    ChainId.POLYGON,
    '0x1BFD67037B42Cf73acF2047067bd4F2C47D9BfD6',
    8,
    'WBTC',
    'Wrapped BTC from Ethereum'
  ),
  [ChainId.OPTIMISM_MAINNET]: new Token(
    ChainId.OPTIMISM_MAINNET,
    '0x68f180fcCe6836688e9084f035309E29Bf0A2095',
    8,
    'WBTC',
    'Wrapped BTC'
  ),
}

export const HONEY = new Token(ChainId.XDAI, '0x71850b7E9Ee3f13Ab46d67167341E4bDc905Eef9', 18, 'HNY', 'Honey')

export const STAKE = new Token(
  ChainId.XDAI,
  '0xb7D311E2Eb55F2f68a9440da38e7989210b9A05e',
  18,
  'STAKE',
  'Stake Token on xDai'
)

export const BAO = new Token(
  ChainId.XDAI,
  '0x82dFe19164729949fD66Da1a37BC70dD6c4746ce',
  18,
  'BAO',
  'BaoToken from Ethereum'
)

export const AGAVE = new Token(ChainId.XDAI, '0x3a97704a1b25F08aa230ae53B352e2e72ef52843', 18, 'AGVE', 'Agave token')

export const GNO = new Token(ChainId.XDAI, '0x9C58BAcC331c9aa871AFD802DB6379a98e80CEdb', 18, 'GNO', 'Gnosis Token')

// used to construct intermediary pairs for trading
export const BASES_TO_CHECK_TRADES_AGAINST: ChainTokenList = {
  [ChainId.MAINNET]: [
    WETH[ChainId.MAINNET],
    DXD[ChainId.MAINNET],
    DAI[ChainId.MAINNET],
    USDC[ChainId.MAINNET],
    WBTC[ChainId.MAINNET],
    USDT[ChainId.MAINNET],
  ],
  [ChainId.RINKEBY]: [WETH[ChainId.RINKEBY]],
  [ChainId.ARBITRUM_ONE]: [
    WETH[ChainId.ARBITRUM_ONE],
    DXD[ChainId.ARBITRUM_ONE],
    USDC[ChainId.ARBITRUM_ONE],
    WBTC[ChainId.ARBITRUM_ONE],
    USDT[ChainId.ARBITRUM_ONE],
  ],
  [ChainId.ARBITRUM_RINKEBY]: [WETH[ChainId.ARBITRUM_RINKEBY], DXD[ChainId.ARBITRUM_RINKEBY]],
  [ChainId.ARBITRUM_GOERLI]: [WETH[ChainId.ARBITRUM_GOERLI]],
  [ChainId.XDAI]: [
    WXDAI[ChainId.XDAI],
    WETH[ChainId.XDAI],
    DXD[ChainId.XDAI],
    USDC[ChainId.XDAI],
    USDT[ChainId.XDAI],
    WBTC[ChainId.XDAI],
    HONEY,
    STAKE,
    AGAVE,
    BAO,
    GNO,
  ],
  [ChainId.POLYGON]: [WMATIC[ChainId.POLYGON], WBTC[ChainId.POLYGON], USDC[ChainId.POLYGON], USDT[ChainId.POLYGON]],
  [ChainId.GOERLI]: [WETH[ChainId.GOERLI]],
  [ChainId.OPTIMISM_MAINNET]: [
    WETH[ChainId.OPTIMISM_MAINNET],
    USDC[ChainId.OPTIMISM_MAINNET],
    USDT[ChainId.OPTIMISM_MAINNET],
    WBTC[ChainId.OPTIMISM_MAINNET],
    DAI[ChainId.OPTIMISM_MAINNET],
  ],
  [ChainId.OPTIMISM_GOERLI]: [WETH[ChainId.OPTIMISM_GOERLI]],
  [ChainId.BSC_MAINNET]: [
    ETH[ChainId.BSC_MAINNET],
    DAI[ChainId.BSC_MAINNET],
    USDT[ChainId.BSC_MAINNET],
    USDC[ChainId.BSC_MAINNET],
  ],
  [ChainId.BSC_TESTNET]: [DAI[ChainId.BSC_TESTNET], USDT[ChainId.BSC_TESTNET], USDC[ChainId.BSC_TESTNET]],
}
