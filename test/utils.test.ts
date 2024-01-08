import type {Context} from '../src/utils';

import {
    afterAll,
    // beforeAll,
    // beforeEach,
    describe,
    expect,
    jest,
    test as it
} from '@jest/globals';

const ENONIC_APP_NAME = 'com.enonic.app.enonic';

describe('utils', () => {
    const OLD_ENV = process.env;

    afterAll(() => {
        process.env = OLD_ENV; // Restore old environment
    });

    describe('APP_NAME', () => {
        it('returns process.env.ENONIC_APP_NAME', () => {
            jest.resetModules();
            process.env = {
                ...OLD_ENV,
                ENONIC_APP_NAME
            };
            import('../src/utils').then((moduleName) => {
                expect(moduleName.APP_NAME).toEqual('com.enonic.app.enonic');
            });
        });

        it('returns process.env.NEXT_PUBLIC_ENONIC_APP_NAME (when ENONIC_APP_NAME is not set)', () => {
            jest.resetModules();
            process.env = {
                ...OLD_ENV,
                NEXT_PUBLIC_ENONIC_APP_NAME: 'com.enonic.app.next-public'
            };
            import('../src/utils').then((moduleName) => {
                expect(moduleName.APP_NAME).toEqual('com.enonic.app.next-public');
            });
        });
    });

    describe('getProjectLocaleConfigs', () => {
        it('throws when default-language is missing from any project', () => {
            jest.resetModules();
            process.env = {
                ...OLD_ENV,
                ENONIC_APP_NAME,
                ENONIC_PROJECTS: ',sv:project/site,,prosjekt/omraade,' // NEXT_PUBLIC_ENONIC_PROJECTS
            };
            import('../src/utils').then((moduleName) => {
                expect(() => moduleName.getProjectLocaleConfigs()).toThrow(Error(
                    `Project "prosjekt/omraade" doesn't match format: <default-language>:<default-repository-name>/<default-site-path>,<language>:<repository-name>/<site-path>`
                ));
            });
        });
        it('returns the correct locale configs', () => {
            jest.resetModules();
            process.env = {
                ...OLD_ENV,
                ENONIC_APP_NAME,
                ENONIC_PROJECTS: 'en:project/site,no:prosjekt/omraade' // NEXT_PUBLIC_ENONIC_PROJECTS
            };
            import('../src/utils').then((moduleName) => {
                expect(moduleName.getProjectLocaleConfigs()).toEqual({
                    en: {
                        default: true,
                        locale: 'en',
                        project: 'project',
                        site: '/site',
                    },
                    no: {
                        default: false,
                        locale: 'no',
                        project: 'prosjekt',
                        site: '/omraade',
                    }
                });
            });
        });
    });

    describe('getRenderMode', () => {
        it("returns 'next' when there is no content-studio-mode header in the context", () => {
            jest.resetModules();
            process.env = {
                ...OLD_ENV,
                ENONIC_APP_NAME
            };
            import('../src/utils').then((moduleName) => {
                const context: Context = {
                    headers: {
                        get(name: string) {
                            if (name === 'content-studio-mode') {
                                return undefined;
                            }
                            console.error('headers get name', name);
                        }
                    },
                    // locale: 'en',
                    // contentPath: '/content/path',
                } as Context;
                expect(moduleName.getRenderMode(context)).toEqual('next');
            });
        });
        it('inline', () => {
            jest.resetModules();
            process.env = {
                ...OLD_ENV,
                ENONIC_APP_NAME
            };
            import('../src/utils').then((moduleName) => {
                const context: Context = {
                    headers: {
                        get(name: string) {
                            if (name === 'content-studio-mode') {
                                return 'inline';
                            }
                            console.error('headers get name', name);
                        }
                    },
                    // locale: 'en',
                    // contentPath: '/content/path',
                } as Context;
                expect(moduleName.getRenderMode(context)).toEqual('inline');
            });
        });
    }); // getRenderMode

    describe('getRequestLocaleInfo', () => {
        it('returns correct locale, locales and defaultLocale from ENONIC_PROJECTS and content-studio-project header', () => {
            jest.resetModules() // Most important - it clears the cache
            process.env = {
                ...OLD_ENV,  // Make a copy
                // ENONIC_API: 'http://localhost:8080',
                // ENONIC_API_TOKEN: 'token',
                ENONIC_APP_NAME: 'com.enonic.app.enonic',
                ENONIC_PROJECTS: 'en:moviedb/hmdb,no:film-db/hmdb'
            };
            import('../src/utils').then((moduleName) => {
                const context: Context = {
                    headers: {
                        get(name: string) {
                            if (name === 'accept-language') {
                                return 'sv'; // Doesn't seem to affect anything?
                            }
                            if (name === 'content-studio-project') {
                                return 'film-db';
                            }
                            console.error('headers get name', name);
                        }
                    },
                    locale: 'da',
                    contentPath: '/content/path',
                } as Context;
                expect(moduleName.getRequestLocaleInfo(context)).toEqual({
                    locale: 'no',
                    locales: ['en','no'],
                    defaultLocale: 'en'
                });
            });
        });
    });
});
