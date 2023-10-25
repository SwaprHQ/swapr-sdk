"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.platformsFromSources = exports.decodeStringToPercent = exports.decodeStringFraction = exports.decodePlatformName = void 0;
const tslib_1 = require("tslib");
const decimal_js_light_1 = tslib_1.__importDefault(require("decimal.js-light"));
const percent_1 = require("../../fractions/percent");
const constants_1 = require("./constants");
const decodePlatformName = (apiName) => constants_1.CODE_TO_PLATFORM_NAME[apiName] || apiName;
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
//# sourceMappingURL=utils.js.map