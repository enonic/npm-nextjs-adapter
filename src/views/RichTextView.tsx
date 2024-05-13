/// <reference types="react" />
import type {MetaData, Replacer, ReplacerResult, RichTextData, RichTextViewProps} from '../types';


import {getUrl, UrlProcessor} from '../common/UrlProcessor';
import HTMLReactParser, {DOMNode, domToReact} from 'html-react-parser';
import {ElementType} from 'domelementtype';
import BaseMacro from './BaseMacro';
import Link from 'next/link';


export function createReplacer(allData: RichTextData, meta: MetaData, renderMacroInEditMode = true, customReplacer?: Replacer): (domNode: DOMNode) => ReplacerResult {
    // eslint-disable-next-line react/display-name
    const replacerFn = (domNode: DOMNode): ReplacerResult => {
        if (domNode.type !== ElementType.Tag) {
            return domNode;
        }

        const el = domNode;
        let ref: string;
        switch (el.tagName) {
            case UrlProcessor.IMG_TAG:
                ref = el.attribs[UrlProcessor.IMG_ATTR];
                if (ref) {
                    if (UrlProcessor.isContentImage(ref, allData.images)) {
                        const src = el.attribs['src'];
                        if (src) {
                            el.attribs['src'] = getUrl(src, meta);
                        }

                        const srcset = el.attribs['srcset'];
                        if (srcset) {
                            el.attribs['srcset'] = UrlProcessor.processSrcSet(srcset, meta);
                        }
                    }
                }
                break;
            case UrlProcessor.LINK_TAG:
                ref = el.attribs[UrlProcessor.LINK_ATTR];
                const href = el.attribs['href'];

                if (ref && href) {
                    const domNodes = el.children as DOMNode[];
                    return <Link href={getUrl(href, meta)}>{domToReact(domNodes, {replace: replacerFn})}</Link>;
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
    return replacerFn;
}

const RichTextView = ({className, tag, data, meta, renderMacroInEditMode, customReplacer}: RichTextViewProps) => {
    const CustomTag = tag as keyof JSX.IntrinsicElements || 'section';
    return <CustomTag className={className}>
        {data.processedHtml ? HTMLReactParser(data.processedHtml, {replace: createReplacer(data, meta, renderMacroInEditMode, customReplacer)}) : ''}
    </CustomTag>;
};

export default RichTextView;
