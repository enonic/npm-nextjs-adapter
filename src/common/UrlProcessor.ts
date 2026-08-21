import type { ImageData, LinkData, MetaData } from '../types';

export class UrlProcessor {

    public static IMG_TAG = 'img';
    public static LINK_TAG = 'a';
    public static MACRO_TAG = 'editor-macro';

    public static IMG_ATTR = 'data-image-ref';
    public static LINK_ATTR = 'data-link-ref';
    public static MACRO_ATTR = 'data-macro-ref';

    /** * @deprecated No need to process urls anymore! */
    public static process(url: string, meta: MetaData, serverSide = false, isResource = false): string {
        return url;
    }

    public static isMediaLink(ref: string, linkData: LinkData[]): boolean {
        // Assuming linkData can't contain more than one entry with the same ref
        return Array.isArray(linkData) && !!linkData.find(data => data?.ref === ref)?.media;
    }

    public static isContentImage(ref: string, imageData: ImageData[]): boolean {
        // Assuming imageData can't contain more than one entry with the same ref
        return Array.isArray(imageData) && !!imageData.find(data => data.ref === ref)?.image;
    }

    /** * @deprecated No need to process urls anymore! */
    public static processSrcSet(srcset: string, meta: MetaData): string {
        console.warn('processSrcSet() is deprecated. No need to process urls anymore!');
        return srcset;
    }
}

/** * @deprecated No need to process urls anymore! */
export function getUrl(url: string, meta: MetaData): string {
    console.warn('getUrl() is deprecated. No need to process urls anymore!');
    return UrlProcessor.process(url, meta, false, false);
}

