import type {PageComponent} from '../../src/types';


import {describe, expect, test as it} from '@jest/globals';
import {buildComponentTree} from '../../src/guillotine/buildComponentTree';
import {FRAGMENT_CONTENTTYPE_NAME, XP_COMPONENT_TYPE} from '../../src/common/constants';


describe('guillotine', () => {
    describe('buildComponentTree', () => {
        it("should return rootComp when comps is an empty array", () => {
            const comps: PageComponent[] = [];
            const rootComp: PageComponent = {
                type: XP_COMPONENT_TYPE.PAGE,
                path: '/',
                page: {
                    descriptor: 'pageDescriptor'
                }
            };
            expect(buildComponentTree(comps, rootComp)).toEqual(rootComp);
        });

        it("should return modified rootComp when contentType is portal:fragment", () => {
            const comps: PageComponent[] = [];
            const rootComp: PageComponent = {
                type: XP_COMPONENT_TYPE.PAGE, // Doesn't matter
                path: '/'
            };
            const deferredRootComp = JSON.parse(JSON.stringify(rootComp));
            const contentType = FRAGMENT_CONTENTTYPE_NAME;
            expect(buildComponentTree(comps, rootComp, contentType)).toEqual(rootComp);
            expect(rootComp).not.toEqual(deferredRootComp);
            expect(rootComp.regions).toEqual({});
        });

        it("should return unmodified rootComp when <TODO>", () => {
            const comps: PageComponent[] = [{
                type: XP_COMPONENT_TYPE.PART,
                path: '/main/0',
                part: {
                    descriptor: 'partDescriptor',
                    config: {
                        key: 'value'
                    }
                }
            }];
            const rootComp: PageComponent = {
                type: XP_COMPONENT_TYPE.PAGE,
                path: '/'
            };
            const deferredRootComp = JSON.parse(JSON.stringify(rootComp));
            const contentType = 'contentType';
            expect(buildComponentTree(comps, rootComp, contentType)).toEqual(rootComp);
            expect(rootComp).toEqual(deferredRootComp);
        });

        it("should return modified rootComp when comps contain component with type page", () => {
            const comp1: PageComponent = {
                type: XP_COMPONENT_TYPE.PAGE,
                path: '/',
                page: {
                    descriptor: 'pageDescriptor1',
                    config: {
                        key1: 'value1'
                    }
                }
            };
            const comps: PageComponent[] = [comp1];
            const rootComp: PageComponent = {
                type: XP_COMPONENT_TYPE.PAGE,
                path: '/',
                page: {
                    descriptor: 'pageDescriptor2',
                    config: {
                        key2: 'value2'
                    }
                }
            };
            const deferredRootComp = JSON.parse(JSON.stringify(rootComp));
            const contentType = 'contentType';
            expect(buildComponentTree(comps, rootComp, contentType)).toEqual(rootComp);
            expect(rootComp).not.toEqual(deferredRootComp);
            expect(rootComp.page).toEqual(comp1.page);
        });

        it("should return modified rootComp when rootComp is fragment and comps contain component with type layout", () => {
            const layout: PageComponent = {
                type: XP_COMPONENT_TYPE.LAYOUT,
                path: '/',
                layout: {
                    descriptor: 'layoutDescriptor',
                    config: {
                        key1: 'value1'
                    }
                }
            };
            const comps: PageComponent[] = [layout];
            const rootComp: PageComponent = {
                type: XP_COMPONENT_TYPE.FRAGMENT,
                path: '/',
                fragment: {
                    id: 'fragmentId',
                    fragment: {
                        components: []
                    }
                }
            };
            const deferredRootComp = JSON.parse(JSON.stringify(rootComp));
            const contentType = 'contentType';
            expect(buildComponentTree(comps, rootComp, contentType)).toEqual(rootComp);
            expect(rootComp.fragment?.fragment.components).toEqual([layout]);
        });

        it("should return unmodified rootComp when comps contain a single fragment component", () => {
            const part = {
                type: XP_COMPONENT_TYPE.PART,
                path: '/main/0/left/0',
                part: {
                    descriptor: 'partDescriptor',
                    config: {
                        key2: 'value2'
                    }
                }
            };
            const layout = {
                type: XP_COMPONENT_TYPE.LAYOUT,
                path: '/main/0',
                layout: {
                    descriptor: 'layoutDescriptor',
                    config: {
                        key1: 'value1'
                    },
                    regions: {
                        left: {
                            name: 'left',
                            components: [part]
                        }
                    }
                }
            };
            const fragment: PageComponent = {
                type: XP_COMPONENT_TYPE.FRAGMENT,
                path: '/main/0',
                fragment: {
                    id: 'fragmentId',
                    fragment: {
                        components: [layout]
                    }
                }
            };
            const comps: PageComponent[] = [fragment];
            const rootComp: PageComponent = {
                type: XP_COMPONENT_TYPE.PAGE,
                path: '/',
                page: {
                    descriptor: 'pageDescriptor',
                    config: {
                        key3: 'value3'
                    },
                    regions: {
                        main: {
                            name: 'main',
                            components: [fragment]
                        }
                    }
                }
            };
            const deferredRootComp = JSON.parse(JSON.stringify(rootComp));
            const contentType = 'contentType';
            expect(buildComponentTree(comps, rootComp, contentType)).toEqual(rootComp);
            expect(rootComp).toEqual(deferredRootComp); // TODO - why is this not modified?
        });
    });
});
