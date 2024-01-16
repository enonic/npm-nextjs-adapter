import type {ImageData, LinkData, MetaData} from './types';


import {RENDER_MODE} from './constants';
import {fixDoubleSlashes} from './utils/fixDoubleSlashes';
import {getProjectLocaleConfigById} from './utils/getProjectLocaleConfigById';
import {commonChars} from './utils/commonChars';
import {addBasePath} from 'next/dist/client/add-base-path';


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
            // console.debug('UrlProcessor.process relative url: ' + url);
            normalUrl = url;
        } else {
            // console.debug('UrlProcessor.process NOT relative url: ' + url);
            // url is absolute, try to make it relative by striping apiUrl
            // NB: will fail if content api is not on the same domain as enonic xp
            const apiUrl = this.getApiUrl(meta);
            normalUrl = this.stripApiUrl(url, apiUrl);
        }
        // console.debug('UrlProcessor.process normalUrl: ' + normalUrl);
        
        const baseUrl = meta?.baseUrl && meta?.baseUrl !== '/' ? meta.baseUrl : '';
        // console.debug('UrlProcessor.process baseUrl: ' + baseUrl);
        
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
        if (!linkData || !Array.isArray(linkData) || !linkData.length) {
            return false;
        }
        // Assuming linkData can't contain more than one entry with the same ref
        const found = linkData.find(data => data?.ref === ref);
        if (!found) {
            return false;
        }
        return (found?.media || null) !== null;
    }

    public static isContentImage(ref: string, imageData: ImageData[]): boolean {
        if (!imageData || !Array.isArray(imageData) || !imageData.length) {
            return false;
        }
        // Assuming imageData can't contain more than one entry with the same ref
        const found = imageData.find(data => data.ref === ref);
        if (!found) {
            return false;
        }
        return (found?.image || null) !== null;
    }

    public static processSrcSet(srcset: string, meta: MetaData): string {
        return srcset.split(/, */g).map(src => {
            const srcParts = src.trim().split(' ');
            // console.debug('UrlProcessor.processSrcSet srcParts: ', srcParts);
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
        const normalUrl = url.replace(this.localhostPattern, '127.0.0.1');
        const normalApiUrl = apiUrl.replace(this.localhostPattern, '127.0.0.1');
        const common = commonChars(normalUrl, normalApiUrl);
        const remaining = common.length > 0 ? normalUrl.substring(common.length) : normalUrl;
        return (remaining.length > 0 && remaining.charAt(0) === '/') ? remaining.substring(1) : remaining;
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

// Actual site is going to be set in fetchContent method, but set a default fallback here too
const defaultConfig = getProjectLocaleConfigById();
UrlProcessor.setSiteKey(defaultConfig.site);

export function getUrl(url: string, meta: MetaData): string {
    return UrlProcessor.process(url, meta, false, false);
}

export function getAsset(url: string, meta: MetaData): string {
    return UrlProcessor.process(url, meta, false, true);
}

