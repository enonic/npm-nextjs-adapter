import type {FetchOptions, ProjectLocaleConfig} from '../../src/types';


import {afterEach, beforeEach, describe, expect, jest, test as it} from '@jest/globals';
import {SpiedFunction} from 'jest-mock';
import {ENV_VARS} from '../../src/common/constants';
import {setupServerEnv} from '../constants';


globalThis.console = {
    // error: console.error,
    error: jest.fn(),
    warn: jest.fn(),
    log: jest.fn(),
    info: jest.fn(),
    debug: jest.fn(),
} as unknown as Console;


const QUERY = `{
    guillotine {
        query(first: 1) {
            valid
        }
    }
}`;

const FETCH_GUILLOTINE_PARAMS_VALID: [
    string,
    ProjectLocaleConfig,
    FetchOptions?,
] = [
    'http://localhost:8080/site/enonic-homepage/master',
    {
        default: true,
        project: 'enonic-homepage',
        site: 'enonic-homepage',
        locale: 'en'
    },
    {
        cache: 'no-store',
        next: {
            revalidate: false,
            tags: ['tag1', 'tag2'],
        },
        headers: {
            'test-header': 'test-value',
        },
        body: {
            query: QUERY,
            variables: {
                // key: 'value'
            }
        },
    }
];


