import { formatEther, parseUnits } from '@ethersproject/units'
import { JsonRpcProvider } from '@ethersproject/providers'
import { MaxInt256 } from '@ethersproject/constants'
import { isAddress } from '@ethersproject/address'
import { Contract } from '@ethersproject/contracts'
import JSBI from 'jsbi'

import { ChainId, Currency, CurrencyAmount, CurveTrade, Percent, RoutablePlatform, Token, TokenAmount } from '../src'
import {
  TOKENS_MAINNET,
  TOKENS_XDAI,
  TOKENS_ARBITRUM_ONE,
  CURVE_POOLS
} from '../src/entities/trades/curve-trade/constants'

import { ERC20_ABI } from '../test-util/abi'
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
        console.log(`Providr ready @ block #${blockNumber}`)
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
  const testIf = (condition: boolean) => (condition ? it : it.skip)

  const maxSlippage = new Percent('5', '100')

  describe('Gnosis Chain', () => {
    const tokenXWDAI = new Token(ChainId.XDAI, TOKENS_XDAI.wxdai.address, TOKENS_XDAI.wxdai.decimals, 'WXDAI', 'WXDAI')
    const tokenUSDC = new Token(ChainId.XDAI, TOKENS_XDAI.usdc.address, TOKENS_XDAI.usdc.decimals, 'USDC', 'USDC')

    test('Should return the best trade from WXDAI to USDC', async () => {
      const currencyAmountIn = tryParseAmount(parseUnits('1', tokenXWDAI.decimals).toString(), tokenXWDAI)

      const trade = await CurveTrade.bestTradeExactIn(
        currencyAmountIn as CurrencyAmount,
        tokenUSDC,
        new Percent('3', '100')
      )

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
    const testAccountList = [
      {
        address: '0xf977814e90da44bfa03b6295a0616a897441acec',
        tokens: [TOKENS_MAINNET.usdc, TOKENS_MAINNET.dai, TOKENS_MAINNET.crv]
      },
      {
        address: '0x28c6c06298d514db089934071355e5743bf21d60',
        tokens: [
          TOKENS_MAINNET.usdc,
          TOKENS_MAINNET.busd,
          TOKENS_MAINNET.crv,
          TOKENS_MAINNET.cvx,
          TOKENS_MAINNET.wbtc,
          TOKENS_MAINNET.eth,
          TOKENS_MAINNET.tusd,
          TOKENS_MAINNET.link
        ]
      }
    ]

    beforeAll(async () => {
      await execAsync('npm run docker:up')
    })

    afterEach(async () => {
      await execAsync('npm run docker:restart')
    })

    afterAll(async () => {
      await execAsync('npm run docker:down')
    })

    CURVE_POOLS[1].forEach(async pool => {
      const tokenIn = new Token(
        ChainId.MAINNET,
        pool.tokens[0].address,
        pool.tokens[0].decimals,
        pool.tokens[0].symbol,
        pool.tokens[0].name
      )

      const tokenOut = new Token(
        ChainId.MAINNET,
        pool.tokens[1].address,
        pool.tokens[1].decimals,
        pool.tokens[1].symbol,
        pool.tokens[1].name
      )

      const currencyAmountIn = tryParseAmount(formatEther(parseUnits('1')), tokenIn)

      const unlockedAccount = testAccountList.find(testAccount =>
        testAccount.tokens.some(token => token.address.toLowerCase() === tokenIn.address.toLowerCase())
      )

      const testName = `Should able to swap 1 ${tokenIn.symbol} to ${tokenOut.symbol} via ${pool.name} pool`

      // Check if the unlocked account is found
      testIf(unlockedAccount != undefined)(testName, async () => {
        // Get EVM
        const mainnetForkProvider = await getGanacheRPCProvider()

        // Unlock
        await mainnetForkProvider.send('evm_unlockUnknownAccount', [unlockedAccount?.address])

        // Get unlocked account as signer
        const unlockedAccountSigner = mainnetForkProvider.getSigner(unlockedAccount?.address)

        // Get trade
        const trade = await CurveTrade.bestTradeExactIn(
          currencyAmountIn as CurrencyAmount,
          tokenOut,
          maxSlippage,
          mainnetForkProvider
        )

        // Assert that the trade is found
        expect(trade).toBeDefined()
        const swapTransaction = trade && (await trade.swapTransaction())
        expect(swapTransaction).toBeDefined()
        expect(swapTransaction?.data).toBeDefined()
        expect(isAddress(swapTransaction?.to as string)).toBeTruthy()

        // Approve the sell token
        const tokenInContract = new Contract(tokenIn.address, ERC20_ABI, unlockedAccountSigner)
        await tokenInContract.approve(trade?.approveAddress, MaxInt256)

        const isReady = await unlockedAccountSigner.provider.ready

        console.log({ isReady })

        // Send swap transaction
        const exchangeTx = unlockedAccountSigner.sendTransaction(swapTransaction as any).then(tx => tx.wait())

        expect(exchangeTx).resolves
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
      const currencyAmountIn = tryParseAmount(parseUnits('1', tokenUSDC.decimals).toString(), tokenUSDC)

      const trade = await CurveTrade.bestTradeExactIn(
        currencyAmountIn as CurrencyAmount,
        tokenUSDT,
        new Percent('3', '100')
      )

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
      const currencyAmountIn = tryParseAmount(parseUnits('1', tokenUSDC.decimals).toString(), tokenUSDC)
      const trade = await CurveTrade.bestTradeExactIn(
        currencyAmountIn as CurrencyAmount,
        tokenEURs,
        new Percent('3', '100')
      )
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
    const currencyAmountIn = tryParseAmount(parseUnits('1.5', tokenXWDAI.decimals).toString(), tokenXWDAI)
    const trade = await CurveTrade.bestTradeExactIn(
      currencyAmountIn as CurrencyAmount,
      tokenUSDC,
      new Percent('3', '100')
    )
    expect(trade).toBeDefined()
    expect(trade?.platform.name).toEqual(RoutablePlatform.CURVE.name)
    // test swap transaction
    const swapTransaction = trade && (await trade.swapTransaction())
    expect(swapTransaction).toBeDefined()
    expect(swapTransaction?.data).toBeDefined()
    expect(isAddress(swapTransaction?.to as string)).toBeTruthy()
  })
})
