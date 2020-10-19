import { INIT_CODE_HASH, FACTORY_ADDRESS, ChainId } from '../src/constants'

import { bytecode } from 'dxswap-core/build/DXswapPair.json'
import { keccak256 } from '@ethersproject/solidity'

// this _could_ go in constants, except that it would cost every consumer of the sdk the CPU to compute the hash
// and load the JSON.
const COMPUTED_INIT_CODE_HASH = keccak256(['bytes'], [`${'0x'+bytecode}`])

describe('constants', () => {
  describe('INIT_CODE_HASH', () => {
    it('matches computed bytecode hash', () => {
      expect(COMPUTED_INIT_CODE_HASH).toEqual(INIT_CODE_HASH)
    })
  })
  describe('FACTORY_ADDRESS', () => {
    it('matches computed bytecode hash', () => {
      expect(FACTORY_ADDRESS[ChainId.RINKEBY]).toEqual('0xc590D61Bf56B8E33D5E3563a4C37af748FEa2CA4')
    })
  })
})
