/// <reference types="react" />
import type {MetaData, RichTextViewProps, Replacer as NextReplacer, RichTextData, MacroData} from '../types';

import {getUrl, UrlProcessor} from '../common/UrlProcessor';
import BaseMacro from './BaseMacro';
import Link from 'next/link';
import type {
    MacroComponentParams,
    LinkComponentParams,
    ImageComponentParams,
    Replacer as ComponentsReplacer,
    ExtendedRichTextData,
    ComponentDataAndProps,
    MacroComponentData
} from '@enonic/react-components';
import {RichText, RichTextMetaData} from '@enonic/react-components';
import type {DOMNode} from 'html-react-parser';
import {LiteralUnion, TextComponent} from '@enonic-types/core';

interface ExtraRichTextProps {
    nextMeta: MetaData;
    renderInEditMode?: boolean;
}

const RichTextView = (props: RichTextViewProps) => {
    const component: TextComponent = {
        type: 'text',
        path: props.meta.path,
        text: props.data.processedHtml
    }
    return <RichText<ExtraRichTextProps>
        data={wrapData(props.data)}
        meta={toRichTextMetaData(props.meta)}
        nextMeta={props.meta}
        component={component}
        className={props.className}
        tag={props.tag}
        replacer={wrapReplacer(props.customReplacer, props.meta, props.renderMacroInEditMode)}
        renderInEditMode={props.renderMacroInEditMode ?? true}
        Macro={MacroAdapter}
        Link={LinkAdapter}
        Image={ImageAdapter}
    />;
};

function wrapReplacer(nextReplacer: NextReplacer | undefined, meta: MetaData,
    renderMacroInEditMode: boolean): ComponentsReplacer<ExtraRichTextProps> {
    if (!nextReplacer) {
        return null;
    }
    return ({el, data}: { el: DOMNode, data: RichTextData, mode?: LiteralUnion<RequestMode> }) => {
        return nextReplacer(el, data, meta, renderMacroInEditMode);
    };
}

function wrapData(data: RichTextData): ExtendedRichTextData {
    if (!data.macros || !data.macros.length) {
        return data as ExtendedRichTextData;
    }
    const macroComponents = data.macros.map(macroData => {
        return {
            component: {
                type: 'macro',
                ref: macroData.ref,
                name: macroData.name,
                descriptor: macroData.descriptor
            },
            data: {
                name: macroData.name,
                descriptor: macroData.descriptor,
                config: macroData.config || {}
            }
        } as ComponentDataAndProps<MacroComponentData>;
    });
    return {
        ...data,
        macroComponents
    };
}

function MacroAdapter(props: MacroComponentParams<ExtraRichTextProps>) {
    const {children, component, data, common, meta, nextMeta, renderInEditMode} = props;

    return <BaseMacro data={data as Omit<MacroData, 'ref'>} meta={nextMeta} renderInEditMode={renderInEditMode}>{children}</BaseMacro>;
}

function LinkAdapter(props: LinkComponentParams<ExtraRichTextProps>) {
    return <Link href={getUrl(props.href, props.nextMeta)}>{props.children}</Link>;
}

function ImageAdapter(props: ImageComponentParams<ExtraRichTextProps>) {
    const srcSet = props.srcSet?.length ? UrlProcessor.processSrcSet(props.srcSet, props.nextMeta) : undefined;
    return <img src={getUrl(props.src, props.nextMeta)} style={props.style} alt={props.alt} sizes={props.sizes} srcSet={srcSet}/>;
}

function toRichTextMetaData(meta: MetaData): RichTextMetaData {
    return {
        type: meta.type,
        mode: meta.renderMode,
        path: meta.path,
        id: meta.id
    }
}

export default RichTextView;
