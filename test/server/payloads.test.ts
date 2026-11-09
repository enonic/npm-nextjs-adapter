import {describe, expect, test as it} from '@jest/globals';

import {validatePreviewPayload} from '../../src/server/validatePreviewPayload';
import {validateXpPayload} from '../../src/server/validateXpPayload';
import {encryptParams} from '../../src/utils/encryptParams';

const secret = 'test-preview-secret';
const now = 1_000_000;
const payload = {xpProject: 'website', JSESSIONID: 'session-123', issuedAt: now, custom: {value: 1}};

function validate(value: Record<string, unknown>, options = {}) {
    return validatePreviewPayload({blob: encryptParams(value, secret), secret, now, ...options});
}

describe('server/validateXpPayload', () => {
    it('accepts project-only payloads for mappings and revalidation and preserves custom data', () => {
        const value = {xpProject: 'website', custom: {value: 1}};
        expect(validateXpPayload({blob: encryptParams(value, secret), secret})).toEqual({ok: true, payload: value});
        expect(validateXpPayload({blob: encryptParams({}, secret), secret})).toEqual({ok: true, payload: {}});
    });

    it('distinguishes missing configuration from failed authentication', () => {
        const blob = encryptParams(payload, secret);
        expect(validateXpPayload({blob: null, secret})).toEqual({ok: false, reason: 'missing-payload'});
        expect(validateXpPayload({blob: '', secret})).toEqual({ok: false, reason: 'missing-payload'});
        expect(validateXpPayload({blob, secret: undefined})).toEqual({ok: false, reason: 'missing-secret'});
        expect(validateXpPayload({blob, secret: 'wrong'})).toEqual({ok: false, reason: 'invalid-payload'});
        expect(validateXpPayload({blob: 'not-encrypted', secret})).toEqual({ok: false, reason: 'invalid-payload'});
        const bytes = Buffer.from(blob, 'base64url');
        bytes[12] ^= 1;
        expect(validateXpPayload({blob: bytes.toString('base64url'), secret})).toEqual({ok: false, reason: 'invalid-payload'});
    });

    it.each([null, [], 'text', 123, true, {xpProject: 123}])('rejects decoded values with invalid shapes: %p', (value) => {
        expect(validateXpPayload({blob: encryptParams(value as any, secret), secret}))
            .toEqual({ok: false, reason: 'invalid-payload'});
    });
});

describe('server/validatePreviewPayload', () => {
    it('accepts fresh preview data and preserves application fields', () => {
        expect(validate(payload)).toEqual({ok: true, payload});
    });

    it('propagates generic payload failures', () => {
        expect(validatePreviewPayload({blob: null, secret, now})).toEqual({ok: false, reason: 'missing-payload'});
        expect(validatePreviewPayload({blob: 'invalid', secret, now})).toEqual({ok: false, reason: 'invalid-payload'});
        expect(validatePreviewPayload({blob: 'invalid', secret: undefined, now})).toEqual({ok: false, reason: 'missing-secret'});
    });

    it.each([undefined, '', ' ', 123, 'bad;session', 'bad\u0000session', 'bad\u001fsession', 'bad\u007fsession'])(
        'rejects invalid session IDs: %p', (JSESSIONID) => {
            expect(validate({...payload, JSESSIONID})).toEqual({ok: false, reason: 'invalid-session'});
        }
    );

    it.each([undefined, null, '1000000', Number.NaN, Number.POSITIVE_INFINITY])('rejects invalid timestamps: %p', (issuedAt) => {
        expect(validate({...payload, issuedAt})).toEqual({ok: false, reason: 'invalid-session'});
    });

    it.each([-30_000, 0, 300_000])('accepts timestamp boundary age %p', (age) => {
        expect(validate({...payload, issuedAt: now - age}).ok).toBe(true);
    });

    it.each([-30_001, 300_001])('rejects out-of-range age %p', (age) => {
        expect(validate({...payload, issuedAt: now - age})).toEqual({ok: false, reason: 'expired-session'});
    });

    it('supports custom age and clock-skew limits', () => {
        expect(validate({...payload, issuedAt: now - 11}, {maxAgeMs: 10})).toEqual({ok: false, reason: 'expired-session'});
        expect(validate({...payload, issuedAt: now + 1}, {clockSkewMs: 0})).toEqual({ok: false, reason: 'expired-session'});
    });

    it.each([{maxAgeMs: -1}, {clockSkewMs: -1}, {maxAgeMs: Infinity}, {now: NaN}])(
        'rejects invalid timing configuration %p', (options) => {
            expect(() => validate(payload, options)).toThrow(RangeError);
        }
    );
});
