import type {FetchContentResult, ProjectLocaleConfig, Result} from '../../src/types';


import {
    beforeAll as beforeAllTestsInThisDescribe,
    describe,
    expect,
    jest,
    test as it
} from '@jest/globals';
import {fetchContentData} from '../../src/guillotine/fetchContentData';
import {RENDER_MODE, XP_REQUEST_TYPE} from '../../src/common/constants';


const FETCH_CONTENT_RESULT: FetchContentResult = {
    data: {
        guillotine: {
            get: {
                _path: '/site/site-name',
            }
        }
    },
    common: null, // {},
    meta: {
        apiUrl: 'apiUrl',
        baseUrl: 'baseUrl',
        canRender: true,
        catchAll: false,
        defaultLocale: 'defaultLocale',
        locale: 'locale',
        path: 'path',
        renderMode: RENDER_MODE.NEXT,
        requestType: XP_REQUEST_TYPE.PAGE,
        type: 'type',
    },
    page: null
};


describe('guillotine', () => {

    beforeAllTestsInThisDescribe((done) => {
        jest.spyOn(globalThis, 'fetch').mockImplementation((url, init = {}) => {
            const result: FetchContentResult|Result = {...FETCH_CONTENT_RESULT}; // deref
            return Promise.resolve({
                json: () => Promise.resolve(result),
                text: () => Promise.resolve(JSON.stringify(result.error || result['data'] )),
                ok: true,
                status: 200
            } as Response);
        });
        done();
    }); // beforeAllTestsInThisDescribe

    describe('fetchContentData', () => {
        it('should return an error when query is empty', () => {
            const contentApiUrl = 'http://localhost:8080/site/site-name/master';
            const xpContentPath = '/xpContentPath'
            const projectConfig: ProjectLocaleConfig = {
                default: true,
                project: 'project',
                site: 'site',
                locale: 'locale',
            };
            const query = '';
            // const variables = undefined;
            // const headers = undefined;
            expect(fetchContentData(
                contentApiUrl, xpContentPath, projectConfig, query
            )).resolves.toEqual({
                error: {
                    code: '400',
                    message: 'Invalid or missing query. JSON.stringify(query) = ""'
                }
            });
        });

        it('should return an error when query is empty', () => {
            const contentApiUrl = 'http://localhost:8080/site/site-name/master';
            const xpContentPath = '/xpContentPath'
            const projectConfig: ProjectLocaleConfig = {
                default: true,
                project: 'project',
                site: 'site-name',
                locale: 'locale',
            };
            const query = 'query($path:ID!) { guillotine { get(key:$path) { _path } } }';
            const variables = {
                path: '/site-name'
            };
            // const headers = undefined;
            expect(fetchContentData(
                contentApiUrl, xpContentPath, projectConfig, query, variables
            )).resolves.toEqual({
                contents: [FETCH_CONTENT_RESULT?.data?.guillotine]
            });
        });
    }); // describe fetchContentData
}); // describe guillotine