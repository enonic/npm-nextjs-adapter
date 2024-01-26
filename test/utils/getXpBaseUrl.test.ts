import type {Context} from '../../src/types';


import {
    afterAll,
    describe,
    expect,
    jest,
    test as it
} from '@jest/globals';
import {XP_BASE_URL_HEADER} from '../../src/common/constants';
import {ENONIC_APP_NAME} from '../constants';


describe('utils', () => {
    const OLD_ENV = process.env;

    afterAll(() => {
        process.env = OLD_ENV; // Restore old environment
    });

    describe('getXpBaseUrl', () => {
        it('replaces edit with inline', () => {
            jest.resetModules();
            process.env = {
                ...OLD_ENV,
                ENONIC_API: 'http://localhost:8080/site',
                ENONIC_APP_NAME
            };
            import('../../src/utils/getXpBaseUrl').then((moduleName) => {
                const context: Context = {
                    headers: {
                        get(name: string) {
                            if (name === XP_BASE_URL_HEADER) {
                                return '/whatnot/edit/1234';
                            }
                            console.error('headers get name', name);
                        }
                    },
                } as Context;
                expect(moduleName.getXpBaseUrl(context)).toEqual('/whatnot/inline/1234');
            });
        });

        it('returns / when context has no headers', () => {
            jest.resetModules();
            process.env = {
                ...OLD_ENV,
                ENONIC_API: 'http://localhost:8080/site',
                ENONIC_APP_NAME
            };
            import('../../src/utils/getXpBaseUrl').then((moduleName) => {
                const context: Context = {} as Context;
                expect(moduleName.getXpBaseUrl(context)).toEqual('/');
            });
        });

        it('returns / when context has no xpbaseurl header', () => {
            jest.resetModules();
            process.env = {
                ...OLD_ENV,
                ENONIC_API: 'http://localhost:8080/site',
                ENONIC_APP_NAME
            };
            import('../../src/utils/getXpBaseUrl').then((moduleName) => {
                const context: Context = {
                    headers: {
                        get(name: string) {
                            if (name === XP_BASE_URL_HEADER) {
                                return undefined;
                            }
                            console.error('headers get name', name);
                        }
                    },
                } as Context;
                expect(moduleName.getXpBaseUrl(context)).toEqual('/');
            });
        });
    });
});