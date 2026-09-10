import type {PageUrlMeta} from '../types';

import {stripOutsideSlashes} from './fixDoubleSlashes';

/** Relative URL for a site-relative content path, prefixed with the locale unless it is the default locale */
export function getPageUrl(path: string | null | undefined, meta: PageUrlMeta): string {
    const relative = stripOutsideSlashes(path || '');
    const prefix = meta.locale === meta.defaultLocale ? '' : `/${meta.locale}`;
    return relative ? `${prefix}/${relative}` : prefix || '/';
}
