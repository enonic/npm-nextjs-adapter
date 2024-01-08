import {
    afterAll,
    beforeAll,
    beforeEach,
    describe,
    expect,
    jest,
    test as it
} from '@jest/globals';

let APP_NAME;

describe('utils', () => {
    const OLD_ENV = process.env;

    afterAll(() => {
        process.env = OLD_ENV; // Restore old environment
    });

    describe('APP_NAME', () => {
        it('returns process.env.ENONIC_APP_NAME', () => {
            process.env = {
                ...OLD_ENV,  // Make a copy
                ENONIC_APP_NAME: 'com.enonic.app.enonic'
            };
            import('../src/utils').then((moduleName) => {
                APP_NAME = moduleName.APP_NAME;
                expect(APP_NAME).toEqual('com.enonic.app.enonic');
            });
        });

        it('returns process.env.NEXT_PUBLIC_ENONIC_APP_NAME (when ENONIC_APP_NAME is not set)', () => {
            jest.resetModules() // Most important - it clears the cache
            process.env = {
                ...OLD_ENV,  // Make a copy
                NEXT_PUBLIC_ENONIC_APP_NAME: 'com.enonic.app.next-public'
            };
            import('../src/utils').then((moduleName) => {
                APP_NAME = moduleName.APP_NAME;
                expect(APP_NAME).toEqual('com.enonic.app.next-public');
            });
        });
    });
});
