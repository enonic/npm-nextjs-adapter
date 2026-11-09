import {describe, expect, test as it} from '@jest/globals';
import {NextRequest, NextResponse} from 'next/server';

import {buildPreviewUrlIfNeeded} from '../../src/server/buildPreviewUrlIfNeeded';
import {validateRedirectPath} from '../../src/server/validateRedirectPath';
import {addLocalePrefix, removeLocalePrefix} from '../../src/server/localePathnames';
import {setPreviewCookies} from '../../src/server/previewCookies';

const origin = 'https://frontend.example.com';
const payload = {xpProject: 'website', JSESSIONID: 'session-new', issuedAt: 1_000_000};
const matchingCookies = '__prerender_bypass=draft; __next_build_id=build-1; JSESSIONID=session-new';

function request(cookie = '') {
    return new NextRequest(`${origin}/no/article?xp=encrypted-blob`, {headers: {cookie}});
}

function preview(cookie = '', options = {}) {
    return buildPreviewUrlIfNeeded({
        request: request(cookie), payload, returnUrl: new URL('/no/article?filter=1', origin), buildId: 'build-1', ...options
    });
}

describe('server/validateRedirectPath', () => {
    it.each([null, '', '/', '/no/article?filter=1#section', '/encoded%20path', '/encoded%2Fpath'])(
        'builds a safe URL for %p', (path) => {
            const result = validateRedirectPath({path, origin});
            expect(result.ok).toBe(true);
            if (result.ok) {
                expect(result.url.href).toBe(new URL(path || '/', origin).href);
            }
        }
    );

    it.each(['https://foreign.example/path', '//foreign.example/path', 'relative', '/\\foreign.example', '/bad\npath', '/bad\u0000path', '/bad\u007fpath'])(
        'rejects unsafe destinations %p', (path) => {
            expect(validateRedirectPath({path, origin})).toEqual({ok: false, reason: 'invalid-path'});
        }
    );

    it.each(['invalid', 'file:///tmp/file', 'javascript:alert(1)'])('rejects an invalid web origin %p', (value) => {
        expect(validateRedirectPath({path: '/', origin: value})).toEqual({ok: false, reason: 'invalid-path'});
    });
});

describe('server/buildPreviewUrlIfNeeded', () => {
    it('returns null when draft, build, and session cookies match', () => {
        expect(preview(matchingCookies)).toBeNull();
    });

    it.each([
        '',
        '__prerender_bypass=draft; __next_build_id=old-build; JSESSIONID=session-new',
        '__next_build_id=build-1; JSESSIONID=session-new',
        '__prerender_bypass=draft; __next_build_id=build-1',
        '__prerender_bypass=draft; __next_build_id=build-1; JSESSIONID=session-old'
    ])('builds a handoff when cookies need synchronization: %p', (cookie) => {
        const result = preview(cookie);
        expect(result?.origin).toBe(origin);
        expect(result?.pathname).toBe('/api/preview');
        expect(result?.searchParams.get('xp')).toBe('encrypted-blob');
        expect(result?.searchParams.get('path')).toBe('/no/article?filter=1');
    });

    it('supports custom preview routes and preserves the input URL', () => {
        const returnUrl = new URL('/no/article?q=1', origin);
        const result = preview('', {returnUrl, previewPath: '/custom/preview?discard=1#fragment'});
        expect(result?.pathname).toBe('/custom/preview');
        expect(result?.searchParams.has('discard')).toBe(false);
        expect(result?.hash).toBe('');
        expect(returnUrl.href).toBe(`${origin}/no/article?q=1`);
    });

    it('does not accept missing build identity as synchronized', () => {
        expect(preview(matchingCookies, {buildId: undefined})).not.toBeNull();
    });

    it('rejects a missing encrypted payload when setup is required', () => {
        expect(() => preview('', {request: new NextRequest(`${origin}/article`)})).toThrow('requires an XP payload');
    });

    it('rejects foreign preview and return destinations', () => {
        expect(() => preview('', {previewPath: '//foreign.example/preview'})).toThrow('request origin');
        expect(() => preview('', {returnUrl: new URL('https://foreign.example/article')})).toThrow('request origin');
    });
});

describe('server/setPreviewCookies', () => {
    it('sets only the session and build marker using secure production-compatible options', () => {
        const response = NextResponse.redirect(new URL('/', origin));
        setPreviewCookies(response, {sessionId: payload.JSESSIONID, buildId: 'build-1', secure: true});
        expect(response.cookies.get('JSESSIONID')).toMatchObject({
            value: payload.JSESSIONID, httpOnly: true, secure: true, sameSite: 'none', path: '/'
        });
        expect(response.cookies.get('__next_build_id')).toMatchObject({value: 'build-1', httpOnly: true});
        expect(response.cookies.has('__prerender_bypass')).toBe(false);
    });

    it('supports local HTTP and explicit deployment cookie policies', () => {
        const response = new NextResponse();
        setPreviewCookies(response, {sessionId: 'local', buildId: 'dev', secure: false});
        expect(response.cookies.get('JSESSIONID')).toMatchObject({secure: false, sameSite: 'lax'});
        setPreviewCookies(response, {sessionId: 'strict', buildId: 'dev', secure: true, sameSite: 'strict'});
        expect(response.cookies.get('JSESSIONID')).toMatchObject({secure: true, sameSite: 'strict'});
    });

    it('rejects missing build identity and insecure SameSite=None without writing cookies', () => {
        const response = new NextResponse();
        expect(() => setPreviewCookies(response, {sessionId: 's', buildId: ''})).toThrow('build ID');
        expect(() => setPreviewCookies(response, {sessionId: 's', buildId: 'b', secure: false, sameSite: 'none'}))
            .toThrow('requires secure');
        expect(response.cookies.getAll()).toHaveLength(0);
    });
});

describe('server/localePathnames', () => {
    const options = {locale: 'no', locales: ['en', 'no']};

    it.each([['/', '/no'], ['/article', '/no/article'], ['/en/article', '/en/article'], ['/no', '/no']])(
        'adds locale to %s as %s', (path, expected) => {
            expect(addLocalePrefix(path, options)).toBe(expected);
        }
    );

    it('does not add a missing locale', () => {
        expect(addLocalePrefix('/article', {...options, locale: undefined})).toBe('/article');
    });

    it.each([['/en/article', '/article'], ['/en', '/'], ['/en/', '/'], ['/english', '/english'], ['/no/article', '/no/article']])(
        'removes a complete locale from %s as %s', (path, expected) => {
            expect(removeLocalePrefix(path, {locale: 'en'})).toBe(expected);
        }
    );

    it('does not remove an unspecified locale', () => {
        expect(removeLocalePrefix('/en/article', {})).toBe('/en/article');
    });
});
