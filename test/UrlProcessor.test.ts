import type {ImageData, LinkData, MetaData} from '../src/types';

import {
    beforeAll,
    describe,
    expect, jest,
    test as it
} from '@jest/globals';
import {
    RENDER_MODE,
    XP_COMPONENT_TYPE,
    XP_REQUEST_TYPE,
} from '../src/constants';
import {
    ENONIC_API,
    ENONIC_APP_NAME,
    ENONIC_PROJECTS,
} from './constants'


const warn = jest.fn();

globalThis.console = {
    // error: console.error,
    error: jest.fn(),
    warn,
    log: jest.fn(),
    info: jest.fn(),
    debug: console.debug,
    // debug: jest.fn(),
} as unknown as Console;


const pageComponent = {
    type: XP_COMPONENT_TYPE.PAGE,
    path: '/site/playground/2-column-test'
};

const META: MetaData = {
    type: 'base:shortcut',
        path: '/site/playground/2-column-test',
        requestType: XP_REQUEST_TYPE.PAGE,
        renderMode: RENDER_MODE.EDIT,
        requestedComponent: pageComponent,
        canRender: true,
        catchAll: false,
        apiUrl: 'http://localhost:8080/site/_/service/com.enonic.app.enonic/guillotine/query',
        baseUrl: '/site/inline/enonic-homepage/draft',
        locale: 'no',
        defaultLocale: 'en',
};

