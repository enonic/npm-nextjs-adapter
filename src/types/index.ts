import type {ParsedUrlQuery} from 'node:querystring';
import type {ReactNode} from 'react';
// import type {NestedRecord} from '@enonic-types/core';


export type * from './component';
export type * from './componentProps';
export type * from './guillotine';
export type * from './next';


// Shape of content base-data API body
export interface ContentApiBaseBody {
    query?: string,                 // Override the default base-data query
    variables?: {                   // GraphQL variables inserted into the query
        path?: string,              // Full content item _path
        [key: string]: string | number | undefined,
    }
}

export interface ContentPathItem {
    contentPath: string[]
    locale: string,
}

export type Dict = Record<string, string>;

export interface LocaleContextType {
    dictionary: Dict
    locale: string
    localize: (key: string, ...args: any[]) => string
    setLocale: (locale: string) => Promise<Dict>
}

export interface PathFragment {
    index: number
    region: string
}

export interface PreviewParams {
    contentPath: string[]
    headers: Record<string, string>
    params: Record<string, string>
}

export interface ProjectLocaleConfig {
    default: boolean
    project: string
    site: string
    locale: string
}

export type ProjectLocalesConfig = Record<string, ProjectLocaleConfig>;

export type SelectorName = 'contentType' | 'page' | 'component' | 'part' | 'layout' | 'macro';

export interface ServerSideParams
    extends ParsedUrlQuery {
    // String array catching a sub-path assumed to match the site-relative path of an XP content.
    contentPath?: string[];
    mode?: string;
}

export interface StaticContentProps extends Record<string, any> {
    children?: ReactNode | ReactNode[];
    element?: string;
    condition: boolean;
}
