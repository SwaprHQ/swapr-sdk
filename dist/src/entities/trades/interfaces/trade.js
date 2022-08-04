"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TradeWithSwapTransaction = exports.Trade = void 0;
const percent_1 = require("../../fractions/percent");
/**
 * Represents a base Trade class.
 * Extend this class to create more trades to the Eco Router
 */
class Trade {
    constructor({ details, type, inputAmount, outputAmount, executionPrice, maximumSlippage, priceImpact, chainId, platform, fee = new percent_1.Percent('0'), }) {
        this.details = details;
        this.tradeType = type;
        this.inputAmount = inputAmount;
        this.maximumSlippage = maximumSlippage;
        this.outputAmount = outputAmount;
        this.executionPrice = executionPrice;
        this.priceImpact = priceImpact;
        this.chainId = chainId;
        this.platform = platform;
        this.fee = fee;
    }
}
exports.Trade = Trade;
/**
 * Represents a trade executed against a list of pairs.
 * Does not account for slippage, i.e. trades that front run this trade and move the price.
 */
class TradeWithSwapTransaction extends Trade {
}
exports.TradeWithSwapTransaction = TradeWithSwapTransaction;
//# sourceMappingURL=trade.js.map