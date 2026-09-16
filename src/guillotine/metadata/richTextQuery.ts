import {ComponentRegistry} from '../../common/ComponentRegistry';
import {configQuery} from './configQuery';
import {indent} from '../../utils/indent';
import {imageUrlQuery, mediaUrlQuery, pageUrlQuery} from '../urlQueries';


// Fragments on Guillotine's rich text member types: spread by every rich text field, defined once per document
export const RICH_TEXT_MACROS_FRAGMENT = 'RichTextMacros';
export const RICH_TEXT_LINKS_FRAGMENT = 'RichTextLinks';
export const RICH_TEXT_IMAGES_FRAGMENT = 'RichTextImages';

const macroConfigQuery = (): string => {
    return configQuery(ComponentRegistry.getMacros(), false, false);
};

export const richTextQuery = (fieldName: string) => {
    return `${fieldName}(processHtml:{imageWidths:[400, 800, 1200], imageSizes:"(max-width: 400px) 400px, (max-width: 800px) 800px, 1200px"}) {
    processedHtml
    macros {
        ...${RICH_TEXT_MACROS_FRAGMENT}
    }
    links {
        ...${RICH_TEXT_LINKS_FRAGMENT}
    }
    images {
        ...${RICH_TEXT_IMAGES_FRAGMENT}
    }}`;
};

const fragmentDefinitions = (): [string, string][] => [
    [RICH_TEXT_MACROS_FRAGMENT, `fragment ${RICH_TEXT_MACROS_FRAGMENT} on Macro {
    ref
    name
    descriptor
    ${indent(macroConfigQuery(), 4)}
}`],
    [RICH_TEXT_LINKS_FRAGMENT, `fragment ${RICH_TEXT_LINKS_FRAGMENT} on Link {
    ref
    uri
    content {
        _path
        _id
        ${pageUrlQuery()}
    }
    media {
        content {
            _id
            ... on media_Image {
                ${mediaUrlQuery()}
            }
        }
        intent
    }
}`],
    [RICH_TEXT_IMAGES_FRAGMENT, `fragment ${RICH_TEXT_IMAGES_FRAGMENT} on Image {
    ref
    image {
        _id
        ... on media_Image {
            ${imageUrlQuery({scale: 'width(768)'})}
        }
    }
    style {
        name
        aspectRatio
        filter
    }
}`]
];

/** The fragment definitions behind richTextQuery(); evaluated when called, so the registered macros are included */
export const richTextFragments = (): string => {
    return fragmentDefinitions().map(([, definition]) => definition).join('\n');
};

/** Appends the definitions of the rich text fragments a document spreads but does not define (fetchGuillotine does this) */
export function withRichTextFragments(query: string): string {
    const missing = fragmentDefinitions()
        .filter(([name]) => query.includes(`...${name}`) && !query.includes(`fragment ${name} `))
        .map(([, definition]) => definition);

    return missing.length ? `${query}\n${missing.join('\n')}` : query;
}
