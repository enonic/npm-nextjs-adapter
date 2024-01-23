import {afterEach, beforeEach, describe, expect, jest, test as it} from '@jest/globals';
import {ENONIC_API, ENONIC_APP_NAME, ENONIC_PROJECTS} from '../constants';


globalThis.console = {
    error: console.error,
    // error: jest.fn(),
    warn: jest.fn(),
    log: jest.fn(),
    info: jest.fn(),
    debug: jest.fn(),
} as unknown as Console;


const OLD_ENV = process.env;


describe('guillotine', () => {

    beforeEach(() => {
        jest.replaceProperty(process, 'env', {
            ...OLD_ENV,
            ENONIC_API,
            ENONIC_APP_NAME,
            ENONIC_PROJECTS
        });
        jest.spyOn(globalThis, 'fetch').mockImplementation((input, init = {}) => {
            // console.error('fetch input', input, 'init', init);
            const {body} = init;
            // console.error('fetch init body', body);
            const parsedBody = JSON.parse(body as string);
            // console.error('fetch init body parsedBody', parsedBody);
            const {query, variables} = parsedBody;
            // console.error('fetch init body parsedBody query', query);
            // console.error('fetch init body parsedBody variables', variables);
            const {count} = variables;
            const queryDsl: {
                _name: string,
                _path: string,
                site?: {
                    _name: string
                }
            }[] = [{
                _name: 'site',
                _path: '/site',
                site: {
                    _name: 'site'
                }
            }];
            if (count !== 1) {
                queryDsl.push({
                    _name: '2-column-test',
                    _path: '/site/playground/2-column-test',
                    site: {
                        _name: 'site'
                    }
                });
                queryDsl.push({
                    _name: 'no-site-leading-slash-test',
                    _path: '/no-site/leading-slash-test'
                });
                queryDsl.push({
                    _name: 'no-leading-slash-test',
                    _path: 'no-site/no-leading-slash-test'
                });
            }
            const guillotine = {
                queryDsl
            };
            return Promise.resolve({
                json: () => Promise.resolve({
                    data: {
                        guillotine
                    }
                }),
                text: () => Promise.resolve(JSON.stringify({
                    guillotine
                })),
                ok: true,
                status: 200
            } as Response);
        });
    });

    afterEach(() => {
        jest.resetModules();
        jest.restoreAllMocks(); // Restores all mocks and replaced properties back to their original value.
    });

    describe('fetchContentPathsForAllLocales', () => {
        it('works with just path', () => {
            const path = '/HAS_NO_EFFECT_SINCE_RESPONSE_IS_MOCKED';
            import('../../src').then((moduleName) => {
                expect(moduleName.fetchContentPathsForAllLocales(path))
                    .resolves.toEqual([{
                    "contentPath": [""],
                    "locale": "en"
                }, {
                    "contentPath": ["playground", "2-column-test"],
                    "locale": "en"
                }, {
                    "contentPath": ["no-site", "leading-slash-test"],
                    "locale": "en"
                }, {
                    "contentPath": ["no-site", "no-leading-slash-test"],
                    "locale": "en"
                }, {
                    "contentPath": [""],
                    "locale": "no"
                }, {
                    "contentPath": ["playground", "2-column-test"],
                    "locale": "no"
                }, {
                    "contentPath": ["no-site", "leading-slash-test"],
                    "locale": "no"
                }, {
                    "contentPath": ["no-site", "no-leading-slash-test"],
                    "locale": "no"
                }]);
            });
        });
        it('works with query and countPerLocale', () => {
            const query = `query ($count: Int) {
    guillotine {
        queryDsl(
            first: $count,
            sort: {
                field: "modifiedTime",
                direction: DESC
            }
            query: {boolean: {mustNot: [
                {in: {field: "type", stringValues: ["base:folder", "base:shortcut"]}}
                {like: {field: "type", value: "media:*"}}
                {like: {field: "_path", value: "*/_*"}}
            ]}}
        ) {
            _name
            _path
            site {_name}
        }
    }
}`;
            const path = '/HAS_NO_EFFECT_SINCE_RESPONSE_IS_MOCKED';
            const countPerLocale = 1;
            import('../../src').then((moduleName) => {
                expect(moduleName.fetchContentPathsForAllLocales(
                    path, query, countPerLocale
                )).resolves.toEqual([{
                    "contentPath": [""],
                    "locale": "en"
                }, {
                    "contentPath": [""],
                    "locale": "no"
                }]);
            });
        });
    });
});
