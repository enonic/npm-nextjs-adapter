import type {Context} from '../../src/types';

import {
    afterAll,
    // beforeAll,
    // beforeEach,
    describe,
    expect,
    jest,
    test as it
} from '@jest/globals';
import {ENONIC_APP_NAME} from '../constants';


describe('utils', () => {
    const OLD_ENV = process.env;

    afterAll(() => {
        process.env = OLD_ENV; // Restore old environment
    });

    describe('setJsessionCookieHeader', () => {
        it('overwrite the Cookie request header with jsessionid', () => {
            jest.resetModules();
            process.env = {
                ...OLD_ENV,
                ENONIC_APP_NAME
            };
            import('../../src/utils/setJsessionCookieHeader').then((moduleName) => {
                const headers = {
                    Cookie: 'name=value; name2=value2; name3=value3'
                };
                const context: Context = {
                    headers: {
                        get(name: string) {
                            if (name === 'jsessionid') {
                                return '1234';
                            }
                            console.error('headers get name', name);
                        }
                    },
                } as Context;
                expect(moduleName.setJsessionCookieHeader(headers, context)).toBe(undefined);
                expect(headers).toEqual({
                    'Cookie': 'jsessionid=1234'
                });
            });
        });

        it('does nothing when jsessionid is missing in context headers', () => {
            jest.resetModules();
            process.env = {
                ...OLD_ENV,
                ENONIC_APP_NAME
            };
            import('../../src/utils/setJsessionCookieHeader').then((moduleName) => {
                const headers = {
                    Cookie: 'name=value; name2=value2; name3=value3'
                };
                const context: Context = {
                    // headers: {
                    //     get(name: string) {
                    //         if (name === 'jsessionid') {
                    //             return undefined
                    //         }
                    //         console.error('headers get name', name);
                    //     }
                    // },
                } as Context;
                expect(moduleName.setJsessionCookieHeader(null, context)).toBe(undefined);
                expect(headers).toEqual({
                    'Cookie': 'name=value; name2=value2; name3=value3'
                });
            });
        });

        it('does nothing when jsessionid is missing in context headers', () => {
            jest.resetModules();
            process.env = {
                ...OLD_ENV,
                ENONIC_APP_NAME
            };
            import('../../src/utils/setJsessionCookieHeader').then((moduleName) => {
                const headers = {
                    Cookie: 'name=value; name2=value2; name3=value3'
                };
                const context: Context = {
                    headers: {
                        get(name: string) {
                            if (name === 'jsessionid') {
                                return undefined
                            }
                            console.error('headers get name', name);
                        }
                    },
                } as Context;
                expect(moduleName.setJsessionCookieHeader(headers, context)).toBe(undefined);
                expect(headers).toEqual({
                    'Cookie': 'name=value; name2=value2; name3=value3'
                });
            });
        });

    }); // describe setJsessionCookieHeader
}); // describe utils