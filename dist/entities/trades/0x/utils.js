"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.build0xApiUrl = exports.platformsFromSources = exports.decodeStringToPercent = exports.decodeStringFraction = exports.decodePlatformName = void 0;
const tslib_1 = require("tslib");
const decimal_js_light_1 = tslib_1.__importDefault(require("decimal.js-light"));
const jsbi_1 = tslib_1.__importDefault(require("jsbi"));
const percent_1 = require("../../fractions/percent");
const constants_1 = require("../constants");
const constants_2 = require("./constants");
const decodePlatformName = (apiName) => apiName.replace(/_/g, ' ');
exports.decodePlatformName = decodePlatformName;
const decodeStringFraction = (value) => {
    const proportion = new decimal_js_light_1.default(value);
    const denominator = new decimal_js_light_1.default('10').pow(proportion.decimalPlaces());
    const numerator = proportion.times(denominator);
    return { numerator, denominator };
};
exports.decodeStringFraction = decodeStringFraction;
const decodeStringToPercent = (value, isStringPercent) => {
    const { numerator, denominator } = (0, exports.decodeStringFraction)(value);
    const percent = isStringPercent ? new decimal_js_light_1.default('10').pow(2) : 1;
    return new percent_1.Percent(numerator.toString(), denominator.times(percent).toString());
};
exports.decodeStringToPercent = decodeStringToPercent;
const platformsFromSources = (sources) => {
    return sources
        .map((source) => {
        return {
            name: (0, exports.decodePlatformName)(source.name),
            percentage: (0, exports.decodeStringToPercent)(source.proportion),
        };
    })
        .filter((platform) => platform.percentage.greaterThan('0'))
        .sort((a, b) => (a.percentage.greaterThan(b.percentage) ? -1 : a.percentage.equalTo(b.percentage) ? 0 : 1));
};
exports.platformsFromSources = platformsFromSources;
function build0xApiUrl({ apiUrl, amount, maximumSlippage, chainId, buyToken, sellToken }) {
    const slippagePercentage = new percent_1.Percent(maximumSlippage.numerator, jsbi_1.default.multiply(maximumSlippage.denominator, jsbi_1.default.BigInt(100))).toFixed(3);
    let apiUrlWithParams = `${apiUrl}swap/v1/quote?buyToken=${buyToken}&sellToken=${sellToken}&sellAmount=${amount.raw}&slippagePercentage=${slippagePercentage}`;
    if (constants_1.REFFERER_ADDRESS_CHAIN_MAPPING[chainId]) {
        const feeRecipient = constants_1.REFFERER_ADDRESS_CHAIN_MAPPING[chainId];
        apiUrlWithParams += `&feeRecipient=${feeRecipient}&buyTokenPercentageFee=${constants_2.ZERO_OX_REFFERER_FEE}`;
    }
    return apiUrlWithParams;
}
exports.build0xApiUrl = build0xApiUrl;
//# sourceMappingURL=utils.js.map