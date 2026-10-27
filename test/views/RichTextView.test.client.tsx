import { afterEach as afterEachTestInDescribe, describe, expect, jest, test as it, beforeAll } from '@jest/globals';
import '@testing-library/jest-dom/jest-globals';
import { cleanup, render, waitFor } from '@testing-library/react';
import * as React from 'react';
import { XP_REQUEST_TYPE, RENDER_MODE } from '../../src/common/constants';
import { ComponentRegistry } from '../../src/common/ComponentRegistry';
import type { MacroProps, Replacer } from '../../src/types';
import type { RichTextData } from '@enonic/react-components';

jest.mock('../../src/common/env', () => ({
    MEDIA_URL: 'https://cdn.example/api'
}));

describe('views', () => {
    describe('RichTextView', () => {

        let RichTextView: typeof import('../../src/views/RichTextView').default;

        const meta = {
            id: '123',
            type: 'landing-page',
            path: '/some/path',
            requestType: XP_REQUEST_TYPE.PAGE,
            renderMode: RENDER_MODE.NEXT,
            canRender: true,
            catchAll: false,
            branch: 'master',
            project: 'project',
            site: '/site',
            baseUrl: '/base/url',
            locale: 'no',
            defaultLocale: 'en'
        };

        beforeAll(async () => {
            await import('../../src/views/RichTextView').then((module) => {
                RichTextView = module.default;
            });
        });

        afterEachTestInDescribe(() => {
            cleanup(); // Resets the DOM after each test suite

            jest.resetAllMocks();
        })

        it('should not replace links, images and macros without data ref attribute or data itself', async () => {
            const data: RichTextData = {
                processedHtml: `<div id="text-root">
                    <p><a href="/some/link" title="Some link"><img src="/some/image.jpg" alt="Some image" /></a></p>
                    <editor-macro data-macro-ref="some-macro" />
                    </div>`,
                links: [],
                macros: [],
                images: []
            };

            render(<RichTextView meta={meta} data={data}/>);
            const rootEl = document.getElementById('text-root');

            await waitFor(() => {
                expect(rootEl.outerHTML).toEqual(`<div id="text-root">
                    <p><a href="/some/link" title="Some link"><div style="background-color: rgb(255, 255, 255); border-width: 2px; border-style: dashed; border-radius: 4px; box-sizing: border-box; display: block; font-family: Open Sans, Helvetica, sans-serif; font-size: 20px; line-height: 33px; margin: 1px 0px 10px; min-height: 137px; padding: 50px 15px; position: relative; text-align: center; border-color: rgb(224, 180, 180); color: rgb(159, 58, 56);">Can't replace image, when there are no images in the data object!</div></a></p>
                    <div style="background-color: rgb(255, 255, 255); border-width: 2px; border-style: dashed; border-radius: 4px; box-sizing: border-box; display: block; font-family: Open Sans, Helvetica, sans-serif; font-size: 20px; line-height: 33px; margin: 1px 0px 10px; min-height: 137px; padding: 50px 15px; position: relative; text-align: center; border-color: rgb(224, 180, 180); color: rgb(159, 58, 56);">Can't replace macro, when there are no macros in the data object!</div></div>`);

            });
        });

        it('should replace link, images and macros with data ref attributes and data', async () => {

            const data: RichTextData = {
                processedHtml: `<div id="text-root">
                    <p>Some text before <a href="/some/link" title="Some link" data-link-ref="link-ref-1">the link</a> and some text after.</p>
                    <figure><a href="/some/image" data-link-ref="link-ref-2"><img src="/some/image.jpg" alt="Some image" data-image-ref="image-ref-1" /></a><figcaption>Some caption</figcaption></figure>
                    <editor-macro data-macro-ref="macro-ref-1"><strong>Child content</strong> of the macro.</editor-macro>
                    </div>`,
                links: [{
                    ref: "link-ref-1",
                    uri: "/some/link",
                    pageUrl: {path: '/path/link', queryString: '?a=1'},
                    fragment: '#details',
                    content: {
                        '_path': '/some/path/link',
                    },
                    media: null
                },
                    {
                        ref: "link-ref-2",
                        uri: "/some/image",
                        pageUrl: null,
                        fragment: '',
                        media: {
                            content: {_id: 'document-id'},
                            mediaUrl: {path: '/media:attachment/project/id:fp/file.pdf', queryString: '?download'},
                            intent: 'download'
                        }
                    }],
                macros: [{
                    ref: "macro-ref-1",
                    name: "macroname",
                    descriptor: "app:macroname" as `${string}:${string}`,
                    config: {
                        "macroname": {
                            key1: "value1"
                        }
                    }
                }],
                images: [{
                    ref: "image-ref-1",
                    src: {path: '/media:image/project/id:fp/width-800/photo.jpg'},
                    srcset: [
                        {width: 400, imageUrl: {path: '/media:image/project/id:fp/width-400/photo.jpg'}},
                        {width: 800, imageUrl: {path: '/media:image/project/id:fp/width-800/photo.jpg'}}
                    ],
                    image: {
                        id: "image-id-1"
                    }
                }]
            };

            jest.spyOn(ComponentRegistry, "getMacro").mockImplementation(() => {
                return {
                    view: (props: MacroProps) => {
                        expect(props.config).toEqual(data.macros[0].config.macroname);
                        expect(props.name).toEqual(data.macros[0].name);
                        expect(props.meta).toEqual(meta);
                        expect(props.children).toBeTruthy();

                        return <div>{props.children}</div>
                    }
                };
            });

            render(<RichTextView meta={meta} data={data}/>);

            const rootEl = document.getElementById('text-root');

            await waitFor(() => {
                expect(rootEl.outerHTML).toEqual(`<div id="text-root">
                    <p>Some text before <a data-content-path="/some/path/link" title="Some link" href="/no/path/link?a=1#details">the link</a> and some text after.</p>
                    <figure><a href="https://cdn.example/api/media:attachment/project/id:fp/file.pdf?download"><img alt="Some image" srcset="https://cdn.example/api/media:image/project/id:fp/width-400/photo.jpg 400w, https://cdn.example/api/media:image/project/id:fp/width-800/photo.jpg 800w" src="https://cdn.example/api/media:image/project/id:fp/width-800/photo.jpg"></a><figcaption>Some caption</figcaption></figure>
                    <div><strong>Child content</strong> of the macro.</div>
                    </div>`);
            });
        });

        describe('tag', () => {

            const data = {
                processedHtml: '<p>one</p><p>two</p>',
                links: [],
                macros: [],
                images: []
            };

            it('should wrap the content in a section by default', async () => {
                const {container} = render(<RichTextView meta={meta} data={data}/>);

                await waitFor(() => {
                    expect(container.innerHTML).toEqual('<section><p>one</p><p>two</p></section>');
                });
            });

            it('should use the given intrinsic tag as the wrapper', async () => {
                const {container} = render(<RichTextView meta={meta} data={data} tag="article" className="rich"/>);

                await waitFor(() => {
                    expect(container.innerHTML).toEqual('<article class="rich"><p>one</p><p>two</p></article>');
                });
            });

            it('should render without a wrapping element when given a Fragment', async () => {
                const {container} = render(<RichTextView meta={meta} data={data} tag={React.Fragment}/>);

                await waitFor(() => {
                    expect(container.innerHTML).toEqual('<p>one</p><p>two</p>');
                });
            });
        });

        it('resolves URLs without macros and preserves external links and site-root fragments', async () => {
            const data: RichTextData = {
                processedHtml: `<a data-link-ref="root" href="#">Home</a><a href="https://example.com" title="External" target="_blank">External</a>`,
                links: [{ref: 'root', uri: 'content://site', pageUrl: {path: '', queryString: '?a=1'}, fragment: '#top'}],
                images: []
            };
            const {container} = render(<RichTextView meta={{...meta, locale: 'en'}} data={data}/>);
            await waitFor(() => {
                expect(container.querySelector('a')).toHaveAttribute('href', '/?a=1#top');
                expect(container.querySelector('a[target="_blank"]')).toHaveAttribute('href', 'https://example.com');
                expect(container.querySelector('a[target="_blank"]')).toHaveAttribute('title', 'External');
            });
        });

        it('does not render placeholder URLs for unresolved internal references', async () => {
            const data: RichTextData = {
                processedHtml: `<a data-link-ref="missing" href="#">Missing</a><a data-link-ref="media" href="#">Media</a><img data-image-ref="missing" src="placeholder" alt="Missing"/>`,
                links: [
                    {ref: 'missing', uri: 'content://missing', pageUrl: null, fragment: '', content: null},
                    {ref: 'media', uri: 'media://missing', pageUrl: null, fragment: '', media: {content: null, mediaUrl: null, intent: 'inline'}}
                ],
                images: [{ref: 'missing', image: null, src: null, srcset: []}]
            };
            const {container} = render(<RichTextView meta={meta} data={data}/>);
            await waitFor(() => {
                expect(container.querySelector('a')).not.toHaveAttribute('href');
                expect(container.querySelectorAll('a')[1]).not.toHaveAttribute('href');
                expect(container.querySelector('img')).toBeNull();
            });
        });

        it('accepts shared data with URL strings and mixed responsive candidates without rewriting it', async () => {
            const data: RichTextData = {
                processedHtml: '<a data-link-ref="page" href="placeholder" target="_blank" title="Page">Page</a><a data-link-ref="file" href="placeholder">File</a><img data-image-ref="photo" src="placeholder"/>',
                links: [
                    {ref: 'page', uri: 'page', pageUrl: '/already-localized/page?a=1', fragment: '#details', content: null},
                    {ref: 'file', uri: 'file', media: {content: null, intent: 'download', mediaUrl: 'https://files.example/file.pdf?download'}}
                ],
                images: [{
                    ref: 'photo',
                    image: null,
                    src: 'https://images.example/photo.jpg',
                    srcset: [
                        {width: 400, imageUrl: 'https://images.example/small.jpg'},
                        {width: 800, imageUrl: {path: '/media:image/project/photo:fp/width-800/photo.jpg'}}
                    ]
                }]
            };
            const original = JSON.parse(JSON.stringify(data));
            const {container} = render(<RichTextView meta={meta} data={data}/>);
            await waitFor(() => {
                expect(container.querySelector('a')).toHaveAttribute('href', '/already-localized/page?a=1#details');
                expect(container.querySelector('a')).toHaveAttribute('target', '_blank');
                expect(container.querySelector('a')).toHaveAttribute('title', 'Page');
                expect(container.querySelectorAll('a')[1]).toHaveAttribute('href', 'https://files.example/file.pdf?download');
                expect(container.querySelector('img')).toHaveAttribute('src', 'https://images.example/photo.jpg');
                expect(container.querySelector('img')).toHaveAttribute('srcset', 'https://images.example/small.jpg 400w, https://cdn.example/api/media:image/project/photo:fp/width-800/photo.jpg 800w');
            });
            expect(data).toEqual(original);
        });

        it('resolves structured references even when their content cannot be fetched', async () => {
            const data: RichTextData = {
                processedHtml: '<a data-link-ref="page" href="placeholder">Page</a><a data-link-ref="file" href="placeholder">File</a><img data-image-ref="photo" src="placeholder"/>',
                links: [
                    {ref: 'page', uri: 'page', content: null, pageUrl: {baseUrl: null, path: '/page'}},
                    {ref: 'file', uri: 'file', media: {content: null, intent: 'inline', mediaUrl: {path: '/media:attachment/project/file:fp/file.pdf'}}}
                ],
                images: [{ref: 'photo', image: null, src: {path: '/media:image/project/photo:fp/full/photo.jpg'}}]
            };
            const {container} = render(<RichTextView meta={meta} data={data}/>);
            await waitFor(() => {
                expect(container.querySelector('a')).toHaveAttribute('href', '/no/page');
                expect(container.querySelectorAll('a')[1]).toHaveAttribute('href', 'https://cdn.example/api/media:attachment/project/file:fp/file.pdf');
                expect(container.querySelector('img')).toHaveAttribute('src', 'https://cdn.example/api/media:image/project/photo:fp/full/photo.jpg');
            });
        });

        it('resolves images without macros and keeps the original data available to custom replacers', async () => {
            const data: RichTextData = {
                processedHtml: `<div><img data-image-ref="photo" src="placeholder" alt="Photo" sizes="100vw"/></div>`,
                images: [{
                    ref: 'photo',
                    image: {_id: 'photo'},
                    src: {path: '/media:image/project/photo:fp/full/photo.jpg', queryString: '?v=1'},
                    srcset: []
                }]
            };
            const customReplacer = jest.fn<Replacer>(() => undefined);
            const {container} = render(<RichTextView meta={meta} data={data} customReplacer={customReplacer}/>);
            await waitFor(() => {
                expect(container.querySelector('img')).toHaveAttribute('src', 'https://cdn.example/api/media:image/project/photo:fp/full/photo.jpg?v=1');
                expect(container.querySelector('img')).toHaveAttribute('sizes', '100vw');
                expect(customReplacer).toHaveBeenCalledWith(expect.anything(), data, meta);
            });
            expect(data.images[0].src).toEqual({path: '/media:image/project/photo:fp/full/photo.jpg', queryString: '?v=1'});
            expect(data.images[0].image).toEqual({_id: 'photo'});
        });

    });
});
