/// <reference types="react" />
import type {MetaData, RichTextViewProps, Replacer as OldReplacer, MacroConfig, RichTextData} from '../types';

import {getUrl} from '../common/UrlProcessor';
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
        renderInEditMode={props.renderMacroInEditMode}
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
    const name = props.descriptor.substring(props.descriptor.indexOf(':') + 1);
    const data = {
        name: name,
        descriptor: props.descriptor,
        config: {
            [name]: props.config as Record<string, MacroConfig>,
        },
    };

    return <BaseMacro data={data} meta={props.meta} renderInEditMode={props.renderInEditMode}/>;
}

function LinkAdapter(props: LinkComponentParams<ExtraRichTextProps>) {
    return <Link href={getUrl(props.href, props.meta)}>{props.children}</Link>;
}

function ImageAdapter(props: ImageComponentParams<ExtraRichTextProps>) {
    return <img src={getUrl(props.src, props.meta)} alt={props.alt} sizes={props.sizes} srcSet={props.srcSet}/>;
}

export default RichTextView;
