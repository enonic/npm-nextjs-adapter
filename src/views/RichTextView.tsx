import type {MetaData, RichTextViewProps, Replacer as NextReplacer, RichTextData, MacroData} from '../types';

import BaseMacro from './BaseMacro';
import Link from 'next/link';
import {mediaUrl, pageUrl} from '../guillotine/urls';
import {useMemo} from 'react';
import type {
    MacroComponentParams,
    LinkComponentParams,
    ImageComponentParams,
    Replacer as ComponentsReplacer,
    ExtendedRichTextData,
    ComponentDataAndProps,
    MacroComponentData,
    UrlValue
} from '@enonic/react-components';
import {RichText, RichTextMetaData} from '@enonic/react-components';
import type {TextComponent} from '@enonic-types/core';

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
        replacer={wrapReplacer(props.customReplacer, props.meta, props.data)}
        Macro={MacroAdapter}
        Link={LinkAdapter}
        Image={ImageAdapter}
    />;
};

function wrapReplacer(nextReplacer: NextReplacer | undefined, meta: MetaData, data: RichTextData): ComponentsReplacer<ExtraRichTextProps> {
    if (!nextReplacer) {
        return null;
    }
    return ({el}) => nextReplacer(el, data, meta);
}

function wrapData(data: RichTextData): ExtendedRichTextData {
    const macroComponents = data.macros?.map((macroData): ComponentDataAndProps<MacroComponentData> => {
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
    const {data} = props;
    const contentUrl = typeof data?.pageUrl === 'string' ? data.pageUrl : pageUrl(data?.pageUrl, props.nextMeta);
    if (contentUrl) {
        return <Link href={contentUrl + (data.fragment || '')} data-content-path={data.content?._path} target={props.target} title={props.title}>{props.children}</Link>;
    }
    // Referenced HTML URLs are placeholders, including when the reference cannot be resolved.
    const href = data ? resolveMediaUrl(data.media?.mediaUrl) : props.href;
    return <a href={href} target={props.target} title={props.title}>{props.children}</a>;
}

function ImageAdapter(props: ImageComponentParams<ExtraRichTextProps>) {
    const src = resolveMediaUrl(props.data?.src);
    if (!src) {
        return null;
    }
    const srcSet = props.data.srcset?.map((source) => {
        const url = resolveMediaUrl(source.imageUrl);
        return url ? `${url} ${source.width}w` : undefined;
    }).filter(Boolean).join(', ');
    return <img src={src} style={props.style} alt={props.alt} sizes={props.sizes} srcSet={srcSet}/>;
}

function resolveMediaUrl(value?: UrlValue | null): string | undefined {
    return typeof value === 'string' ? value : mediaUrl(value);
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
