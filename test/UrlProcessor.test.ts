import type {ImageData, LinkData, MetaData} from '../src/types';
import type * as SrcModule from '../src';

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

    let UrlProcessor: typeof SrcModule.UrlProcessor;
    let getAsset: typeof SrcModule.getAsset;
    let getUrl: typeof SrcModule.getUrl;

    beforeAll((done) => {
        setupServerEnv();
        import('../src').then((mod) => {
            UrlProcessor = mod.UrlProcessor;
            getAsset = mod.getAsset;
            getUrl = mod.getUrl;
            done();
        });
    });

    describe('isContentImage', () => {
        it('return true when ref matches and has image', () => {
            const ref = 'ref';
            const imageData = [{
                ref: 'ref',
                image: {
                    id: 'id'
                }
            }];
            expect(UrlProcessor.isContentImage(ref, imageData)).toEqual(true);
        });
        it("handles imageData entry without ref", () => {
            const ref = 'ref';
            const imageData: ImageData[] = [{} as ImageData, {
                ref: 'ref',
                image: {
                    id: 'id'
                }
            }];
            expect(UrlProcessor.isContentImage(ref, imageData)).toEqual(true);
        });
        it('return false when ref matches, but image is not even present', () => {
            const ref = 'ref';
            const imageData = [{
                ref: 'ref'
            }] as ImageData[];
            expect(UrlProcessor.isContentImage(ref, imageData)).toEqual(false);
        });
        it('return false when ref matches, but image is null', () => {
            const ref = 'ref';
            const imageData = [{
                ref: 'ref',
                image: null
            }];
            expect(UrlProcessor.isContentImage(ref, imageData)).toEqual(false);
        });
        it("return false when imageData is empty", () => {
            const ref = 'ref';
            const imageData = [];
            expect(UrlProcessor.isContentImage(ref, imageData)).toEqual(false);
        });
        it("return false when ref isn't found", () => {
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

    describe('isMediaLink', () => {
        it('return true when ref matches and has media', () => {
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
        it("handles linkData entry without ref", () => {
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
        it('return false when ref matches, but media is not even present', () => {
            const ref = 'ref';
            const linkData = [{
                ref: 'ref'
            }] as LinkData[];
            expect(UrlProcessor.isMediaLink(ref, linkData)).toEqual(false);
        });
        it('return false when ref matches, but media is null', () => {
            const ref = 'ref';
            const linkData = [{
                ref: 'ref',
                uri: 'uri',
                media: null
            }];
            expect(UrlProcessor.isMediaLink(ref, linkData)).toEqual(false);
        });
        it("return false when linkData is empty", () => {
            const ref = 'ref';
            const linkData = [];
            expect(UrlProcessor.isMediaLink(ref, linkData)).toEqual(false);
        });
        it("return false when ref isn't found", () => {
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


    describe('getAsset', () => {
        it("returns asset url without language prefix", () => {
            const url = '/images/image.jpg';
            expect(getAsset(url, {
                ...META,
                renderMode: RENDER_MODE.NEXT
            })).toEqual('/site/inline/enonic-homepage/draft/images/image.jpg');
        });
    });

    describe('getUrl', () => {
        it("returns baseurl when url is empty", () => {
            const url = '';
            expect(getUrl(url, META)).toEqual('/site/inline/enonic-homepage/draft/');
        });
    });

    describe('process', () => {
        [{
            url: '#hash',
            expected: '#hash',
            meta: META
        }, {
            url: 'http://localhost:8080/site/path',
            expected: 'http://localhost:8080/site/path',
            meta: false as unknown as MetaData
        }, {
            url: 'http://localhost:8080/site/_/media:image/1234',
            expected: 'http://localhost:8080/site/_/media:image/1234',
            meta: {
                ...META,
                renderMode: RENDER_MODE.NEXT
            }
        }, {
            url: 'http://localhost:8080/site/_/media:attachment/1234',
            expected: 'http://localhost:8080/site/_/media:attachment/1234',
            meta: {
                ...META,
                renderMode: RENDER_MODE.NEXT
            }
        }, {
            // isRelative
            url: '/path',
            expected: '/site/inline/enonic-homepage/draft/no/path',
            meta: {
                ...META,
                renderMode: RENDER_MODE.NEXT
            }
        }, {
            url: 'http://localhost:8080/site/path',
            expected: '/site/inline/enonic-homepage/draft/no/path',
            meta: {
                ...META,
                renderMode: RENDER_MODE.NEXT
            }
        }, {
            url: 'http://localhost:8080/site/path',
            expected: '/site/inline/enonic-homepage/draft/path',
            meta: {
                ...META,
                apiUrl: 'http://localhost:8080/site/_/service/com.enonic.app.enonic/guillotine/query'
            }
        }, {
            url: 'http://localhost:8080/simon',
            expected: '/site/inline/enonic-homepage/draft/simon',
            meta: {
                ...META,
                apiUrl: 'https://localhost:8080/site/_/service/com.enonic.app.enonic/guillotine/query'
            }
        }, {
            url: 'https://google.com',
            expected: 'https://google.com',
            meta: {
                ...META,
                apiUrl: 'http://localhost:8080/site/_/service/com.enonic.app.enonic/guillotine/query'
            }
        }].forEach(({url, expected, meta}) => {
            it(`should return ${expected} when url is ${url}`, () => {
                expect(UrlProcessor.process(url, meta)).toEqual(expected);
            });
        });
        it("should not cut out site name from absolute url if site differs from one from locale mapping", () => {
            expect(UrlProcessor.process('http://localhost:8080/site/nettsteder/simon', {
                ...META,
                apiUrl: 'http://localhost:8080/site'
            })).toEqual('/site/inline/enonic-homepage/draft/nettsteder/simon');
        })
        it("should cut out site name from absolute url if it equals one from locale mapping", () => {
            expect(UrlProcessor.process('http://localhost:8080/site/nettsted/don/simon', {
                ...META,
                apiUrl: 'http://localhost:8080/site'
            })).toEqual('/site/inline/enonic-homepage/draft/don/simon');
        })
        it("should cut out site name from relative url if it equals one from locale mapping", () => {
            expect(UrlProcessor.process('/nettsted/don/simon', {
                ...META,
                apiUrl: 'http://localhost:8080/site'
            })).toEqual('/site/inline/enonic-homepage/draft/don/simon');
        })
        it("should not cut out site name from relative url if it differs one from locale mapping", () => {
            expect(UrlProcessor.process('/nettsteder/don/simon', {
                ...META,
                apiUrl: 'http://localhost:8080/site'
            })).toEqual('/site/inline/enonic-homepage/draft/nettsteder/don/simon');
        })
    }); // process

    describe('processSrcSet', () => {
        it("works for srcset without width descriptor", () => {
            const srcset = 'elva-fairy-480w.jpg';
            expect(UrlProcessor.processSrcSet(srcset, META)).toEqual('/site/inline/enonic-homepage/draft/elva-fairy-480w.jpg');
        });
        it("works for srcset with a single src", () => {
            const srcset = 'elva-fairy-480w.jpg 480w 1x';
            expect(UrlProcessor.processSrcSet(srcset, META)).toEqual('/site/inline/enonic-homepage/draft/elva-fairy-480w.jpg 480w 1x');
        });
        it("works for srcset with a two srcs", () => {
            const srcset = 'elva-fairy-480w.jpg 480w 1x, elva-fairy-800w.jpg 800w';
            expect(UrlProcessor.processSrcSet(srcset, META)).toEqual(
                '/site/inline/enonic-homepage/draft/elva-fairy-480w.jpg 480w 1x, /site/inline/enonic-homepage/draft/elva-fairy-800w.jpg 800w');
        });
        it("warns and returns srcset when it can't process the srcset", () => {
            const srcset = 'src width pixel notsupported';
            expect(UrlProcessor.processSrcSet(srcset, META)).toEqual(srcset);
            expect(warn).toHaveBeenCalledWith(`Can not process image srcset: ${srcset}`);
        });
    }); // processSrcSet
}); // UrlProcessor
