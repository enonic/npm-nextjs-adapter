import {afterEach, describe, expect, jest, test as it} from '@jest/globals';
import {ENONIC_APP_NAME, setupClientEnv, META} from './constants';


globalThis.console = {
    error: console.error,
    // error: jest.fn(),
    warn: jest.fn(),
    log: jest.fn(),
    info: jest.fn(),
    debug: jest.fn()
} as unknown as Console;


describe('index (CLIENT)', () => {

    afterEach(() => {
        jest.resetModules();
    });

    it('returns process.env.NEXT_PUBLIC_ENONIC_APP_NAME (CLIENT)', () => {

        setupClientEnv();

        import('../src').then((moduleName) => {
            expect(moduleName.APP_NAME).toEqual(ENONIC_APP_NAME);
        });
    });

    it('throws when process.env.NEXT_PUBLIC_ENONIC_APP_NAME is missing (CLIENT)', () => {

        setupClientEnv({
            NEXT_PUBLIC_ENONIC_APP_NAME: undefined
            });

            expect(import('../src'))
                .rejects.toThrow(Error("Environment variable 'NEXT_PUBLIC_ENONIC_APP_NAME' is missing (from .env?)"));
        }
    );

    it('throws when process.env.NEXT_PUBLIC_ENONIC_API is missing (CLIENT)', () => {

        setupClientEnv({
            NEXT_PUBLIC_ENONIC_API: undefined
        });

            expect(import('../src'))
                .rejects.toThrow(Error("Environment variable 'NEXT_PUBLIC_ENONIC_API' is missing (from .env?)"));
        }
    );

    it('should process urls same way as on the server (CLIENT)', () => {

            setupClientEnv();

            import('../src').then(({UrlProcessor}) => {
                expect(UrlProcessor.process('https://localhost:8080/some/test/url', META)).toEqual('/site/inline/enonic-homepage/draft/some/test/url');
            });
        }
    );
}); // describe index
