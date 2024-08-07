import type {ImageData, LinkData, MetaData} from '../types';


import {RENDER_MODE} from './constants';
import {fixDoubleSlashes} from '../utils/fixDoubleSlashes';
import {addBasePath} from 'next/dist/client/add-base-path';
import {parseUrl} from 'next/dist/shared/lib/router/utils/parse-url';


export class UrlProcessor {

    public static IMG_TAG = 'img';
    public static LINK_TAG = 'a';
    public static MACRO_TAG = 'editor-macro';

    public static IMG_ATTR = 'data-image-ref';
    public static LINK_ATTR = 'data-link-ref';
    public static MACRO_ATTR = 'data-macro-ref';

    private static IMG_ATMT_REGEXP = /_\/image\/|_\/attachment\//;
    private static endSlashPattern = /\/+$/;
    private static startSlashPattern = /^\/+/;
    private static localhostPattern = /localhost/;

    private static siteKey: string;

    public static process(url: string, meta: MetaData, serverSide = false, isResource = false): string {
        if (this.startsWithHash(url) || !meta || (this.isAttachmentUrl(url)) && meta.renderMode === RENDER_MODE.NEXT) {
            // do not process if:
            // - url starts with #
            // - meta is absent
            // - attachment urls in NEXT mode
            return url;
        }

        let normalUrl: string;
        if (this.isRelative(url)) {
            normalUrl = url;
        } else {
            // url is absolute, try to make it relative by striping apiUrl
            // NB: will fail if content api is not on the same domain as enonic xp
            const apiUrl = this.getApiUrl(meta);
            normalUrl = this.stripApiUrl(url, apiUrl);

            // if url is still absolute, return it as is
            if (!this.isRelative(normalUrl)) {
                return normalUrl;
            }
        }

        const baseUrl = meta?.baseUrl && meta?.baseUrl !== '/' ? meta.baseUrl : '';

        let result: string;
        if (meta.renderMode === RENDER_MODE.NEXT) {
            // only add basePath and locale in next mode
            result = `/${normalUrl}`;
            if (!isResource && meta.locale !== meta.defaultLocale) {
                // append locale if it's not the default one
                // to avoid additional middleware redirection
                // NB: don't add locale to resource urls
                result = `/${meta.locale}${result}`;
            }
            if (!serverSide) {
                // no need for baseurl and basepath on server
                result = addBasePath(`${baseUrl}${result}`);
            }
        } else {
            result = `${baseUrl}/${normalUrl}`;
        }

        return fixDoubleSlashes(result);
    }

    public static setSiteKey(key: string): void {
        this.siteKey = key;
    }

    public static isMediaLink(ref: string, linkData: LinkData[]): boolean {
        // Assuming linkData can't contain more than one entry with the same ref
        return Array.isArray(linkData) && !!linkData.find(data => data?.ref === ref)?.media;
    }

    public static isContentImage(ref: string, imageData: ImageData[]): boolean {
        // Assuming imageData can't contain more than one entry with the same ref
        return Array.isArray(imageData) && !!imageData.find(data => data.ref === ref)?.image;
    }

    public static processSrcSet(srcset: string, meta: MetaData): string {
        return srcset.split(/, */g).map(src => {
            const srcParts = src.trim().split(' ');
            switch (srcParts.length) {
                case 1: // src only
                    return this.process(src, meta);
                case 2: // width descriptor
                    return `${this.process(srcParts[0], meta)} ${srcParts[1]}`;
                case 3: // pixel density descriptor
                    return `${this.process(srcParts[0], meta)} ${srcParts[1]} ${srcParts[2]}`;
                default:
                    console.warn('Can not process image srcset: ' + src);
                    return src;
            }
        }).join(', ');
    }

    private static stripApiUrl(url: string, apiUrl: string): string {
        // normalise localhost-127.0.0.1 if present in urls
        const normalUrl = parseUrl(url.replace(this.localhostPattern, '127.0.0.1'));
        const normalApiUrl = parseUrl(apiUrl.replace(this.localhostPattern, '127.0.0.1'));

        // WARNING! disregarding the protocol (http/https)

        if (normalUrl.hostname !== normalApiUrl.hostname
            || normalUrl.port !== normalApiUrl.port) {
            // can't strip apiUrl if hostnames or ports are different
            return url;
        }

        const urlPathCrumbs = normalUrl.pathname.split('/');
        const apiUrlPathCrumbs = normalApiUrl.pathname.split('/');
        for (let i = 0; i < Math.min(apiUrlPathCrumbs.length, urlPathCrumbs.length);) {
            const urlPathCrumb = urlPathCrumbs[i];
            const apiUrlPathCrumb = apiUrlPathCrumbs[i];
            if (urlPathCrumb === apiUrlPathCrumb) {
                urlPathCrumbs.shift();
                apiUrlPathCrumbs.shift();
            } else {
                i++;
            }
        }

        return `/${urlPathCrumbs.join('/')}` + normalUrl.search + normalUrl.hash;
    }

    private static isAttachmentUrl(url: string): boolean {
        return this.IMG_ATMT_REGEXP.test(url);
    }

    private static startsWithHash(url: string): boolean {
        return url?.charAt(0) == '#';
    }

    private static isRelative(url: string): boolean {
        return !/^(?:ht|f)tps?:\/\/[^ :\r\n\t]+/.test(url);
    }

    private static getApiUrl(meta: MetaData) {
        let combinedUrl = meta.apiUrl?.replace(this.endSlashPattern, '') || '';
        if (this.siteKey?.length) {
            combinedUrl += '/' + this.siteKey.replace(this.startSlashPattern, '');
        }
        return combinedUrl;
    }
}

export function getUrl(url: string, meta: MetaData): string {
    return UrlProcessor.process(url, meta, false, false);
}

export function getAsset(url: string, meta: MetaData): string {
    return UrlProcessor.process(url, meta, false, true);
}

