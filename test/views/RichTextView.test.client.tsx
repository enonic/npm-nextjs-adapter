import {afterEach as afterEachTestInDescribe, describe, expect, jest, test as it, beforeAll} from '@jest/globals';
import '@testing-library/jest-dom/jest-globals';
import {cleanup, render} from '@testing-library/react'
import * as React from 'react'
import {XP_REQUEST_TYPE, RENDER_MODE} from '../../src/common/constants';
import {setupClientEnv} from '../constants';
import {ComponentRegistry} from '../../src/common/ComponentRegistry';
import type {MacroProps} from '../../src/types';


describe('views', () => {
    describe('RichTextView', () => {

        let RichTextView;

        const meta = {
            id: '123',
            type: 'landing-page',
            path: '/some/path',
            requestType: XP_REQUEST_TYPE.PAGE,
            renderMode: RENDER_MODE.NEXT,
            canRender: true,
            catchAll: false,
            apiUrl: 'http://localhost:8080/site/api',
            baseUrl: '/base/url',
            locale: 'no',
            defaultLocale: 'en'
        };

        beforeAll(async () => {
            setupClientEnv();
            await import('../../src/views/RichTextView').then((module) => {
                RichTextView = module.default;
            });
        });

        afterEachTestInDescribe(() => {
            cleanup(); // Resets the DOM after each test suite

            jest.resetAllMocks();
        })

        it('should not replace links, images and macros without data ref attribute or data itself', () => {
            const data = {
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
            expect(rootEl.parentElement.innerHTML).toEqual(`<div id="text-root">
                    <p><a href="/some/link" title="Some link"><div style="border: 1px dotted red; color: red;">Can't replace image, when there are no images in the data object!</div></a></p>
                    <div style="border: 1px dotted red; color: red;">Can't replace macro, when there are no macros in the data object!</div></div>`);

        });

        it('should replace link, images and macros with data ref attributes and data', async () => {

            const data = {
                processedHtml: `<div id="text-root">
                    <p>Some text before <a href="/some/link" title="Some link" data-link-ref="link-ref-1">the link</a> and some text after.</p>
                    <figure><a href="/some/image" data-link-ref="link-ref-2"><img src="/some/image.jpg" alt="Some image" data-image-ref="image-ref-1" /></a><figcaption>Some caption</figcaption></figure>
                    <editor-macro data-macro-ref="macro-ref-1"><strong>Child content</strong> of the macro.</editor-macro>
                    </div>`,
                links: [{
                    ref: "link-ref-1",
                    uri: "/some/link",
                    media: {
                        content: {
                            id: 'content-id-1'
                        },
                        intent: 'inline' as 'inline' | 'download'
                    }
                },
                    {
                        ref: "link-ref-2",
                        uri: "/some/image",
                        media: null
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

            expect(rootEl.parentElement.innerHTML).toEqual(`<div id="text-root">
                    <p>Some text before <a href="/base/url/no/some/link">the link</a> and some text after.</p>
                    <figure><a href="/base/url/no/some/image"><img src="/base/url/no/some/image.jpg" alt="Some image"></a><figcaption>Some caption</figcaption></figure>
                    <div><strong>Child content</strong> of the macro.</div>
                    </div>`);
        });
    });
});
