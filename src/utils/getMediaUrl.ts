import {MEDIA_URL} from '../common/env';

const MEDIA_MARKER = '/media:';

/** Absolute media URL from a Guillotine `path` or any XP media `url` (server-side only, passthrough on the client) */
export function getMediaUrl(urlOrPath: string): string {
    const index = urlOrPath.indexOf(MEDIA_MARKER);
    if (!MEDIA_URL || index < 0) {
        return urlOrPath;
    }
    return MEDIA_URL + urlOrPath.slice(index);
}

export function getMediaSrcSet(srcSet: string): string {
    return srcSet.split(',').map((candidate) => {
        const [url, ...descriptors] = candidate.trim().split(/\s+/);
        return [getMediaUrl(url), ...descriptors].join(' ');
    }).join(', ');
}
