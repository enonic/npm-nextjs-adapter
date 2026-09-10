import type {MetaData} from './componentProps';
import type {AttachmentUrl, ImageUrl, PageUrl} from './guillotine';

export type GraphqlJson = Record<string, unknown>;

export interface ImageUrlArgs {
    scale: string;
    quality?: number;
    background?: string;
    format?: string;
    filter?: string;
    params?: GraphqlJson;
}

export interface MediaUrlArgs {
    download?: boolean;
    params?: GraphqlJson;
}

export interface PageUrlArgs {
    params?: GraphqlJson;
}

/** Object returned by imageUrlQuery(), mediaUrlQuery() and attachmentUrlQuery(): every field of the Guillotine URL type */
export type MediaUrlResult = ImageUrl | AttachmentUrl;

/** Object returned by pageUrlQuery() */
export type PageUrlResult = PageUrl;

/** Meta for pageUrl(): the locale prefix is omitted when `locale` equals `defaultLocale`; without `defaultLocale` it is always added */
export type PageUrlMeta = Pick<MetaData, 'locale'> & Partial<Pick<MetaData, 'defaultLocale'>>;

/** Minimal input for the *Url() functions: `path` is required, `queryString` optional */
export type UrlParts<T extends {path: string; queryString: string}> = Pick<T, 'path'> & Partial<Pick<T, 'queryString'>>;

export interface UrlMappingRule {
    sources: string[];
    target: string;
    matchAny?: boolean;
}
