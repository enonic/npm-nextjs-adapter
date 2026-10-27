import {describe, expect, test} from '@jest/globals';
import type {
    ImageData,
    LinkData,
    MacroConfig,
    MacroData,
    RichTextData
} from '../src/types';
import type {
    ImageData as SharedImageData,
    LinkData as SharedLinkData,
    MacroConfig as SharedMacroConfig,
    MacroData as SharedMacroData,
    RichTextData as SharedRichTextData
} from '@enonic/react-components';
import type {AttachmentUrl, ImageUrl, PageUrl} from '../src/types/guillotine';

type Same<A, B> = (<T>() => T extends A ? 1 : 2) extends (<T>() => T extends B ? 1 : 2) ? true : false;

const sharedTypes: [
    Same<ImageData, SharedImageData>,
    Same<LinkData, SharedLinkData>,
    Same<MacroConfig, SharedMacroConfig>,
    Same<MacroData, SharedMacroData>,
    Same<RichTextData, SharedRichTextData>
] = [true, true, true, true, true];

const imageUrl: ImageUrl = {
    path: '/media:image/project/photo:fp/width-400/photo.jpg',
    queryString: '',
    context: 'project',
    id: 'photo',
    fingerprint: 'fp',
    scale: 'width-400',
    name: 'photo.jpg'
};
const mediaUrl: AttachmentUrl = {
    path: '/media:attachment/project/file:fp/file.pdf',
    queryString: '?download',
    context: 'project',
    id: 'file',
    fingerprint: 'fp',
    name: 'file.pdf',
    intent: 'download'
};
const pageUrl: PageUrl = {baseUrl: 'https://example.com', path: '/page', queryString: '?a=1'};

const queryData: SharedRichTextData = {
    processedHtml: '<a data-link-ref="page" href="placeholder">Page</a>',
    links: [
        {ref: 'page', uri: 'content://page', content: {_id: 'page', _path: '/site/page'}, pageUrl, fragment: '#details'},
        {ref: 'file', uri: 'media://file', media: {content: {_id: 'file'}, mediaUrl, intent: 'download'}}
    ],
    images: [{ref: 'photo', image: {_id: 'photo'}, src: imageUrl, srcset: [{width: 400, imageUrl}]}]
};
const adapterData: RichTextData = queryData;
const componentData: SharedRichTextData = adapterData;

describe('shared rich-text types', () => {
    test('re-exports the component types without narrowing their contracts', () => {
        expect(sharedTypes).toEqual([true, true, true, true, true]);
    });

    test('accepts queried URL objects without converting the payload', () => {
        expect(componentData).toBe(queryData);
        expect(componentData.images[0].src).toBe(imageUrl);
        expect(componentData.links[1].media.mediaUrl).toBe(mediaUrl);
    });
});
