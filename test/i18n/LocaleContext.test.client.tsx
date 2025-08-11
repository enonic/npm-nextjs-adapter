import {afterEach, beforeAll, describe, expect, jest, test as it} from '@jest/globals';
import '@testing-library/jest-dom/jest-globals';
import {cleanup, render, screen, waitFor} from '@testing-library/react'
import * as React from 'react'
import {PHRASES_EN, PHRASES_NO} from './testData';
import {setupClientEnv} from '../constants';


globalThis.console = {
    error: console.error,
    // error: jest.fn(),
    warn: jest.fn(),
    log: jest.fn(),
    info: jest.fn(),
    debug: jest.fn()
} as unknown as Console;


const buildLocaleConsumer = (useLocaleContext) => () => {
    const LocaleContext = useLocaleContext();
    const {
        // dictionary,
        locale,
        localize,
        // setLocale
    } = LocaleContext;
    // console.error(dictionary); // {} becomes correct later on
    // console.error(locale); // undefined, 'en', 'no'
    const phraseKey = 'template';
    const localized = localize(phraseKey, 'a', 'b', 'c');
    return (
        <p>Locale is: '{locale}' Localized: '{localized}'</p>
    );
};


describe('i18n', () => {
    beforeAll(() => {
        jest.mock('@phrases/en.json', () => (PHRASES_EN), {
            virtual: true
        });
        
        jest.mock('@phrases/no.json', () => (PHRASES_NO), {
            virtual: true
        });

        setupClientEnv();
    });

    afterEach(() => {
        cleanup(); // Resets the DOM after each test suite
    })

    describe('LocaleContextProvider', () => {
        it("renders correctly without locale", () => {
            import('../../src/client').then(async ({LocaleContextProvider, useLocaleContext}) => {
                const LocaleConsumer = buildLocaleConsumer(useLocaleContext);

                render(<LocaleContextProvider><h1 data-testid="a"><LocaleConsumer/></h1></LocaleContextProvider>);
                await waitFor(() => {
                    expect(screen.queryByTestId('a')).toBeInTheDocument();
                });

                const bodyEl = screen.queryAllByText('')[0];
                // console.error(bodyEl.outerHTML);
                expect(bodyEl).toContainHTML(`<body><div><h1 data-testid="a"><p>Locale is: '' Localized: '&lt;template&gt;'</p></h1></div></body>`);
            });
        });

        it("renders correctly with locale='en'", () => {
            import('../../src/client').then(async ({LocaleContextProvider, useLocaleContext}) => {
                const LocaleConsumer = buildLocaleConsumer(useLocaleContext);
                const locale = 'en';

                render(<LocaleContextProvider locale={locale}><h1 data-testid="a"><LocaleConsumer/></h1></LocaleContextProvider>);
                await waitFor(() => {
                    expect(screen.queryByTestId('a')).toBeInTheDocument();
                });

                const bodyEl = screen.queryAllByText('')[0];
                // console.error(bodyEl.outerHTML);
                expect(bodyEl).toContainHTML(`<body><div><h1 data-testid="a"><p>Locale is: 'en' Localized: 'Template {} c b a a'</p></h1></div></body>`);
            });
        });

        it("renders correctly with locale='no'", () => {
            import('../../src/client').then(async ({LocaleContextProvider, useLocaleContext}) => {
                const LocaleConsumer = buildLocaleConsumer(useLocaleContext);
                const locale = 'no';

                render(<LocaleContextProvider locale={locale}><h1 data-testid="a"><LocaleConsumer/></h1></LocaleContextProvider>);
                await waitFor(() => {
                    expect(screen.queryByTestId('a')).toBeInTheDocument();
                });

                const bodyEl = screen.queryAllByText('')[0];
                // console.error(bodyEl.outerHTML);
                expect(bodyEl).toContainHTML(`<body><div><h1 data-testid="a"><p>Locale is: 'no' Localized: 'Mal {} c b a a'</p></h1></div></body>`);
            });
        });
    }); // describe LocaleContextProvider
}); // describe i18n
