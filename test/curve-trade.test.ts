import { parseEther, parseUnits } from '@ethersproject/units'
import { MaxUint256 } from '@ethersproject/constants'
import { BigNumber } from '@ethersproject/bignumber'
import { Contract } from '@ethersproject/contracts'
import invariant from 'tiny-invariant'

// Jest
import { addEVMAccount, ERC20_ABI, execAsync, getGanacheRPCProvider, unlockEVMAccount } from '../jest'

// Tets targets
import { ChainId, CurrencyAmount, CurveTrade, Percent, RoutablePlatform, Token, TokenAmount } from '../src'
import { TOKENS_XDAI, TOKENS_ARBITRUM_ONE, TOKENS_MAINNET } from '../src/entities/trades/curve/tokens'
import { getPoolTokenList } from '../src/entities/trades/curve/contracts'
import { CURVE_POOLS } from '../src/entities/trades/curve/pools'

describe('CurveTrade', () => {
  const maximumSlippage = new Percent('3', '100')

  describe('Gnosis Chain', () => {
    const tokenXWDAI = new Token(ChainId.XDAI, TOKENS_XDAI.wxdai.address, TOKENS_XDAI.wxdai.decimals, 'WXDAI', 'WXDAI')
    const tokenUSDC = new Token(ChainId.XDAI, TOKENS_XDAI.usdc.address, TOKENS_XDAI.usdc.decimals, 'USDC', 'USDC')

    test('Should be able to accept native xDAI', async () => {
      const currencyAmountIn = TokenAmount.nativeCurrency(parseUnits('100', 18).toBigInt(), ChainId.XDAI)
      const trade = await CurveTrade.bestTradeExactIn({
        currencyAmountIn,
        currencyOut: tokenUSDC,
        maximumSlippage,
      })
      invariant(!!trade)
      const swapTransaction = await trade.swapTransaction()
      expect(swapTransaction?.data).toBeDefined()
      expect(swapTransaction?.to).toBeAddress()
    })
    test('Should return the best trade from WXDAI to USDC', async () => {
      const currencyAmountIn = new TokenAmount(tokenXWDAI, parseUnits('100', tokenXWDAI.decimals).toBigInt())
      const trade = await CurveTrade.bestTradeExactIn({
        currencyAmountIn,
        currencyOut: tokenUSDC,
        maximumSlippage,
      })
      invariant(!!trade)
      const swapTransaction = await trade.swapTransaction()
      expect(swapTransaction?.data).toBeDefined()
      expect(swapTransaction?.to).toBeAddress()
    })

    test('Should return the best trade from USDC to WXDAI', async () => {
      const currencyAmountIn = new TokenAmount(tokenUSDC, parseUnits('100', tokenUSDC.decimals).toBigInt())
      const trade = await CurveTrade.bestTradeExactIn({
        currencyAmountIn,
        currencyOut: tokenXWDAI,
        maximumSlippage,
      })
      invariant(!!trade)
      const swapTransaction = await trade.swapTransaction()
      expect(swapTransaction?.data).toBeDefined()
      expect(swapTransaction?.to).toBeAddress()
    })

    test('Should estimate WXDAI input amount to get 100 USDC', async () => {
      const currencyAmountOut = new TokenAmount(tokenUSDC, parseUnits('100', tokenUSDC.decimals).toBigInt())
      const trade = await CurveTrade.bestTradeExactOut({
        currencyAmountOut,
        maximumSlippage,
        currencyIn: tokenXWDAI,
      })
      invariant(!!trade)
      const swapTransaction = await trade.swapTransaction()
      expect(swapTransaction?.data).toBeDefined()
      expect(swapTransaction?.to).toBeAddress()
    })
    test('Should estimate USDC input amount to get 100 WXDAI', async () => {
      const currencyAmountOut = new TokenAmount(tokenXWDAI, parseUnits('100', tokenXWDAI.decimals).toBigInt())
      const trade = await CurveTrade.bestTradeExactOut({
        currencyAmountOut,
        maximumSlippage,
        currencyIn: tokenUSDC,
      })
      invariant(trade)
      const swapTransaction = await trade.swapTransaction()
      expect(swapTransaction?.data).toBeDefined()
      expect(swapTransaction?.to).toBeAddress()
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

    test('Should find a route from 1 USDC to USDT via 2pool', async () => {
      const currencyAmountIn = new TokenAmount(tokenUSDC, parseUnits('1', tokenUSDC.decimals).toString())

      const trade = await CurveTrade.bestTradeExactIn({
        currencyAmountIn,
        currencyOut: tokenUSDT,
        maximumSlippage,
      })
      const curve2Pool = CURVE_POOLS[ChainId.ARBITRUM_ONE].find(({ name }) => name.toLowerCase() == '2pool')
      invariant(!!trade)
      expect(trade.platform.name).toEqual(RoutablePlatform.CURVE.name)
      const swapTransaction = await trade.swapTransaction()
      expect(swapTransaction.data).toBeDefined()
      expect(swapTransaction?.to?.toLowerCase()).toBe(curve2Pool?.address.toLowerCase())
    })

    test('Should find a route from 10 USDC to EURs via eurusd pool', async () => {
      const currencyAmountIn = new TokenAmount(tokenUSDC, parseUnits('10', tokenUSDC.decimals).toString())
      const trade = await CurveTrade.bestTradeExactIn({
        currencyAmountIn,
        currencyOut: tokenEURs,
        maximumSlippage,
      })
      invariant(!!trade)
      expect(trade.platform.name).toEqual(RoutablePlatform.CURVE.name)
      const swapTransaction = await trade.swapTransaction()
      expect(swapTransaction.data).toBeDefined()
      expect(swapTransaction?.to).toBeAddress()
    })
  })

  test('Should handle fractions like 1.5 WXDAI to USDC', async () => {
    const tokenXWDAI = new Token(ChainId.XDAI, TOKENS_XDAI.wxdai.address, TOKENS_XDAI.wxdai.decimals, 'WXDAI', 'WXDAI')
    const tokenUSDC = new Token(ChainId.XDAI, TOKENS_XDAI.usdc.address, TOKENS_XDAI.usdc.decimals, 'USDC', 'USDC')
    const currencyAmountIn = new TokenAmount(tokenXWDAI, parseUnits('1.5', tokenXWDAI.decimals).toString())
    const trade = await CurveTrade.bestTradeExactIn({
      currencyAmountIn,
      currencyOut: tokenUSDC,
      maximumSlippage,
    })
    invariant(!!trade)
    expect(trade?.platform.name).toEqual(RoutablePlatform.CURVE.name)
    const swapTransaction = await trade.swapTransaction()
    expect(swapTransaction?.data).toBeDefined()
    expect(swapTransaction?.to).toBeAddress()
  })

  describe('Ethereum', () => {
    //
    const testEVMTX = true

    // @ts-ignore
    const testAccountList = [
      {
        // Binance 8
        address: '0xf977814e90da44bfa03b6295a0616a897441acec',
        tokens: [TOKENS_MAINNET.usdc, TOKENS_MAINNET.dai, TOKENS_MAINNET.crv],
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
          TOKENS_MAINNET.link,
        ],
      },
      {
        // Random RenBTC
        address: '0x36cc7b13029b5dee4034745fb4f24034f3f2ffc6',
        tokens: [TOKENS_MAINNET.renbtc],
      },

      {
        // Random FRAX holder
        address: '0x183d0dc5867c01bfb1dbbc41d6a9d3de6e044626',
        tokens: [TOKENS_MAINNET.frax],
      },
      {
        // FTX
        address: '0x2faf487a4414fe77e2327f0bf4ae2a264a776ad2',
        tokens: [TOKENS_MAINNET.xaut, TOKENS_MAINNET.husd, TOKENS_MAINNET.pax],
      },
      {
        address: '0x8301AE4fc9c624d1D396cbDAa1ed877821D7C511',
        tokens: [TOKENS_MAINNET.eth],
      },
      {
        // Houbi
        address: '0x46705dfff24256421a05d056c29e81bdc09723b8',
        tokens: [TOKENS_MAINNET.hbtc],
      },
      {
        // Random RAI holder
        address: '0x618788357d0ebd8a37e763adab3bc575d54c2c7d',
        tokens: [TOKENS_MAINNET.rai],
      },
      {
        // Gemini 4
        address: '0x5f65f7b609678448494de4c87521cdf6cef1e932',
        tokens: [TOKENS_MAINNET.gusd],
      },
      {
        // Hotbit 3
        address: '0x562680a4dc50ed2f14d75bf31f494cfe0b8d10a1',
        tokens: [TOKENS_MAINNET.dusd],
      },
      {
        // Random
        address: '0xa046a8660e66d178ee07ec97c585eeb6aa18c26c',
        tokens: [TOKENS_MAINNET.mim],
      },
      {
        // Random
        address: '0x7d812b62dc15e6f4073eba8a2ba8db19c4e40704',
        tokens: [TOKENS_MAINNET.usdt],
      },
      {
        // Random
        address: '0xab4ce310054a11328685ece1043211b68ba5d082',
        tokens: [TOKENS_MAINNET.cdai],
      },
      {
        // Coinbase 4
        address: '0x503828976d22510aad0201ac7ec88293211d23da',
        tokens: [TOKENS_MAINNET.musd],
      },
      {
        // Random EOA with 9k WETH
        address: '0x57757e3d981446d585af0d9ae4d7df6d64647806',
        tokens: [TOKENS_MAINNET.weth],
      },
    ]

    // Enable debugging
    process.env.__SWAPR_SDK_DEBUG__ = 'true'

    const CURVE_ROUTER_ADDRESS = '0xfA9a30350048B2BF66865ee20363067c66f67e58'

    const tokenStETH = new Token(
      ChainId.MAINNET,
      TOKENS_MAINNET.steth.address,
      TOKENS_MAINNET.steth.decimals,
      TOKENS_MAINNET.steth.symbol,
      TOKENS_MAINNET.steth.name
    )

    const tokenWETH = new Token(
      ChainId.MAINNET,
      TOKENS_MAINNET.weth.address,
      TOKENS_MAINNET.weth.decimals,
      TOKENS_MAINNET.weth.symbol,
      TOKENS_MAINNET.weth.name
    )
    const tokenETH = new Token(
      ChainId.MAINNET,
      TOKENS_MAINNET.eth.address,
      TOKENS_MAINNET.eth.decimals,
      TOKENS_MAINNET.eth.symbol,
      TOKENS_MAINNET.eth.name
    )
    const tokenCRV = new Token(
      ChainId.MAINNET,
      TOKENS_MAINNET.crv.address,
      TOKENS_MAINNET.crv.decimals,
      TOKENS_MAINNET.crv.symbol,
      TOKENS_MAINNET.crv.name
    )

    const tokenUSDC = new Token(
      ChainId.MAINNET,
      TOKENS_MAINNET.usdc.address,
      TOKENS_MAINNET.usdc.decimals,
      TOKENS_MAINNET.usdc.symbol,
      TOKENS_MAINNET.usdc.name
    )

    const tokenRenBTC = new Token(
      ChainId.MAINNET,
      TOKENS_MAINNET.renbtc.address,
      TOKENS_MAINNET.renbtc.decimals,
      TOKENS_MAINNET.renbtc.symbol,
      TOKENS_MAINNET.renbtc.name
    )

    const tokenWBTC = new Token(
      ChainId.MAINNET,
      TOKENS_MAINNET.wbtc.address,
      TOKENS_MAINNET.wbtc.decimals,
      TOKENS_MAINNET.wbtc.symbol,
      TOKENS_MAINNET.wbtc.name
    )

    // Common token amounts
    const currencyAmountETH1 = new TokenAmount(
      tokenETH,
      parseUnits('1', tokenETH.decimals).toString()
    ) as CurrencyAmount
    const currencyAmountStETH1 = new TokenAmount(
      tokenStETH,
      parseUnits('1', tokenStETH.decimals).toString()
    ) as CurrencyAmount
    const currencyAmountUSDC1000 = new TokenAmount(
      tokenUSDC,
      parseUnits('1000', tokenUSDC.decimals).toString()
    ) as CurrencyAmount
    const currencyAmountRenBTC1 = new TokenAmount(
      tokenRenBTC,
      parseUnits('1', tokenRenBTC.decimals).toString()
    ) as CurrencyAmount

    beforeAll(async () => {
      await execAsync('npm run docker:up')
    })

    afterAll(async () => {
      await execAsync('npm run docker:clean')
    })

    test.skip('Should find a route from 1 stETH to WETH', async () => {
      const provider = await getGanacheRPCProvider()
      const trade = await CurveTrade.bestTradeExactIn(
        {
          currencyAmountIn: currencyAmountStETH1,
          currencyOut: tokenWETH,
          maximumSlippage,
        },
        provider
      )
      invariant(!!trade)
      const swapTransaction = await trade.swapTransaction()
      expect(swapTransaction.data).toBeDefined()
      expect(swapTransaction?.to).toBeAddress()
      expect(swapTransaction.value).toEqual(parseEther('1').toString())
    })

    test('Should find a route from 1 stETH to ETH', async () => {
      const currencyAmountIn = new TokenAmount(
        tokenStETH,
        parseUnits('1', tokenStETH.decimals).toString()
      ) as CurrencyAmount
      const provider = await getGanacheRPCProvider()
      const trade = await CurveTrade.bestTradeExactIn(
        {
          currencyAmountIn,
          currencyOut: tokenETH,
          maximumSlippage,
        },
        provider
      )
      invariant(!!trade)
      const swapTransaction = await trade.swapTransaction()
      expect(swapTransaction.data).toBeDefined()
      expect(swapTransaction.to).toBeAddress()
      expect(swapTransaction?.value?.toString()).toEqual('0')
    })
    test('Should find a route from 1 ETH to stETH', async () => {
      const provider = await getGanacheRPCProvider()
      const trade = await CurveTrade.bestTradeExactIn(
        {
          currencyAmountIn: currencyAmountETH1,
          currencyOut: tokenStETH,
          maximumSlippage,
        },
        provider
      )
      invariant(!!trade)
      const swapTransaction = await trade.swapTransaction()
      expect(swapTransaction.data).toBeDefined()
      expect(swapTransaction?.to).toBeAddress()
      expect(swapTransaction?.value?.toString()).toEqual(
        parseUnits('1', currencyAmountETH1.currency.decimals).toString()
      )
    })

    test('Should find a route from 1 ETH to CRV via CRVETH pool', async () => {
      const provider = await getGanacheRPCProvider()
      const trade = await CurveTrade.bestTradeExactIn(
        {
          currencyAmountIn: currencyAmountETH1,
          currencyOut: tokenCRV,
          maximumSlippage,
        },
        provider
      )
      invariant(!!trade)
      const swapTransaction = await trade.swapTransaction()
      expect(swapTransaction.data).toBeDefined()
      expect(swapTransaction?.to).toBeAddress()
      expect(swapTransaction.value).toEqual(parseUnits('1'))
    })

    test('Should find a route from 1000 USDC to stETH via Curve Smart Router', async () => {
      const provider = await getGanacheRPCProvider()
      const trade = await CurveTrade.bestTradeExactIn(
        {
          currencyAmountIn: currencyAmountUSDC1000,
          currencyOut: tokenStETH,
          maximumSlippage,
        },
        provider
      )
      invariant(!!trade)
      const swapTransaction = await trade.swapTransaction()
      expect(swapTransaction.data).toBeDefined()
      expect(swapTransaction.to).toBeAddress()
      expect(swapTransaction?.value?.toString()).toEqual('0')
      expect(swapTransaction?.to?.toLowerCase()).toEqual(CURVE_ROUTER_ADDRESS.toLowerCase())
    })
    test.skip('Should find a route from 1000 USDC to WETH via Curve Smart Router', async () => {
      const provider = await getGanacheRPCProvider()
      const trade = await CurveTrade.bestTradeExactIn(
        {
          currencyAmountIn: currencyAmountUSDC1000,
          currencyOut: tokenWETH,
          maximumSlippage,
        },
        provider
      )
      invariant(!!trade)
      const swapTransaction = await trade.swapTransaction()
      expect(swapTransaction.data).toBeDefined()
      expect(swapTransaction?.to).toBeAddress()
      expect(swapTransaction?.value?.toString()).toEqual('0')
      expect(swapTransaction?.to?.toLowerCase()).toEqual(CURVE_ROUTER_ADDRESS.toLowerCase())
    })

    test('Should find a route from 1 renBTC to WBTC via renBTC pool', async () => {
      const provider = await getGanacheRPCProvider()
      const trade = await CurveTrade.bestTradeExactIn(
        {
          currencyAmountIn: currencyAmountRenBTC1,
          currencyOut: tokenWBTC,
          maximumSlippage,
        },
        provider
      )
      invariant(!!trade)
      const swapTransaction = await trade.swapTransaction()
      expect(swapTransaction.data).toBeDefined()
      expect(swapTransaction?.to).toBeAddress()

      expect(swapTransaction?.value?.toString()).toEqual('0')
    })

    test('Should fetch token list from the pool', async () => {
      const results = await getPoolTokenList('0x52EA46506B9CC5Ef470C5bf89f17Dc28bB35D85C', ChainId.MAINNET)
      expect(Array.isArray(results.allTokens)).toBeTruthy()
      expect(Array.isArray(results.mainTokens)).toBeTruthy()
      expect(Array.isArray(results.underlyingTokens)).toBeTruthy()
    })

    interface TestPair {
      tokenIn: Token
      tokenOut: Token
      tokenInAmount: string
      testAccount: string
    }

    const testCombos: TestPair[] = [
      /* not avaialble at Curve.fi
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
      },
      */
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
          TOKENS_MAINNET.wbtc.address,
          TOKENS_MAINNET.wbtc.decimals,
          TOKENS_MAINNET.wbtc.symbol,
          TOKENS_MAINNET.wbtc.name
        ),
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
        ),
      },
    ]

    testCombos.forEach(({ testAccount, tokenIn, tokenOut, tokenInAmount }) => {
      const tokenInAmountBN = parseUnits(tokenInAmount, tokenIn.decimals)
      const currencyAmountIn = new TokenAmount(tokenIn, tokenInAmountBN.toString()) as CurrencyAmount
      const testName = `Should find a route from ${tokenInAmount} ${tokenIn.symbol} to ${tokenOut.symbol}`

      test(testName, async () => {
        // Get EVM
        const mainnetForkProvider = await getGanacheRPCProvider()
        // Unlock wallet
        await addEVMAccount(mainnetForkProvider, testAccount)
        await unlockEVMAccount(mainnetForkProvider, testAccount)

        await mainnetForkProvider.send('evm_setAccountBalance', [testAccount, parseEther('2').toHexString()])

        console.log(await mainnetForkProvider.listAccounts())

        console.log(await mainnetForkProvider.getBalance('0xf006779eabe823f8eed05464a1628383af1f7afb'))

        // Get unlocked account as signer
        const unlockedAccountSigner = mainnetForkProvider.getSigner(testAccount)

        console.log(await unlockedAccountSigner.getBalance())

        // Get trade
        const trade = await CurveTrade.bestTradeExactIn(
          {
            currencyAmountIn,
            currencyOut: tokenOut,
            maximumSlippage,
          },
          mainnetForkProvider
        )

        invariant(!!trade)
        const swapTransaction = await trade.swapTransaction()

        expect(swapTransaction?.data).toBeDefined()
        expect(swapTransaction?.to).toBeAddress()

        let approved = false

        if (!testEVMTX) return

        try {
          // Approve the sell token
          const tokenInContract = new Contract(tokenIn.address, ERC20_ABI, unlockedAccountSigner)

          // Check unlocked account balance before moving to swapping
          const testAccountTokenInBalance = (await tokenInContract.balanceOf(testAccount)) as BigNumber
          const testAccountTokenInAllowance = (await tokenInContract.allowance(
            trade?.approveAddress,
            testAccount
          )) as BigNumber

          console.log(
            `User balance at ${
              tokenIn.symbol
            } = ${testAccountTokenInBalance.toString()}, allowance = ${testAccountTokenInAllowance.toString()}`
          )

          if (testAccountTokenInBalance.gte(tokenInAmountBN)) {
            console.log(`Approving ${tokenIn.symbol} (${tokenIn.address}) for swap on ${trade?.approveAddress}`)
            await tokenInContract.approve(trade?.approveAddress, MaxUint256).then((tx: any) => tx.wait())
            console.log(`Approved ${tokenIn.symbol} (${tokenIn.address}) for swap on ${trade?.approveAddress}`)
            approved = true
          }
        } catch (e) {
          console.log('[WARNING] Approve failed. Swap stage of test is skipped')
        }
        if (approved) {
          const exchangeTx = await unlockedAccountSigner
            .sendTransaction(swapTransaction as any)
            .then((tx) => tx.wait())
            .catch(console.log)
        }
      })
    })
  })
})
