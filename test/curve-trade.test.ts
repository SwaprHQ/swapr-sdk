import { parseUnits } from '@ethersproject/units'
import { JsonRpcProvider } from '@ethersproject/providers'
// import { MaxInt256 } from '@ethersproject/constants'
// import { Contract } from '@ethersproject/contracts'
import { isAddress } from '@ethersproject/address'
import JSBI from 'jsbi'

import { ChainId, Currency, CurrencyAmount, CurveTrade, Percent, RoutablePlatform, Token, TokenAmount } from '../src'
import {
  TOKENS_MAINNET,
  TOKENS_XDAI,
  TOKENS_ARBITRUM_ONE,
  CURVE_POOLS,
  POOLS_MAINNET,
  CurvePool
} from '../src/entities/trades/curve-trade/constants'

// import { ERC20_ABI } from '../test-util/abi'
import { execAsync } from '../test-util'

export async function getGanacheRPCProvider(timeout = 10000): Promise<JsonRpcProvider> {
  let retryCt = 0
  let provider: JsonRpcProvider

  while (retryCt * 100 < timeout) {
    try {
      provider = new JsonRpcProvider()
      const isReady = await provider.ready
      const blockNumber = await provider.getBlockNumber()

      if (isReady) {
        console.log(`Provider ready @ block #${blockNumber}`)
        break
      }
    } catch (e) {
      console.log(e)
    }

    retryCt++
  }

  // @ts-ignore
  return provider
}

// try to parse a user entered amount for a given token
export function tryParseAmount(value?: string, currency?: Currency, chainId?: number): CurrencyAmount | undefined {
  if (!value || !currency) {
    return undefined
  }

  try {
    const typedValueParsed = parseUnits(value, currency.decimals).toString()
    if (typedValueParsed !== '0') {
      if (currency instanceof Token) return new TokenAmount(currency, JSBI.BigInt(typedValueParsed))
      else if (chainId) return CurrencyAmount.nativeCurrency(JSBI.BigInt(typedValueParsed), chainId)
      else return undefined
    }
  } catch (error) {
    // should fail if the user specifies too many decimal places of precision (or maybe exceed max uint?)
    console.debug(`Failed to parse input amount: "${value}"`, error)
  }
  // necessary for all paths to return a value
  return undefined
}

