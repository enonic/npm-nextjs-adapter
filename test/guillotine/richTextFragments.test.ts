import type {FetchOptions} from '../../src/types';


import {afterEach, beforeEach, describe, expect, jest, test as it} from '@jest/globals';
import {SpiedFunction} from 'jest-mock';
import {ENV_VARS} from '../../src/common/constants';
import {setupServerEnv} from '../constants';


globalThis.console = {
    error: jest.fn(),
    warn: jest.fn(),
    log: jest.fn(),
    info: jest.fn(),
    debug: jest.fn()
} as unknown as Console;


describe('richTextQuery fragments', () => {

    let fetchMock: SpiedFunction<typeof fetch>;

    beforeEach(() => {
        setupServerEnv({
            [ENV_VARS.MAPPINGS]: 'en:enonic-homepage/enonic-homepage'
        });
        fetchMock = jest.spyOn(globalThis, 'fetch').mockImplementation(() => Promise.resolve({
            json: () => Promise.resolve({data: {guillotine: {}}}),
            text: () => Promise.resolve('{"guillotine":{}}'),
            ok: true,
            status: 200
        } as Response));
    });

    afterEach(() => {
        jest.resetAllMocks();
        jest.resetModules();
    });

    it('richTextQuery spreads the fragments instead of inlining macros, links and images', async () => {
        const {richTextQuery} = await import('../../src/index');
        const query = richTextQuery('text');
        expect(query).toContain('...RichTextMacros');
        expect(query).toContain('...RichTextLinks');
        expect(query).toContain('...RichTextImages');
        expect(query).not.toContain('fragment ');
        expect(query).not.toContain('processedHtml\n    macros {\n        ref');
    });

    it('richTextFragments defines the three fragments with the registered macro configs', async () => {
        const {richTextFragments, ComponentRegistry} = await import('../../src/index');
        ComponentRegistry.addMacro('com.enonic.app.test:factbox', {configQuery: '{ header }'});
        const fragments = richTextFragments();
        expect(fragments).toContain('fragment RichTextMacros on Macro {');
        expect(fragments).toContain('factbox{ header }');
        expect(fragments).toContain('fragment RichTextLinks on Link {');
        expect(fragments).toContain('fragment RichTextImages on Image {');
        expect(fragments).toContain('imageUrl(scale: "width(768)")');
    });

    it('withRichTextFragments appends only the missing definitions, once', async () => {
        const {richTextQuery, withRichTextFragments} = await import('../../src/index');
        const plain = 'query { guillotine { get { _id } } }';
        expect(withRichTextFragments(plain)).toBe(plain);

        const document = `query { guillotine { get { ${richTextQuery('text')} ${richTextQuery('bio')} } } }`;
        const withFragments = withRichTextFragments(document);
        expect(withFragments.match(/fragment RichTextMacros on Macro/g)).toHaveLength(1);
        expect(withFragments.match(/fragment RichTextLinks on Link/g)).toHaveLength(1);
        expect(withFragments.match(/fragment RichTextImages on Image/g)).toHaveLength(1);
        expect(withRichTextFragments(withFragments)).toBe(withFragments);
    });

    it('fetchGuillotine sends the fragment definitions with the query', async () => {
        const {richTextQuery} = await import('../../src/index');
        const {fetchGuillotine} = await import('../../src/server');
        const options: FetchOptions = {
            body: {
                query: `query { guillotine { get { ${richTextQuery('text')} } } }`
            }
        };
        await fetchGuillotine('http://localhost:8080/api/com.enonic.app.guillotine:graphql', options);

        expect(fetchMock).toHaveBeenCalledTimes(1);
        const sent = JSON.parse(fetchMock.mock.calls[0][1]?.body as string).query as string;
        expect(sent).toContain('...RichTextMacros');
        expect(sent).toContain('fragment RichTextMacros on Macro{ref name descriptor}');
        expect(sent).toContain('fragment RichTextLinks on Link{');
        expect(sent).toContain('fragment RichTextImages on Image{');
    });
});
