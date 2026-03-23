import type {ImageData, LinkData, MetaData} from '../src/types';

import {beforeAll, describe, expect, jest, test as it} from '@jest/globals';
import {RENDER_MODE} from '../src/common/constants';
import {setupServerEnv, META} from './constants';


const warn = jest.fn();

globalThis.console = {
    // error: console.error,
    error: jest.fn(),
    warn,
    log: jest.fn(),
    info: jest.fn(),
    debug: console.debug,
    // debug: jest.fn()
} as unknown as Console;

describe('UrlProcessor', () => {

    beforeAll(() => {
        setupServerEnv();
    });

    describe('isContentImage', () => {
        it('return true when ref matches and has image', () => {
            import('../src').then(({UrlProcessor}) => {
                const ref = 'ref';
                const imageData = [{
                    ref: 'ref',
                    image: {
                        id: 'id'
                    }
                }];
                expect(UrlProcessor.isContentImage(ref, imageData)).toEqual(true);
            });
        });
        it("handles imageData entry without ref", () => {
            import('../src').then(({UrlProcessor}) => {
                const ref = 'ref';
                const imageData: ImageData[] = [{} as ImageData, {
                    ref: 'ref',
                    image: {
                        id: 'id'
                    }
                }];
                expect(UrlProcessor.isContentImage(ref, imageData)).toEqual(true);
            });
        });
        it('return false when ref matches, but image is not even present', () => {
            import('../src').then(({UrlProcessor}) => {
                const ref = 'ref';
                const imageData = [{
                    ref: 'ref'
                }] as ImageData[];
                expect(UrlProcessor.isContentImage(ref, imageData)).toEqual(false);
            });
        });
        it('return false when ref matches, but image is null', () => {
            import('../src').then(({UrlProcessor}) => {
                const ref = 'ref';
                const imageData = [{
                    ref: 'ref',
                    image: null
                }];
                expect(UrlProcessor.isContentImage(ref, imageData)).toEqual(false);
            });
        });
        it("return false when imageData is empty", () => {
            import('../src').then(({UrlProcessor}) => {
                const ref = 'ref';
                const imageData = [];
                expect(UrlProcessor.isContentImage(ref, imageData)).toEqual(false);
            });
        });
        it("return false when ref isn't found", () => {
            import('../src').then(({UrlProcessor}) => {
                const ref = 'ref';
                const imageData = [{
                    ref: 'notref',
                    image: {
                        id: "doesn't matter"
                    }
                }];
                expect(UrlProcessor.isContentImage(ref, imageData)).toEqual(false);
            });
        });
    });

    describe('isMediaLink', () => {
        it('return true when ref matches and has media', () => {
            import('../src').then(({UrlProcessor}) => {
                const ref = 'ref';
                const linkData = [{
                    ref: 'ref',
                    uri: 'uri',
                    media: {
                        content: {
                            id: 'id'
                        },
                        intent: 'download' as 'download' | 'inline'
                    }
                }];
                expect(UrlProcessor.isMediaLink(ref, linkData)).toEqual(true);
            });
        });
        it("handles linkData entry without ref", () => {
            import('../src').then(({UrlProcessor}) => {
                const ref = 'ref';
                const linkData: LinkData[] = [{} as LinkData, {
                    ref: 'ref',
                    uri: 'uri',
                    media: {
                        content: {
                            id: 'id'
                        },
                        intent: 'download' as 'download' | 'inline'
                    }
                }];
                expect(UrlProcessor.isMediaLink(ref, linkData)).toEqual(true);
            });
        });
        it('return false when ref matches, but media is not even present', () => {
            import('../src').then(({UrlProcessor}) => {
                const ref = 'ref';
                const linkData = [{
                    ref: 'ref'
                }] as LinkData[];
                expect(UrlProcessor.isMediaLink(ref, linkData)).toEqual(false);
            });
        });
        it('return false when ref matches, but media is null', () => {
            import('../src').then(({UrlProcessor}) => {
                const ref = 'ref';
                const linkData = [{
                    ref: 'ref',
                    uri: 'uri',
                    media: null
                }];
                expect(UrlProcessor.isMediaLink(ref, linkData)).toEqual(false);
            });
        });
        it("return false when linkData is empty", () => {
            import('../src').then(({UrlProcessor}) => {
                const ref = 'ref';
                const linkData = [];
                expect(UrlProcessor.isMediaLink(ref, linkData)).toEqual(false);
            });
        });
        it("return false when ref isn't found", () => {
            import('../src').then(({UrlProcessor}) => {
                const ref = 'ref';
                const linkData = [{
                    ref: 'notref',
                    uri: 'uri',
                    media: {
                        content: {
                            id: "doesn't matter"
                        },
                        intent: 'download' as 'download' | 'inline'
                    }
                }];
                expect(UrlProcessor.isMediaLink(ref, linkData)).toEqual(false);
            });
        });
    });

    describe('getAsset', () => {
        it("returns XP asset url with api url host and without language prefix", () => {
            import('../src').then(({getAsset}) => {
                const url = '/_/media:image/image.jpg';
                expect(getAsset(url, {
                    ...META,
                    renderMode: RENDER_MODE.NEXT
                })).toEqual('http://localhost:8080/_/media:image/image.jpg');
            });
        });

        it("returns relative next asset url without language prefix", () => {
            import('../src').then(({getAsset}) => {
                const url = '/images/image.jpg';
                expect(getAsset(url, {
                    ...META,
                    renderMode: RENDER_MODE.NEXT
                })).toEqual('/images/image.jpg');
            });
        });
    });

    describe('getUrl', () => {
        it("returns site root url when url is empty", () => {
            import('../src').then(({getUrl}) => {
                const url = getUrl('', META);
                const urlParts = url.split('?');
                expect(urlParts[0]).toEqual('/site');
                expect(urlParts[1]).toMatch(/^xp=.+$/);
            });
        });
    });

    describe('process', () => {
        [{
            url: '#hash',
            expected: '#hash',
            meta: META
        }, {
            // urls are returned as is without meta
            url: '/site/_/media:image/1234',
            expected: '/site/_/media:image/1234',
            meta: false as unknown as MetaData
        }, {
            // absolute urls are returned as-is
            url: 'http://localhost:8080/site/_/media:image/1234',
            expected: 'http://localhost:8080/site/_/media:image/1234',
            meta: {
                ...META,
                renderMode: RENDER_MODE.NEXT
            }
        }, {
            // xp media urls are transformed to absolute
            url: '/site/_/media:attachment/1234',
            expected: 'http://localhost:8080/site/_/media:attachment/1234',
            meta: {
                ...META,
                renderMode: RENDER_MODE.NEXT
            }
        }, {
            // xp media urls are transformed to absolute
            url: '/site/_/media:image/1234',
            expected: 'http://localhost:8080/site/_/media:image/1234',
            meta: {
                ...META,
                renderMode: RENDER_MODE.NEXT
            }
        }, {
            // language is added in next mode
            url: '/path',
            expected: '/no/path',
            meta: {
                ...META,
                renderMode: RENDER_MODE.NEXT
            }
        }, {
            url: 'https://google.com',
            expected: 'https://google.com',
            meta: {
                ...META
            }
        }].forEach(({url, expected, meta}) => {
            it(`should return ${expected} when url is ${url}`, () => {
                import('../src').then(({UrlProcessor}) => {
                    expect(UrlProcessor.process(url, meta)).toEqual(expected);
                });
            });
        });
    }); // process

    describe('processSrcSet', () => {
        it("works for srcset without width descriptor", () => {
            import('../src').then(({UrlProcessor}) => {
                const srcset = '/images/elva-fairy-480w.jpg';
                expect(UrlProcessor.processSrcSet(srcset, META)).toEqual('/images/elva-fairy-480w.jpg');
            });
        });
        it("works for srcset with a single src", () => {
            import('../src').then(({UrlProcessor}) => {
                const srcset = '/_/media:image/elva-fairy-480w.jpg 480w 1x';
                expect(UrlProcessor.processSrcSet(srcset, META)).toEqual('http://localhost:8080/_/media:image/elva-fairy-480w.jpg 480w 1x');
            });
        });
        it("works for srcset with a two srcs", () => {
            import('../src').then(({UrlProcessor}) => {
                const srcset = '/_/media:attachment/elva-fairy-480w.jpg 480w 1x, /_/media:attachment/elva-fairy-800w.jpg 800w';
                expect(UrlProcessor.processSrcSet(srcset, META)).toEqual(
                    'http://localhost:8080/_/media:attachment/elva-fairy-480w.jpg 480w 1x, http://localhost:8080/_/media:attachment/elva-fairy-800w.jpg 800w');
            });
        });
        it("warns and returns srcset when it can't process the srcset", () => {
            import('../src').then(({UrlProcessor}) => {
                const srcset = 'src width pixel notsupported';
                expect(UrlProcessor.processSrcSet(srcset, META)).toEqual(srcset);
                expect(warn).toHaveBeenCalledWith(`Can not process image srcset: ${srcset}`);
            });
        });
    }); // processSrcSet
}); // UrlProcessor
