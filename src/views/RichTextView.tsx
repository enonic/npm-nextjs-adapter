import type {MetaData, PageUrl, RichTextViewProps, Replacer as NextReplacer, RichTextData, MacroData} from '../types';

import BaseMacro from './BaseMacro';
import Link from 'next/link';
import {pageUrl} from '../guillotine/urls';
import {getMediaSrcSet, getMediaUrl} from '../utils/getMediaUrl';
import {useMemo} from 'react';
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
}

const RichTextView = (props: RichTextViewProps) => {
    const component: TextComponent = useMemo(() => ({
        type: 'text',
        path: props.meta.path,
        text: props.data.processedHtml
    }), [props.meta.path, props.data.processedHtml]);

    return <RichText<ExtraRichTextProps>
        data={wrapData(props.data)}
        meta={toRichTextMetaData(props.meta)}
        nextMeta={props.meta}
        component={component}
        className={props.className}
        tag={props.tag}
        replacer={wrapReplacer(props.customReplacer, props.meta)}
        Macro={MacroAdapter}
        Link={LinkAdapter}
        Image={ImageAdapter}
    />;
};

function wrapReplacer(nextReplacer: NextReplacer | undefined, meta: MetaData): ComponentsReplacer<ExtraRichTextProps> {
    if (!nextReplacer) {
        return null;
    }
    return ({el, data}: { el: DOMNode, data: RichTextData, mode?: LiteralUnion<RequestMode> }) => {
        return nextReplacer(el, data, meta);
    };
}

function wrapData(data: RichTextData): ExtendedRichTextData {
    if (!data.macros || !data.macros.length) {
        return data;
    }
    const macroComponents = data.macros.map((macroData): ComponentDataAndProps<MacroComponentData> => {
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
        };
    });
    return {
        ...data,
        macroComponents
    };
}

function MacroAdapter(props: MacroComponentParams<ExtraRichTextProps>) {
    const {children, component, data, common, meta, nextMeta} = props;

    return <BaseMacro data={data as Omit<MacroData, 'ref'>} meta={nextMeta}>{children}</BaseMacro>;
}

function LinkAdapter(props: LinkComponentParams<ExtraRichTextProps>) {
    const contentUrl = pageUrl(props.content?.pageUrl as unknown as PageUrl | undefined, props.nextMeta);
    if (contentUrl) {
        return <Link href={contentUrl} data-content-path={props.content?._path}>{props.children}</Link>;
    }
    // media and external links keep the href from processedHtml, media ones get the media base URL
    return <a href={getMediaUrl(props.href)} target={props.target} title={props.title}>{props.children}</a>;
}

function ImageAdapter(props: ImageComponentParams<ExtraRichTextProps>) {
    const srcSet = props.srcSet && getMediaSrcSet(props.srcSet);
    return <img src={getMediaUrl(props.src)} style={props.style} alt={props.alt} sizes={props.sizes} srcSet={srcSet}/>;
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
