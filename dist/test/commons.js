"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TEST_TOKENS = void 0;
const src_1 = require("../src");
exports.TEST_TOKENS = {
    WEENUS: {
        [src_1.ChainId.MAINNET]: new src_1.Token(src_1.ChainId.MAINNET, '0x2823589Ae095D99bD64dEeA80B4690313e2fB519', 18, 'WEENUS', 'Weenus 💪'),
        [src_1.ChainId.RINKEBY]: new src_1.Token(src_1.ChainId.RINKEBY, '0xaFF4481D10270F50f203E0763e2597776068CBc5', 18, 'WEENUS', 'Weenus 💪')
    },
    XEENUS: {
        [src_1.ChainId.MAINNET]: new src_1.Token(src_1.ChainId.MAINNET, '0xeEf5E2d8255E973d587217f9509B416b41CA5870', 18, 'XEENUS', 'Xeenus 💪'),
        [src_1.ChainId.RINKEBY]: new src_1.Token(src_1.ChainId.RINKEBY, '0x022E292b44B5a146F2e8ee36Ff44D3dd863C915c', 18, 'XEENUS', 'Xeenus 💪')
    },
    YEENUS: {
        [src_1.ChainId.MAINNET]: new src_1.Token(src_1.ChainId.MAINNET, '0x187E63F9eBA692A0ac98d3edE6fEb870AF0079e1', 8, 'YEENUS', 'Yeenus 💪'),
        [src_1.ChainId.RINKEBY]: new src_1.Token(src_1.ChainId.RINKEBY, '0xc6fDe3FD2Cc2b173aEC24cc3f267cb3Cd78a26B7', 8, 'YEENUS', 'Yeenus 💪')
    },
    ZEENUS: {
        [src_1.ChainId.MAINNET]: new src_1.Token(src_1.ChainId.MAINNET, '0x187E63F9eBA692A0ac98d3edE6fEb870AF0079e1', 8, 'ZEENUS', 'Zeenus 💪'),
        [src_1.ChainId.RINKEBY]: new src_1.Token(src_1.ChainId.RINKEBY, '0x1f9061B953bBa0E36BF50F21876132DcF276fC6e', 8, 'ZEENUS', 'Zeenus 💪')
    }
};
//# sourceMappingURL=commons.js.map