describe('CurveTrade', () => {
  // @ts-ignore
  const testIf = (condition: boolean) => (condition ? it : it.skip)

  const maximumSlippage = new Percent('3', '100')

  describe('Gnosis Chain', () => {
    const tokenXWDAI = new Token(ChainId.XDAI, TOKENS_XDAI.wxdai.address, TOKENS_XDAI.wxdai.decimals, 'WXDAI', 'WXDAI')
    const tokenUSDC = new Token(ChainId.XDAI, TOKENS_XDAI.usdc.address, TOKENS_XDAI.usdc.decimals, 'USDC', 'USDC')

    test('Should return the best trade from WXDAI to USDC', async () => {
      const currencyAmountIn = tryParseAmount(
        parseUnits('1', tokenXWDAI.decimals).toString(),
        tokenXWDAI
      ) as CurrencyAmount

      const trade = await CurveTrade.bestTradeExactIn({
        currencyAmountIn,
        currencyOut: tokenUSDC,
        maximumSlippage
      })

      expect(trade).toBeDefined()
      expect(trade?.platform.name).toEqual(RoutablePlatform.CURVE.name)

      // test swap transaction
      const swapTransaction = trade && (await trade.swapTransaction())
      expect(swapTransaction).toBeDefined()
      expect(swapTransaction?.data).toBeDefined()
      expect(isAddress(swapTransaction?.to as string)).toBeTruthy()
    })

    test('Should return the best trade from USDC to WXDAI', async () => {
      const currencyAmountIn = tryParseAmount(
        parseUnits('1', tokenUSDC.decimals).toString(),
        tokenUSDC
      ) as CurrencyAmount

      const trade = await CurveTrade.bestTradeExactIn({
        currencyAmountIn,
        currencyOut: tokenXWDAI,
        maximumSlippage
      })

      expect(trade).toBeDefined()
      expect(trade?.platform.name).toEqual(RoutablePlatform.CURVE.name)

      // test swap transaction
      const swapTransaction = trade && (await trade.swapTransaction())
      expect(swapTransaction).toBeDefined()
      expect(swapTransaction?.data).toBeDefined()
      expect(isAddress(swapTransaction?.to as string)).toBeTruthy()
    })
  })

  describe('Ethereum', () => {
    // @ts-ignore
    const testAccountList = [
      {
        // Binance 8
        address: '0xf977814e90da44bfa03b6295a0616a897441acec',
        tokens: [TOKENS_MAINNET.usdc, TOKENS_MAINNET.dai, TOKENS_MAINNET.crv]
      },
      {
        // Binance 14
        address: '0x28c6c06298d514db089934071355e5743bf21d60',
        tokens: [
          TOKENS_MAINNET.usdc,
          TOKENS_MAINNET.busd,
          TOKENS_MAINNET.crv,
          TOKENS_MAINNET.cvx,
          TOKENS_MAINNET.eth,
          TOKENS_MAINNET.tusd,
          TOKENS_MAINNET.link
        ]
      },
      {
        // Random RenBTC
        address: '0x36cc7b13029b5dee4034745fb4f24034f3f2ffc6',
        tokens: [TOKENS_MAINNET.renbtc]
      },

      {
        // Random FRAX holder
        address: '0x183d0dc5867c01bfb1dbbc41d6a9d3de6e044626',
        tokens: [TOKENS_MAINNET.frax]
      },
      {
        // FTX
        address: '0x2faf487a4414fe77e2327f0bf4ae2a264a776ad2',
        tokens: [TOKENS_MAINNET.xaut, TOKENS_MAINNET.husd, TOKENS_MAINNET.pax]
      },
      {
        address: '0x8301AE4fc9c624d1D396cbDAa1ed877821D7C511',
        tokens: [TOKENS_MAINNET.eth]
      },
      {
        // Houbi
        address: '0x46705dfff24256421a05d056c29e81bdc09723b8',
        tokens: [TOKENS_MAINNET.hbtc]
      },
      {
        // Random RAI holder
        address: '0x618788357d0ebd8a37e763adab3bc575d54c2c7d',
        tokens: [TOKENS_MAINNET.rai]
      },
      {
        // Gemini 4
        address: '0x5f65f7b609678448494de4c87521cdf6cef1e932',
        tokens: [TOKENS_MAINNET.gusd]
      },
      {
        // Hotbit 3
        address: '0x562680a4dc50ed2f14d75bf31f494cfe0b8d10a1',
        tokens: [TOKENS_MAINNET.dusd]
      },
      {
        // Random
        address: '0xa046a8660e66d178ee07ec97c585eeb6aa18c26c',
        tokens: [TOKENS_MAINNET.mim]
      },
      {
        // Random
        address: '0x7d812b62dc15e6f4073eba8a2ba8db19c4e40704',
        tokens: [TOKENS_MAINNET.usdt]
      },
      {
        // Random
        address: '0xab4ce310054a11328685ece1043211b68ba5d082',
        tokens: [TOKENS_MAINNET.cdai]
      },
      {
        // Coinbase 4
        address: '0x503828976d22510aad0201ac7ec88293211d23da',
        tokens: [TOKENS_MAINNET.musd]
      },
      {
        // Random EOA with 9k WETH
        address: '0x57757e3d981446d585af0d9ae4d7df6d64647806',
        tokens: [TOKENS_MAINNET.weth]
      }
    ]

    beforeAll(async () => {
      await execAsync('npm run docker:up')
    })

    afterEach(async () => {
      // await execAsync('npm run docker:restart')
    })

    afterAll(async () => {
      await execAsync('npm run docker:down')
    })

    interface TestPair {
      tokenIn: Token
      tokenOut: Token
      tokenInAmount: string
      testAccount: string
      pool?: CurvePool
    }

    // @ts-ignore
    const testCombos: TestPair[] = [
      {
        testAccount: '0xF006779eAbE823F8EEd05464A1628383af1f7afb',
        tokenInAmount: '100',
        tokenIn: new Token(
          ChainId.MAINNET,
          TOKENS_MAINNET.usdc.address,
          TOKENS_MAINNET.usdc.decimals,
          TOKENS_MAINNET.usdc.symbol,
          TOKENS_MAINNET.usdc.name
        ),
        tokenOut: new Token(
          ChainId.MAINNET,
          TOKENS_MAINNET.dai.address,
          TOKENS_MAINNET.dai.decimals,
          TOKENS_MAINNET.dai.symbol,
          TOKENS_MAINNET.dai.name
        ),
        pool: POOLS_MAINNET.find(pool => pool.id === 'susd')
      },
      {
        testAccount: '0xF006779eAbE823F8EEd05464A1628383af1f7afb',
        tokenInAmount: '1000',
        tokenIn: new Token(
          ChainId.MAINNET,
          TOKENS_MAINNET.usdc.address,
          TOKENS_MAINNET.usdc.decimals,
          TOKENS_MAINNET.usdc.symbol,
          TOKENS_MAINNET.usdc.name
        ),
        tokenOut: new Token(
          ChainId.MAINNET,
          TOKENS_MAINNET.wbtc.address,
          TOKENS_MAINNET.wbtc.decimals,
          TOKENS_MAINNET.wbtc.symbol,
          TOKENS_MAINNET.wbtc.name
        )
      },
      {
        // Random WBTC holder
        testAccount: '0x72a53cdbbcc1b9efa39c834a540550e23463aacb',
        tokenInAmount: '1',
        tokenIn: new Token(
          ChainId.MAINNET,
          TOKENS_MAINNET.wbtc.address,
          TOKENS_MAINNET.wbtc.decimals,
          TOKENS_MAINNET.wbtc.symbol,
          TOKENS_MAINNET.wbtc.name
        ),
        tokenOut: new Token(
          ChainId.MAINNET,
          TOKENS_MAINNET.renbtc.address,
          TOKENS_MAINNET.renbtc.decimals,
          TOKENS_MAINNET.renbtc.symbol,
          TOKENS_MAINNET.renbtc.name
        )
      },
      {
        testAccount: '0x28c6c06298d514db089934071355e5743bf21d60',
        tokenInAmount: '1',
        tokenIn: new Token(
          ChainId.MAINNET,
          TOKENS_MAINNET.eth.address,
          TOKENS_MAINNET.eth.decimals,
          TOKENS_MAINNET.eth.symbol,
          TOKENS_MAINNET.eth.name
        ),
        tokenOut: new Token(
          ChainId.MAINNET,
          TOKENS_MAINNET.steth.address,
          TOKENS_MAINNET.steth.decimals,
          TOKENS_MAINNET.steth.symbol,
          TOKENS_MAINNET.steth.name
        )
      }
    ]

    testCombos.forEach(({ testAccount, tokenIn, tokenOut, tokenInAmount }) => {
      const currencyAmountIn = new TokenAmount(
        tokenIn,
        parseUnits(tokenInAmount, tokenIn.decimals).toString()
      ) as CurrencyAmount
      const testName = `Should swap ${tokenInAmount} ${tokenIn.symbol} to ${tokenOut.symbol}`

      test(testName, async () => {
        // Get EVM
        const mainnetForkProvider = await getGanacheRPCProvider()
        // Unlock
        await mainnetForkProvider.send('evm_unlockUnknownAccount', [testAccount])

        // console.log(`Unlocked ${testAccount} for swap`)

        // Get unlocked account as signer
        // const unlockedAccountSigner = mainnetForkProvider.getSigner(testAccount)

        // Get trade
        const trade = await CurveTrade.bestTradeExactIn(
          {
            currencyAmountIn,
            currencyOut: tokenOut,
            maximumSlippage
          },
          mainnetForkProvider
        )

        expect(trade).toBeDefined()
        const swapTransaction = trade && (await trade.swapTransaction())
        expect(swapTransaction).toBeDefined()
        expect(swapTransaction?.data).toBeDefined()
        expect(isAddress(swapTransaction?.to as string)).toBeTruthy()

        /*
        let approved = false
        try {
          // Approve the sell token
          const tokenInContract = new Contract(tokenIn.address, ERC20_ABI, unlockedAccountSigner)
          console.log(`Approving ${tokenIn.symbol} (${tokenIn.address}) for swap on ${trade?.approveAddress}`)
          await tokenInContract.approve(trade?.approveAddress, MaxInt256).then((tx: any) => tx.wait())
          console.log(`Approved ${tokenIn.symbol} (${tokenIn.address}) for swap on ${trade?.approveAddress}`)
          approved = true
        } catch (e) {
          console.log('[WARNING] Approve failed. Swap stage of test is skipped')
        }
        if (approved) {
          const exchangeTx = await unlockedAccountSigner.sendTransaction(swapTransaction as any)
          console.log(exchangeTx)
          expect(exchangeTx).toBeDefined()
        }
        */
      })
    })
  })

  describe('Arbitrum One', () => {
    const tokenEURs = new Token(
      ChainId.ARBITRUM_ONE,
      TOKENS_ARBITRUM_ONE.eurs.address,
      TOKENS_ARBITRUM_ONE.eurs.decimals,
      TOKENS_ARBITRUM_ONE.eurs.symbol,
      TOKENS_ARBITRUM_ONE.eurs.name
    )
    const tokenUSDC = new Token(
      ChainId.ARBITRUM_ONE,
      TOKENS_ARBITRUM_ONE.usdc.address,
      TOKENS_ARBITRUM_ONE.usdc.decimals,
      TOKENS_ARBITRUM_ONE.usdc.symbol,
      TOKENS_ARBITRUM_ONE.usdc.name
    )

    const tokenUSDT = new Token(
      ChainId.ARBITRUM_ONE,
      TOKENS_ARBITRUM_ONE.usdt.address,
      TOKENS_ARBITRUM_ONE.usdt.decimals,
      TOKENS_ARBITRUM_ONE.usdt.symbol,
      TOKENS_ARBITRUM_ONE.usdt.name
    )

    test('Should return the best trade from USDC to USDT via 2pool', async () => {
      const currencyAmountIn = tryParseAmount(
        parseUnits('1', tokenUSDC.decimals).toString(),
        tokenUSDC
      ) as CurrencyAmount

      const trade = await CurveTrade.bestTradeExactIn({
        currencyAmountIn,
        currencyOut: tokenUSDT,
        maximumSlippage
      })

      const curve2Pool = CURVE_POOLS[ChainId.ARBITRUM_ONE].find(({ name }) => name.toLowerCase() == '2pool')

      expect(trade).toBeDefined()
      expect(trade?.platform.name).toEqual(RoutablePlatform.CURVE.name)
      // test swap transaction
      const swapTransaction = trade && (await trade.swapTransaction())
      expect(swapTransaction).toBeDefined()
      expect(swapTransaction?.data).toBeDefined()
      expect(isAddress(swapTransaction?.to as string)).toBeTruthy()
      expect(swapTransaction?.to).toBe(curve2Pool?.swapAddress)
    })

    test('Should return the best trade from USDC to EURs via eurusd', async () => {
      const currencyAmountIn = tryParseAmount(
        parseUnits('1', tokenUSDC.decimals).toString(),
        tokenUSDC
      ) as CurrencyAmount
      const trade = await CurveTrade.bestTradeExactIn({
        currencyAmountIn,
        currencyOut: tokenEURs,
        maximumSlippage
      })
      expect(trade).toBeDefined()
      expect(trade?.platform.name).toEqual(RoutablePlatform.CURVE.name)
      // test swap transaction
      const swapTransaction = trade && (await trade.swapTransaction())
      expect(swapTransaction).toBeDefined()
      expect(swapTransaction?.data).toBeDefined()
      expect(isAddress(swapTransaction?.to as string)).toBeTruthy()
    })
  })

  test('Should handle fractions like 1.5 WXDAI to USDC', async () => {
    const tokenXWDAI = new Token(ChainId.XDAI, TOKENS_XDAI.wxdai.address, TOKENS_XDAI.wxdai.decimals, 'WXDAI', 'WXDAI')
    const tokenUSDC = new Token(ChainId.XDAI, TOKENS_XDAI.usdc.address, TOKENS_XDAI.usdc.decimals, 'USDC', 'USDC')
    const currencyAmountIn = tryParseAmount(
      parseUnits('1.5', tokenXWDAI.decimals).toString(),
      tokenXWDAI
    ) as CurrencyAmount
    const trade = await CurveTrade.bestTradeExactIn({
      currencyAmountIn,
      currencyOut: tokenUSDC,
      maximumSlippage
    })
    expect(trade).toBeDefined()
    expect(trade?.platform.name).toEqual(RoutablePlatform.CURVE.name)
    // test swap transaction
    const swapTransaction = trade && (await trade.swapTransaction())
    expect(swapTransaction).toBeDefined()
    expect(swapTransaction?.data).toBeDefined()
    expect(isAddress(swapTransaction?.to as string)).toBeTruthy()
  })
})
