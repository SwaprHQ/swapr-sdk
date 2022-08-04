import { Percent } from '../../fractions/percent';
import { Platform } from '../../platforms-breakdown';
import { ApiSource, DecodeStringFractionReturn } from './types';
export declare const decodePlatformName: (apiName: string) => string;
export declare const decodeStringFraction: (value: string) => DecodeStringFractionReturn;
export declare const decodeStringToPercent: (value: string, isStringPercent?: boolean) => Percent;
export declare const platformsFromSources: (sources: ApiSource[]) => Platform[];
