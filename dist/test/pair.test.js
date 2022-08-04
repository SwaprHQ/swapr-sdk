"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const src_1 = require("../src");
const commons_1 = require("./commons");
describe('Pair', () => {
    const USDC = new src_1.Token(src_1.ChainId.MAINNET, '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', 18, 'USDC', 'USD Coin');
    const DAI = new src_1.Token(src_1.ChainId.MAINNET, '0x6B175474E89094C44Da98b954EedeAC495271d0F', 18, 'DAI', 'DAI Stablecoin');
    describe('constructor', () => {
        it('cannot be used for tokens on different chains', () => {
            expect(() => new src_1.Pair(new src_1.TokenAmount(USDC, '100'), new src_1.TokenAmount(src_1.Token.WETH[src_1.ChainId.RINKEBY], '100'))).toThrow('CHAIN_ID');
        });
    });
    describe('#getAddress', () => {
        it('returns the correct address', () => {
            const usdc = new src_1.Token(src_1.ChainId.MAINNET, '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', 18, 'USDC', 'USD Coin');
            const dai = new src_1.Token(src_1.ChainId.MAINNET, '0x6B175474E89094C44Da98b954EedeAC495271d0F', 18, 'DAI', 'DAI Stablecoin');
            expect(src_1.Pair.getAddress(usdc, dai, src_1.UniswapV2RoutablePlatform.SWAPR)).toEqual('0x0e18852eE5CE266E2Ce6f4844Ba04cd9CD11AF5B');
        });
    });
    describe('#getAddressfromWrongPlatform', () => {
        it('returns the incorrect address', () => {
            const usdc = new src_1.Token(src_1.ChainId.MAINNET, '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', 18, 'USDC', 'USD Coin');
            const dai = new src_1.Token(src_1.ChainId.MAINNET, '0x6B175474E89094C44Da98b954EedeAC495271d0F', 18, 'DAI', 'DAI Stablecoin');
            expect(src_1.Pair.getAddress(usdc, dai, src_1.UniswapV2RoutablePlatform.UNISWAP)).not.toEqual('0x0e18852eE5CE266E2Ce6f4844Ba04cd9CD11AF5B');
        });
    });
    describe('#getAddressFromUniswap', () => {
        it('returns the correct address from Uniswap rather than Swapr', () => {
            const usdc = new src_1.Token(src_1.ChainId.MAINNET, '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', 18, 'USDC', 'USD Coin');
            const weth = new src_1.Token(src_1.ChainId.MAINNET, '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', 18, 'WETH', 'Wrapped ETH');
            expect(src_1.Pair.getAddress(usdc, weth, src_1.UniswapV2RoutablePlatform.UNISWAP)).toEqual('0xB4e16d0168e52d35CaCD2c6185b44281Ec28C9Dc');
        });
    });
    describe('#getAddressFromSushiswap', () => {
        it('returns the correct address from Uniswap rather than Swapr', () => {
            const usdc = new src_1.Token(src_1.ChainId.MAINNET, '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', 18, 'USDC', 'USD Coin');
            const weth = new src_1.Token(src_1.ChainId.MAINNET, '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', 18, 'WETH', 'Wrapped ETH');
            expect(src_1.Pair.getAddress(usdc, weth, src_1.UniswapV2RoutablePlatform.SUSHISWAP)).toEqual('0x397FF1542f962076d0BFE58eA045FfA2d347ACa0');
        });
    });
    describe('#fetchData', () => {
        it.skip('returns the correct address', () => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
            const pairAddress = src_1.Pair.getAddress(src_1.Token.WETH[src_1.ChainId.RINKEBY], commons_1.TEST_TOKENS.WEENUS[src_1.ChainId.RINKEBY], src_1.UniswapV2RoutablePlatform.SWAPR);
            const pairData = yield src_1.Fetcher.fetchPairData(src_1.Token.WETH[src_1.ChainId.RINKEBY], commons_1.TEST_TOKENS.WEENUS[src_1.ChainId.RINKEBY]);
            expect(pairData.swapFee).toEqual(src_1.JSBI.BigInt(10));
            expect(pairData.protocolFeeDenominator).toEqual(src_1.JSBI.BigInt(9));
            expect(pairData.liquidityToken.address).toEqual(pairAddress);
            expect(pairData.liquidityToken.chainId).toEqual(src_1.ChainId.RINKEBY);
            expect(pairData.liquidityToken.decimals).toEqual(18);
            expect(pairData.liquidityToken.symbol).toEqual('DXS');
            expect(pairData.liquidityToken.name).toEqual('DXswap');
        }));
    });
    describe('#token0', () => {
        it('always is the token that sorts before', () => {
            expect(new src_1.Pair(new src_1.TokenAmount(USDC, '100'), new src_1.TokenAmount(DAI, '100')).token0).toEqual(DAI);
            expect(new src_1.Pair(new src_1.TokenAmount(DAI, '100'), new src_1.TokenAmount(USDC, '100')).token0).toEqual(DAI);
        });
    });
    describe('#token1', () => {
        it('always is the token that sorts after', () => {
            expect(new src_1.Pair(new src_1.TokenAmount(USDC, '100'), new src_1.TokenAmount(DAI, '100')).token1).toEqual(USDC);
            expect(new src_1.Pair(new src_1.TokenAmount(DAI, '100'), new src_1.TokenAmount(USDC, '100')).token1).toEqual(USDC);
        });
    });
    describe('#reserve0', () => {
        it('always comes from the token that sorts before', () => {
            expect(new src_1.Pair(new src_1.TokenAmount(USDC, '100'), new src_1.TokenAmount(DAI, '101')).reserve0).toEqual(new src_1.TokenAmount(DAI, '101'));
            expect(new src_1.Pair(new src_1.TokenAmount(DAI, '101'), new src_1.TokenAmount(USDC, '100')).reserve0).toEqual(new src_1.TokenAmount(DAI, '101'));
        });
    });
    describe('#reserve1', () => {
        it('always comes from the token that sorts after', () => {
            expect(new src_1.Pair(new src_1.TokenAmount(USDC, '100'), new src_1.TokenAmount(DAI, '101')).reserve1).toEqual(new src_1.TokenAmount(USDC, '100'));
            expect(new src_1.Pair(new src_1.TokenAmount(DAI, '101'), new src_1.TokenAmount(USDC, '100')).reserve1).toEqual(new src_1.TokenAmount(USDC, '100'));
        });
    });
    describe('#token0Price', () => {
        it('returns price of token0 in terms of token1', () => {
            expect(new src_1.Pair(new src_1.TokenAmount(USDC, '101'), new src_1.TokenAmount(DAI, '100')).token0Price).toEqual(new src_1.Price({ baseCurrency: DAI, quoteCurrency: USDC, denominator: '100', numerator: '101' }));
            expect(new src_1.Pair(new src_1.TokenAmount(DAI, '100'), new src_1.TokenAmount(USDC, '101')).token0Price).toEqual(new src_1.Price({ baseCurrency: DAI, quoteCurrency: USDC, denominator: '100', numerator: '101' }));
        });
    });
    describe('#token1Price', () => {
        it('returns price of token1 in terms of token0', () => {
            expect(new src_1.Pair(new src_1.TokenAmount(USDC, '101'), new src_1.TokenAmount(DAI, '100')).token1Price).toEqual(new src_1.Price({ baseCurrency: USDC, quoteCurrency: DAI, denominator: '101', numerator: '100' }));
            expect(new src_1.Pair(new src_1.TokenAmount(DAI, '100'), new src_1.TokenAmount(USDC, '101')).token1Price).toEqual(new src_1.Price({ baseCurrency: USDC, quoteCurrency: DAI, denominator: '101', numerator: '100' }));
        });
    });
    describe('#priceOf', () => {
        const pair = new src_1.Pair(new src_1.TokenAmount(USDC, '101'), new src_1.TokenAmount(DAI, '100'));
        it('returns price of token in terms of other token', () => {
            expect(pair.priceOf(DAI)).toEqual(pair.token0Price);
            expect(pair.priceOf(USDC)).toEqual(pair.token1Price);
        });
        it('throws if invalid token', () => {
            expect(() => pair.priceOf(src_1.Token.WETH[src_1.ChainId.MAINNET])).toThrow('TOKEN');
        });
    });
    describe('#reserveOf', () => {
        it('returns reserves of the given token', () => {
            expect(new src_1.Pair(new src_1.TokenAmount(USDC, '100'), new src_1.TokenAmount(DAI, '101')).reserveOf(USDC)).toEqual(new src_1.TokenAmount(USDC, '100'));
            expect(new src_1.Pair(new src_1.TokenAmount(DAI, '101'), new src_1.TokenAmount(USDC, '100')).reserveOf(USDC)).toEqual(new src_1.TokenAmount(USDC, '100'));
        });
        it('throws if not in the pair', () => {
            expect(() => new src_1.Pair(new src_1.TokenAmount(DAI, '101'), new src_1.TokenAmount(USDC, '100')).reserveOf(src_1.Token.WETH[src_1.ChainId.MAINNET])).toThrow('TOKEN');
        });
    });
    describe('#chainId', () => {
        it('returns the token0 chainId', () => {
            expect(new src_1.Pair(new src_1.TokenAmount(USDC, '100'), new src_1.TokenAmount(DAI, '100')).chainId).toEqual(src_1.ChainId.MAINNET);
            expect(new src_1.Pair(new src_1.TokenAmount(DAI, '100'), new src_1.TokenAmount(USDC, '100')).chainId).toEqual(src_1.ChainId.MAINNET);
        });
    });
    describe('#involvesToken', () => {
        expect(new src_1.Pair(new src_1.TokenAmount(USDC, '100'), new src_1.TokenAmount(DAI, '100')).involvesToken(USDC)).toEqual(true);
        expect(new src_1.Pair(new src_1.TokenAmount(USDC, '100'), new src_1.TokenAmount(DAI, '100')).involvesToken(DAI)).toEqual(true);
        expect(new src_1.Pair(new src_1.TokenAmount(USDC, '100'), new src_1.TokenAmount(DAI, '100')).involvesToken(src_1.Token.WETH[src_1.ChainId.MAINNET])).toEqual(false);
    });
});
//# sourceMappingURL=pair.test.js.map