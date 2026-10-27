import type {ImageUrlArgs, MediaUrlArgs, PageUrlArgs} from '../types';

// Every field of the Guillotine 9 result types, so callers can build their own URLs from the parts
export const IMAGE_URL_FIELDS = '{ path queryString context id fingerprint scale name }';
export const ATTACHMENT_URL_FIELDS = '{ path queryString context id fingerprint name intent }';
export const PAGE_URL_FIELDS = '{ baseUrl path queryString }';

export const imageUrlQuery = (args?: ImageUrlArgs): string => `imageUrl${toGraphqlArgs(args)} ${IMAGE_URL_FIELDS}`;

export const mediaUrlQuery = (args?: MediaUrlArgs): string => `mediaUrl${toGraphqlArgs(args)} ${ATTACHMENT_URL_FIELDS}`;

export const attachmentUrlQuery = (args?: MediaUrlArgs): string => `attachmentUrl${toGraphqlArgs(args)} ${ATTACHMENT_URL_FIELDS}`;

export const pageUrlQuery = (args?: PageUrlArgs): string => `pageUrl${toGraphqlArgs(args)} ${PAGE_URL_FIELDS}`;

function toGraphqlArgs(args: object = {}): string {
    const entries = Object.entries(args).filter(([, value]) => value !== undefined && value !== null);
    return entries.length ? `(${entries.map(([key, value]) => `${key}: ${toGraphqlLiteral(value)}`).join(', ')})` : '';
}

export function toGraphqlLiteral(value: unknown): string {
    if (Array.isArray(value)) {
        return `[${value.map(toGraphqlLiteral).join(', ')}]`;
    }
    if (value !== null && typeof value === 'object') {
        // GraphQL object literals have unquoted keys, unlike JSON
        return `{${Object.entries(value).map(([key, val]) => `${key}: ${toGraphqlLiteral(val)}`).join(', ')}}`;
    }
    return JSON.stringify(value);
}
