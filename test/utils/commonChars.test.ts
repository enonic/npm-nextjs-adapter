import {
    describe,
    expect,
    test as it
} from '@jest/globals';
import {commonChars} from '../../src/utils/commonChars';

describe('utils', () => {
    describe('commonChars', () => {
        it("returns '' when no params", () => {
            expect(commonChars()).toEqual('');
        });

        it("returns '' when single params", () => {
            expect(commonChars('https://127.0.0.1:8080/whatnot')).toEqual('');
        });

        it("returns '' when first param is ''", () => {
            expect(commonChars('', 'https://127.0.0.1:8080/different')).toEqual('');
        });

        it("returns '' when second param is ''", () => {
            expect(commonChars('https://127.0.0.1:8080/whatnot', '')).toEqual('');
        });

        it("returns common chars when two params", () => {
            expect(commonChars('https://127.0.0.1:8080/whatnot', 'https://127.0.0.1:8080/different')).toEqual('https://127.0.0.1:8080/');
        });
    });
});