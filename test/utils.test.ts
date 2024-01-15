import type {Context} from '../src/types';

import {beforeAll, describe, expect, jest, test as it} from '@jest/globals';
import {ENONIC_APP_NAME} from './constants';


const OLD_ENV = process.env;


describe('utils', () => {

    beforeAll((done) => {
        jest.replaceProperty(process, 'env', {
            ...OLD_ENV,
            ENONIC_API: 'http://localhost:8080/site',
            ENONIC_APP_NAME,
            ENONIC_PROJECTS: 'en:moviedb/hmdb,no:film-db/omraade'
        });
        done();
    });

    describe('fixDoubleSlashes', () => {
        it('returns correct string', () => {
            jest.resetModules();
            process.env = {
                ...OLD_ENV,
                ENONIC_API: 'http://localhost:8080/site',
                ENONIC_PROJECTS: 'en:moviedb/hmdb,no:film-db/omraade',
                ENONIC_APP_NAME
            };
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
                jest.resetModules();
                process.env = {
                    ...OLD_ENV,
                    ENONIC_API: 'http://localhost:8080/site',
                    ENONIC_APP_NAME,
                    ENONIC_PROJECTS: 'en:moviedb/hmdb,no:film-db/omraade' // NEXT_PUBLIC_ENONIC_PROJECTS
                };
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

    describe('getProjectLocaleConfig', () => {
        it('returns correct ProjectLocaleConfig when content-studio-project is set', () => {
            jest.resetModules();
            process.env = {
                ...OLD_ENV,
                ENONIC_API: 'http://localhost:8080/site',
                ENONIC_APP_NAME,
                ENONIC_PROJECTS: 'en:moviedb/hmdb,no:film-db/omraade' // NEXT_PUBLIC_ENONIC_PROJECTS
            };
            import('../src/utils/getProjectLocaleConfig').then((moduleName) => {
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
                expect(moduleName.getProjectLocaleConfig(context)).toEqual({
                    default: false,
                    locale: 'no',
                    project: 'film-db',
                    site: '/omraade',
                });
            });
        });
        it('returns correct ProjectLocaleConfig when content-studio-project is set', () => {
            jest.resetModules();
            process.env = {
                ...OLD_ENV,
                ENONIC_API: 'http://localhost:8080/site',
                ENONIC_APP_NAME,
                ENONIC_PROJECTS: 'en:moviedb/site,no:film-db/omraade' // NEXT_PUBLIC_ENONIC_PROJECTS
            };
            import('../src/utils/getProjectLocaleConfig').then((moduleName) => {
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
                expect(moduleName.getProjectLocaleConfig(context)).toEqual({
                    default: true,
                    locale: 'en',
                    project: 'moviedb',
                    site: '/site',
                });
            });
        });
    }); // describe getProjectLocaleConfig

    describe('getProjectLocaleConfigById', () => {
        it('returns correct ProjectLocaleConfig', () => {
            jest.resetModules();
            process.env = {
                ...OLD_ENV,
                ENONIC_API: 'http://localhost:8080/site',
                ENONIC_APP_NAME,
                ENONIC_PROJECTS: 'en:moviedb/hmdb,no:film-db/omraade' // NEXT_PUBLIC_ENONIC_PROJECTS
            };
            import('../src/utils/getProjectLocaleConfigById').then((moduleName) => {
                expect(moduleName.getProjectLocaleConfigById('film-db')).toEqual({
                    default: false,
                    locale: 'no',
                    project: 'film-db',
                    site: '/omraade',
                });
            });
        });

        it('returns default ProjectLocaleConfig when projectId param is missing', () => {
            jest.resetModules();
            process.env = {
                ...OLD_ENV,
                ENONIC_API: 'http://localhost:8080/site',
                ENONIC_APP_NAME,
                ENONIC_PROJECTS: 'en:moviedb/site,no:film-db/omraade' // NEXT_PUBLIC_ENONIC_PROJECTS
            };
            import('../src/utils/getProjectLocaleConfigById').then((moduleName) => {
                expect(moduleName.getProjectLocaleConfigById()).toEqual({
                    default: true,
                    locale: 'en',
                    project: 'moviedb',
                    site: '/site',
                });
            });
        });
    }); // describe getProjectLocaleConfigById

    describe('getProjectLocaleConfigByLocale', () => {
        it('returns correct ProjectLocaleConfig', () => {
            jest.resetModules();
            process.env = {
                ...OLD_ENV,
                ENONIC_API: 'http://localhost:8080/site',
                ENONIC_APP_NAME,
                ENONIC_PROJECTS: 'en:moviedb/hmdb,no:film-db/omraade' // NEXT_PUBLIC_ENONIC_PROJECTS
            };
            import('../src/utils/getProjectLocaleConfigByLocale').then((moduleName) => {
                expect(moduleName.getProjectLocaleConfigByLocale('no')).toEqual({
                    default: false,
                    locale: 'no',
                    project: 'film-db',
                    site: '/omraade',
                });
            });
        });
    }); // describe getProjectLocaleConfigByLocale

    describe('getProjectLocaleConfigs', () => {
        it('throws when ENONIC_PROJECTS is missing', () => {
                jest.resetModules();
                process.env = {
                    ...OLD_ENV,
                    ENONIC_API: 'http://localhost:8080/site',
                    ENONIC_APP_NAME,
                };
                expect(import('../src/utils/getProjectLocaleConfigs')
                    .then(moduleName => moduleName.getProjectLocaleConfigs()))
                    .rejects.toThrow(Error("Environment variable 'ENONIC_PROJECTS' is missing (from .env?)"));
            }
        );
        it('throws when default-language is missing from any project', () => {
            jest.resetModules();
            process.env = {
                ...OLD_ENV,
                ENONIC_API: 'http://localhost:8080/site',
                ENONIC_APP_NAME,
                ENONIC_PROJECTS: ',sv:project/site,,prosjekt/omraade,' // NEXT_PUBLIC_ENONIC_PROJECTS
            };
            import('../src/utils/getProjectLocaleConfigs').then((moduleName) => {
                expect(() => moduleName.getProjectLocaleConfigs()).toThrow(Error(
                    `Project "prosjekt/omraade" doesn't match format: <default-language>:<default-repository-name>/<default-site-path>,<language>:<repository-name>/<site-path>`
                ));
            });
        });
        it('returns the correct locale configs', () => {
            jest.resetModules();
            process.env = {
                ...OLD_ENV,
                ENONIC_API: 'http://localhost:8080/site',
                ENONIC_APP_NAME,
                ENONIC_PROJECTS: 'en:project/site,no:prosjekt/omraade' // NEXT_PUBLIC_ENONIC_PROJECTS
            };
            import('../src/utils/getProjectLocaleConfigs').then((moduleName) => {
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

    describe('getProjectLocales', () => {
        it('returns the correct locales', () => {
            jest.resetModules();
            process.env = {
                ...OLD_ENV,
                ENONIC_API: 'http://localhost:8080/site',
                ENONIC_APP_NAME,
                ENONIC_PROJECTS: 'en:project/site,no:prosjekt/omraade' // NEXT_PUBLIC_ENONIC_PROJECTS
            };
            import('../src/utils/getProjectLocales').then((moduleName) => {
                expect(moduleName.getProjectLocales()).toEqual(['en', 'no']);
            });
        });
    });

    describe('getRenderMode', () => {
        it("returns 'next' when there is no content-studio-mode header in the context", () => {
            jest.resetModules();
            process.env = {
                ...OLD_ENV,
                ENONIC_API: 'http://localhost:8080/site',
                ENONIC_APP_NAME
            };
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
                } as Context;
                expect(moduleName.getRenderMode(context)).toEqual('next');
            });
        });
        const RENDER_MODES = ['edit', 'inline', 'preview', 'live', 'admin', 'next'];
        RENDER_MODES.forEach((mode) => {
            it(`return ${mode} when context header content-studio-mode is ${mode}`, () => {
                jest.resetModules();
                process.env = {
                    ...OLD_ENV,
                    ENONIC_API: 'http://localhost:8080/site',
                    ENONIC_APP_NAME
                };
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
        it('returns correct locale, locales and defaultLocale from ENONIC_PROJECTS and content-studio-project header', () => {
            jest.resetModules() // Most important - it clears the cache
            process.env = {
                ...OLD_ENV,  // Make a copy
                ENONIC_API: 'http://localhost:8080/site',
                // ENONIC_API_TOKEN: 'token',
                ENONIC_APP_NAME: 'com.enonic.app.enonic',
                ENONIC_PROJECTS: 'en:moviedb/hmdb,no:film-db/hmdb'
            };
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
            jest.resetModules() // Most important - it clears the cache
            process.env = {
                ...OLD_ENV,  // Make a copy
                ENONIC_API: 'http://localhost:8080/site',
                // ENONIC_API_TOKEN: 'token',
                ENONIC_APP_NAME: 'com.enonic.app.enonic',
                ENONIC_PROJECTS: 'en:moviedb/hmdb,no:film-db/hmdb'
            };
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

        it('uses accept-language when both context header content-studio-project and locale is missing', () => {
            jest.resetModules() // Most important - it clears the cache
            process.env = {
                ...OLD_ENV,  // Make a copy
                ENONIC_API: 'http://localhost:8080/site',
                // ENONIC_API_TOKEN: 'token',
                ENONIC_APP_NAME: 'com.enonic.app.enonic',
                ENONIC_PROJECTS: 'en:moviedb/hmdb,no:film-db/hmdb'
            };
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
                    locale: 'no',
                    locales: ['en', 'no'],
                    defaultLocale: 'en'
                });
            });
        });

        it('falls back to default language when no matches are found', () => {
            jest.resetModules() // Most important - it clears the cache
            process.env = {
                ...OLD_ENV,  // Make a copy
                ENONIC_API: 'http://localhost:8080/site',
                ENONIC_APP_NAME: 'com.enonic.app.enonic',
                ENONIC_PROJECTS: 'en:moviedb/hmdb,no:film-db/hmdb'
            };
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