describe('UrlProcessor', () => {

    beforeAll(() => {
        jest.replaceProperty(process, 'env', {
            ENONIC_API,
            ENONIC_APP_NAME,
            ENONIC_PROJECTS,
        });
    });

    describe('isContentImage', () => {
        it('return true when ref matches and has image', () => {
            import('../src/UrlProcessor').then(({UrlProcessor}) => {
                const ref = 'ref';
                const imageData = [{
                    ref: 'ref',
                    image: {
                        id: 'id'
                    },
                }];
                expect(UrlProcessor.isContentImage(ref, imageData)).toEqual(true);
            });
        });
        it("handles imageData entry without ref", () => {
            import('../src/UrlProcessor').then(({UrlProcessor}) => {
                const ref = 'ref';
                const imageData: ImageData[] = [{} as ImageData, {
                    ref: 'ref',
                    image: {
                        id: 'id'
                    },
                }];
                expect(UrlProcessor.isContentImage(ref, imageData)).toEqual(true);
            });
        });
        it('return false when ref matches, but image is not even present', () => {
            import('../src/UrlProcessor').then(({UrlProcessor}) => {
                const ref = 'ref';
                const imageData = [{
                    ref: 'ref'
                }] as ImageData[];
                expect(UrlProcessor.isContentImage(ref, imageData)).toEqual(false);
            });
        });
        it('return false when ref matches, but image is null', () => {
            import('../src/UrlProcessor').then(({UrlProcessor}) => {
                const ref = 'ref';
                const imageData = [{
                    ref: 'ref',
                    image: null,
                }];
                expect(UrlProcessor.isContentImage(ref, imageData)).toEqual(false);
            });
        });
        it("return false when imageData is empty", () => {
            import('../src/UrlProcessor').then(({UrlProcessor}) => {
                const ref = 'ref';
                const imageData = [];
                expect(UrlProcessor.isContentImage(ref, imageData)).toEqual(false);
            });
        });
        it("return false when ref isn't found", () => {
            import('../src/UrlProcessor').then(({UrlProcessor}) => {
                const ref = 'ref';
                const imageData = [{
                    ref: 'notref',
                    image: {
                        id: "doesn't matter"
                    },
                }];
                expect(UrlProcessor.isContentImage(ref, imageData)).toEqual(false);
            });
        });
    });

    describe('isMediaLink', () => {
        it('return true when ref matches and has media', () => {
            import('../src/UrlProcessor').then(({UrlProcessor}) => {
                const ref = 'ref';
                const linkData = [{
                    ref: 'ref',
                    media: {
                        content: {
                            id: 'id'
                        }
                    },
                }];
                expect(UrlProcessor.isMediaLink(ref, linkData)).toEqual(true);
            });
        });
        it("handles linkData entry without ref", () => {
            import('../src/UrlProcessor').then(({UrlProcessor}) => {
                const ref = 'ref';
                const linkData: LinkData[] = [{} as LinkData, {
                    ref: 'ref',
                    media: {
                        content: {
                            id: 'id'
                        }
                    },
                }];
                expect(UrlProcessor.isMediaLink(ref, linkData)).toEqual(true);
            });
        });
        it('return false when ref matches, but media is not even present', () => {
            import('../src/UrlProcessor').then(({UrlProcessor}) => {
                const ref = 'ref';
                const linkData = [{
                    ref: 'ref'
                }] as LinkData[];
                expect(UrlProcessor.isMediaLink(ref, linkData)).toEqual(false);
            });
        });
        it('return false when ref matches, but media is null', () => {
            import('../src/UrlProcessor').then(({UrlProcessor}) => {
                const ref = 'ref';
                const linkData = [{
                    ref: 'ref',
                    media: null,
                }];
                expect(UrlProcessor.isMediaLink(ref, linkData)).toEqual(false);
            });
        });
        it("return false when linkData is empty", () => {
            import('../src/UrlProcessor').then(({UrlProcessor}) => {
                const ref = 'ref';
                const linkData = [];
                expect(UrlProcessor.isMediaLink(ref, linkData)).toEqual(false);
            });
        });
        it("return false when ref isn't found", () => {
            import('../src/UrlProcessor').then(({UrlProcessor}) => {
                const ref = 'ref';
                const linkData = [{
                    ref: 'notref',
                    media: {
                        content: {
                            id: "doesn't matter"
                        }
                    },
                }];
                expect(UrlProcessor.isMediaLink(ref, linkData)).toEqual(false);
            });
        });
    });


    describe('getAsset', () => {
        it("returns baseurl when url is empty", () => {
            import('../src/UrlProcessor').then(({getAsset}) => {
                const url = '';
                expect(getAsset(url, META)).toEqual('/site/inline/enonic-homepage/draft/');
            });
        });
    });

    describe('getUrl', () => {
        it("returns baseurl when url is empty", () => {
            import('../src/UrlProcessor').then(({getUrl}) => {
                const url = '';
                expect(getUrl(url, META)).toEqual('/site/inline/enonic-homepage/draft/');
            });
        });
    });

    describe('process', () => {
        [{
            url: '#hash',
            expected: '#hash',
            meta: META,
        }, {
            url: 'http://localhost:8080/site/path',
            expected: 'http://localhost:8080/site/path',
            meta: false as unknown as MetaData,
        }, {
            url: '_/image/1234',
            expected: '_/image/1234',
            meta: {
                ...META,
                renderMode: RENDER_MODE.NEXT,
            }
        }, {
            url: '_/attachment/1234',
            expected: '_/attachment/1234',
            meta: {
                ...META,
                renderMode: RENDER_MODE.NEXT,
            }
        }, {
            // isRelative
            url: '/path',
            expected: '/site/inline/enonic-homepage/draft/no/path',
            meta: {
                ...META,
                renderMode: RENDER_MODE.NEXT,
            }
        },{
            url: 'http://localhost:8080/site/path',
            expected: '/site/inline/enonic-homepage/draft/no/path',
            meta: {
                ...META,
                renderMode: RENDER_MODE.NEXT,
            }
        },{
            url: 'http://localhost:8080/site/path',
            expected: '/site/inline/enonic-homepage/draft/path',
            meta: META
        }].forEach(({url, expected, meta}) => {
            it(`should return ${expected} when url is ${url}`, () => {
                import('../src/UrlProcessor').then(({UrlProcessor}) => {
                    expect(UrlProcessor.process(url, meta)).toEqual(expected);
                });
            });
        });
    }); // process

    describe('processSrcSet', () => {
        it("works for srcset without width descriptor", () => {
            import('../src/UrlProcessor').then(({UrlProcessor}) => {
                const srcset = 'elva-fairy-480w.jpg';
                expect(UrlProcessor.processSrcSet(srcset, META)).toEqual('/site/inline/enonic-homepage/draft/elva-fairy-480w.jpg');
            });
        });
        it("works for srcset with a single src", () => {
            import('../src/UrlProcessor').then(({UrlProcessor}) => {
                const srcset = 'elva-fairy-480w.jpg 480w 1x';
                expect(UrlProcessor.processSrcSet(srcset, META)).toEqual('/site/inline/enonic-homepage/draft/elva-fairy-480w.jpg 480w 1x');
            });
        });
        it("works for srcset with a two srcs", () => {
            import('../src/UrlProcessor').then(({UrlProcessor}) => {
                const srcset = 'elva-fairy-480w.jpg 480w 1x, elva-fairy-800w.jpg 800w';
                expect(UrlProcessor.processSrcSet(srcset, META)).toEqual('/site/inline/enonic-homepage/draft/elva-fairy-480w.jpg 480w 1x, /site/inline/enonic-homepage/draft/elva-fairy-800w.jpg 800w');
            });
        });
        it("warns and returns srcset when it can't process the srcset", () => {
            import('../src/UrlProcessor').then(({UrlProcessor}) => {
                const srcset = 'src width pixel notsupported';
                expect(UrlProcessor.processSrcSet(srcset, META)).toEqual(srcset);
                expect(warn).toHaveBeenCalledWith(`Can not process image srcset: ${srcset}`);
            });
        });
    }); // processSrcSet
}); // UrlProcessor