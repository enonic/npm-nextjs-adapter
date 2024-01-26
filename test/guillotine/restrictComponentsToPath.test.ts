import type {PageComponent} from '../../src/types';

import {
    describe,
    expect,
    test as it
} from '@jest/globals';
import {restrictComponentsToPath} from '../../src/guillotine/restrictComponentsToPath';
import {
    FRAGMENT_CONTENTTYPE_NAME,
    XP_COMPONENT_TYPE
} from '../../src/common/constants';


describe('guillotine', () => {
    describe('restrictComponentsToPath', () => {

        it('should return an empty array when no components', () => {
            expect(restrictComponentsToPath('')).toEqual([]);
        });

        it('should return the passed components when no componentPath', () => {
            const components: PageComponent[] = [{
                path: 'main/0',
                type: XP_COMPONENT_TYPE.PART,
            }];
            expect(restrictComponentsToPath('', components)).toEqual(components);
        });

        it('should return an empty array when componentPath not found in components', () => {
            const components: PageComponent[] = [{
                path: 'main/0',
                type: XP_COMPONENT_TYPE.PART,
            }];
            expect(restrictComponentsToPath('', components, 'main/1')).toEqual([]);
        });

        it('should return an array with the only matched component when componentPath found in components', () => {
            const components: PageComponent[] = [{
                path: 'main/0',
                type: XP_COMPONENT_TYPE.PART,
            },{
                path: 'main/1',
                type: XP_COMPONENT_TYPE.LAYOUT,
            },{
                path: 'main/1/twoColumns/0',
                type: XP_COMPONENT_TYPE.PART,
            },{
                path: 'main/1/twoColumns/1',
                type: XP_COMPONENT_TYPE.PART,
            },{
                path: 'main/2',
                type: XP_COMPONENT_TYPE.PART,
            }];
            expect(restrictComponentsToPath('', components, 'main/1/twoColumns/1')).toEqual([{
                path: 'main/1/twoColumns/1',
                type: XP_COMPONENT_TYPE.PART,
            }]);
        });

        it('should handle layouts', () => {
            const components: PageComponent[] = [{
                path: 'main/0',
                type: XP_COMPONENT_TYPE.PART,
            },{
                path: 'main/1',
                type: XP_COMPONENT_TYPE.LAYOUT,
            },{
                path: 'main/1/twoColumns/0',
                type: XP_COMPONENT_TYPE.PART,
            },{
                path: 'main/1/twoColumns/1',
                type: XP_COMPONENT_TYPE.PART,
            },{
                path: 'main/2',
                type: XP_COMPONENT_TYPE.PART,
            }];
            expect(restrictComponentsToPath('', components, 'main/1')).toEqual([{
                path: 'main/1',
                type: XP_COMPONENT_TYPE.LAYOUT,
            },{
                path: 'main/1/twoColumns/0',
                type: XP_COMPONENT_TYPE.PART,
            },{
                path: 'main/1/twoColumns/1',
                type: XP_COMPONENT_TYPE.PART,
            }]);
        });

    });
});