describe('guillotine', () => {
    // beforeAll(() => {});

    let fetchMock: SpiedFunction<typeof fetch>;

    beforeEach(() => {
        setupServerEnv({
            [ENV_VARS.MAPPINGS]: 'en:enonic-homepage/enonic-homepage'
        });
        fetchMock = jest.spyOn(globalThis, 'fetch').mockImplementation((input, init = {}) => {
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
        jest.resetAllMocks();
        jest.resetModules();
    });

    // afterAll(() => {});

    describe('fetchGuillotine', () => {
        it('fetches a response from guillotine', async () => {
            await import('../../src/server').then((moduleName) => {
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


        it('handles variables = undefined', async () => {
            const [contentApiUrl, projectConfig, options] = Object.create(FETCH_GUILLOTINE_PARAMS_VALID);
            const opts = Object.create(options);
            delete opts.body.variables;

            await import('../../src/server').then((moduleName) => {
                moduleName.fetchGuillotine(contentApiUrl, projectConfig, opts).then((result) => {
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

        it('returns an error when res.json() = []', async () => {
            jest.spyOn(globalThis, 'fetch').mockImplementation((input, init = {}) => {
                const array = [];
                return Promise.resolve({
                    json: () => Promise.resolve(array),
                    text: () => Promise.resolve(JSON.stringify(array)),
                    ok: true,
                    status: 200
                } as Response);
            });
            await import('../../src/server').then((moduleName) => {
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

        it('handles variables with path', async () => {
            const [contentApiUrl, projectConfig, options] = FETCH_GUILLOTINE_PARAMS_VALID;

            const opts = {
                ...options,
                body: {
                    query: QUERY,
                    variables: {
                        path: '/HAS_NO_EFFECT_SINCE_RESPONSE_IS_MOCKED'
                    }
                }
            };

            await import('../../src/server').then((moduleName) => {
                moduleName.fetchGuillotine(contentApiUrl, projectConfig, opts).then((result) => {
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

        it('returns an error when query is not a string', async () => {
            const [contentApiUrl, projectConfig, options] = FETCH_GUILLOTINE_PARAMS_VALID;

            const opts = {
                ...options,
                body: {
                    query: true as unknown as string,
                    variables: {},
                }
            };

            await import('../../src/server').then((moduleName) => {
                moduleName.fetchGuillotine(contentApiUrl, projectConfig, opts).then((result) => {
                    expect(result).toEqual({
                        error: {
                            code: '400',
                            message: 'Invalid or missing query. JSON.stringify(query) = true'
                        }
                    });
                });
            });
        });

        it('returns an error when query is an empty string', async () => {
            const [contentApiUrl, projectConfig, options] = FETCH_GUILLOTINE_PARAMS_VALID;

            const opts = {
                ...options,
                body: {
                    query: '',
                    variables: {},
                }
            };

            await import('../../src/server').then(async (moduleName) => {
                let result = await moduleName.fetchGuillotine(contentApiUrl, projectConfig, opts);
                return expect(result).toEqual({
                    error: {
                        code: '400',
                        message: 'Invalid or missing query. JSON.stringify(query) = ""'
                    }
                });
            });
        });

        it('ensures json.errors is always an array', async () => {
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

            await import('../../src/server').then((moduleName) => {
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

        it('returns a nice error when fetch throws', async () => {
            jest.spyOn(globalThis, 'fetch').mockImplementation(() => {
                throw new Error('fetch error');
            });
            await import('../../src/server').then((moduleName) => {
                expect(moduleName.fetchGuillotine(...FETCH_GUILLOTINE_PARAMS_VALID)).resolves.toEqual({
                    error: {
                        code: 'API',
                        message: 'fetch error'
                    }
                });
            });
        });

        it('returns a nice error when fetch response not ok', async () => {
            jest.spyOn(globalThis, 'fetch').mockImplementation(() => {
                return Promise.resolve({
                    json: () => Promise.resolve({}),
                    text: () => Promise.resolve('Internal server error'),
                    ok: false,
                    status: 500
                } as Response);
            });
            await import('../../src/server').then((moduleName) => {
                expect(moduleName.fetchGuillotine(...FETCH_GUILLOTINE_PARAMS_VALID)).resolves.toEqual({
                    error: {
                        code: 500,
                        message: "Data fetching failed (message: 'Internal server error')"
                    }
                });
            });
        });

        it('returns a nice error when fetch response is not json', async () => {
            jest.spyOn(globalThis, 'fetch').mockImplementation(() => {
                return Promise.resolve({
                    text: () => Promise.resolve('Could this ever happen? I guess if endpoint url is wrong?'),
                    ok: true,
                    status: 200
                } as Response);
            });
            await import('../../src/server').then((moduleName) => {
                expect(moduleName.fetchGuillotine(...FETCH_GUILLOTINE_PARAMS_VALID)).resolves.toEqual({
                    error: {
                        code: 500,
                        message: 'API call completed but with non-JSON data: "Could this ever happen? I guess if endpoint url is wrong?"'
                    }
                });
            });
        });

        it('returns a nice error when fetch response is empty', async () => {
            jest.spyOn(globalThis, 'fetch').mockImplementation(() => {
                return Promise.resolve({
                    json: () => Promise.resolve(),
                    text: () => Promise.resolve('Could this ever happen?'),
                    ok: true,
                    status: 200
                } as Response);
            });
            await import('../../src/server').then((moduleName) => {
                expect(moduleName.fetchGuillotine(...FETCH_GUILLOTINE_PARAMS_VALID)).resolves.toEqual({
                    error: {
                        code: 500,
                        message: 'API call completed but with unexpectedly empty data: "Could this ever happen?"'
                    }
                });
            });
        });

        it("passes cache and next options and add headers", async () => {

            const [contentApiUrl, projectConfig, options] = FETCH_GUILLOTINE_PARAMS_VALID;

            const opts = Object.create(options);
            delete opts.headers;

            await import('../../src/server').then((moduleName) => {
                moduleName.fetchGuillotine(contentApiUrl, projectConfig, opts).then((result) => {

                    const [url, opts] = fetchMock.mock.lastCall;

                    expect(opts.cache).toEqual('no-store');
                    expect((opts as FetchOptions).next).toEqual({
                        revalidate: false,
                        tags: ['tag1', 'tag2'],
                    })
                    const headers = opts.headers as Headers;
                    expect(headers).toBeTruthy();
                    expect(headers.get('X-Guillotine-SiteKey')).toEqual('enonic-homepage');
                    expect(headers.get('Content-Type')).toEqual('application/json');
                    expect(headers.get('Accept')).toEqual('application/json');

                });
            });
        });

        it("does not allow to override X-Guillotine-SiteKey header only", async () => {

            const [contentApiUrl, projectConfig, options] = FETCH_GUILLOTINE_PARAMS_VALID;

            const opts = {
                ...options,
                headers: {
                    'X-Guillotine-SiteKey': 'should-not-be-applied',
                    'Content-Type': 'text/plain',
                    'Accept': 'text/plain',
                }
            };

            await import('../../src/server').then((moduleName) => {
                moduleName.fetchGuillotine(contentApiUrl, projectConfig, opts).then((result) => {

                    const [url, opts] = fetchMock.mock.lastCall;

                    const headers = opts.headers as Headers;
                    expect(headers).toBeTruthy();
                    expect(headers.get('X-Guillotine-SiteKey')).toEqual('enonic-homepage');
                    expect(headers.get('Content-Type')).toEqual('text/plain');
                    expect(headers.get('Accept')).toEqual('text/plain');

                });
            });
        });

        // THIS NEEDS TO GO LAST BECAUSE THIS MOCK AFFECTS OTHER TESTS
        it("returns a nice error when error.message can't be JSON parsed", async () => {
            const fetchFromApi = jest.fn(async () => {
                throw new Error('not json parseable');
            });
            jest.mock<typeof import('../../src/guillotine/fetchFromApi')>(
                '../../src/guillotine/fetchFromApi', () => ({fetchFromApi})
            );
            await import('../../src/server').then((moduleName) => {
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
