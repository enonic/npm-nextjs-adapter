import type {ImageData, LinkData, MetaData} from '../types';
import {RENDER_MODE} from './constants';
import {fixDoubleSlashes} from '../utils/fixDoubleSlashes';
import {addBasePath} from 'next/dist/client/add-base-path';
import {API_URL} from './env';

export class UrlProcessor {

    public static IMG_TAG = 'img';
    public static LINK_TAG = 'a';
    public static MACRO_TAG = 'editor-macro';

    public static IMG_ATTR = 'data-image-ref';
    public static LINK_ATTR = 'data-link-ref';
    public static MACRO_ATTR = 'data-macro-ref';

    private static IMG_ATMT_REGEXP = /_\/media:image|attachment\//;

    public static process(url: string, meta: MetaData, serverSide = false, isResource = false): string {
        // console.debug(`UrlProcessor: renderMode=${meta?.renderMode}, serverSide=${serverSide}, isResource=${isResource}):`);
        if (this.startsWithHash(url) || this.isAbsolute(url) || !meta) {
            // do not process if:
            // - url starts with #
            // - url is absolute
            // - meta is absent
            console.debug(`UrlProcessor [${meta?.renderMode}]: ${url} ==> same`);
            return url;
        }

        if (this.isAttachmentUrl(url)) {
            // XP resource, add api url host and base url
            const apiUrl = new URL(API_URL);
            const result = `${apiUrl.origin}${url}`;

            console.debug(`UrlProcessor [${meta?.renderMode}]: ${url} ==> ${result}`);
            return result;
        }

        let result = this.normalizeBaseUrl(url, meta, isResource);

        if (!isResource && meta.locale !== meta.defaultLocale) {
            // append locale if it's not the default one
            // to avoid additional middleware redirection
            // NB: don't add locale to resource urls
            result = `/${meta.locale}${result}`;
        }

        // only add basePath and locale in next mode
        if (meta.renderMode === RENDER_MODE.NEXT) {
            if (!serverSide) {
                // no need for baseurl and basepath on server
                result = addBasePath(result);
            }
        }
        result = fixDoubleSlashes(result);

        console.debug(`UrlProcessor [${meta?.renderMode}]: ${url} ==> ${result}`);
        return result;
    }

    private static normalizeBaseUrl(url: string, meta: MetaData, isResource: boolean) {
        if (isResource) {
            return url;
        }

        let result = url;
        if (result.charAt(0) !== '/') {
            result = '/' + result;
        }
        if (!result.startsWith(meta.site)) {
            result = `${meta.site}${result !== '/' ? result : ''}`;
        }

        return result;
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
                return UrlProcessor.process(src, meta, false, true);
            case 2: // width descriptor
                return `${UrlProcessor.process(srcParts[0], meta, false, true)} ${srcParts[1]}`;
            case 3: // pixel density descriptor
                return `${UrlProcessor.process(srcParts[0], meta, false, true)} ${srcParts[1]} ${srcParts[2]}`;
            default:
                console.warn('Can not process image srcset: ' + src);
                return src;
            }
        }).join(', ');
    }

    private static isAttachmentUrl(url: string): boolean {
        return this.IMG_ATMT_REGEXP.test(url);
    }

    private static startsWithHash(url: string): boolean {
        return url?.charAt(0) == '#';
    }

    private static isAbsolute(url: string): boolean {
        return /^(?:ht|f)tps?:\/\/[^ :\r\n\t]+/.test(url);
    }
}

export function getUrl(url: string, meta: MetaData): string {
    return UrlProcessor.process(url, meta, false, false);
}

