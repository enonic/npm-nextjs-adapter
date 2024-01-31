import type {ComponentDefinition} from '../../../src/types';


import {
    describe,
    expect,
    test as it
} from '@jest/globals';
import {configQuery} from '../../../src/guillotine/metadata/configQuery';
import {ENONIC_APP_NAME} from '../../constants';
import {ws} from '../../testUtils';


describe('guillotine', () => {
    describe('metadata', () => {
        describe('configQuery', () => {
            it("should return 'configAsJson' when list is undefined", () => {
                const list = undefined as unknown as [string, ComponentDefinition][];
                expect(configQuery(list)).toEqual('configAsJson');
            });

            it("should return 'configAsJson' when list is empty", () => {
                const list = [];
                expect(configQuery(list)).toEqual('configAsJson');
            });

            it("should return '' when list is empty and canUseConfigAsJson is false", () => {
                const list = [], includeAppName = true, canUseConfigAsJson = false;
                expect(configQuery(list, includeAppName, canUseConfigAsJson)).toEqual('');
            });

            it("should return 'configAsJson' when no component has configQuery in list", () => {
                const componentDefinition1: ComponentDefinition = {};
                const componentDefinition2: ComponentDefinition = {};
                const list: [string, ComponentDefinition][] = [
                    ['key1', componentDefinition1],
                    ['key2', componentDefinition2]
                ];
                expect(configQuery(list)).toEqual('configAsJson');
            });

            it("should return a weird query when componentname is missing app name", () => {
                const componentDefinition1: ComponentDefinition = {};
                const componentDefinition2: ComponentDefinition = {
                    configQuery: '{configQuery}'
                };
                const list: [string, ComponentDefinition][] = [
                    ['component1', componentDefinition1],
                    ['component2', componentDefinition2]
                ];
                expect(ws(configQuery(list))).toEqual('configAsJson config { }');
            });

            it("should return a query when at least one component has configQuery in list", () => {
                const componentDefinition1: ComponentDefinition = {};
                const componentDefinition2: ComponentDefinition = {
                    configQuery: '{configQuery}'
                };
                const list: [string, ComponentDefinition][] = [
                    [`${ENONIC_APP_NAME}:component1`, componentDefinition1],
                    [`${ENONIC_APP_NAME}:component2`, componentDefinition2]
                ];
                expect(ws(configQuery(list))).toEqual('configAsJson config { com_enonic_app_enonic{ component2{configQuery} } }');
            });

            it("should return a query without app name when includeAppName is false", () => {
                const componentDefinition1: ComponentDefinition = {};
                const componentDefinition2: ComponentDefinition = {
                    configQuery: '{configQuery}'
                };
                const list: [string, ComponentDefinition][] = [
                    [`${ENONIC_APP_NAME}:component1`, componentDefinition1],
                    [`${ENONIC_APP_NAME}:component2`, componentDefinition2]
                ];
                const includeAppName = false;
                expect(ws(configQuery(list, includeAppName))).toEqual('configAsJson config { component2{configQuery} }');
            });

            it("should return a query without configAsJson and app name when includeAppName and canUseConfigAsJson is false", () => {
                const componentDefinition1: ComponentDefinition = {};
                const componentDefinition2: ComponentDefinition = {
                    configQuery: '{configQuery}'
                };
                const list: [string, ComponentDefinition][] = [
                    [`${ENONIC_APP_NAME}:component1`, componentDefinition1],
                    [`${ENONIC_APP_NAME}:component2`, componentDefinition2]
                ];
                const includeAppName = false, canUseConfigAsJson = false;
                expect(ws(configQuery(list, includeAppName, canUseConfigAsJson))).toEqual('config { component2{configQuery} }');
            });
        });
    });
});