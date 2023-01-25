import {commonChars, RENDER_MODE, SITE_KEY} from './utils';
import {ImageData, LinkData, MetaData} from './guillotine/getMetaData';
import {useRouter} from 'next/router';

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

    public static process(url: string, meta: MetaData): string {
        let result;
        if (!meta || !this.isPageUrl(url) && meta.renderMode === RENDER_MODE.NEXT) {
            // keep content urls absolute in next mode for everything but page urls
            result = url;
        } else {
            const apiUrl = this.getApiUrl(meta);
            const strippedUrl = this.stripApiUrl(url, apiUrl);
            let basePath: string | undefined;
            // only add basePath in next
            if (meta.renderMode === RENDER_MODE.NEXT) {
                try {
                    basePath = useRouter().basePath;
                } catch (e) {
                    console.error('Error getting basePath from nextjs router', e);
                }
            }
            result = (basePath && basePath !== '/' ? basePath : '') + (meta?.baseUrl || '') + strippedUrl;
        }

        return result;
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

    private static stripApiUrl(url: string, apiUrl: string): string {
        // normalise localhost-127.0.0.1 if present in urls
        const normalUrl = url.replace(this.localhostPattern, '127.0.0.1');
        const normalApiUrl = apiUrl.replace(this.localhostPattern, '127.0.0.1');
        const common = commonChars(normalUrl, normalApiUrl);
        const remaining = common.length > 0 ? normalUrl.substring(common.length) : normalUrl;
        return (remaining.length > 0 && remaining.charAt(0) === '/') ? remaining.substring(1) : remaining;
    }

    private static isPageUrl(url: string): boolean {
        return !this.IMG_ATMT_REGEXP.test(url);
    }

    private static getApiUrl(meta: MetaData) {
        let combinedUrl = meta.apiUrl?.replace(this.endSlashPattern, '') || '';
        if (this.siteKey?.length) {
            combinedUrl += '/' + this.siteKey.replace(this.startSlashPattern, '');
        }
        return combinedUrl;
    }
}

UrlProcessor.setSiteKey(SITE_KEY);

export const getUrl: (url: string, meta: MetaData) => string = UrlProcessor.process.bind(UrlProcessor);

