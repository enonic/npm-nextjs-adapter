import {fixDoubleSlashes, RENDER_MODE} from './utils';
import {ImageData, LinkData, MetaData} from './guillotine/getMetaData';
import {addBasePath} from 'next/dist/client/add-base-path';

export class UrlProcessor {

    public static IMG_TAG = 'img';
    public static LINK_TAG = 'a';
    public static MACRO_TAG = 'editor-macro';

    public static IMG_ATTR = 'data-image-ref';
    public static LINK_ATTR = 'data-link-ref';
    public static MACRO_ATTR = 'data-macro-ref';

    private static IMG_ATMT_REGEXP = /_\/image\/|_\/attachment\//;

    public static process(url: string, meta: MetaData, serverSide = false): string {

        if (this.startsWithHash(url) || this.isAbsolute(url) || !meta) {
            // do not process if:
            // - url starts with #
            // - url is absolute
            // - meta is absent
            return url;
        }

        const strippedUrl = url.replace(`/${meta.project}/${meta.branch}/${meta.project}`, '');
        const baseUrl = meta?.baseUrl && meta?.baseUrl !== '/' ? meta.baseUrl : '';

        let result;
        if (meta.renderMode === RENDER_MODE.NEXT) {
            // only add basePath and locale in next mode
            result = `/${strippedUrl}`;
            if (!serverSide) {
                // no need for baseurl and basepath on server
                result = addBasePath(`${baseUrl}${result}`);
            }
        } else {
            result = `${baseUrl}/${strippedUrl}`;
        }

        return fixDoubleSlashes(result);
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

export const getUrl: (url: string, meta: MetaData, serverSide?: boolean) => string = UrlProcessor.process.bind(UrlProcessor);

