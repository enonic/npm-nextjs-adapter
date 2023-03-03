import * as fs from 'fs';
import {IncrementalCache} from 'next/dist/server/lib/incremental-cache';
import ClearableFileCache from './ClearableFileCache';

const getCacheHandler = (cache: IncrementalCache): ClearableFileCache => {
    return cache.cacheHandler as ClearableFileCache;
};

export const purgeCache = async (cache: IncrementalCache, pathname?: string) => {
    if (pathname) {
        return purgePath(cache, pathname);
    } else {
        return purgeAll(cache);
    }
};

const purgePath = async (cache: IncrementalCache, pathname: string) => {
    const handler = getCacheHandler(cache);
    const fullPathname = await handler.getFsPath({pathname});
    try {
        /* Delete entry in cache */
        handler.delete(pathname);

        /* Delete files from disc */
        fs.unlinkSync(`${fullPathname}.html`);
        fs.unlinkSync(`${fullPathname}.json`);

        console.info(`\nCache deleted for '${fullPathname}'\n`);
    } catch (err) {
        console.error(`Could not delete cache of '${fullPathname}':`, err);
    }
};

const purgeAll = async (cache: IncrementalCache) => {
    const handler = getCacheHandler(cache);
    try {
        /* Purge cache */
        handler.clear();

        const {filePath: pagesRoot} = await handler.getFsPath({pathname: ''});

        if (fs.existsSync(pagesRoot)) {
            fs.rmSync(pagesRoot, {recursive: true});
        }

        console.info('\nCache was successfully purged\n');
    } catch (err) {
        console.error('Could not purge cache:', err);
    }
};