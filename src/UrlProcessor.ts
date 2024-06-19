import {fixDoubleSlashes, getLocaleProjectConfigs, RENDER_MODE} from './utils';
import {ImageData, LinkData, MetaData} from './guillotine/getMetaData';
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

    public static process(url: string, meta: MetaData, serverSide = false): string {
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

        let result: string;
        const baseUrl = meta?.baseUrl && meta?.baseUrl !== '/' ? meta.baseUrl : '';
        if (meta.renderMode === RENDER_MODE.NEXT) {
            // only add basePath and locale in next mode
            result = `/${normalUrl}`;
            if (!this.isRelative(url) && meta.locale !== meta.defaultLocale) {
                // do not append locale to local assets (having relative urls)
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
        return linkData.find(data => data.ref === ref)?.media !== null;
    }

    public static isContentImage(ref: string, linkData: ImageData[]): boolean {
        return linkData.find(data => data.ref === ref)?.image !== null;
    }

    public static processSrcSet(srcset: string, meta: MetaData): string {
        return srcset.split(/, */g).map(src => {
            const srcParts = src.trim().split(' ');
            switch (srcParts.length) {
                case 1:
                    return this.process(src, meta);
                case 2:
                    return this.process(srcParts[0], meta) + ' ' + srcParts[1];
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

// Actual site is going to be set in fetchContent method, but set a default fallback here too
const defaultConfig = getLocaleProjectConfigs().default;
UrlProcessor.setSiteKey(defaultConfig.site);

export const getUrl: (url: string, meta: MetaData, serverSide?: boolean) => string = UrlProcessor.process.bind(UrlProcessor);

