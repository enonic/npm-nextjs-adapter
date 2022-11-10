import React from 'react';
import {getUrl, UrlProcessor} from '../UrlProcessor';
import {MetaData, RichTextData} from '../guillotine/getMetaData';
import HTMLReactParser, {DOMNode} from 'html-react-parser';
import {ElementType} from 'domelementtype';
import {Element} from 'domhandler/lib';
import BaseMacro from './BaseMacro';

export type ReplacerResult = JSX.Element | object | void | undefined | null | false;

export type Replacer = (domNode: DOMNode, data: RichTextData, meta: MetaData, renderMacroInEditMode: boolean) => ReplacerResult;

type Props = {
    data: RichTextData,
    meta: MetaData,
    tag?: string,
    renderMacroInEditMode?: boolean,
    customReplacer?: Replacer,
};

export function createReplacer(allData: RichTextData, meta: MetaData, renderMacroInEditMode = true, customReplacer?: Replacer): (domNode: DOMNode) => ReplacerResult {
    // eslint-disable-next-line react/display-name
    return (domNode: DOMNode): ReplacerResult => {
        if (domNode.type !== ElementType.Tag) {
            return domNode;
        }

        const el = domNode as Element;
        let ref: string;
        switch (el.tagName) {
            case UrlProcessor.IMG_TAG:
                ref = el.attribs[UrlProcessor.IMG_ATTR];
                const src = el.attribs['src'];
                // do not process content images in next to keep it absolute
                if (ref && src && UrlProcessor.isContentImage(ref, allData.images)) {
                    el.attribs['src'] = getUrl(src, meta);
                }
                break;
            case UrlProcessor.LINK_TAG:
                ref = el.attribs[UrlProcessor.LINK_ATTR];
                const href = el.attribs['href'];

                if (ref && href) {
                    el.attribs['href'] = getUrl(href, meta);
                }
                break;
            case UrlProcessor.MACRO_TAG:
                ref = el.attribs[UrlProcessor.MACRO_ATTR];
                const data = ref && allData.macros.find((d) => d.ref === ref);
                if (data) {
                    return <BaseMacro data={data} meta={meta} renderInEditMode={renderMacroInEditMode}/>;
                }
                break;
            default:
                if (customReplacer) {
                    const result = customReplacer(domNode, allData, meta, renderMacroInEditMode);
                    if (result) {
                        return result;
                    }
                }
                break;
        }
        return el;
    };
}

const RichTextView = ({tag, data, meta, renderMacroInEditMode, customReplacer}: Props) => {
    const CustomTag = tag as keyof JSX.IntrinsicElements || 'section';
    return <CustomTag>
        {data.processedHtml ? HTMLReactParser(data.processedHtml, {replace: createReplacer(data, meta, renderMacroInEditMode, customReplacer)}) : ''}
    </CustomTag>;
};

export default RichTextView;
