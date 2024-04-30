import type {Context} from '../src/types';

import {afterEach, beforeEach, describe, expect, jest, test as it} from '@jest/globals';
import {setupServerEnv} from './constants';
import {ENV_VARS} from '../src/common/constants';


globalThis.console = {
    error: console.error,
    // error: jest.fn(),
    warn: jest.fn(),
    log: jest.fn(),
    info: jest.fn(),
    debug: jest.fn(),
} as unknown as Console;


const OLD_ENV = process.env;


describe('utils', () => {

    beforeEach((done) => {
        setupServerEnv({
            [ENV_VARS.MAPPINGS]: 'en:moviedb/hmdb,no:film-db/omraade'
        });
        done();
    });

    afterEach(() => {
        jest.resetModules();
    });

    describe('fixDoubleSlashes', () => {
        it('returns correct string', () => {

            import('../src/utils/fixDoubleSlashes').then((moduleName) => {
                expect(moduleName.fixDoubleSlashes('/content//path')).toEqual('/content/path');
            });
        });
    });

    describe('getContentApiUrl', () => {
        const TESTS = {
            'edit': 'draft',
            'inline': 'draft',
            'preview': 'draft',
            'live': 'master',
            'admin': 'draft',
            'next': 'master',
        };
        Object.entries(TESTS).forEach(([mode, branch]) => {
            it(`returns correct url with branch ${branch} when mode is ${mode}`, () => {

                import('../src/utils/getContentApiUrl').then((moduleName) => {
                    const context: Context = {
                        headers: {
                            get(name: string) {
                                if (name === 'content-studio-mode') {
                                    return mode;
                                }
                                if (name === 'content-studio-project') {
                                    return 'film-db';
                                }
                                console.error('headers get name', name);
                            }
                        },
                    } as Context;
                    expect(moduleName.getContentApiUrl(context)).toEqual(`http://localhost:8080/site/film-db/${branch}`);
                });
            });
        });
    });

    describe('getLocaleMapping', () => {
        it('returns correct LocaleMapping when content-studio-project is set', () => {

            import('../src/utils/getLocaleMapping').then((moduleName) => {
                const context: Context = {
                    headers: {
                        get(name: string) {
                            if (name === 'accept-language') {
                                return 'no';
                            }
                            if (name === 'content-studio-project') {
                                return 'film-db';
                            }
                            console.error('headers get name', name);
                        }
                    },
                    // contentPath: '/omraade',
                } as Context;
                expect(moduleName.getLocaleMapping(context)).toEqual({
                    default: false,
                    locale: 'no',
                    project: 'film-db',
                    site: '/omraade',
                });
            });
        });
        it('returns correct LocaleMapping when content-studio-project is set', () => {

            setupServerEnv({
                [ENV_VARS.MAPPINGS]: 'en:moviedb/site,no:film-db/omraade'
            });

            import('../src/utils/getLocaleMapping').then((moduleName) => {
                const context: Context = {
                    headers: {
                        get(name: string) {
                            if (name === 'accept-language') {
                                return 'no';
                            }
                            if (name === 'content-studio-project') {
                                return undefined;
                            }
                            console.error('headers get name', name);
                        }
                    },
                    // contentPath: '/omraade',
                } as Context;
                expect(moduleName.getLocaleMapping(context)).toEqual({
                    default: true,
                    locale: 'en',
                    project: 'moviedb',
                    site: '/site',
                });
            });
        });
    }); // describe getLocaleMapping

    describe('getLocaleMappingById', () => {
        it('returns correct LocaleMapping', () => {

            import('../src/utils/getLocaleMappingByProjectId').then((moduleName) => {
                expect(moduleName.getLocaleMappingByProjectId('film-db')).toEqual({
                    default: false,
                    locale: 'no',
                    project: 'film-db',
                    site: '/omraade',
                });
            });
        });

        it('returns default LocaleMapping when projectId param is missing', () => {

            setupServerEnv({
                [ENV_VARS.MAPPINGS]: 'en:moviedb/site,no:film-db/omraade'
            });
            import('../src/utils/getLocaleMappingByProjectId').then((moduleName) => {
                expect(moduleName.getLocaleMappingByProjectId()).toEqual({
                    default: true,
                    locale: 'en',
                    project: 'moviedb',
                    site: '/site',
                });
            });
        });
    }); // describe getLocaleMappingById

    describe('getLocaleMappingByLocale', () => {
        it('returns correct LocaleMapping', () => {

            import('../src/utils/getLocaleMappingByLocale').then((moduleName) => {
                expect(moduleName.getLocaleMappingByLocale('no')).toEqual({
                    default: false,
                    locale: 'no',
                    project: 'film-db',
                    site: '/omraade',
                });
            });
        });
    }); // describe getLocaleMappingByLocale

    describe('getLocaleMappings', () => {
        it('throws when ENONIC_MAPPINGS is missing', () => {

            setupServerEnv({
                [ENV_VARS.MAPPINGS]: undefined
            });

            expect(import('../src/utils/getLocaleMappings')
                .then(moduleName => moduleName.getLocaleMappings()))
                    .rejects.toThrow(Error("Environment variable 'ENONIC_MAPPINGS' is missing (from .env?)"));
            }
        );
        it('throws when default-language is missing from any project', () => {

            setupServerEnv({
                [ENV_VARS.MAPPINGS]: 'sv:project/site,,prosjekt/omraade'
            });

            import('../src/utils/getLocaleMappings').then((moduleName) => {
                expect(() => moduleName.getLocaleMappings()).toThrow(Error(
                    `Project "prosjekt/omraade" doesn't match format: <default-language>:<default-repository-name>/<default-site-path>,<language>:<repository-name>/<site-path>`
                ));
            });
        });
        it('returns the correct locale configs', () => {

            setupServerEnv({
                [ENV_VARS.MAPPINGS]: 'en:project/site,no:prosjekt/omraade'
            });

            import('../src/utils/getLocaleMappings').then((moduleName) => {
                expect(moduleName.getLocaleMappings()).toEqual({
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

    describe('getAllLocales', () => {
        it('returns the correct locales', () => {

            import('../src/utils/getAllLocales').then((moduleName) => {
                expect(moduleName.getAllLocales()).toEqual(['en', 'no']);
            });
        });
    });

    describe('getRenderMode', () => {
        it("returns 'next' when there is no content-studio-mode header in the context", () => {

            setupServerEnv({
                [ENV_VARS.MAPPINGS]: undefined
            });

            import('../src/utils/getRenderMode').then((moduleName) => {
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
                } as unknown as Context;
                expect(moduleName.getRenderMode(context)).toEqual('next');
            });
        });
        const RENDER_MODES = ['edit', 'inline', 'preview', 'live', 'admin', 'next'];
        RENDER_MODES.forEach((mode) => {
            it(`return ${mode} when context header content-studio-mode is ${mode}`, () => {

                setupServerEnv({
                    [ENV_VARS.MAPPINGS]: undefined
                });

                import('../src/utils/getRenderMode').then((moduleName) => {
                    const context: Context = {
                        headers: {
                            get(name: string) {
                                if (name === 'content-studio-mode') {
                                    return mode;
                                }
                                console.error('headers get name', name);
                            }
                        },
                    } as Context;
                    expect(moduleName.getRenderMode(context)).toEqual(mode);
                });
            });
        });

    }); // getRenderMode

    describe('getRequestLocaleInfo', () => {
        it('returns correct locale, locales and defaultLocale from ENONIC_MAPPINGS and content-studio-project header', () => {

            setupServerEnv({
                [ENV_VARS.MAPPINGS]: 'en:moviedb/hmdb,no:film-db/hmdb'
            });

            import('../src/utils/getRequestLocaleInfo').then((moduleName) => {
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
                    locales: ['en', 'no'],
                    defaultLocale: 'en'
                });
            });
        });

        it('uses context locale when context header content-studio-project is missing', () => {

            setupServerEnv({
                [ENV_VARS.MAPPINGS]: 'en:moviedb/hmdb,no:film-db/hmdb'
            });

            import('../src/utils/getRequestLocaleInfo').then((moduleName) => {
                const context: Context = {
                    headers: {
                        get(name: string) {
                            if (name === 'accept-language') {
                                return 'no';
                            }
                            if (name === 'content-studio-project') {
                                return undefined;
                            }
                            console.error('headers get name', name);
                        }
                    },
                    locale: 'da',
                    contentPath: '/content/path',
                } as Context;
                expect(moduleName.getRequestLocaleInfo(context)).toEqual({
                    locale: 'da',
                    locales: ['en', 'no'],
                    defaultLocale: 'en'
                });
            });
        });

        it('does not use accept-language header when both content-studio-project header and locale is missing', () => {

            setupServerEnv({
                [ENV_VARS.MAPPINGS]: 'en:moviedb/hmdb,no:film-db/hmdb'
            });

            import('../src/utils/getRequestLocaleInfo').then((moduleName) => {
                const context: Context = {
                    headers: {
                        get(name: string) {
                            if (name === 'accept-language') {
                                return 'no';
                            }
                            if (name === 'content-studio-project') {
                                return undefined;
                            }
                            console.error('headers get name', name);
                        }
                    },
                    // locale: 'da',
                    contentPath: '/content/path',
                } as Context;
                expect(moduleName.getRequestLocaleInfo(context)).toEqual({
                    locale: 'en',
                    locales: ['en', 'no'],
                    defaultLocale: 'en'
                });
            });
        });

        it('falls back to default language when no matches are found', () => {

            setupServerEnv({
                [ENV_VARS.MAPPINGS]: 'en:moviedb/hmdb,no:film-db/hmdb'
            });

            import('../src/utils/getRequestLocaleInfo').then((moduleName) => {
                const context: Context = {
                    headers: {
                        get(name: string) {
                            if (name === 'accept-language') {
                                return '';
                            }
                            if (name === 'content-studio-project') {
                                return undefined;
                            }
                            console.error('headers get name', name);
                        }
                    },
                    contentPath: '/content/path',
                } as Context;
                expect(moduleName.getRequestLocaleInfo(context)).toEqual({
                    locale: 'en',
                    locales: ['en', 'no'],
                    defaultLocale: 'en'
                });
            });
        });
    }); // getRequestLocaleInfo
}); // describe utils
