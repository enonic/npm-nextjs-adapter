import type {NextRequest} from 'next/server';

import {FROM_XP_PARAM, JSESSIONID_HEADER} from '../common/constants';

import {validateRedirectPath} from './validateRedirectPath';
import type {PreviewPayload} from './validatePreviewPayload';
import {BUILD_COOKIE, DRAFT_COOKIE} from './previewCookies';

export interface BuildPreviewUrlOptions {
    request: {
        cookies: Pick<NextRequest['cookies'], 'get' | 'has'>;
        nextUrl: Pick<NextRequest['nextUrl'], 'origin' | 'searchParams'>;
    };
    payload: PreviewPayload;
    returnUrl: URL;
    buildId: string | undefined;
    previewPath?: string;
}

/** Returns the preview handoff URL when cookies need synchronization, or null when they already match.
 * The payload must be the decoded value of this request's encrypted XP parameter.
 */
export function buildPreviewUrlIfNeeded({
    request,
    payload,
    returnUrl,
    buildId,
    previewPath = '/api/preview'
}: BuildPreviewUrlOptions): URL | null {
    const hasDraftCookieForBuild = Boolean(buildId) && request.cookies.has(DRAFT_COOKIE)
        && request.cookies.get(BUILD_COOKIE)?.value === buildId;
    const hasMatchingSessionCookie = request.cookies.get(JSESSIONID_HEADER)?.value === payload.JSESSIONID;
    if (hasDraftCookieForBuild && hasMatchingSessionCookie) {
        return null;
    }
    const xpBlob = request.nextUrl.searchParams.get(FROM_XP_PARAM);
    if (!xpBlob) {
        throw new Error('A preview redirect requires an XP payload');
    }
    const destination = validateRedirectPath({path: previewPath, origin: request.nextUrl.origin});
    if (!destination.ok || returnUrl.origin !== request.nextUrl.origin) {
        throw new Error('Preview and return URLs must use the request origin');
    }
    const url = destination.url;
    url.search = '';
    url.hash = '';
    url.searchParams.set(FROM_XP_PARAM, xpBlob);
    url.searchParams.set('path', returnUrl.pathname + returnUrl.search);
    return url;
}
