import JSBI from 'jsbi';
import { BigintIsh, SolidityType } from './constants';
export declare function validateSolidityTypeInstance(value: JSBI, solidityType: SolidityType): void;
export declare function validateAndParseAddress(address: string): string;
export declare function parseBigintIsh(bigintIsh: BigintIsh): JSBI;
export declare function sqrt(y: JSBI): JSBI;
export declare function sortedInsert<T>(items: T[], add: T, maxSize: number, comparator: (a: T, b: T) => number): T | null;
/**
 * Prints debug data to console. Requires setting `window.__SWAPR_SDK_DEBUG__` to `true`
 * @param data
 * @returns void
 */
export declare function debug(...data: any[]): void;
/**
 * Given a array of string, returns boolean if it exists *case insensitive
 * @param needle string to be compared to
 * @param haystack array of strings to be compared against
 * @returns boolean if string is contained in array of string
 */
export declare function checkIfStringExists(needle: string, hayStack: string[]): boolean;
