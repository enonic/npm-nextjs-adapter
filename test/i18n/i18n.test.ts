import {
    beforeEach,
    describe,
    expect,
    jest,
    test as it
} from '@jest/globals';
import {
    ENONIC_API,
    ENONIC_APP_NAME,
    ENONIC_PROJECTS
} from '../constants';
import {PHRASES_EN, PHRASES_NO} from './testData';


const OLD_ENV = process.env;


globalThis.console = {
    // error: console.error,
    error: jest.fn(),
    warn: jest.fn(),
    log: jest.fn(),
    info: jest.fn(),
    debug: jest.fn(),
} as unknown as Console;


describe('i18n', () => {
    beforeEach(() => {
        jest.resetModules();
        jest.resetAllMocks(); // Resets the state of all mocks. Equivalent to calling .mockReset() on every mocked function.
        // jest.restoreAllMocks(); // Restores all mocks and replaced properties back to their original value.
        jest.replaceProperty(process, 'env', {
            ...OLD_ENV,
            ENONIC_API,
            ENONIC_APP_NAME,
            ENONIC_PROJECTS
        });
        jest.mock('@phrases/en.json', () => (PHRASES_EN), {
            virtual: true
        });
        
        jest.mock('@phrases/no.json', () => (PHRASES_NO), {
            virtual: true
        });
    });

    it("does it's thing", () => {
        import('../../src').then(async ({I18n}) => {
            expect(I18n.getLocale()).toBe('');
            expect(I18n.getDictionary()).toEqual({});
            expect(await I18n.setLocale('en')).toEqual(PHRASES_EN);
            expect(I18n.getLocale()).toBe('en');
            expect(I18n.getDictionary()).toEqual(PHRASES_EN);
            expect(I18n.localize('key')).toEqual('<key>');
            expect(I18n.localize('key', 1, 2, 3)).toEqual('<key>');
        });
    });

    describe('loadPhrases', () => {
        it("does it's thing", () => {
            import('../../src/i18n/i18n').then(({loadPhrases}) => {
                expect(loadPhrases('en')).resolves.toEqual(PHRASES_EN);
                expect(loadPhrases('no')).resolves.toEqual(PHRASES_NO);
            });
        });
        it("returns an empty dictionary for missing phrases files", () => {
            import('../../src/i18n/i18n').then(({loadPhrases}) => {
                expect(loadPhrases('sv')).resolves.toEqual({});
            });
        });
    });

    describe('getPhrase', () => {
        it("returns dict[key]", () => {
            import('../../src/i18n/i18n').then(({getPhrase}) => {
                expect(getPhrase('en', PHRASES_EN, 'template')).toEqual('Template {} {2} {1} {0} {0}');
                expect(getPhrase('no', PHRASES_NO, 'template')).toEqual('Mal {} {2} {1} {0} {0}');
            });
        });
        it("replaces ...args", () => {
            import('../../src/i18n/i18n').then(({getPhrase}) => {
                // Too many
                expect(getPhrase('en', PHRASES_EN, 'template', 1, 2, 3, 4)).toEqual('Template 1 3 2 1 1');
                expect(getPhrase('no', PHRASES_NO, 'template', 1, 2, 3, 4)).toEqual('Mal 1 3 2 1 1');
                // Too few
                expect(getPhrase('en', PHRASES_EN, 'template', 1, 2)).toEqual('Template 1 {2} 2 1 1');
            });
        });
        it("returns <key> when !dict[key]", () => {
            import('../../src/i18n/i18n').then(({getPhrase}) => {
                expect(getPhrase('en', PHRASES_EN, 'key')).toEqual('<key>');
                expect(getPhrase('en', PHRASES_EN, 'key', 1, 2, 3)).toEqual('<key>');

                expect(getPhrase('no', PHRASES_NO, 'key')).toEqual('<key>');
                expect(getPhrase('no', PHRASES_NO, 'key', 1, 2, 3)).toEqual('<key>');
            });
        });
    });
});