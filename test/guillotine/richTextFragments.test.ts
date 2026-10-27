import type {FetchOptions, RichTextQueryOptions} from '../../src/types';


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

    it.each<RichTextQueryOptions | undefined>([
        undefined,
        {},
        {imageWidths: undefined, imageSizes: undefined, imageSrcWidth: undefined}
    ])('preserves all defaults for omitted options: %p', async (options) => {
        const {richTextQuery} = await import('../../src/index');
        const query = richTextQuery('bio', options);
        expect(query).toContain('bio(processHtml:{imageWidths: [400, 800, 1200], imageSizes: "(max-width: 400px) 400px, (max-width: 800px) 800px, 1200px"})');
        expect(query).not.toContain('imageSrcWidth');
    });

    it('overrides image widths without changing other defaults', async () => {
        const {richTextQuery} = await import('../../src/index');
        const query = richTextQuery('bio', {imageWidths: [320, 640, 960]});
        expect(query).toContain('imageWidths: [320, 640, 960]');
        expect(query).toContain('imageSizes: "(max-width: 400px) 400px, (max-width: 800px) 800px, 1200px"');
        expect(query).not.toContain('imageSrcWidth');
    });

    it('overrides image sizes without changing other defaults', async () => {
        const {richTextQuery} = await import('../../src/index');
        const query = richTextQuery('bio', {imageSizes: '(max-width: 640px) 100vw, 640px'});
        expect(query).toContain('imageWidths: [400, 800, 1200]');
        expect(query).toContain('imageSizes: "(max-width: 640px) 100vw, 640px"');
        expect(query).not.toContain('imageSrcWidth');
    });

    it('overrides the primary width without changing other defaults', async () => {
        const {richTextQuery} = await import('../../src/index');
        const query = richTextQuery('bio', {imageSrcWidth: 640});
        expect(query).toContain('imageWidths: [400, 800, 1200]');
        expect(query).toContain('imageSizes: "(max-width: 400px) 400px, (max-width: 800px) 800px, 1200px"');
        expect(query).toContain('imageSrcWidth: 640');
    });

    it('supports overriding all image settings together', async () => {
        const {richTextQuery} = await import('../../src/index');
        const options: RichTextQueryOptions = {
            imageWidths: [320, 640, 960],
            imageSizes: '100vw',
            imageSrcWidth: 640
        };
        expect(richTextQuery('bio', options)).toContain('bio(processHtml:{imageWidths: [320, 640, 960], imageSizes: "100vw", imageSrcWidth: 640})');
        expect(options).toEqual({imageWidths: [320, 640, 960], imageSizes: '100vw', imageSrcWidth: 640});
    });

    it('does not replace explicit empty image settings with defaults', async () => {
        const {richTextQuery} = await import('../../src/index');
        expect(richTextQuery('bio', {imageWidths: [], imageSizes: ''}))
            .toContain('bio(processHtml:{imageWidths: [], imageSizes: ""})');
    });

    it('escapes image sizes as a GraphQL string literal', async () => {
        const {richTextQuery} = await import('../../src/index');
        const imageSizes = '"quoted"\\path\n100vw';
        const query = richTextQuery('bio', {imageSizes});
        expect(query).toContain(`imageSizes: ${JSON.stringify(imageSizes)}`);
        expect(query).not.toContain(imageSizes);
    });

    it('richTextFragments defines the three fragments with the registered macro configs', async () => {
        const {richTextFragments, ComponentRegistry} = await import('../../src/index');
        ComponentRegistry.addMacro('com.enonic.app.test:factbox', {configQuery: '{ header }'});
        const fragments = richTextFragments();
        expect(fragments).toContain('fragment RichTextMacros on Macro {');
        expect(fragments).toContain('factbox{ header }');
        expect(fragments).toContain('fragment RichTextLinks on Link {');
        expect(fragments).toContain('fragment RichTextImages on Image {');
        expect(fragments).toContain('fragment\n    pageUrl { baseUrl path queryString }');
        expect(fragments).toContain('mediaUrl { path queryString context id fingerprint name intent }');
        expect(fragments).toContain('src { path queryString context id fingerprint scale name }');
        expect(fragments).toContain('srcset {\n        width\n        imageUrl {');
        expect(fragments).toContain('application');
        expect(fragments).not.toContain('imageUrl(scale:');
        expect(fragments).not.toContain('... on media_Image');
    });

    it('withRichTextFragments appends only the missing definitions, once', async () => {
        const {richTextQuery, withRichTextFragments} = await import('../../src/index');
        const plain = 'query { guillotine { get { _id } } }';
        expect(withRichTextFragments(plain)).toBe(plain);

        const document = `query { guillotine { get { ${richTextQuery('text', {imageWidths: [320, 640], imageSizes: '50vw'})} ${richTextQuery('bio', {imageSrcWidth: 960})} } } }`;
        const withFragments = withRichTextFragments(document);
        expect(withFragments).toContain(richTextQuery('text', {imageWidths: [320, 640], imageSizes: '50vw'}));
        expect(withFragments).toContain(richTextQuery('bio', {imageSrcWidth: 960}));
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
                query: `query { guillotine { get { ${richTextQuery('text', {imageSrcWidth: 640})} } } }`
            }
        };
        await fetchGuillotine('http://localhost:8080/api/com.enonic.app.guillotine:graphql', options);

        expect(fetchMock).toHaveBeenCalledTimes(1);
        const sent = JSON.parse(fetchMock.mock.calls[0][1]?.body as string).query as string;
        expect(sent).toContain('imageSrcWidth:640');
        expect(sent).toContain('imageWidths:[400,800,1200]');
        expect(sent).toContain('...RichTextMacros');
        expect(sent).toContain('fragment RichTextMacros on Macro{ref name descriptor}');
        expect(sent).toContain('fragment RichTextLinks on Link{');
        expect(sent).toContain('fragment RichTextImages on Image{');
    });
});
