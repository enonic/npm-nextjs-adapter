import {createServer} from 'http';
import {purgeCache} from './cache';
import {NextServer} from 'next/dist/server/next';
import path from 'path';
import {NextConfig} from 'next/dist/server/config-shared';

const host = process.env.HOST || '127.0.0.1';
const dev = process.env.NODE_ENV !== 'production';
const port = process.env.PORT && parseInt(process.env.PORT, 10) || (dev ? 3000 : 4242);

export const PURGE_CACHE_URL = '/_/enonic/cache/purge';

export const withEnonicCache = function (config: any) {
    const exp = config.experimental || {};
    exp.isrMemoryCacheSize = exp.isrMemoryCacheSize || 1000000;
    exp.incrementalCacheHandlerPath = path.resolve(__dirname, 'ClearableFileCache.js');
    config.experimental = exp;
    return config;
};

// Not typed to prevent collision of local types with end-user ones
export default async (next: (options: any) => any) => {
    const nextServer = next({dev}) as NextServer;
    const nextHandler = nextServer.getRequestHandler();
    return await nextServer.prepare().then(async () => {
        const nextNodeServer = await nextServer['getServer']?.();
        if (!nextNodeServer) {
            console.error('Unable to access incremental cache, cache purge endpoint will be disabled');
            return nextServer;
        }
        const opts: NextConfig = nextNodeServer['serverOptions'].conf;
        const purgeUrl = (opts?.basePath || '') + PURGE_CACHE_URL;

        console.info(`Staring cache purge endpoint at ${purgeUrl}...`);
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        const server = createServer(async (req, res) => {
            const parsedUrl = new URL(`http://${host}:${port}${req.url || ''}`);
            if (parsedUrl.pathname !== purgeUrl) {
                await nextHandler(req, res);
            } else if (dev) {
                console.warn('\nCache clearing is not available in DEV mode.\n');

                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({purged: false}));
            } else {
                const tokenParam = parsedUrl.searchParams.get('token');
                if (tokenParam !== process.env.API_TOKEN) {
                    // XP hijacks 401 to show login page, so send 407 instead
                    res.statusCode = 407;
                    res.end(JSON.stringify({message: 'Invalid token'}));
                    return;
                }

                const cache = nextNodeServer.getIncrementalCache({
                    requestHeaders: Object.assign({}, req.headers),
                });

                const pathParam = parsedUrl.searchParams.get('path') || undefined;
                await purgeCache(cache, pathParam);

                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({purged: true}));
            }

        }).listen(port, host, () => {
            console.info(`Server ready on ${host}:${port}`);
        }).on('error', (e) => {
            console.error('Server error:', e);
            server.close();
        });

        return nextServer;
    });
};