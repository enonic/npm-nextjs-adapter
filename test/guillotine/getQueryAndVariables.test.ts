import type {Context, GlobalVariables, LocaleMapping, QueryGetter, VariablesGetter} from '../../src/types';


import {afterEach, beforeEach, describe, expect, jest, test as it} from '@jest/globals';
import {setupServerEnv} from '../constants';


const BRANCH = 'master';
const MAPPING: LocaleMapping = {
    default: true,
    project: 'project',
    site: '/site',
    locale: 'en'
};


describe('guillotine', () => {
    describe('getQueryAndVariables', () => {
        beforeEach(() => {
            setupServerEnv();
        });

        afterEach(() => {
            jest.resetModules();
        });

        it("should return undefined when selectedQuery is not provided", () => {
            return import('../../src/guillotine/getQueryAndVariables').then(({getQueryAndVariables}) => {
                const type = '';
                const path = '';
                const context: Context = {} as Context;
                expect(getQueryAndVariables(type, path, BRANCH, MAPPING, context)).toEqual(undefined);
            });
        });

        it("should return undefined when selectedQuery is an empty string", () => {
            return import('../../src/guillotine/getQueryAndVariables').then(({getQueryAndVariables}) => {
                const type = 'contenttype';
                const path = 'path';
                const context: Context = {} as Context;
                const selectedQuery = '';
                expect(getQueryAndVariables(type, path, BRANCH, MAPPING, context, selectedQuery)).toEqual(undefined);
            });
        });

        it("should return query and variables when selectedQuery is 'query' ", () => {
            return import('../../src/guillotine/getQueryAndVariables').then(({getQueryAndVariables}) => {
                const type = 'contenttype';
                const path = 'path';
                const context: Context = {} as Context;
                const selectedQuery = 'query';
                const result = getQueryAndVariables(type, path, BRANCH, MAPPING, context, selectedQuery);
                expect(result.query).toEqual('query');
                expect(result.variables.path).toEqual('path');
                expect(result.variables.project).toEqual('project');
                expect(result.variables.siteKey).toEqual('/site');
                expect(result.variables.branch).toEqual('master');
            });
        });

        it("should return query and variables when selectedQuery is [string | QueryGetter, VariablesGetter]", () => {
            return import('../../src/guillotine/getQueryAndVariables').then(({getQueryAndVariables}) => {
                const type = 'contenttype';
                const path = 'path';
                const context: Context = {} as Context;
                const variablesGetter: VariablesGetter = (vars: GlobalVariables) => ({
                    ...vars,
                    another: 'value',
                    path: 'path2'
                });
                const selectedQuery: [string | QueryGetter, VariablesGetter] = ['query', variablesGetter];
                const result = getQueryAndVariables(type, path, BRANCH, MAPPING, context, selectedQuery);
                expect(result.query).toEqual('query');
                expect(result.variables.another).toEqual('value');
                expect(result.variables.path).toEqual('path2');
                expect(result.variables.project).toEqual('project');
                expect(result.variables.siteKey).toEqual('/site');
                expect(result.variables.branch).toEqual('master');
            });
        });

        it("should return query and variables when selectedQuery is an Object", () => {
            return import('../../src/guillotine/getQueryAndVariables').then(({getQueryAndVariables}) => {
                const type = 'contenttype';
                const path = 'path';
                const context: Context = {} as Context;
                const variablesGetter: VariablesGetter = (vars: GlobalVariables) => ({
                    ...vars,
                    another: 'value',
                    path: 'path2'
                });
                const selectedQuery = {
                    query: 'query',
                    variables: variablesGetter
                };
                const result = getQueryAndVariables(type, path, BRANCH, MAPPING, context, selectedQuery);
                expect(result.query).toEqual('query');
                expect(result.variables.another).toEqual('value');
                expect(result.variables.path).toEqual('path2');
                expect(result.variables.project).toEqual('project');
                expect(result.variables.siteKey).toEqual('/site');
                expect(result.variables.branch).toEqual('master');
            });
        });

        it("should throw when selectedQuery is an Object, but it's variables in not a function", () => {
            return import('../../src/guillotine/getQueryAndVariables').then(({getQueryAndVariables}) => {
                const type = 'contenttype';
                const path = 'path';
                const context: Context = {} as Context;
                const selectedQuery = {
                    query: 'query',
                    variables: true as unknown as VariablesGetter
                } as {
                    query: string | QueryGetter
                    variables: VariablesGetter
                };
                expect(() => getQueryAndVariables(type, path, BRANCH, MAPPING, context, selectedQuery)).toThrow(
                    'getVariables for content type contenttype should be a function, not: boolean');
            });
        });

        it("should throw when selectedQuery is an Object, but query is not a string, nor function", () => {
            return import('../../src/guillotine/getQueryAndVariables').then(({getQueryAndVariables}) => {
                const type = 'contenttype';
                const path = 'path';
                const context: Context = {} as Context;
                const variablesGetter: VariablesGetter = (vars: GlobalVariables) => ({
                    ...vars,
                    another: 'value',
                    path: 'path2'
                });
                const selectedQuery = {
                    query: true as unknown as string | QueryGetter,
                    variables: variablesGetter
                };
                expect(() => getQueryAndVariables(type, path, BRANCH, MAPPING, context, selectedQuery)).toThrow(
                    'Query for content type contenttype should be a string or function, not: boolean');
            });
        });

        it("should return query and variables when selectedQuery is an function", () => {
            return import('../../src/guillotine/getQueryAndVariables').then(({getQueryAndVariables}) => {
                const type = 'contenttype';
                const path = 'path';
                const context: Context = {} as Context;
                const selectedQuery: QueryGetter = () => 'query';
                const config = {
                    what: 'ever'
                };
                const result = getQueryAndVariables(type, path, BRANCH, MAPPING, context, selectedQuery, config);
                expect(result.query).toEqual('query');
                expect(result.variables.path).toEqual('path');
                expect(result.variables.project).toEqual('project');
                expect(result.variables.siteKey).toEqual('/site');
                expect(result.variables.branch).toEqual('master');
            });
        });
    });
});
