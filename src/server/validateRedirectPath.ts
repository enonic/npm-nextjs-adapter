import {ASCII_CONTROL_CHARACTERS_PATTERN} from '../common/constants';

export type RedirectPathResult =
    | {ok: true; url: URL}
    | {ok: false; reason: 'invalid-path'};

/** Validates a root-relative path and returns its same-origin URL; missing or empty paths default to '/'. */
export function validateRedirectPath({path, origin}: {path: string | null; origin: string}): RedirectPathResult {
    const destination = path || '/';
    if (!destination.startsWith('/') || destination.startsWith('//') || destination.includes('\\')
        || ASCII_CONTROL_CHARACTERS_PATTERN.test(destination)) {
        return {ok: false, reason: 'invalid-path'};
    }
    try {
        const base = new URL(origin);
        const url = new URL(destination, base);
        if (!['http:', 'https:'].includes(base.protocol) || url.origin !== base.origin) {
            return {ok: false, reason: 'invalid-path'};
        }
        return {ok: true, url};
    } catch {
        return {ok: false, reason: 'invalid-path'};
    }
}
