import {describe, expect, test as it} from '@jest/globals';
import {encryptParams} from '../../src/utils/encryptParams';
import {decryptParams} from '../../src/utils/decryptParams';


const SECRET = 'super-secret-key';

describe('utils', () => {
    describe('encryptParams / decryptParams', () => {
        it('round-trips a flat object of strings', () => {
            const params = {userId: 'abc123', role: 'editor'};
            const blob = encryptParams(params, SECRET);
            expect(decryptParams(blob, SECRET)).toEqual(params);
        });

        it('round-trips mixed primitive types and nested structures', () => {
            const params = {
                count: 42,
                active: true,
                tags: ['a', 'b', 'c'],
                nested: {answer: 42, list: [1, 2, 3]},
                unicode: 'café — naïve — 漢字'
            };
            const blob = encryptParams(params, SECRET);
            expect(decryptParams(blob, SECRET)).toEqual(params);
        });

        it('returns null when decrypted with a wrong secret', () => {
            const blob = encryptParams({userId: 'abc'}, SECRET);
            expect(decryptParams(blob, 'different-secret')).toBeNull();
        });

        it('returns null when ciphertext is tampered with', () => {
            const blob = encryptParams({userId: 'abc'}, SECRET);
            // Flip a byte roughly in the middle of the ciphertext region (after the 12-byte IV).
            const buf = Buffer.from(blob, 'base64url');
            const tamperIndex = Math.floor(buf.length / 2);
            buf[tamperIndex] = buf[tamperIndex] ^ 0xff;
            const tampered = buf.toString('base64url');
            expect(decryptParams(tampered, SECRET)).toBeNull();
        });

        it('returns null for malformed input', () => {
            expect(decryptParams('not-valid-base64-$$$', SECRET)).toBeNull();
            expect(decryptParams('', SECRET)).toBeNull();
            expect(decryptParams('AAAA', SECRET)).toBeNull();
        });

        it('produces a different ciphertext on each call (random IV)', () => {
            const params = {userId: 'abc'};
            const blob1 = encryptParams(params, SECRET);
            const blob2 = encryptParams(params, SECRET);
            expect(blob1).not.toEqual(blob2);
            expect(decryptParams(blob1, SECRET)).toEqual(params);
            expect(decryptParams(blob2, SECRET)).toEqual(params);
        });

        it('accepts an empty object', () => {
            const blob = encryptParams({}, SECRET);
            expect(decryptParams(blob, SECRET)).toEqual({});
        });
    });
});
