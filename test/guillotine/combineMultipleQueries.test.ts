import type {ComponentDefinition, PageComponent} from '../../src/types';
import {
    describe,
    expect,
    jest,
    test as it
} from '@jest/globals';


// This must come before the imports to suppress logging.
globalThis.console = {
    ...console,
    error: jest.fn(),
    warn: jest.fn(),
    log: jest.fn(),
    info: jest.fn(),
    // debug: jest.fn(),
} as Console;
import {combineMultipleQueries} from '../../src/guillotine/combineMultipleQueries';
import {XP_COMPONENT_TYPE} from '../../src/common/constants';
import {ENONIC_APP_NAME} from '../constants';
import {ws} from '../testUtils';


const PART_DESCRIPTOR = `${ENONIC_APP_NAME}:heading`;
const PART_COMPONENT: PageComponent = {
    type: XP_COMPONENT_TYPE.PART,
    path: '/',
    part: {
        config: {},
        descriptor: PART_DESCRIPTOR,
    },
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
                component: PART_COMPONENT,
            }]);
            expect(ws(query)).toEqual('query { }');
            expect(variables).toEqual({});
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
                        key1: 'value1',
                    },
                },
            },{
                type: REGISTERED_PART,
                component: PART_COMPONENT,
                queryAndVariables: { 
                    query: 'query{guillotine{x}}'
                },
            },{
                type: REGISTERED_PART,
                component: PART_COMPONENT,
                queryAndVariables: { 
                    query: 'query(someVar:$key3){guillotine{x}}',
                    variables: {
                        key3: 'value3',
                    },
                },
            }]);
            expect(ws(query)).toEqual('query ($request2_omeVar:$key3) { request1:guillotine {x} request2:guillotine {x} } fragment x on y {z}');
            expect(variables).toEqual({
                request0_key1: 'value1',
                request2_key3: 'value3'
            });
        });
    });
});