import type {AttachmentUrl, ImageUrl, PageUrl} from '../../src/types';

import {beforeAll, describe, expect, jest, test as it} from '@jest/globals';
import {setupServerEnv} from '../constants';
import * as queries from '../../src/guillotine/urlQueries';


describe('guillotine/urls', () => {
    let urls: typeof import('../../src/guillotine/urls');

    beforeAll(async () => {
        jest.resetModules();
        setupServerEnv();
        urls = await import('../../src/guillotine/urls');
    });

    describe('query builders', () => {
        it('imageUrlQuery emits scale only', () => {
            expect(queries.imageUrlQuery({scale: 'width(500)'})).toEqual('imageUrl(scale: "width(500)") { url path queryString context id fingerprint scale name }');
        });

        it('imageUrlQuery emits every argument and params as a GraphQL object literal', () => {
            expect(queries.imageUrlQuery({
                scale: 'block(200,200)',
                quality: 80,
                background: 'ffffff',
                format: 'webp',
                filter: 'blur(3)',
                params: {foo: 'bar', n: 1, list: [1, 'a'], nested: {ok: true}}
            })).toEqual('imageUrl(scale: "block(200,200)", quality: 80, background: "ffffff", format: "webp", filter: "blur(3)", '
                + 'params: {foo: "bar", n: 1, list: [1, "a"], nested: {ok: true}}) { url path queryString context id fingerprint scale name }');
        });

        it('imageUrlQuery skips undefined arguments', () => {
            expect(queries.imageUrlQuery({scale: 'width(1)', quality: undefined})).toEqual('imageUrl(scale: "width(1)") { url path queryString context id fingerprint scale name }');
        });

        it('mediaUrlQuery and attachmentUrlQuery emit no parentheses without args', () => {
            expect(queries.mediaUrlQuery()).toEqual('mediaUrl { url path queryString context id fingerprint name intent }');
            expect(queries.attachmentUrlQuery()).toEqual('attachmentUrl { url path queryString context id fingerprint name intent }');
            expect(queries.mediaUrlQuery({download: true})).toEqual('mediaUrl(download: true) { url path queryString context id fingerprint name intent }');
        });

        it('pageUrlQuery selects path only', () => {
            expect(queries.pageUrlQuery()).toEqual('pageUrl { url path queryString }');
            expect(queries.pageUrlQuery({params: {a: 'b'}})).toEqual('pageUrl(params: {a: "b"}) { url path queryString }');
        });
    });

    describe('string functions', () => {
        const image: ImageUrl = {
            url: '/api/media:image/hmdb/id:fp/width-500/photo.jpg',
            path: '/media:image/hmdb/id:fp/width-500/photo.jpg',
            queryString: '',
            context: 'hmdb',
            id: 'id',
            fingerprint: 'fp',
            scale: 'width-500',
            name: 'photo.jpg'
        };
        const attachment = (queryString: string): AttachmentUrl => ({
            url: '/api/media:attachment/hmdb/id:fp/file.pdf' + queryString,
            path: '/media:attachment/hmdb/id:fp/file.pdf',
            queryString,
            context: 'hmdb',
            id: 'id',
            fingerprint: 'fp',
            name: 'file.pdf',
            intent: queryString ? 'download' : 'inline'
        });
        const page = (path: string): PageUrl => ({url: path, path, queryString: ''});

        it('imageUrl, mediaUrl and attachmentUrl prepend the media base URL to path and queryString', () => {
            expect(urls.imageUrl(image)).toEqual('http://localhost:8080/api/media:image/hmdb/id:fp/width-500/photo.jpg');
            expect(urls.mediaUrl(attachment('?download'))).toEqual('http://localhost:8080/api/media:attachment/hmdb/id:fp/file.pdf?download');
            expect(urls.attachmentUrl(attachment(''))).toEqual('http://localhost:8080/api/media:attachment/hmdb/id:fp/file.pdf');
        });

        it('media functions pass undefined through', () => {
            expect(urls.imageUrl(undefined)).toBeUndefined();
            expect(urls.mediaUrl(null)).toBeUndefined();
        });

        it('pageUrl prefixes non-default locales, appends the query string and accepts a bare path', () => {
            const en = {locale: 'en', defaultLocale: 'en'};
            const no = {locale: 'no', defaultLocale: 'en'};
            expect(urls.pageUrl(page('/persons/lea'), en)).toEqual('/persons/lea');
            expect(urls.pageUrl(page('/persons/lea'), no)).toEqual('/no/persons/lea');
            expect(urls.pageUrl(page(''), en)).toEqual('/');
            expect(urls.pageUrl({path: '/'}, no)).toEqual('/no');
            expect(urls.pageUrl({path: '/persons/lea', queryString: '?a=1'}, no)).toEqual('/no/persons/lea?a=1');
            expect(urls.pageUrl({path: '/persons/lea'}, {locale: 'en'})).toEqual('/en/persons/lea');
            expect(urls.pageUrl(undefined, no)).toBeUndefined();
        });
    });
});
