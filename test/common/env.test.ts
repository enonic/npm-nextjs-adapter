import {describe, expect, jest, test as it} from '@jest/globals';
import {setupServerEnv} from '../constants';


async function loadEnv(overrides: Record<string, string> = {}) {
    jest.resetModules();
    setupServerEnv(overrides);
    return import('../../src/common/env');
}

describe('common', () => {
    describe('env', () => {
        it('derives the Guillotine URL from the API root and the default descriptor', async () => {
            const env = await loadEnv();
            expect(env.API_URL).toEqual('http://localhost:8080/api');
            expect(env.GUILLOTINE_URL).toEqual('http://localhost:8080/api/com.enonic.app.guillotine:graphql');
        });

        it('strips slashes when joining a custom GUILLOTINE_API', async () => {
            const env = await loadEnv({ENONIC_API: 'http://localhost:8080/api/', GUILLOTINE_API: '/my.app:graphql/'});
            expect(env.GUILLOTINE_URL).toEqual('http://localhost:8080/api/my.app:graphql');
        });

        it('defaults the media URL to the API root and honours ENONIC_MEDIA_CDN', async () => {
            expect((await loadEnv()).MEDIA_URL).toEqual('http://localhost:8080/api');
            expect((await loadEnv({ENONIC_MEDIA_CDN: 'https://cdn.example.com/api/'})).MEDIA_URL).toEqual('https://cdn.example.com/api');
        });
    });
});
