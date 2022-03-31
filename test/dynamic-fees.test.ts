import JSBI from 'jsbi'
import { ChainId, Pair, Percent, Token, TokenAmount, UniswapV2Trade } from '../src'
import { defaultSwapFee, defaultProtocolFeeDenominator } from '../src/constants'

describe('Dynamic-Fees', () => {
  const maximumSlippage = new Percent('3', '100')

  const token0 = new Token(ChainId.MAINNET, '0x0000000000000000000000000000000000000001', 18, 't0')
  const token1 = new Token(ChainId.MAINNET, '0x0000000000000000000000000000000000000002', 18, 't1')
  const token2 = new Token(ChainId.MAINNET, '0x0000000000000000000000000000000000000003', 18, 't2')
  const token3 = new Token(ChainId.MAINNET, '0x0000000000000000000000000000000000000004', 18, 't3')

  const pair_0_1 = new Pair(
    new TokenAmount(token0, JSBI.BigInt(1000)),
    new TokenAmount(token1, JSBI.BigInt(1000)),
    JSBI.BigInt(0),
    JSBI.BigInt(0)
  )
  const pair_0_2 = new Pair(
    new TokenAmount(token0, JSBI.BigInt(1000)),
    new TokenAmount(token2, JSBI.BigInt(1100)),
    JSBI.BigInt(15),
    JSBI.BigInt(5)
  )
  const pair_0_3 = new Pair(
    new TokenAmount(token0, JSBI.BigInt(1000)),
    new TokenAmount(token3, JSBI.BigInt(900)),
    JSBI.BigInt(30),
    JSBI.BigInt(0)
  )
  const pair_1_2 = new Pair(
    new TokenAmount(token1, JSBI.BigInt(1200)),
    new TokenAmount(token2, JSBI.BigInt(1000)),
    JSBI.BigInt(0),
    JSBI.BigInt(5)
  )
  const pair_1_3 = new Pair(
    new TokenAmount(token1, JSBI.BigInt(1200)),
    new TokenAmount(token3, JSBI.BigInt(1300)),
    defaultSwapFee,
    defaultProtocolFeeDenominator
  )

  const empty_pair_0_1 = new Pair(new TokenAmount(token0, JSBI.BigInt(0)), new TokenAmount(token1, JSBI.BigInt(0)))

  describe('#computeTradeExactIn', () => {
    it('throws with empty pairs', () => {
      expect(() =>
        UniswapV2Trade.computeTradeExactIn({
          pairs: [],
          currencyAmountIn: new TokenAmount(token0, JSBI.BigInt(100)),
          currencyOut: token2,
          maximumSlippage,
        })
      ).toThrow('PAIRS')
    })
    it('throws with max hops of 0', () => {
      expect(() =>
        UniswapV2Trade.computeTradeExactIn({
          pairs: [pair_0_2],
          currencyAmountIn: new TokenAmount(token0, JSBI.BigInt(100)),
          currencyOut: token2,
          maxHops: { maxHops: 0 },
          maximumSlippage,
        })
      ).toThrow('MAX_HOPS')
    })

    it('provides best route', () => {
      const result = UniswapV2Trade.computeTradeExactIn({
        pairs: [pair_0_1, pair_0_2, pair_1_2],
        currencyAmountIn: new TokenAmount(token0, JSBI.BigInt(100)),
        currencyOut: token2,
        maximumSlippage,
      })
      expect(result[0]?.route.pairs).toHaveLength(1) // 0 -> 2 at 10:11
      expect(result[0]?.route.path).toEqual([token0, token2])
      expect(result[0]?.inputAmount).toEqual(new TokenAmount(token0, JSBI.BigInt(100)))
      expect(result[0]?.outputAmount).toEqual(new TokenAmount(token2, JSBI.BigInt(99)))
    })

    it('doesnt throw for zero liquidity pairs', () => {
      expect(
        UniswapV2Trade.computeTradeExactIn({
          pairs: [empty_pair_0_1],
          currencyAmountIn: new TokenAmount(token0, JSBI.BigInt(100)),
          currencyOut: token1,
          maximumSlippage,
        })
      ).toHaveLength(0)
    })

    it('respects maxHops', () => {
      const result = UniswapV2Trade.computeTradeExactIn({
        pairs: [pair_0_1, pair_0_2, pair_1_2],
        currencyAmountIn: new TokenAmount(token0, JSBI.BigInt(10)),
        currencyOut: token2,
        maxHops: { maxHops: 1 },
        maximumSlippage,
      })
      expect(result[0]?.route.pairs).toHaveLength(1) // 0 -> 2 at 10:11
      expect(result[0]?.route.path).toEqual([token0, token2])
    })

    it('insufficient input for one pair', () => {
      const result = UniswapV2Trade.computeTradeExactIn({
        pairs: [pair_0_1, pair_0_2, pair_1_2],
        currencyAmountIn: new TokenAmount(token0, JSBI.BigInt(1)),
        currencyOut: token2,
        maximumSlippage,
      })
      expect(result[0]?.route.pairs).toHaveLength(1) // 0 -> 2 at 10:11
      expect(result[0]?.route.path).toEqual([token0, token2])
      expect(result[0]?.outputAmount).toEqual(new TokenAmount(token2, JSBI.BigInt(1)))
    })

    it('respects n', () => {
      const result = UniswapV2Trade.computeTradeExactIn({
        pairs: [pair_0_1, pair_0_2, pair_1_2],
        currencyAmountIn: new TokenAmount(token0, JSBI.BigInt(10)),
        currencyOut: token2,
        maxHops: { maxNumResults: 1 },
        maximumSlippage,
      })
      expect(result[0]?.route.pairs).toHaveLength(1)
    })

    it('no path', () => {
      const result = UniswapV2Trade.computeTradeExactIn({
        pairs: [pair_0_1, pair_0_3, pair_1_3],
        currencyAmountIn: new TokenAmount(token0, JSBI.BigInt(10)),
        currencyOut: token2,
        maximumSlippage,
      })
      expect(result).toHaveLength(0)
    })
  })

  describe('#computeTradeExactOut', () => {
    it('throws with empty pairs', () => {
      expect(() =>
        UniswapV2Trade.computeTradeExactOut({
          pairs: [],
          currencyIn: token0,
          currencyAmountOut: new TokenAmount(token2, JSBI.BigInt(100)),
          maximumSlippage,
        })
      ).toThrow('PAIRS')
    })
    it('throws with max hops of 0', () => {
      expect(() =>
        UniswapV2Trade.computeTradeExactOut({
          pairs: [pair_0_2],
          currencyIn: token0,
          currencyAmountOut: new TokenAmount(token2, JSBI.BigInt(100)),
          maxHops: { maxHops: 0 },
          maximumSlippage,
        })
      ).toThrow('MAX_HOPS')
    })

    it('provides best route', () => {
      const result = UniswapV2Trade.computeTradeExactOut({
        pairs: [pair_0_1, pair_0_2, pair_1_2],
        currencyIn: token0,
        currencyAmountOut: new TokenAmount(token2, JSBI.BigInt(100)),
        maximumSlippage,
      })
      expect(result[0]?.route.pairs).toHaveLength(1) // 0 -> 2 at 10:11
      expect(result[0]?.route.path).toEqual([token0, token2])
      expect(result[0]?.inputAmount).toEqual(new TokenAmount(token0, JSBI.BigInt(101)))
      expect(result[0]?.outputAmount).toEqual(new TokenAmount(token2, JSBI.BigInt(100)))
    })

    it('respects maxHops', () => {
      const result = UniswapV2Trade.computeTradeExactOut({
        pairs: [pair_0_1, pair_0_2, pair_1_2],
        currencyIn: token0,
        currencyAmountOut: new TokenAmount(token2, JSBI.BigInt(10)),
        maxHops: { maxHops: 1 },
        maximumSlippage,
      })
      expect(result[0]?.route.pairs).toHaveLength(1) // 0 -> 2 at 10:11
      expect(result[0]?.route.path).toEqual([token0, token2])
    })

    it('insufficient liquidity', () => {
      const result = UniswapV2Trade.computeTradeExactOut({
        pairs: [pair_0_1, pair_0_2, pair_1_2],
        currencyIn: token0,
        currencyAmountOut: new TokenAmount(token2, JSBI.BigInt(1200)),
        maximumSlippage,
      })
      expect(result).toHaveLength(0)
    })

    it('insufficient liquidity in one pair but not the other', () => {
      const result = UniswapV2Trade.computeTradeExactOut({
        pairs: [pair_0_1, pair_0_2, pair_1_2],
        currencyIn: token0,
        currencyAmountOut: new TokenAmount(token2, JSBI.BigInt(1050)),
        maximumSlippage,
      })
      expect(result[0]?.route.pairs).toHaveLength(1)
    })

    it('respects n', () => {
      const result = UniswapV2Trade.computeTradeExactOut({
        pairs: [pair_0_1, pair_0_2, pair_1_2],
        currencyIn: token0,
        currencyAmountOut: new TokenAmount(token2, JSBI.BigInt(10)),
        maxHops: { maxNumResults: 1 },
        maximumSlippage,
      })

      expect(result[0]?.route.pairs).toHaveLength(1)
    })

    it('no path', () => {
      const result = UniswapV2Trade.computeTradeExactOut({
        pairs: [pair_0_1, pair_0_3, pair_1_3],
        currencyIn: token0,
        currencyAmountOut: new TokenAmount(token2, JSBI.BigInt(10)),
        maximumSlippage,
      })
      expect(result).toHaveLength(0)
    })
  })
})
