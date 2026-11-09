import type {NextResponse} from 'next/server';

import {JSESSIONID_HEADER} from '../common/constants';

export const DRAFT_COOKIE = '__prerender_bypass';
export const BUILD_COOKIE = '__next_build_id';

export interface PreviewCookieOptions {
    sessionId: string;
    buildId: string;
    secure?: boolean;
    sameSite?: 'lax' | 'strict' | 'none';
}

/** Sets the XP session and build marker on an existing response; draft mode is enabled by the caller. */
export function setPreviewCookies(response: {
    cookies: {set: (...args: Parameters<NextResponse['cookies']['set']>) => unknown};
}, {
    sessionId,
    buildId,
    secure = process.env.NODE_ENV !== 'development',
    sameSite = secure ? 'none' : 'lax'
}: PreviewCookieOptions): void {
    if (!buildId) {
        throw new Error('A build ID is required for preview cookies');
    }
    if (sameSite === 'none' && !secure) {
        throw new Error('SameSite=None requires secure preview cookies');
    }
    const options = {httpOnly: true, secure, sameSite, path: '/'};
    response.cookies.set(JSESSIONID_HEADER, sessionId, options);
    response.cookies.set(BUILD_COOKIE, buildId, options);
}
