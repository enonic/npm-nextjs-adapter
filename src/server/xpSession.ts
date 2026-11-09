import {ASCII_CONTROL_CHARACTERS_PATTERN, JSESSIONID_HEADER} from '../common/constants';

/** Reads the XP session header first, falling back to its cookie. Does not authenticate the session. */
export function getXpSessionId(headers: Headers): string | undefined {
    const headerValue = headers.get(JSESSIONID_HEADER);
    const cookieValue = headers.get('cookie')?.split(';').map((cookie) => cookie.trim()).find((cookie) => {
        return cookie.startsWith(`${JSESSIONID_HEADER}=`);
    })?.slice(JSESSIONID_HEADER.length + 1);
    const value = headerValue || cookieValue;
    return value && !value.includes(';') && !ASCII_CONTROL_CHARACTERS_PATTERN.test(value) ? value : undefined;
}

/** Clones request headers and derives the forwarded XP session header exclusively from its cookie. */
export function getXpRequestHeaders(request: Pick<Request, 'headers'>): Headers {
    const headers = new Headers(request.headers);
    headers.delete(JSESSIONID_HEADER);
    const sessionId = getXpSessionId(headers);
    if (sessionId) {
        headers.set(JSESSIONID_HEADER, sessionId);
    }
    return headers;
}
