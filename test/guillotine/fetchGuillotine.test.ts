import type {
    ContentApiBaseBody,
    ProjectLocaleConfig
} from '../../src/types';


import {
    beforeEach,
    describe,
    expect,
    jest,
    test as it
} from '@jest/globals';
import { afterEach } from 'node:test';


globalThis.console = {
    // error: console.error,
    error: jest.fn(),
    warn: jest.fn(),
    log: jest.fn(),
    info: jest.fn(),
    debug: jest.fn(),
} as unknown as Console;


const ENONIC_APP_NAME = 'com.enonic.web.enonic.com';

const QUERY = `{
    guillotine {
        query(first: 1) {
            valid
        }
    }
}`;

const FETCH_GUILLOTINE_PARAMS_VALID: [
    string,
    ContentApiBaseBody,
    ProjectLocaleConfig,
    {}
] = [
    'http://localhost:8080/site/enonic-homepage/master',
    {
        query: QUERY,
        variables: {
            // key: 'value'
        }
    },
    {
        default: true,
        project: 'enonic-homepage',
        site: 'enonic-homepage',
        locale: 'en'
    },
    {
        // headerKey: 'headerValue'
    }
];

const OLD_ENV = process.env;


describe('guillotine', () => {
    // beforeAll(() => {});

    beforeEach(() => {
        jest.replaceProperty(process, 'env', {
            ...OLD_ENV,
            // ENONIC_API_TOKEN: '1234567890',
            ENONIC_API: 'http://localhost:8080/site',
            ENONIC_APP_NAME,
            ENONIC_PROJECTS: 'en:enonic-homepage/enonic-homepage'
        });
        jest.spyOn(globalThis, 'fetch').mockImplementation((input, init = {}) => {
            // console.debug('fetch', input, init);
            const guillotine = {
                query: [{
                    valid: true
                }]
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
    }); // beforeEach

    afterEach(() => {
        jest.resetModules();
        jest.restoreAllMocks(); // Restores all mocks and replaced properties back to their original value.
    });

    // afterAll(() => {});

    describe('fetchGuillotine', () => {
        it('fetches a response from guillotine', () => {
            import('../../src').then((moduleName) => {
                moduleName.fetchGuillotine(...FETCH_GUILLOTINE_PARAMS_VALID).then((result) => {
                    expect(result).toEqual({
                        guillotine: {
                            query: [{
                                valid: true
                            }]
                        }
                    });
                });
            });
        });

        it('handles variables = undefined', () => {
            const [contentApiUrl, body, projectConfig, headers] = [
                FETCH_GUILLOTINE_PARAMS_VALID[0],
                {
                    query: QUERY
                },
                FETCH_GUILLOTINE_PARAMS_VALID[2],
                FETCH_GUILLOTINE_PARAMS_VALID[3],
            ]
            import('../../src').then((moduleName) => {
                moduleName.fetchGuillotine(contentApiUrl, body, projectConfig, headers).then((result) => {
                    expect(result).toEqual({
                        guillotine: {
                            query: [{
                                valid: true
                            }]
                        }
                    });
                });
            });
        });

        it('returns an error when res.json() = []', () => {
            jest.spyOn(globalThis, 'fetch').mockImplementation((input, init = {}) => {
                const array = [];
                return Promise.resolve({
                    json: () => Promise.resolve(array),
                    text: () => Promise.resolve(JSON.stringify(array)),
                    ok: true,
                    status: 200
                } as Response);
            });
            import('../../src').then((moduleName) => {
                moduleName.fetchGuillotine(...FETCH_GUILLOTINE_PARAMS_VALID).then((result) => {
                    expect(result).toEqual({
                        error: {
                            code: 500,
                            message: 'API call completed but with unexpected array data: []'
                        }
                    });
                });
            });
        });

        it('handles variables with path', () => {
            const [contentApiUrl, body, projectConfig, headers] = [
                FETCH_GUILLOTINE_PARAMS_VALID[0],
                {
                    query: QUERY,
                    variables: {
                        path: '/HAS_NO_EFFECT_SINCE_RESPONSE_IS_MOCKED'
                    }
                },
                FETCH_GUILLOTINE_PARAMS_VALID[2],
                FETCH_GUILLOTINE_PARAMS_VALID[3],
            ]
            import('../../src').then((moduleName) => {
                moduleName.fetchGuillotine(contentApiUrl, body, projectConfig, headers).then((result) => {
                    expect(result).toEqual({
                        guillotine: {
                            query: [{
                                valid: true
                            }]
                        }
                    });
                });
            });
        });

        it('returns an error when query is not a string', () => {
            const [contentApiUrl, body, projectConfig, headers] = [
                FETCH_GUILLOTINE_PARAMS_VALID[0],
                {
                    query: true as unknown as string,
                    variables: {}
                },
                FETCH_GUILLOTINE_PARAMS_VALID[2],
                FETCH_GUILLOTINE_PARAMS_VALID[3]
            ]
            import('../../src').then((moduleName) => {
                moduleName.fetchGuillotine(contentApiUrl, body, projectConfig, headers).then((result) => {
                    expect(result).toEqual({
                        error: {
                            code: '400',
                            message: 'Invalid or missing query. JSON.stringify(query) = true'
                        }
                    });
                });
            });
        });

        it('returns an error when query is an empty string', () => {
            const [contentApiUrl, body, projectConfig, headers] = [
                FETCH_GUILLOTINE_PARAMS_VALID[0],
                {
                    query: '',
                    variables: {}
                },
                FETCH_GUILLOTINE_PARAMS_VALID[2],
                FETCH_GUILLOTINE_PARAMS_VALID[3],
            ]
            import('../../src').then((moduleName) => {
                moduleName.fetchGuillotine(contentApiUrl, body, projectConfig, headers).then((result) => {
                    expect(result).toEqual({
                        error: {
                            code: '400',
                            message: 'Invalid or missing query. JSON.stringify(query) = ""'
                        }
                    });
                });
            });
        });

        it('ensures json.errors is always an array', () => {
            jest.spyOn(globalThis, 'fetch').mockImplementation((input, init = {}) => {
                const json = {
                    errors: 'Single string error'
                };
                return Promise.resolve({
                    json: () => Promise.resolve(json),
                    text: () => Promise.resolve(JSON.stringify(json)),
                    ok: true,
                    status: 200
                } as Response);
            });
            import('../../src').then((moduleName) => {
                moduleName.fetchGuillotine(...FETCH_GUILLOTINE_PARAMS_VALID).then((result) => {
                    expect(result).toEqual({
                        error: {
                            code: '500',
                            message: 'Server responded with 1 error(s), probably from guillotine - see log.'
                        }
                    });
                });
            });
        });

        it('returns a nice error when fetch throws', () => {
            jest.spyOn(globalThis, 'fetch').mockImplementation(() => {
                throw new Error('fetch error');
            });
            import('../../src').then((moduleName) => {
                expect(moduleName.fetchGuillotine(...FETCH_GUILLOTINE_PARAMS_VALID)).resolves.toEqual({
                    error: {
                        code: 'API',
                        message: 'fetch error'
                    }
                });
            });
        });

        it('returns a nice error when fetch response not ok', () => {
            jest.spyOn(globalThis, 'fetch').mockImplementation(() => {
                return Promise.resolve({
                    json: () => Promise.resolve({}),
                    text: () => Promise.resolve('Internal server error'),
                    ok: false,
                    status: 500
                } as Response);
            });
            import('../../src').then((moduleName) => {
                expect(moduleName.fetchGuillotine(...FETCH_GUILLOTINE_PARAMS_VALID)).resolves.toEqual({
                    error: {
                        code: 500,
                        message: "Data fetching failed (message: 'Internal server error')"
                    }
                });
            });
        });

        it('returns a nice error when fetch response is not json', () => {
            jest.spyOn(globalThis, 'fetch').mockImplementation(() => {
                return Promise.resolve({
                    text: () => Promise.resolve('Could this ever happen? I guess if endpoint url is wrong?'),
                    ok: true,
                    status: 200
                } as Response);
            });
            import('../../src').then((moduleName) => {
                expect(moduleName.fetchGuillotine(...FETCH_GUILLOTINE_PARAMS_VALID)).resolves.toEqual({
                    error: {
                        code: 500,
                        message: 'API call completed but with non-JSON data: "Could this ever happen? I guess if endpoint url is wrong?"'
                    }
                });
            });
        });

        it('returns a nice error when fetch response is empty', () => {
            jest.spyOn(globalThis, 'fetch').mockImplementation(() => {
                return Promise.resolve({
                    json: () => Promise.resolve(),
                    text: () => Promise.resolve('Could this ever happen?'),
                    ok: true,
                    status: 200
                } as Response);
            });
            import('../../src').then((moduleName) => {
                expect(moduleName.fetchGuillotine(...FETCH_GUILLOTINE_PARAMS_VALID)).resolves.toEqual({
                    error: {
                        code: 500,
                        message: 'API call completed but with unexpectedly empty data: "Could this ever happen?"'
                    }
                });
            });
        });

        it("returns a nice error when error.message can't be JSON parsed", () => {
            const fetchFromApi = jest.fn(async () => {
                throw new Error('not json parseable');
            });
            jest.resetModules(); // Required or next line wont work
            jest.doMock<typeof import('../../src/guillotine/fetchFromApi')>(
                '../../src/guillotine/fetchFromApi', () => ({fetchFromApi})
            );
            import('../../src').then((moduleName) => {
                expect(moduleName.fetchGuillotine(...FETCH_GUILLOTINE_PARAMS_VALID)).resolves.toEqual({
                    error: {
                        code: 'Client-side error',
                        message: 'not json parseable'
                    }
                });
                expect(fetchFromApi.mock.calls).toHaveLength(1);
            });
        });
    }); // fetchGuillotine
});