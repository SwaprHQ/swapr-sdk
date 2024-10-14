import { ChainId } from '../../../constants'

export const POOL_DEPLOYER_ADDRESS = '0xC1b576AC6Ec749d5Ace1787bF9Ec6340908ddB47'
export const POOL_INIT_CODE_HASH = '0xbce37a54eab2fcd71913a0d40723e04238970e7fc1159bfd58ad5b79531697e7'

export const SWAPR_ALGEBRA_CONTRACTS = {
  quoter: '0xcBaD9FDf0D2814659Eb26f600EFDeAF005Eda0F7',
  router: '0xfFB643E73f280B97809A8b41f7232AB401a04ee1',
  multicall: '0xc4B85BaF01cD7D1C8F08a8539ba96C205782BBcf',
}

export type BaseToken = {
  chainId: number
  decimals: number
  symbol: string
  name: string
  isNative: boolean
  isToken: boolean
  address: string
}

export const baseTokens: BaseToken[] = [
  {
    chainId: ChainId.GNOSIS,
    decimals: 18,
    symbol: 'WXDAI',
    name: 'Wrapped XDAI',
    isNative: false,
    isToken: true,
    address: '0xe91D153E0b41518A2Ce8Dd3D7944Fa863463a97d',
  },
  {
    chainId: ChainId.GNOSIS,
    decimals: 6,
    symbol: 'USDC',
    name: 'USD//C on Gnosis',
    isNative: false,
    isToken: true,
    address: '0xDDAfbb505ad214D7b80b1f830fcCc89B60fb7A83',
  },
  {
    chainId: ChainId.GNOSIS,
    decimals: 18,
    symbol: 'WETH',
    name: 'Wrapped Ether on Gnosis chain',
    isNative: false,
    isToken: true,
    address: '0x6A023CCd1ff6F2045C3309768eAd9E68F978f6e1',
  },
  {
    chainId: ChainId.GNOSIS,
    decimals: 18,
    symbol: 'GNO',
    name: 'Gnosis Token on Gnosis chain',
    isNative: false,
    isToken: true,
    address: '0x9C58BAcC331c9aa871AFD802DB6379a98e80CEdb',
  },
]
