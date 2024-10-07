/// <reference types="react" />
import type {MetaData, RichTextViewProps, Replacer as OldReplacer, MacroConfig, RichTextData} from '../types';

import {getUrl, UrlProcessor} from '../common/UrlProcessor';
import BaseMacro from './BaseMacro';
import Link from 'next/link';
import type {MacroComponentParams, LinkComponentParams, ImageComponentParams, Replacer as NewReplacer} from '@enonic/react-components';
import {RichText} from '@enonic/react-components';
import type {DOMNode} from 'html-react-parser';

interface ExtraRichTextProps {
    meta: MetaData;
    renderInEditMode?: boolean;
}

const RichTextView = (props: RichTextViewProps) => {
    return <RichText<ExtraRichTextProps>
        data={props.data}
        meta={props.meta}
        className={props.className}
        tag={props.tag}
        replacer={wrapReplacer(props.customReplacer, props.meta, props.renderMacroInEditMode)}
        renderInEditMode={props.renderMacroInEditMode ?? true}
        Macro={MacroAdapter}
        Link={LinkAdapter}
        Image={ImageAdapter}
    />;
};

function wrapReplacer(oldReplacer: OldReplacer | undefined, meta: MetaData, renderMacroInEditMode: boolean): NewReplacer {
    if (!oldReplacer) {
        return null;
    }
    return (element: DOMNode, data: RichTextData) => {
        return oldReplacer(element, data, meta, renderMacroInEditMode);
    };
}

function MacroAdapter(props: MacroComponentParams<ExtraRichTextProps>) {
    const {children, descriptor, config, meta, renderInEditMode} = props;
    const name = descriptor.substring(descriptor.indexOf(':') + 1);
    const data = {
        name: name,
        descriptor: descriptor,
        config: {
            [name]: config as Record<string, MacroConfig>,
        },
    };

    return <BaseMacro data={data} meta={meta} renderInEditMode={renderInEditMode}>{children}</BaseMacro>;
}

function LinkAdapter(props: LinkComponentParams<ExtraRichTextProps>) {
    return <Link href={getUrl(props.href, props.meta)}>{props.children}</Link>;
}

function ImageAdapter(props: ImageComponentParams<ExtraRichTextProps>) {
    const srcSet = props.srcSet?.length ? UrlProcessor.processSrcSet(props.srcSet, props.meta) : undefined;
    return <img src={getUrl(props.src, props.meta)} style={props.style} alt={props.alt} sizes={props.sizes} srcSet={srcSet}/>;
}

export default RichTextView;
