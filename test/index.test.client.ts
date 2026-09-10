import { beforeEach, describe, expect, jest, test as it } from '@jest/globals';


globalThis.console = {
    error: console.error,
    // error: jest.fn(),
    warn: jest.fn(),
    log: jest.fn(),
    info: jest.fn(),
    debug: jest.fn()
} as unknown as Console;


describe('index (CLIENT)', () => {

    beforeEach(() => {
        jest.resetModules();
        jest.replaceProperty(process, 'env', {});
    });

    it('does not require ENONIC_* env vars on the client (CLIENT)', async () => {
        const { APP_NAME } = await import('../src');

        expect(APP_NAME).toBeUndefined();
    });

    it('leaves media urls untouched on the client, where no media base is known (CLIENT)', async () => {
        const { imageUrl } = await import('../src');

        expect(imageUrl({
            url: '/api/media:image/hmdb/id:fp/width-500/a.jpg',
            path: '/media:image/hmdb/id:fp/width-500/a.jpg',
            queryString: '',
            context: 'hmdb',
            id: 'id',
            fingerprint: 'fp',
            scale: 'width-500',
            name: 'a.jpg'
        })).toEqual('/media:image/hmdb/id:fp/width-500/a.jpg');
    });
}); // describe index
