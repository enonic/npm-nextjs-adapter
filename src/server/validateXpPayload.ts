import {decryptParams} from '../utils/decryptParams';

export interface XpPayload extends Record<string, unknown> {
    xpProject?: string;
}

export type XpPayloadError = 'missing-payload' | 'missing-secret' | 'invalid-payload';
export type XpPayloadResult =
    | {ok: true; payload: XpPayload}
    | {ok: false; reason: XpPayloadError};

export interface ValidateXpPayloadOptions {
    blob: string | null;
    secret: string | undefined;
}

/** Authenticates and decodes an encrypted XP payload without imposing preview-session requirements. */
export function validateXpPayload({blob, secret}: ValidateXpPayloadOptions): XpPayloadResult {
    if (!blob) {
        return {ok: false, reason: 'missing-payload'};
    }
    if (!secret) {
        return {ok: false, reason: 'missing-secret'};
    }
    const value: unknown = decryptParams(blob, secret);
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
        return {ok: false, reason: 'invalid-payload'};
    }
    const payload = value as Record<string, unknown>;
    if (payload.xpProject !== undefined && typeof payload.xpProject !== 'string') {
        return {ok: false, reason: 'invalid-payload'};
    }
    return {ok: true, payload};
}
