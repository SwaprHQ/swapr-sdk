"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const constants_1 = require("@ethersproject/constants");
const contracts_1 = require("@ethersproject/contracts");
const units_1 = require("@ethersproject/units");
const tiny_invariant_1 = tslib_1.__importDefault(require("tiny-invariant"));
// Jest
const jest_1 = require("../jest");
// Tets targets
const src_1 = require("../src");
const contracts_2 = require("../src/entities/trades/curve/contracts");
const pools_1 = require("../src/entities/trades/curve/pools");
const tokens_1 = require("../src/entities/trades/curve/tokens");
describe('CurveTrade', () => {
    const maximumSlippage = new src_1.Percent('3', '100');
    describe('Gnosis Chain', () => {
        const tokenXWDAI = new src_1.Token(src_1.ChainId.XDAI, tokens_1.TOKENS_XDAI.wxdai.address, tokens_1.TOKENS_XDAI.wxdai.decimals, 'WXDAI', 'WXDAI');
        const tokenUSDC = new src_1.Token(src_1.ChainId.XDAI, tokens_1.TOKENS_XDAI.usdc.address, tokens_1.TOKENS_XDAI.usdc.decimals, 'USDC', 'USDC');
        test('Should be able to accept native xDAI', () => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
            const currencyAmountIn = src_1.TokenAmount.nativeCurrency((0, units_1.parseUnits)('100', 18).toBigInt(), src_1.ChainId.XDAI);
            const trade = yield src_1.CurveTrade.bestTradeExactIn({
                currencyAmountIn,
                currencyOut: tokenUSDC,
                maximumSlippage,
            });
            (0, tiny_invariant_1.default)(!!trade);
            const swapTransaction = yield trade.swapTransaction();
            (0, tiny_invariant_1.default)(!!swapTransaction);
            console.log(swapTransaction);
            expect(swapTransaction === null || swapTransaction === void 0 ? void 0 : swapTransaction.data).toBeDefined();
            expect(swapTransaction === null || swapTransaction === void 0 ? void 0 : swapTransaction.to).toBeAddress();
        }));
        test('Should be able to trade to native xDAI', () => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
            const currencyAmountIn = new src_1.TokenAmount(tokenUSDC, (0, units_1.parseUnits)('100', tokenXWDAI.decimals).toBigInt());
            const nativeCurrency = src_1.Currency.getNative(src_1.ChainId.XDAI);
            const trade = yield src_1.CurveTrade.bestTradeExactIn({
                currencyAmountIn,
                currencyOut: nativeCurrency,
                maximumSlippage,
            });
            (0, tiny_invariant_1.default)(!!trade);
            const swapTransaction = yield trade.swapTransaction();
            (0, tiny_invariant_1.default)(!!swapTransaction);
            console.log(swapTransaction);
            expect(swapTransaction === null || swapTransaction === void 0 ? void 0 : swapTransaction.data).toBeDefined();
            expect(swapTransaction === null || swapTransaction === void 0 ? void 0 : swapTransaction.to).toBeAddress();
        }));
        test('Should return the best trade from WXDAI to USDC', () => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
            const currencyAmountIn = new src_1.TokenAmount(tokenXWDAI, (0, units_1.parseUnits)('100', tokenXWDAI.decimals).toBigInt());
            const trade = yield src_1.CurveTrade.bestTradeExactIn({
                currencyAmountIn,
                currencyOut: tokenUSDC,
                maximumSlippage,
            });
            (0, tiny_invariant_1.default)(!!trade);
            const swapTransaction = yield trade.swapTransaction();
            expect(swapTransaction === null || swapTransaction === void 0 ? void 0 : swapTransaction.data).toBeDefined();
            expect(swapTransaction === null || swapTransaction === void 0 ? void 0 : swapTransaction.to).toBeAddress();
        }));
        test('Should return the best trade from USDC to WXDAI', () => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
            const currencyAmountIn = new src_1.TokenAmount(tokenUSDC, (0, units_1.parseUnits)('100', tokenUSDC.decimals).toBigInt());
            const trade = yield src_1.CurveTrade.bestTradeExactIn({
                currencyAmountIn,
                currencyOut: tokenXWDAI,
                maximumSlippage,
            });
            (0, tiny_invariant_1.default)(!!trade);
            const swapTransaction = yield trade.swapTransaction();
            expect(swapTransaction === null || swapTransaction === void 0 ? void 0 : swapTransaction.data).toBeDefined();
            expect(swapTransaction === null || swapTransaction === void 0 ? void 0 : swapTransaction.to).toBeAddress();
        }));
        test('Should estimate WXDAI input amount to get 100 USDC', () => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
            const currencyAmountOut = new src_1.TokenAmount(tokenUSDC, (0, units_1.parseUnits)('100', tokenUSDC.decimals).toBigInt());
            const trade = yield src_1.CurveTrade.bestTradeExactOut({
                currencyAmountOut,
                maximumSlippage,
                currencyIn: tokenXWDAI,
            });
            (0, tiny_invariant_1.default)(!!trade);
            const swapTransaction = yield trade.swapTransaction();
            expect(swapTransaction === null || swapTransaction === void 0 ? void 0 : swapTransaction.data).toBeDefined();
            expect(swapTransaction === null || swapTransaction === void 0 ? void 0 : swapTransaction.to).toBeAddress();
        }));
        test('Should estimate USDC input amount to get 100 WXDAI', () => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
            const currencyAmountOut = new src_1.TokenAmount(tokenXWDAI, (0, units_1.parseUnits)('100', tokenXWDAI.decimals).toBigInt());
            const trade = yield src_1.CurveTrade.bestTradeExactOut({
                currencyAmountOut,
                maximumSlippage,
                currencyIn: tokenUSDC,
            });
            (0, tiny_invariant_1.default)(trade);
            const swapTransaction = yield trade.swapTransaction();
            expect(swapTransaction === null || swapTransaction === void 0 ? void 0 : swapTransaction.data).toBeDefined();
            expect(swapTransaction === null || swapTransaction === void 0 ? void 0 : swapTransaction.to).toBeAddress();
        }));
    });
    describe('Arbitrum One', () => {
        const tokenEURs = new src_1.Token(src_1.ChainId.ARBITRUM_ONE, tokens_1.TOKENS_ARBITRUM_ONE.eurs.address, tokens_1.TOKENS_ARBITRUM_ONE.eurs.decimals, tokens_1.TOKENS_ARBITRUM_ONE.eurs.symbol, tokens_1.TOKENS_ARBITRUM_ONE.eurs.name);
        const tokenUSDC = new src_1.Token(src_1.ChainId.ARBITRUM_ONE, tokens_1.TOKENS_ARBITRUM_ONE.usdc.address, tokens_1.TOKENS_ARBITRUM_ONE.usdc.decimals, tokens_1.TOKENS_ARBITRUM_ONE.usdc.symbol, tokens_1.TOKENS_ARBITRUM_ONE.usdc.name);
        const tokenUSDT = new src_1.Token(src_1.ChainId.ARBITRUM_ONE, tokens_1.TOKENS_ARBITRUM_ONE.usdt.address, tokens_1.TOKENS_ARBITRUM_ONE.usdt.decimals, tokens_1.TOKENS_ARBITRUM_ONE.usdt.symbol, tokens_1.TOKENS_ARBITRUM_ONE.usdt.name);
        test('Should find a route from 1 USDC to USDT via 2pool', () => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
            var _a;
            const currencyAmountIn = new src_1.TokenAmount(tokenUSDC, (0, units_1.parseUnits)('1', tokenUSDC.decimals).toString());
            const trade = yield src_1.CurveTrade.bestTradeExactIn({
                currencyAmountIn,
                currencyOut: tokenUSDT,
                maximumSlippage,
            });
            const curve2Pool = pools_1.CURVE_POOLS[src_1.ChainId.ARBITRUM_ONE].find(({ name }) => name.toLowerCase() == '2pool');
            (0, tiny_invariant_1.default)(!!trade);
            expect(trade.platform.name).toEqual(src_1.RoutablePlatform.CURVE.name);
            const swapTransaction = yield trade.swapTransaction();
            expect(swapTransaction.data).toBeDefined();
            expect((_a = swapTransaction === null || swapTransaction === void 0 ? void 0 : swapTransaction.to) === null || _a === void 0 ? void 0 : _a.toLowerCase()).toBe(curve2Pool === null || curve2Pool === void 0 ? void 0 : curve2Pool.address.toLowerCase());
        }));
        test('Should find a route from 10 USDC to EURs via eurusd pool', () => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
            const currencyAmountIn = new src_1.TokenAmount(tokenUSDC, (0, units_1.parseUnits)('10', tokenUSDC.decimals).toString());
            const trade = yield src_1.CurveTrade.bestTradeExactIn({
                currencyAmountIn,
                currencyOut: tokenEURs,
                maximumSlippage,
            });
            (0, tiny_invariant_1.default)(!!trade);
            expect(trade.platform.name).toEqual(src_1.RoutablePlatform.CURVE.name);
            const swapTransaction = yield trade.swapTransaction();
            expect(swapTransaction.data).toBeDefined();
            expect(swapTransaction === null || swapTransaction === void 0 ? void 0 : swapTransaction.to).toBeAddress();
        }));
    });
    test('Should handle fractions like 1.5 WXDAI to USDC', () => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
        const tokenXWDAI = new src_1.Token(src_1.ChainId.XDAI, tokens_1.TOKENS_XDAI.wxdai.address, tokens_1.TOKENS_XDAI.wxdai.decimals, 'WXDAI', 'WXDAI');
        const tokenUSDC = new src_1.Token(src_1.ChainId.XDAI, tokens_1.TOKENS_XDAI.usdc.address, tokens_1.TOKENS_XDAI.usdc.decimals, 'USDC', 'USDC');
        const currencyAmountIn = new src_1.TokenAmount(tokenXWDAI, (0, units_1.parseUnits)('1.5', tokenXWDAI.decimals).toString());
        const trade = yield src_1.CurveTrade.bestTradeExactIn({
            currencyAmountIn,
            currencyOut: tokenUSDC,
            maximumSlippage,
        });
        (0, tiny_invariant_1.default)(!!trade);
        expect(trade === null || trade === void 0 ? void 0 : trade.platform.name).toEqual(src_1.RoutablePlatform.CURVE.name);
        const swapTransaction = yield trade.swapTransaction();
        expect(swapTransaction === null || swapTransaction === void 0 ? void 0 : swapTransaction.data).toBeDefined();
        expect(swapTransaction === null || swapTransaction === void 0 ? void 0 : swapTransaction.to).toBeAddress();
    }));
    describe('Ethereum', () => {
        const testEVMTX = true;
        // Enable debugging
        process.env.__SWAPR_SDK_DEBUG__ = 'true';
        const CURVE_ROUTER_ADDRESS = '0xfA9a30350048B2BF66865ee20363067c66f67e58';
        const tokenStETH = new src_1.Token(src_1.ChainId.MAINNET, tokens_1.TOKENS_MAINNET.steth.address, tokens_1.TOKENS_MAINNET.steth.decimals, tokens_1.TOKENS_MAINNET.steth.symbol, tokens_1.TOKENS_MAINNET.steth.name);
        const tokenWETH = new src_1.Token(src_1.ChainId.MAINNET, tokens_1.TOKENS_MAINNET.weth.address, tokens_1.TOKENS_MAINNET.weth.decimals, tokens_1.TOKENS_MAINNET.weth.symbol, tokens_1.TOKENS_MAINNET.weth.name);
        const tokenETH = new src_1.Token(src_1.ChainId.MAINNET, tokens_1.TOKENS_MAINNET.eth.address, tokens_1.TOKENS_MAINNET.eth.decimals, tokens_1.TOKENS_MAINNET.eth.symbol, tokens_1.TOKENS_MAINNET.eth.name);
        const tokenCRV = new src_1.Token(src_1.ChainId.MAINNET, tokens_1.TOKENS_MAINNET.crv.address, tokens_1.TOKENS_MAINNET.crv.decimals, tokens_1.TOKENS_MAINNET.crv.symbol, tokens_1.TOKENS_MAINNET.crv.name);
        const tokenUSDC = new src_1.Token(src_1.ChainId.MAINNET, tokens_1.TOKENS_MAINNET.usdc.address, tokens_1.TOKENS_MAINNET.usdc.decimals, tokens_1.TOKENS_MAINNET.usdc.symbol, tokens_1.TOKENS_MAINNET.usdc.name);
        const tokenRenBTC = new src_1.Token(src_1.ChainId.MAINNET, tokens_1.TOKENS_MAINNET.renbtc.address, tokens_1.TOKENS_MAINNET.renbtc.decimals, tokens_1.TOKENS_MAINNET.renbtc.symbol, tokens_1.TOKENS_MAINNET.renbtc.name);
        const tokenWBTC = new src_1.Token(src_1.ChainId.MAINNET, tokens_1.TOKENS_MAINNET.wbtc.address, tokens_1.TOKENS_MAINNET.wbtc.decimals, tokens_1.TOKENS_MAINNET.wbtc.symbol, tokens_1.TOKENS_MAINNET.wbtc.name);
        // Common token amounts
        const currencyAmountETH1 = new src_1.TokenAmount(tokenETH, (0, units_1.parseUnits)('1', tokenETH.decimals).toString());
        const currencyAmountStETH1 = new src_1.TokenAmount(tokenStETH, (0, units_1.parseUnits)('1', tokenStETH.decimals).toString());
        const currencyAmountUSDC1000 = new src_1.TokenAmount(tokenUSDC, (0, units_1.parseUnits)('1000', tokenUSDC.decimals).toString());
        const currencyAmountRenBTC1 = new src_1.TokenAmount(tokenRenBTC, (0, units_1.parseUnits)('1', tokenRenBTC.decimals).toString());
        beforeAll(() => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
            yield (0, jest_1.execAsync)('npm run docker:up');
        }));
        afterAll(() => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
            yield (0, jest_1.execAsync)('npm run docker:clean');
        }));
        test.skip('Should find a route from 1 stETH to WETH', () => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
            const provider = yield (0, jest_1.getGanacheRPCProvider)();
            const trade = yield src_1.CurveTrade.bestTradeExactIn({
                currencyAmountIn: currencyAmountStETH1,
                currencyOut: tokenWETH,
                maximumSlippage,
            }, provider);
            (0, tiny_invariant_1.default)(!!trade);
            const swapTransaction = yield trade.swapTransaction();
            expect(swapTransaction.data).toBeDefined();
            expect(swapTransaction === null || swapTransaction === void 0 ? void 0 : swapTransaction.to).toBeAddress();
            expect(swapTransaction.value).toEqual((0, units_1.parseEther)('1').toString());
        }));
        test('Should find a route from 1 stETH to ETH', () => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
            var _a;
            const currencyAmountIn = new src_1.TokenAmount(tokenStETH, (0, units_1.parseUnits)('1', tokenStETH.decimals).toString());
            const provider = yield (0, jest_1.getGanacheRPCProvider)();
            const trade = yield src_1.CurveTrade.bestTradeExactIn({
                currencyAmountIn,
                currencyOut: tokenETH,
                maximumSlippage,
            }, provider);
            (0, tiny_invariant_1.default)(!!trade);
            const swapTransaction = yield trade.swapTransaction();
            expect(swapTransaction.data).toBeDefined();
            expect(swapTransaction.to).toBeAddress();
            expect((_a = swapTransaction === null || swapTransaction === void 0 ? void 0 : swapTransaction.value) === null || _a === void 0 ? void 0 : _a.toString()).toEqual('0');
        }));
        test('Should find a route from 1 ETH to stETH', () => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
            var _b;
            const provider = yield (0, jest_1.getGanacheRPCProvider)();
            const trade = yield src_1.CurveTrade.bestTradeExactIn({
                currencyAmountIn: currencyAmountETH1,
                currencyOut: tokenStETH,
                maximumSlippage,
            }, provider);
            (0, tiny_invariant_1.default)(!!trade);
            const swapTransaction = yield trade.swapTransaction();
            expect(swapTransaction.data).toBeDefined();
            expect(swapTransaction === null || swapTransaction === void 0 ? void 0 : swapTransaction.to).toBeAddress();
            console.log(trade.minimumAmountOut().toExact());
            expect((_b = swapTransaction === null || swapTransaction === void 0 ? void 0 : swapTransaction.value) === null || _b === void 0 ? void 0 : _b.toString()).toEqual((0, units_1.parseUnits)('1', currencyAmountETH1.currency.decimals).toString());
        }));
        test('Should find a route from 1 ETH to CRV via CRVETH pool', () => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
            const provider = yield (0, jest_1.getGanacheRPCProvider)();
            const trade = yield src_1.CurveTrade.bestTradeExactIn({
                currencyAmountIn: currencyAmountETH1,
                currencyOut: tokenCRV,
                maximumSlippage,
            }, provider);
            (0, tiny_invariant_1.default)(!!trade);
            const swapTransaction = yield trade.swapTransaction();
            expect(swapTransaction.data).toBeDefined();
            expect(swapTransaction === null || swapTransaction === void 0 ? void 0 : swapTransaction.to).toBeAddress();
            expect(swapTransaction.value).toEqual((0, units_1.parseUnits)('1'));
        }));
        test('Should find a route from 1000 USDC to stETH via Curve Smart Router', () => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
            var _c, _d;
            const provider = yield (0, jest_1.getGanacheRPCProvider)();
            const trade = yield src_1.CurveTrade.bestTradeExactIn({
                currencyAmountIn: currencyAmountUSDC1000,
                currencyOut: tokenStETH,
                maximumSlippage,
            }, provider);
            (0, tiny_invariant_1.default)(!!trade);
            const swapTransaction = yield trade.swapTransaction();
            expect(swapTransaction.data).toBeDefined();
            expect(swapTransaction.to).toBeAddress();
            expect((_c = swapTransaction === null || swapTransaction === void 0 ? void 0 : swapTransaction.value) === null || _c === void 0 ? void 0 : _c.toString()).toEqual('0');
            expect((_d = swapTransaction === null || swapTransaction === void 0 ? void 0 : swapTransaction.to) === null || _d === void 0 ? void 0 : _d.toLowerCase()).toEqual(CURVE_ROUTER_ADDRESS.toLowerCase());
        }));
        test.skip('Should find a route from 1000 USDC to WETH via Curve Smart Router', () => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
            var _e, _f;
            const provider = yield (0, jest_1.getGanacheRPCProvider)();
            const trade = yield src_1.CurveTrade.bestTradeExactIn({
                currencyAmountIn: currencyAmountUSDC1000,
                currencyOut: tokenWETH,
                maximumSlippage,
            }, provider);
            (0, tiny_invariant_1.default)(!!trade);
            const swapTransaction = yield trade.swapTransaction();
            expect(swapTransaction.data).toBeDefined();
            expect(swapTransaction === null || swapTransaction === void 0 ? void 0 : swapTransaction.to).toBeAddress();
            expect((_e = swapTransaction === null || swapTransaction === void 0 ? void 0 : swapTransaction.value) === null || _e === void 0 ? void 0 : _e.toString()).toEqual('0');
            expect((_f = swapTransaction === null || swapTransaction === void 0 ? void 0 : swapTransaction.to) === null || _f === void 0 ? void 0 : _f.toLowerCase()).toEqual(CURVE_ROUTER_ADDRESS.toLowerCase());
        }));
        test('Should find a route from 1 renBTC to WBTC via renBTC pool', () => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
            var _g;
            const provider = yield (0, jest_1.getGanacheRPCProvider)();
            const trade = yield src_1.CurveTrade.bestTradeExactIn({
                currencyAmountIn: currencyAmountRenBTC1,
                currencyOut: tokenWBTC,
                maximumSlippage,
            }, provider);
            (0, tiny_invariant_1.default)(!!trade);
            const swapTransaction = yield trade.swapTransaction();
            expect(swapTransaction.data).toBeDefined();
            expect(swapTransaction === null || swapTransaction === void 0 ? void 0 : swapTransaction.to).toBeAddress();
            expect((_g = swapTransaction === null || swapTransaction === void 0 ? void 0 : swapTransaction.value) === null || _g === void 0 ? void 0 : _g.toString()).toEqual('0');
        }));
        test('Should fetch token list from the pool', () => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
            const results = yield (0, contracts_2.getPoolTokenList)({
                poolAddress: '0x52EA46506B9CC5Ef470C5bf89f17Dc28bB35D85C',
                chainId: src_1.ChainId.MAINNET,
            });
            expect(Array.isArray(results.allTokens)).toBeTruthy();
            expect(Array.isArray(results.mainTokens)).toBeTruthy();
            expect(Array.isArray(results.underlyingTokens)).toBeTruthy();
        }));
        const testCombos = [
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
            */
            {
                // Random WBTC holder
                testAccount: '0x72a53cdbbcc1b9efa39c834a540550e23463aacb',
                tokenInAmount: '1',
                tokenIn: new src_1.Token(src_1.ChainId.MAINNET, tokens_1.TOKENS_MAINNET.wbtc.address, tokens_1.TOKENS_MAINNET.wbtc.decimals, tokens_1.TOKENS_MAINNET.wbtc.symbol, tokens_1.TOKENS_MAINNET.wbtc.name),
                tokenOut: new src_1.Token(src_1.ChainId.MAINNET, tokens_1.TOKENS_MAINNET.renbtc.address, tokens_1.TOKENS_MAINNET.renbtc.decimals, tokens_1.TOKENS_MAINNET.renbtc.symbol, tokens_1.TOKENS_MAINNET.renbtc.name),
            },
        ];
        testCombos.forEach(({ testAccount, tokenIn, tokenOut, tokenInAmount }) => {
            const tokenInAmountBN = (0, units_1.parseUnits)(tokenInAmount, tokenIn.decimals);
            const currencyAmountIn = new src_1.TokenAmount(tokenIn, tokenInAmountBN.toString());
            const testName = `Should find a route from ${tokenInAmount} ${tokenIn.symbol} to ${tokenOut.symbol}`;
            test(testName, () => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
                // Get EVM
                const mainnetForkProvider = yield (0, jest_1.getGanacheRPCProvider)();
                // Unlock wallet
                yield (0, jest_1.addEVMAccount)(mainnetForkProvider, testAccount);
                yield (0, jest_1.unlockEVMAccount)(mainnetForkProvider, testAccount);
                yield mainnetForkProvider.send('evm_setAccountBalance', [testAccount, (0, units_1.parseEther)('2').toHexString()]);
                console.log(yield mainnetForkProvider.listAccounts());
                console.log(yield mainnetForkProvider.getBalance('0xf006779eabe823f8eed05464a1628383af1f7afb'));
                // Get unlocked account as signer
                const unlockedAccountSigner = mainnetForkProvider.getSigner(testAccount);
                console.log(yield unlockedAccountSigner.getBalance());
                // Get trade
                const trade = yield src_1.CurveTrade.bestTradeExactIn({
                    currencyAmountIn,
                    currencyOut: tokenOut,
                    maximumSlippage,
                }, mainnetForkProvider);
                (0, tiny_invariant_1.default)(!!trade);
                const swapTransaction = yield trade.swapTransaction();
                expect(swapTransaction === null || swapTransaction === void 0 ? void 0 : swapTransaction.data).toBeDefined();
                expect(swapTransaction === null || swapTransaction === void 0 ? void 0 : swapTransaction.to).toBeAddress();
                let approved = false;
                if (!testEVMTX)
                    return;
                try {
                    // Approve the sell token
                    const tokenInContract = new contracts_1.Contract(tokenIn.address, jest_1.ERC20_ABI, unlockedAccountSigner);
                    // Check unlocked account balance before moving to swapping
                    const testAccountTokenInBalance = (yield tokenInContract.balanceOf(testAccount));
                    const testAccountTokenInAllowance = (yield tokenInContract.allowance(trade === null || trade === void 0 ? void 0 : trade.approveAddress, testAccount));
                    console.log(`User balance at ${tokenIn.symbol} = ${testAccountTokenInBalance.toString()}, allowance = ${testAccountTokenInAllowance.toString()}`);
                    if (testAccountTokenInBalance.gte(tokenInAmountBN)) {
                        console.log(`Approving ${tokenIn.symbol} (${tokenIn.address}) for swap on ${trade === null || trade === void 0 ? void 0 : trade.approveAddress}`);
                        yield tokenInContract.approve(trade === null || trade === void 0 ? void 0 : trade.approveAddress, constants_1.MaxUint256).then((tx) => tx.wait());
                        console.log(`Approved ${tokenIn.symbol} (${tokenIn.address}) for swap on ${trade === null || trade === void 0 ? void 0 : trade.approveAddress}`);
                        approved = true;
                    }
                }
                catch (e) {
                    console.log('[WARNING] Approve failed. Swap stage of test is skipped');
                }
                if (approved) {
                    const exchangeTx = yield unlockedAccountSigner.sendTransaction(swapTransaction).then((tx) => tx.wait());
                    expect(exchangeTx.status).toBe(1);
                }
            }));
        });
    });
});
//# sourceMappingURL=curve-trade.test.js.map