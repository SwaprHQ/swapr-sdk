"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CoWTradeError = void 0;
/**
 * CoWTradeError
 */
class CoWTradeError extends Error {
    constructor(message) {
        super(message);
        this.name = 'CoWTradeError';
    }
}
exports.CoWTradeError = CoWTradeError;
//# sourceMappingURL=CoWTradeError.js.map