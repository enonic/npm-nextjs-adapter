import type {AttachmentUrl, ImageUrl, MediaUrlMeta, MediaUrlResult, PageUrl, PageUrlMeta, UrlParts} from '../types';

import {getMediaProxyUrl, getMediaUrl} from '../utils/getMediaUrl';
import {getPageUrl} from '../utils/getPageUrl';

export function imageUrl(data: UrlParts<ImageUrl>, meta: MediaUrlMeta): string;
export function imageUrl(data: UrlParts<ImageUrl> | null | undefined, meta: MediaUrlMeta): string | undefined;
export function imageUrl(data: UrlParts<ImageUrl> | null | undefined, meta: MediaUrlMeta): string | undefined {
    return toMediaUrl(data, meta);
}

export function mediaUrl(data: UrlParts<AttachmentUrl>, meta: MediaUrlMeta): string;
export function mediaUrl(data: UrlParts<AttachmentUrl> | null | undefined, meta: MediaUrlMeta): string | undefined;
export function mediaUrl(data: UrlParts<AttachmentUrl> | null | undefined, meta: MediaUrlMeta): string | undefined {
    return toMediaUrl(data, meta);
}

export function attachmentUrl(data: UrlParts<AttachmentUrl>, meta: MediaUrlMeta): string;
export function attachmentUrl(data: UrlParts<AttachmentUrl> | null | undefined, meta: MediaUrlMeta): string | undefined;
export function attachmentUrl(data: UrlParts<AttachmentUrl> | null | undefined, meta: MediaUrlMeta): string | undefined {
    return toMediaUrl(data, meta);
}

// Public URL: no prefix for the default locale. Pass {locale} without defaultLocale for the always-prefixed route path.
// Only path is required, so links without a Guillotine object can pass a bare {path}, e.g. the site root
export function pageUrl(data: UrlParts<PageUrl>, meta: PageUrlMeta): string;
export function pageUrl(data: UrlParts<PageUrl> | null | undefined, meta: PageUrlMeta): string | undefined;
export function pageUrl(data: UrlParts<PageUrl> | null | undefined, meta: PageUrlMeta): string | undefined {
    return data ? getPageUrl(data.path, meta) + (data.queryString || '') : undefined;
}

function toMediaUrl(data: UrlParts<MediaUrlResult> | null | undefined, meta: MediaUrlMeta): string | undefined {
    if (!data) {
        return undefined;
    }
    const url = data.path + (data.queryString || '');
    return meta.branch === 'draft' ? getMediaProxyUrl(url) : getMediaUrl(url);
}
