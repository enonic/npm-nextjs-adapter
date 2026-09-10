import type {AttachmentUrl, ImageUrl, MediaUrlResult, PageUrl, PageUrlMeta, UrlParts} from '../types';

import {getMediaUrl} from '../utils/getMediaUrl';
import {getPageUrl} from '../utils/getPageUrl';

export function imageUrl(data: UrlParts<ImageUrl>): string;
export function imageUrl(data?: UrlParts<ImageUrl> | null): string | undefined;
export function imageUrl(data?: UrlParts<ImageUrl> | null): string | undefined {
    return toMediaUrl(data);
}

export function mediaUrl(data: UrlParts<AttachmentUrl>): string;
export function mediaUrl(data?: UrlParts<AttachmentUrl> | null): string | undefined;
export function mediaUrl(data?: UrlParts<AttachmentUrl> | null): string | undefined {
    return toMediaUrl(data);
}

export function attachmentUrl(data: UrlParts<AttachmentUrl>): string;
export function attachmentUrl(data?: UrlParts<AttachmentUrl> | null): string | undefined;
export function attachmentUrl(data?: UrlParts<AttachmentUrl> | null): string | undefined {
    return toMediaUrl(data);
}

// Public URL: no prefix for the default locale. Pass {locale} without defaultLocale for the always-prefixed route path.
// Only path is required, so links without a Guillotine object can pass a bare {path}, e.g. the site root
export function pageUrl(data: UrlParts<PageUrl>, meta: PageUrlMeta): string;
export function pageUrl(data: UrlParts<PageUrl> | null | undefined, meta: PageUrlMeta): string | undefined;
export function pageUrl(data: UrlParts<PageUrl> | null | undefined, meta: PageUrlMeta): string | undefined {
    return data ? getPageUrl(data.path + (data.queryString || ''), meta) : undefined;
}

function toMediaUrl(data?: UrlParts<MediaUrlResult> | null): string | undefined {
    return data ? getMediaUrl(data.path + (data.queryString || '')) : undefined;
}
