import JSBI from 'jsbi'
import {
  ChainId,
  ETHER,
  CurrencyAmount,
  Pair,
  Percent,
  Route,
  Token,
  TokenAmount,
  TradeType,
  UniswapV2Trade,
  UniswapV2RoutablePlatform,
} from '../src'

describe('UniswapV2Trade', () => {
  const maximumSlippage = new Percent('3', '100')

  const token0 = new Token(ChainId.MAINNET, '0x0000000000000000000000000000000000000001', 18, 't0')
  const token1 = new Token(ChainId.MAINNET, '0x0000000000000000000000000000000000000002', 18, 't1')
  const token2 = new Token(ChainId.MAINNET, '0x0000000000000000000000000000000000000003', 18, 't2')
  const token3 = new Token(ChainId.MAINNET, '0x0000000000000000000000000000000000000004', 18, 't3')

  const pair_0_1 = new Pair(new TokenAmount(token0, JSBI.BigInt(1000)), new TokenAmount(token1, JSBI.BigInt(1000)))
  const pair_0_2 = new Pair(new TokenAmount(token0, JSBI.BigInt(1000)), new TokenAmount(token2, JSBI.BigInt(1100)))
  const pair_0_3 = new Pair(new TokenAmount(token0, JSBI.BigInt(1000)), new TokenAmount(token3, JSBI.BigInt(900)))
  const pair_1_2 = new Pair(new TokenAmount(token1, JSBI.BigInt(1200)), new TokenAmount(token2, JSBI.BigInt(1000)))
  const pair_1_3 = new Pair(new TokenAmount(token1, JSBI.BigInt(1200)), new TokenAmount(token3, JSBI.BigInt(1300)))

  const pair_weth_0 = new Pair(
    new TokenAmount(Token.WETH[ChainId.MAINNET], JSBI.BigInt(1000)),
    new TokenAmount(token0, JSBI.BigInt(1000))
  )

  const empty_pair_0_1 = new Pair(new TokenAmount(token0, JSBI.BigInt(0)), new TokenAmount(token1, JSBI.BigInt(0)))

  it('can be constructed with ETHER as input', () => {
    const trade = new UniswapV2Trade(
      new Route([pair_weth_0], ETHER),
      CurrencyAmount.nativeCurrency(JSBI.BigInt(100), ChainId.MAINNET),
      maximumSlippage,
      TradeType.EXACT_INPUT
    )
    expect(trade.inputAmount.currency).toEqual(ETHER)
    expect(trade.outputAmount.currency).toEqual(token0)
  })
  it('can be constructed with ETHER as input for exact output', () => {
    const trade = new UniswapV2Trade(
      new Route([pair_weth_0], ETHER, token0),
      new TokenAmount(token0, JSBI.BigInt(100)),
      maximumSlippage,
      TradeType.EXACT_OUTPUT
    )
    expect(trade.inputAmount.currency).toEqual(ETHER)
    expect(trade.outputAmount.currency).toEqual(token0)
  })

  it('can be constructed with ETHER as output', () => {
    const trade = new UniswapV2Trade(
      new Route([pair_weth_0], token0, ETHER),
      CurrencyAmount.nativeCurrency(JSBI.BigInt(100), ChainId.MAINNET),
      maximumSlippage,
      TradeType.EXACT_OUTPUT
    )
    expect(trade.inputAmount.currency).toEqual(token0)
    expect(trade.outputAmount.currency).toEqual(ETHER)
  })
  it('can be constructed with ETHER as output for exact input', () => {
    const trade = new UniswapV2Trade(
      new Route([pair_weth_0], token0, ETHER),
      new TokenAmount(token0, JSBI.BigInt(100)),
      maximumSlippage,
      TradeType.EXACT_INPUT
    )
    expect(trade.inputAmount.currency).toEqual(token0)
    expect(trade.outputAmount.currency).toEqual(ETHER)
  })
  it('has platform value set default to Swapr', () => {
    const trade = new UniswapV2Trade(
      new Route([pair_weth_0], ETHER),
      CurrencyAmount.nativeCurrency(JSBI.BigInt(100), ChainId.MAINNET),
      maximumSlippage,
      TradeType.EXACT_INPUT
    )
    expect(trade.platform).toEqual(UniswapV2RoutablePlatform.SWAPR)
  })

  describe('#bestTradeExactIn', () => {
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

      expect(result[1]?.route.path).toEqual([token0, token1, token2])
      expect(result[1]?.inputAmount).toEqual(new TokenAmount(token0, JSBI.BigInt(100)))
      expect(result[1]?.outputAmount).toEqual(new TokenAmount(token2, JSBI.BigInt(69)))
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

    it('works for ETHER currency input', () => {
      const result = UniswapV2Trade.computeTradeExactIn({
        pairs: [pair_weth_0, pair_0_1, pair_0_3, pair_1_3],
        currencyAmountIn: CurrencyAmount.nativeCurrency(JSBI.BigInt(100), ChainId.MAINNET),
        currencyOut: token3,
        maximumSlippage,
      })
      expect(result[0]?.inputAmount.currency).toEqual(ETHER)
      expect(result[0]?.route.path).toEqual([Token.WETH[ChainId.MAINNET], token0, token1, token3])
      expect(result[0]?.outputAmount.currency).toEqual(token3)
    })
    it('works for ETHER currency output', () => {
      const result = UniswapV2Trade.computeTradeExactIn({
        pairs: [pair_weth_0, pair_0_1, pair_0_3, pair_1_3],
        currencyAmountIn: new TokenAmount(token3, JSBI.BigInt(100)),
        currencyOut: ETHER,
        maximumSlippage,
      })
      expect(result[0]?.inputAmount.currency).toEqual(token3)
      expect(result[0]?.route.path).toEqual([token3, token0, Token.WETH[ChainId.MAINNET]])
      expect(result[0]?.inputAmount.currency).toEqual(token3)
      expect(result[0]?.outputAmount.currency).toEqual(ETHER)
    })
  })

  /*
  No longer valid, clean up
  describe.skip('#maximumAmountIn', () => {
    describe('tradeType = EXACT_INPUT', () => {
      const exactIn = new UniswapV2Trade(
        new Route([pair_0_1, pair_1_2], token0),
        new TokenAmount(token0, JSBI.BigInt(100)),
        maximumSlippage,
        TradeType.EXACT_INPUT
      )
      it('throws if less than 0', () => {
        expect(() => exactIn.maximumAmountIn(new Percent(JSBI.BigInt(-1), JSBI.BigInt(100)))).toThrow(
          'SLIPPAGE_TOLERANCE'
        )
      })
      it('returns exact if 0', () => {
        expect(exactIn.maximumAmountIn(new Percent(JSBI.BigInt(0), JSBI.BigInt(100)))).toEqual(exactIn.inputAmount)
      })
      it('returns exact if nonzero', () => {
        expect(exactIn.maximumAmountIn(new Percent(JSBI.BigInt(0), JSBI.BigInt(100)))).toEqual(
          new TokenAmount(token0, JSBI.BigInt(100))
        )
        expect(exactIn.maximumAmountIn(new Percent(JSBI.BigInt(5), JSBI.BigInt(100)))).toEqual(
          new TokenAmount(token0, JSBI.BigInt(100))
        )
        expect(exactIn.maximumAmountIn(new Percent(JSBI.BigInt(200), JSBI.BigInt(100)))).toEqual(
          new TokenAmount(token0, JSBI.BigInt(100))
        )
      })
    })
    describe('tradeType = EXACT_OUTPUT', () => {
      const exactOut = new UniswapV2Trade(
        new Route([pair_0_1, pair_1_2], token0),
        new TokenAmount(token2, JSBI.BigInt(100)),
        maximumSlippage,
        TradeType.EXACT_OUTPUT
      )

      it('throws if less than 0', () => {
        expect(() => exactOut.maximumAmountIn(new Percent(JSBI.BigInt(-1), JSBI.BigInt(100)))).toThrow(
          'SLIPPAGE_TOLERANCE'
        )
      })
      it('returns exact if 0', () => {
        expect(exactOut.maximumAmountIn(new Percent(JSBI.BigInt(0), JSBI.BigInt(100)))).toEqual(exactOut.inputAmount)
      })
      it('returns slippage amount if nonzero', () => {
        expect(exactOut.maximumAmountIn(new Percent(JSBI.BigInt(0), JSBI.BigInt(100)))).toEqual(
          new TokenAmount(token0, JSBI.BigInt(156))
        )
        expect(exactOut.maximumAmountIn(new Percent(JSBI.BigInt(5), JSBI.BigInt(100)))).toEqual(
          new TokenAmount(token0, JSBI.BigInt(163))
        )
        expect(exactOut.maximumAmountIn(new Percent(JSBI.BigInt(200), JSBI.BigInt(100)))).toEqual(
          new TokenAmount(token0, JSBI.BigInt(468))
        )
      })
    })
  })

  describe('#minimumAmountOut', () => {
    describe('tradeType = EXACT_INPUT', () => {
      const exactIn = new UniswapV2Trade(
        new Route([pair_0_1, pair_1_2], token0),
        new TokenAmount(token0, JSBI.BigInt(100)),
        maximumSlippage,
        TradeType.EXACT_INPUT
      )
      it('throws if less than 0', () => {
        expect(() => exactIn.minimumAmountOut(new Percent(JSBI.BigInt(-1), JSBI.BigInt(100)))).toThrow(
          'SLIPPAGE_TOLERANCE'
        )
      })
      it('returns exact if 0', () => {
        expect(exactIn.minimumAmountOut(new Percent(JSBI.BigInt(0), JSBI.BigInt(100)))).toEqual(exactIn.outputAmount)
      })
      it('returns exact if nonzero', () => {
        expect(exactIn.minimumAmountOut(new Percent(JSBI.BigInt(0), JSBI.BigInt(100)))).toEqual(
          new TokenAmount(token2, JSBI.BigInt(69))
        )
        expect(exactIn.minimumAmountOut(new Percent(JSBI.BigInt(5), JSBI.BigInt(100)))).toEqual(
          new TokenAmount(token2, JSBI.BigInt(65))
        )
        expect(exactIn.minimumAmountOut(new Percent(JSBI.BigInt(200), JSBI.BigInt(100)))).toEqual(
          new TokenAmount(token2, JSBI.BigInt(23))
        )
      })
    })
    describe('tradeType = EXACT_OUTPUT', () => {
      const exactOut = new UniswapV2Trade(
        new Route([pair_0_1, pair_1_2], token0),
        new TokenAmount(token2, JSBI.BigInt(100)),
        maximumSlippage,
        TradeType.EXACT_OUTPUT
      )

      it('throws if less than 0', () => {
        expect(() => exactOut.minimumAmountOut(new Percent(JSBI.BigInt(-1), JSBI.BigInt(100)))).toThrow(
          'SLIPPAGE_TOLERANCE'
        )
      })
      it('returns exact if 0', () => {
        expect(exactOut.minimumAmountOut(new Percent(JSBI.BigInt(0), JSBI.BigInt(100)))).toEqual(exactOut.outputAmount)
      })
      it('returns slippage amount if nonzero', () => {
        expect(exactOut.minimumAmountOut(new Percent(JSBI.BigInt(0), JSBI.BigInt(100)))).toEqual(
          new TokenAmount(token2, JSBI.BigInt(100))
        )
        expect(exactOut.minimumAmountOut(new Percent(JSBI.BigInt(5), JSBI.BigInt(100)))).toEqual(
          new TokenAmount(token2, JSBI.BigInt(100))
        )
        expect(exactOut.minimumAmountOut(new Percent(JSBI.BigInt(200), JSBI.BigInt(100)))).toEqual(
          new TokenAmount(token2, JSBI.BigInt(100))
        )
      })
    })
  })
  */

  describe('#bestTradeExactOut', () => {
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
      expect(result[1]?.inputAmount).toEqual(new TokenAmount(token0, JSBI.BigInt(156)))
      expect(result[1]?.outputAmount).toEqual(new TokenAmount(token2, JSBI.BigInt(100)))
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

    it('works for ETHER currency input', () => {
      const result = UniswapV2Trade.computeTradeExactOut({
        pairs: [pair_weth_0, pair_0_1, pair_0_3, pair_1_3],
        currencyIn: ETHER,
        currencyAmountOut: new TokenAmount(token3, JSBI.BigInt(100)),
        maximumSlippage,
      })
      expect(result[0]?.inputAmount.currency).toEqual(ETHER)
      expect(result[0]?.route.path).toEqual([Token.WETH[ChainId.MAINNET], token0, token1, token3])
      expect(result[0]?.outputAmount.currency).toEqual(token3)
      // least efficient path
      expect(result[1]?.inputAmount.currency).toEqual(ETHER)
      expect(result[1]?.route.path).toEqual([Token.WETH[ChainId.MAINNET], token0, token3])
      expect(result[1]?.outputAmount.currency).toEqual(token3)
    })
    it('works for ETHER currency output', () => {
      const result = UniswapV2Trade.computeTradeExactOut({
        pairs: [pair_weth_0, pair_0_1, pair_0_3, pair_1_3],
        currencyIn: token3,
        currencyAmountOut: CurrencyAmount.nativeCurrency(JSBI.BigInt(100), ChainId.MAINNET),
        maximumSlippage,
      })
      expect(result[0]?.inputAmount.currency).toEqual(token3)
      expect(result[0]?.route.path).toEqual([token3, token0, Token.WETH[ChainId.MAINNET]])
      expect(result[0]?.outputAmount.currency).toEqual(ETHER)
      // least efficient path
      expect(result[1]?.inputAmount.currency).toEqual(token3)
      expect(result[1]?.outputAmount.currency).toEqual(ETHER)
      expect(result[1]?.route.path).toEqual([token3, token1, token0, Token.WETH[ChainId.MAINNET]])
    })
  })
})
