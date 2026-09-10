import {beforeAll, describe, expect, jest, test as it} from '@jest/globals';
import {setupServerEnv} from '../constants';


describe('utils', () => {
    describe('getMediaUrl', () => {
        let mod: typeof import('../../src/utils/getMediaUrl');

        beforeAll(async () => {
            jest.resetModules();
            setupServerEnv();
            mod = await import('../../src/utils/getMediaUrl');
        });

        it('prepends the media base to a Guillotine path', () => {
            expect(mod.getMediaUrl('/media:image/hmdb/id:fp/width-500/a.jpg'))
                .toEqual('http://localhost:8080/api/media:image/hmdb/id:fp/width-500/a.jpg');
        });

        it('re-bases server-relative and absolute XP media urls', () => {
            expect(mod.getMediaUrl('/api/media:image/hmdb/id:fp/width-500/a.jpg'))
                .toEqual('http://localhost:8080/api/media:image/hmdb/id:fp/width-500/a.jpg');
            expect(mod.getMediaUrl('https://xp.example.com/api/media:attachment/hmdb/id:fp/a.pdf?download'))
                .toEqual('http://localhost:8080/api/media:attachment/hmdb/id:fp/a.pdf?download');
        });

        it('leaves non-media urls untouched', () => {
            expect(mod.getMediaUrl('/images/logo.svg')).toEqual('/images/logo.svg');
            expect(mod.getMediaUrl('https://example.com/page')).toEqual('https://example.com/page');
        });

        it('rewrites every candidate of a srcset', () => {
            expect(mod.getMediaSrcSet('/api/media:image/a/b/width-400/x.jpg 400w, /api/media:image/a/b/width-800/x.jpg 800w'))
                .toEqual('http://localhost:8080/api/media:image/a/b/width-400/x.jpg 400w, http://localhost:8080/api/media:image/a/b/width-800/x.jpg 800w');
            expect(mod.getMediaSrcSet('/api/media:image/a/b/width-400/x.jpg')).toEqual('http://localhost:8080/api/media:image/a/b/width-400/x.jpg');
        });

        it('uses ENONIC_MEDIA_CDN when set', async () => {
            jest.resetModules();
            setupServerEnv({ENONIC_MEDIA_CDN: 'https://cdn.example.com/'});
            const cdn = await import('../../src/utils/getMediaUrl');
            expect(cdn.getMediaUrl('/media:image/hmdb/id:fp/width-500/a.jpg')).toEqual('https://cdn.example.com/media:image/hmdb/id:fp/width-500/a.jpg');
        });
    });
});
