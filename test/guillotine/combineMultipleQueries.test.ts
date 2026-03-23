import type {ComponentDefinition, PageComponent} from '../../src/types';
import {describe, expect, jest, test as it} from '@jest/globals';
import {combineMultipleQueries} from '../../src/guillotine/combineMultipleQueries';
import {XP_COMPONENT_TYPE} from '../../src/common/constants';
import {ENONIC_APP_NAME} from '../constants';
import {ws} from '../testUtils';


// This must come before the imports to suppress logging.
globalThis.console = {
    ...console,
    error: jest.fn(),
    warn: jest.fn(),
    log: jest.fn(),
    info: jest.fn(),
    // debug: jest.fn()
} as Console;


const PART_DESCRIPTOR = `${ENONIC_APP_NAME}:heading`;
const PART_COMPONENT: PageComponent = {
    type: XP_COMPONENT_TYPE.PART,
    path: '/',
    part: {
        config: {},
        descriptor: PART_DESCRIPTOR
    }
};
const REGISTERED_PART: ComponentDefinition = {
    catchAll: false,
    configQuery: '{heading}',
    // processor
    query: 'partQuery($ignored) {}',
    // view
};

describe('guillotine', () => {
    describe('combineMultipleQueries', () => {
        it('should return empty query and variables when queries is empty', () => {
            const {
                query,
                variables
            } = combineMultipleQueries([]);
            expect(ws(query)).toEqual('query { }');
            expect(variables).toEqual({});
        });

        it('should return empty query and variables when queries has no queryAndVariables', () => {
            const {
                query,
                variables
            } = combineMultipleQueries([{
                type: REGISTERED_PART,
                component: PART_COMPONENT
            }]);
            expect(ws(query)).toEqual('query { }');
            expect(variables).toEqual({});
        });

        it('should inject global params (but not other) that are used in query', () => {
            const {
                query,
                variables
            } = combineMultipleQueries([{
                type: REGISTERED_PART,
                component: PART_COMPONENT,
                queryAndVariables: {
                    query: 'query{guillotine(project:$project,siteKey:$siteKey){get(key:$path){x}}}',
                }
            }, {
                type: REGISTERED_PART,
                component: PART_COMPONENT,
                queryAndVariables: {
                    query: 'query($someVar:String){guillotine(branch:$branch,foo:$bar){x}}',
                    variables: {
                        bar: 'value3'
                    }
                }
            }]);
            expect(ws(query)).toEqual(
                'query ($path:ID!, $siteKey:String, $project:String, $request1_someVar:String, $branch:String) { request0:guillotine(project:$project,siteKey:$siteKey){get(key:$path){x}} request1:guillotine(branch:$branch,foo:$bar){x} }');
            expect(variables).toEqual({
                request1_bar: 'value3'
            });
        });

        it('should override global params if they are defined in the query', () => {
            const {
                query,
                variables
            } = combineMultipleQueries([{
                type: REGISTERED_PART,
                component: PART_COMPONENT,
                queryAndVariables: {
                    query: 'query{guillotine(project:$project){x}}',
                }
            }, {
                type: REGISTERED_PART,
                component: PART_COMPONENT,
                queryAndVariables: {
                    query: 'query($path:ID!){guillotine(branch:$branch){get(key:$path){x}}}',
                    variables: {
                        path: 'value3'
                    }
                }
            }]);
            expect(ws(query)).toEqual(
                'query ($project:String, $request1_path:ID!, $branch:String) { request0:guillotine(project:$project){x} request1:guillotine(branch:$branch){get(key:$request1_path){x}} }');
            expect(variables).toEqual({
                request1_path: 'value3'
            });
        });

        it('should handle fragment and guillotine queries', () => {
            const {
                query,
                variables
            } = combineMultipleQueries([{
                type: REGISTERED_PART,
                component: PART_COMPONENT,
                queryAndVariables: { 
                    query: 'fragment x on y {z}',
                    variables: {
                        key1: 'value1'
                    }
                }
            },{
                type: REGISTERED_PART,
                component: PART_COMPONENT,
                queryAndVariables: {
                    query: 'query{guillotine(project:$project){x}}'
                }
            },{
                type: REGISTERED_PART,
                component: PART_COMPONENT,
                queryAndVariables: {
                    query: 'query($someVar:String){guillotine(branch:$branch){x}}',
                    variables: {
                        someVar: 'value3'
                    }
                }
            }]);
            expect(ws(query)).toEqual(
                'query ($project:String, $request2_someVar:String, $branch:String) { request1:guillotine(project:$project){x} request2:guillotine(branch:$branch){x} } fragment x on y {z}');
            expect(variables).toEqual({
                request0_key1: 'value1',
                request2_someVar: 'value3'
            });
        });
    });
});
