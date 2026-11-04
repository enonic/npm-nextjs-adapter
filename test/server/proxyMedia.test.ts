import {afterEach, describe, expect, jest, test as it} from '@jest/globals';

import {setupServerEnv} from '../constants';

async function setup({draft = true, env = {}}: {draft?: boolean; env?: Record<string, string>} = {}) {
    jest.resetModules();
    setupServerEnv(env);
    jest.mock('next/headers', () => ({
        draftMode: () => Promise.resolve({isEnabled: draft})
    }), {virtual: true});

    const fetchMock = jest.spyOn(globalThis, 'fetch');
    const {proxyMedia} = await import('../../src/server/proxyMedia');
    return {proxyMedia, fetchMock};
}

function request(path: string, init: RequestInit = {}): Request {
    return new Request(`https://frontend.example.com${path}`, {
        ...init,
        headers: {
            cookie: 'analytics=value; JSESSIONID=session-123; __prerender_bypass=draft',
            ...init.headers
        }
    });
}

describe('server/proxyMedia', () => {
    afterEach(() => {
        jest.restoreAllMocks();
        jest.resetModules();
    });

    it('is unavailable outside draft mode', async () => {
        const {proxyMedia, fetchMock} = await setup({draft: false});

        const response = await proxyMedia(request('/api/media/media:image/hmdb/id:fp/width-500/photo.jpg'));

        expect(response.status).toBe(404);
        expect(fetchMock).not.toHaveBeenCalled();
    });

    it('prefers ENONIC_MEDIA_CDN and forwards only JSESSIONID', async () => {
        const {proxyMedia, fetchMock} = await setup({
            env: {ENONIC_MEDIA_CDN: 'https://media.example.com/api/'}
        });
        fetchMock.mockResolvedValue(new Response(new Uint8Array([1, 2, 3]), {
            headers: {'Content-Type': 'image/png'}
        }));

        const response = await proxyMedia(request(
            '/api/media/media:image/hmdb/id:fp/width-500/photo.jpg?quality=80',
            {headers: {accept: 'image/avif,image/webp', cookie: 'analytics=value; JSESSIONID=session-123'}}
        ));

        expect(await response.arrayBuffer()).toEqual(new Uint8Array([1, 2, 3]).buffer);
        expect(fetchMock).toHaveBeenCalledTimes(1);
        const [url, init] = fetchMock.mock.calls[0];
        expect(url).toBe('https://media.example.com/api/media:image/hmdb/id:fp/width-500/photo.jpg?quality=80');
        const headers = new Headers(init?.headers);
        expect(headers.get('cookie')).toBe('JSESSIONID=session-123');
        expect(headers.get('cookie')).not.toContain('analytics');
        expect(headers.get('accept')).toBe('image/avif,image/webp');
        expect(init).toMatchObject({cache: 'no-store', redirect: 'manual'});
        expect(response.headers.get('content-type')).toBe('image/png');
        expect(response.headers.get('cache-control')).toBe('private, no-store');
    });

    it('falls back to ENONIC_API for attachment media', async () => {
        const {proxyMedia, fetchMock} = await setup();
        fetchMock.mockResolvedValue(new Response('pdf', {
            status: 206,
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': 'attachment; filename="report.pdf"',
                'Content-Range': 'bytes 0-2/3'
            }
        }));

        const response = await proxyMedia(request(
            '/api/media/media:attachment/hmdb/id:fp/report.pdf?download',
            {headers: {range: 'bytes=0-2'}}
        ));

        expect(fetchMock.mock.calls[0][0]).toBe('http://localhost:8080/api/media:attachment/hmdb/id:fp/report.pdf?download');
        expect(new Headers(fetchMock.mock.calls[0][1]?.headers).get('range')).toBe('bytes=0-2');
        expect(response.status).toBe(206);
        expect(response.headers.get('content-disposition')).toBe('attachment; filename="report.pdf"');
        expect(response.headers.get('content-range')).toBe('bytes 0-2/3');
    });

    it('rejects missing sessions, unrelated paths and unsupported methods', async () => {
        const {proxyMedia, fetchMock} = await setup();

        const missingSession = await proxyMedia(new Request(
            'https://frontend.example.com/api/media/media:image/hmdb/id:fp/width-500/photo.jpg'
        ));
        const unrelated = await proxyMedia(request('/api/media/admin/rest-v2/cs/content/image/id'));
        const post = await proxyMedia(request('/api/media/media:image/hmdb/id:fp/width-500/photo.jpg', {method: 'POST'}));

        expect(missingSession.status).toBe(401);
        expect(unrelated.status).toBe(400);
        expect(post.status).toBe(405);
        expect(fetchMock).not.toHaveBeenCalled();
    });

    it('does not forward cookies, hop-by-hop headers or stale encoded-body headers', async () => {
        const {proxyMedia, fetchMock} = await setup();
        const headers = new Headers({
            'Content-Type': 'image/svg+xml',
            'Content-Encoding': 'gzip',
            'Content-Length': '20',
            'Content-Security-Policy': "default-src 'none'",
            Connection: 'keep-alive'
        });
        headers.append('Set-Cookie', 'secret=value');
        fetchMock.mockResolvedValue(new Response('<svg/>', {headers}));

        const response = await proxyMedia(request('/api/media/media:image/hmdb/id:fp/full/image.svgz'));

        expect(await response.text()).toBe('<svg/>');
        expect(response.headers.get('content-type')).toBe('image/svg+xml');
        expect(response.headers.get('content-security-policy')).toBe("default-src 'none'");
        expect(response.headers.get('content-encoding')).toBeNull();
        expect(response.headers.get('content-length')).toBeNull();
        expect(response.headers.get('connection')).toBeNull();
        expect(response.headers.get('set-cookie')).toBeNull();
    });

    it('returns bad gateway when the upstream request fails', async () => {
        const {proxyMedia, fetchMock} = await setup();
        fetchMock.mockRejectedValue(new Error('connection failed'));
        const consoleError = jest.spyOn(console, 'error').mockImplementation(() => undefined);

        const response = await proxyMedia(request('/api/media/media:image/hmdb/id:fp/full/photo.jpg'));

        expect(response.status).toBe(502);
        expect(consoleError).toHaveBeenCalledWith('Media proxy request failed', {
            path: '/media:image/hmdb/id:fp/full/photo.jpg',
            error: 'connection failed'
        });
    });
});
