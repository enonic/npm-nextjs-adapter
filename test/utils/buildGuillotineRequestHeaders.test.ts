import type {Context} from '../../src/types';

import {afterAll, describe, expect, jest, test as it} from '@jest/globals';
import {ENONIC_APP_NAME} from '../constants';


describe('utils', () => {
    const OLD_ENV = process.env;

    afterAll(() => {
        process.env = OLD_ENV; // Restore old environment
    });

    describe('buildGuillotineRequestHeaders', () => {
        it('adds Cookie header with jsessionid, when jsessionid present in context headers', () => {
            jest.resetModules();
            process.env = {
                ...OLD_ENV,
                ENONIC_API: 'http://localhost:8080/site',
                ENONIC_APP_NAME
            };
            import('../../src/utils/buildGuillotineRequestHeaders').then((moduleName) => {
                const context: Context = {
                    headers: {
                        get(name: string) {
                            if (name === 'jsessionid') {
                                return '1234';
                            }
                            console.error('headers get name', name);
                        }
                    }
                } as Context;
                expect(moduleName.buildGuillotineRequestHeaders({
                    context,
                    defaultLocale: 'en',
                    locale: 'en',
                    locales: ['en', 'no']
                })).toEqual({
                    'Cookie': 'jsessionid=1234',
                    'default-locale': 'en',
                    locale: 'en',
                    locales: '["en","no"]'
                });
            });
        });

        it('set locale headers even when jsessionid not present in context headers', () => {
            jest.resetModules();
            process.env = {
                ...OLD_ENV,
                ENONIC_API: 'http://localhost:8080/site',
                ENONIC_APP_NAME
            };
            import('../../src/utils/buildGuillotineRequestHeaders').then((moduleName) => {
                const context: Context = {
                    headers: {
                        get(name: string) {
                            if (name === 'jsessionid') {
                                return undefined;
                            }
                            console.error('headers get name', name);
                        }
                    }
                } as Context;
                expect(moduleName.buildGuillotineRequestHeaders({
                    context,
                    defaultLocale: 'en',
                    locale: 'en',
                    locales: ['en', 'no']
                })).toEqual({
                    'default-locale': 'en',
                    locale: 'en',
                    locales: '["en","no"]'
                });
            });
        });

        it('handles context without headers', () => {
            jest.resetModules();
            process.env = {
                ...OLD_ENV,
                ENONIC_API: 'http://localhost:8080/site',
                ENONIC_APP_NAME
            };
            import('../../src/utils/buildGuillotineRequestHeaders').then((moduleName) => {
                const context: Context = {} as Context;
                expect(moduleName.buildGuillotineRequestHeaders({
                    context,
                    defaultLocale: 'en',
                    locale: 'en',
                    locales: ['en', 'no']
                })).toEqual({
                    'default-locale': 'en',
                    locale: 'en',
                    locales: '["en","no"]'
                });
            });
        });
    }); // describe buildGuillotineRequestHeaders
}); // describe utils
