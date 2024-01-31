import type {PageComponent, PathFragment, RegionTree} from '../../src/types';


import {
    // afterEach,
    // beforeEach,
    describe,
    expect,
    // jest,
    test as it
} from '@jest/globals';
import {getParentRegion} from '../../src/guillotine/getParentRegion';
import {XP_COMPONENT_TYPE} from '../../src/common/constants';


describe('guillotine', () => {
    describe('getParentRegion', () => {
        it('should return undefined when cmpPath is empty', () => {
            const source: RegionTree = {};
            const contentType = '';
            const cmpPath: PathFragment[] = [];
            const components: PageComponent[] = [];
            const createMissing = false;
            expect(getParentRegion(source,contentType,cmpPath,components,createMissing)).toEqual(undefined);
        });

        it('should throw when region in cmpPath is not found in source and createMissing is false', () => {
            const source: RegionTree = {};
            const contentType = '';
            const cmpPath: PathFragment[] = [{
                index: 0,
                region: 'main',
            }];
            const components: PageComponent[] = [];
            const createMissing = false;
            expect(() => getParentRegion(source,contentType,cmpPath,components,createMissing)).toThrow('Region [main] was not found');
        });

        it('should createMissing when createMissing is true', () => {
            const source: RegionTree = {};
            const contentType = '';
            const cmpPath: PathFragment[] = [{
                index: 0,
                region: 'main',
            }];
            const components: PageComponent[] = [];
            const createMissing = true;
            expect(getParentRegion(source,contentType,cmpPath,components,createMissing)).toEqual({"components": [], "name": "main"});
        });

        it('should return parent region when found', () => {
            const source: RegionTree = {
                main: {
                    name: 'main',
                    components: [],
                }
            };
            const contentType = '';
            const cmpPath: PathFragment[] = [{
                index: 0,
                region: 'main',
            }];
            const components: PageComponent[] = [];
            const createMissing = false;
            expect(getParentRegion(source,contentType,cmpPath,components,createMissing)).toEqual({"components": [], "name": "main"});
        });

        it('should throw when layout not in components', () => {
            const source: RegionTree = {
                main: {
                    name: 'main',
                    components: [],
                }
            };
            const contentType = '';
            const cmpPath: PathFragment[] = [{
                index: 0,
                region: 'main',
            },{
                index: 0,
                region: 'twoColumn',
            }];
            const components: PageComponent[] = [];
            const createMissing = false;
            expect(() => getParentRegion(source,contentType,cmpPath,components,createMissing))
                .toThrow(`Layout [/main/0] not found among components, but needed for component [[
  {
    "index": 0,
    "region": "main"
  },
  {
    "index": 0,
    "region": "twoColumn"
  }
]]`);
        });

        it('should return parent region when found', () => {
            const source: RegionTree = {
                main: {
                    name: 'main',
                    components: [],
                }
            };
            const contentType = '';
            const cmpPath: PathFragment[] = [{
                index: 0,
                region: 'main',
            },{
                index: 0,
                region: 'twoColumn',
            }];
            const components: PageComponent[] = [{
                type: XP_COMPONENT_TYPE.LAYOUT,
                path: '/main/0',
                regions: {
                    twoColumn: {
                        name: 'twoColumn',
                        components: [],
                    }
                }
            }];
            const createMissing = false;
            expect(getParentRegion(source,contentType,cmpPath,components,createMissing)).toEqual({"components": [], "name": "twoColumn"});
        });
    });
});