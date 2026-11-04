import {draftMode} from 'next/headers';

import {JSESSIONID_HEADER} from '../common/constants';
import {getMediaUrl} from '../utils/getMediaUrl';

const DEFAULT_PROXY_PATH = '/api/media';
const ALLOWED_MEDIA_PREFIXES = ['/media:image/', '/media:attachment/', '/media:unknown'];
const FORWARDED_REQUEST_HEADERS = [
    'accept',
    'accept-encoding',
    'if-modified-since',
    'if-none-match',
    'if-range',
    'range'
];
const EXCLUDED_RESPONSE_HEADERS = new Set([
    'connection',
    'keep-alive',
    'proxy-authenticate',
    'proxy-authorization',
    'set-cookie',
    'te',
    'trailer',
    'transfer-encoding',
    'upgrade'
]);

export interface ProxyMediaOptions {
    proxyPath?: string;
}

/** Streams authenticated Guillotine media through Next.js while draft mode is active. */
export async function proxyMedia(request: Request, options: ProxyMediaOptions = {}): Promise<Response> {
    if (!(await draftMode()).isEnabled) {
        return new Response('Not Found', {status: 404});
    }
    if (request.method !== 'GET' && request.method !== 'HEAD') {
        return new Response('Method Not Allowed', {
            status: 405,
            headers: {Allow: 'GET, HEAD'}
        });
    }

    const requestUrl = new URL(request.url);
    const mediaPath = getProxiedMediaPath(requestUrl.pathname, options.proxyPath || DEFAULT_PROXY_PATH);
    if (!mediaPath) {
        return new Response('Invalid media path', {status: 400});
    }

    const jsessionid = getSessionId(request.headers);
    if (!jsessionid) {
        return new Response('Unauthorized', {status: 401});
    }

    const upstreamUrl = getMediaUrl(mediaPath + requestUrl.search);
    if (!URL.canParse(upstreamUrl) || upstreamUrl === mediaPath + requestUrl.search) {
        return new Response('Media upstream is not configured', {status: 500});
    }

    const headers = new Headers();
    for (const name of FORWARDED_REQUEST_HEADERS) {
        const value = request.headers.get(name);
        if (value) {
            headers.set(name, value);
        }
    }
    headers.set('cookie', `${JSESSIONID_HEADER}=${jsessionid}`);

    let upstream: Response;
    try {
        upstream = await fetch(upstreamUrl, {
            method: request.method,
            headers,
            cache: 'no-store',
            redirect: 'manual',
            signal: request.signal
        });
    } catch (error) {
        console.error('Media proxy request failed', {
            path: mediaPath,
            error: error instanceof Error ? error.message : String(error)
        });
        return new Response('Bad Gateway', {status: 502});
    }

    const responseHeaders = copyResponseHeaders(upstream.headers);
    responseHeaders.set('cache-control', 'private, no-store');

    const hasBody = request.method !== 'HEAD' && ![204, 205, 304].includes(upstream.status);
    return new Response(hasBody ? upstream.body : null, {
        status: upstream.status,
        statusText: upstream.statusText,
        headers: responseHeaders
    });
}

function getProxiedMediaPath(pathname: string, proxyPath: string): string | undefined {
    const normalizedProxyPath = '/' + proxyPath.replace(/^\/+|\/+$/g, '');
    if (!pathname.startsWith(normalizedProxyPath + '/')) {
        return undefined;
    }

    const mediaPath = pathname.slice(normalizedProxyPath.length);
    if (!ALLOWED_MEDIA_PREFIXES.some((prefix) => mediaPath.startsWith(prefix))) {
        return undefined;
    }
    if (mediaPath.includes('\\') || hasControlCharacters(mediaPath) || /\/(?:\.{1,2})(?:\/|$)/.test(mediaPath)) {
        return undefined;
    }
    return mediaPath;
}

function getSessionId(headers: Headers): string | undefined {
    const headerValue = headers.get(JSESSIONID_HEADER);
    const cookieValue = headers.get('cookie')?.split(';').map((cookie) => cookie.trim()).find((cookie) => {
        return cookie.startsWith(`${JSESSIONID_HEADER}=`);
    })?.slice(JSESSIONID_HEADER.length + 1);
    const value = headerValue || cookieValue;
    return value && !value.includes(';') && !hasControlCharacters(value) ? value : undefined;
}

function hasControlCharacters(value: string): boolean {
    return Array.from(value).some((character) => {
        const code = character.charCodeAt(0);
        return code <= 31 || code === 127;
    });
}

function copyResponseHeaders(upstreamHeaders: Headers): Headers {
    const headers = new Headers();
    const wasEncoded = upstreamHeaders.has('content-encoding');
    upstreamHeaders.forEach((value, name) => {
        const lowerName = name.toLowerCase();
        if (EXCLUDED_RESPONSE_HEADERS.has(lowerName)) {
            return;
        }
        // Fetch runtimes transparently decode encoded bodies. Do not describe the streamed body as still encoded.
        if (wasEncoded && (lowerName === 'content-encoding' || lowerName === 'content-length')) {
            return;
        }
        headers.append(name, value);
    });
    return headers;
}
