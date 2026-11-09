import {describe, expect, jest, test as it} from '@jest/globals';

import {getXpRequestHeaders, getXpSessionId} from '../../src/server/xpSession';

describe('server/getXpSessionId', () => {
    it('prefers the session header and falls back to the exact session cookie', () => {
        const headers = new Headers({JSESSIONID: 'header-session', cookie: 'analytics=1; JSESSIONID=cookie-session'});
        expect(getXpSessionId(headers)).toBe('header-session');
        headers.delete('JSESSIONID');
        expect(getXpSessionId(headers)).toBe('cookie-session');
        expect(getXpSessionId(new Headers({cookie: 'otherJSESSIONID=wrong'}))).toBeUndefined();
        expect(getXpSessionId(new Headers())).toBeUndefined();
    });

    it.each(['invalid;session', 'invalid\u0000session', 'invalid\u001fsession', 'invalid\u007fsession'])(
        'rejects unsafe header sessions %p', (value) => {
            const headers = new Headers();
            // Fetch rejects NUL before the helper runs; inject raw values to exercise its validation too.
            jest.spyOn(headers, 'get').mockImplementation((name) => name === 'JSESSIONID' ? value : null);
            expect(getXpSessionId(headers)).toBeUndefined();
        }
    );

    it('preserves session values containing equals signs', () => {
        expect(getXpSessionId(new Headers({cookie: 'JSESSIONID=session=123'}))).toBe('session=123');
    });
});

describe('server/getXpRequestHeaders', () => {
    it('derives the session header from the cookie without mutating the request', () => {
        const request = new Request('https://frontend.example.com', {
            headers: {JSESSIONID: 'untrusted', cookie: 'JSESSIONID=actual', 'x-custom': 'kept'}
        });
        const headers = getXpRequestHeaders(request);
        expect(headers.get('JSESSIONID')).toBe('actual');
        expect(headers.get('x-custom')).toBe('kept');
        expect(headers.get('cookie')).toBe('JSESSIONID=actual');
        expect(request.headers.get('JSESSIONID')).toBe('untrusted');
    });

    it('removes an incoming session header when no frontend session cookie exists', () => {
        const headers = getXpRequestHeaders({headers: new Headers({JSESSIONID: 'untrusted'})});
        expect(headers.has('JSESSIONID')).toBe(false);
    });
});
