import type {PageComponent} from '../../src/types';


import {
    describe,
    expect,
    test as it
} from '@jest/globals';
import {getComponentConfig} from '../../src/guillotine/getComponentConfig';
import {XP_COMPONENT_TYPE} from '../../src/common/constants';


describe('guillotine', () => {
    describe('getComponentConfig', () => {
        it("should return the component config when it exits", () => {
            const cmp: PageComponent = {
                type: XP_COMPONENT_TYPE.PART,
                path: 'main/0',
                part: {
                    descriptor: 'com.enonic.app.another:myPart',
                    config: {
                        key: 'value'
                    }
                }
            };
            expect(getComponentConfig(cmp)).toEqual({
                key: 'value'
            });
        });

        it("should return undefined when cmp[type] doesn't exit", () => {
            const cmp: PageComponent = {
                type: XP_COMPONENT_TYPE.PART,
                path: 'main/0',
            };
            expect(getComponentConfig(cmp)).toEqual(undefined);
        });

        it("should return undefined when cmp[type].config doesn't exit", () => {
            const cmp: PageComponent = {
                type: XP_COMPONENT_TYPE.PART,
                path: 'main/0',
                part: {}
            } as PageComponent;
            expect(getComponentConfig(cmp)).toEqual(undefined);
        });
    });
});