import {ASCII_CONTROL_CHARACTERS_PATTERN} from '../common/constants';

import {validateXpPayload} from './validateXpPayload';
import type {ValidateXpPayloadOptions, XpPayload, XpPayloadError} from './validateXpPayload';

export interface PreviewPayload extends XpPayload {
    JSESSIONID: string;
    issuedAt: number;
}

export interface ValidatePreviewPayloadOptions extends ValidateXpPayloadOptions {
    maxAgeMs?: number;
    clockSkewMs?: number;
    now?: number;
}

export type PreviewPayloadResult =
    | {ok: true; payload: PreviewPayload}
    | {ok: false; reason: XpPayloadError | 'invalid-session' | 'expired-session'};

/** Decrypts and validates an XP preview handoff, requiring a safe session ID and a fresh timestamp. */
export function validatePreviewPayload({
    blob,
    secret,
    maxAgeMs = 5 * 60 * 1000,
    clockSkewMs = 30 * 1000,
    now = Date.now()
}: ValidatePreviewPayloadOptions): PreviewPayloadResult {
    if (!Number.isFinite(now) || !Number.isFinite(maxAgeMs) || maxAgeMs < 0
        || !Number.isFinite(clockSkewMs) || clockSkewMs < 0) {
        throw new RangeError('Preview timing options must be finite, with nonnegative age and clock skew');
    }
    const decoded = validateXpPayload({blob, secret});
    if (decoded.ok === false) {
        return {ok: false, reason: decoded.reason};
    }
    const {JSESSIONID: sessionId, issuedAt} = decoded.payload;
    if (typeof sessionId !== 'string' || !sessionId.trim() || sessionId.includes(';')
        || ASCII_CONTROL_CHARACTERS_PATTERN.test(sessionId)
        || typeof issuedAt !== 'number' || !Number.isFinite(issuedAt)) {
        return {ok: false, reason: 'invalid-session'};
    }
    const age = now - issuedAt;
    if (age < -clockSkewMs || age > maxAgeMs) {
        return {ok: false, reason: 'expired-session'};
    }
    return {ok: true, payload: {...decoded.payload, JSESSIONID: sessionId, issuedAt}};
}
