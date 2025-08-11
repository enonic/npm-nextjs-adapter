/// <reference types="react" />

export type * from './component';
export type * from './componentProps';
export type * from './guillotine';
export type * from './i18n';
export type * from './next';
export type * from './util';


// Shape of content base-data API body
export interface ContentApiBaseBody {
    query?: string,                             // Override the default base-data query
    variables?: ContentApiBaseBodyVariables     // GraphQL variables inserted into the query
}

export interface ContentApiBaseBodyVariables {
    path?: string,              // Full content item _path
    [key: string]: string | number | undefined
}

export interface ContentPathItem {
    contentPath: string[]
    locale: string
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

export interface LocaleMapping {
    default: boolean
    project: string
    site: string
    locale: string
}

export type LocaleMappings = Record<string, LocaleMapping>;

export type SelectorName = 'contentType' | 'page' | 'component' | 'part' | 'layout' | 'macro';

// https://nextjs.org/docs/app/api-reference/functions/fetch
export type FetchOptions = Omit<RequestInit, 'body'> & {
    body?: ContentApiBaseBody,
    next?: {
        revalidate?: boolean | number,
        tags?: string[]
    }
};

export interface StaticContentProps extends Record<string, any> {
    children?: React.ReactNode;
    element?: string;
    condition: boolean;
}
