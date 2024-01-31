import type {Context, QueryGetter, VariablesGetter} from '../../src/types';


import {
    describe,
    expect,
    test as it
} from '@jest/globals';
import {getQueryAndVariables} from '../../src/guillotine/getQueryAndVariables';


describe('guillotine', () => {
    describe('getQueryAndVariables', () => {
        it("should return undefined when selectedQuery is not provided", () => {
            const type = '';
            const path = '';
            const context: Context = {} as Context;
            expect(getQueryAndVariables(type, path, context)).toEqual(undefined);
        });

        it("should return undefined when selectedQuery is an empty string", () => {
            const type = 'contenttype';
            const path = 'path';
            const context: Context = {} as Context;
            const selectedQuery = '';
            expect(getQueryAndVariables(type, path, context, selectedQuery)).toEqual(undefined);
        });

        it("should return query and variables when selectedQuery is 'query' ", () => {
            const type = 'contenttype';
            const path = 'path';
            const context: Context = {} as Context;
            const selectedQuery = 'query';
            expect(getQueryAndVariables(type, path, context, selectedQuery)).toEqual({
                query: 'query',
                variables: {
                    path: 'path'
                }
            });
        });

        it("should return query and variables when selectedQuery is [string | QueryGetter, VariablesGetter]", () => {
            const type = 'contenttype';
            const path = 'path';
            const context: Context = {} as Context;
            const variablesGetter: VariablesGetter = () => ({
                another: 'value',
                path: 'path2'
            });
            const selectedQuery: [string | QueryGetter, VariablesGetter] = ['query', variablesGetter];
            // const config = {};
            expect(getQueryAndVariables(type, path, context, selectedQuery)).toEqual({
                query: 'query',
                variables: {
                    another: 'value',
                    path: 'path2'
                }
            });
        });

        it("should return query and variables when selectedQuery is an Object", () => {
            const type = 'contenttype';
            const path = 'path';
            const context: Context = {} as Context;
            const variablesGetter: VariablesGetter = () => ({
                another: 'value',
                path: 'path2'
            });
            const selectedQuery = {
                query: 'query',
                variables: variablesGetter
            };
            // const config = {};
            expect(getQueryAndVariables(type, path, context, selectedQuery)).toEqual({
                query: 'query',
                variables: {
                    another: 'value',
                    path: 'path2'
                }
            });
        });

        it("should throw when selectedQuery is an Object, but it's variables in not a function", () => {
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
            // const config = {};
            expect(() => getQueryAndVariables(type, path, context, selectedQuery)).toThrow('getVariables for content type contenttype should be a function, not: boolean');
        });

        it("should throw when selectedQuery is an Object, but query is not a string, nor function", () => {
            const type = 'contenttype';
            const path = 'path';
            const context: Context = {} as Context;
            const variablesGetter: VariablesGetter = () => ({
                another: 'value',
                path: 'path2'
            });
            const selectedQuery = {
                query: true as unknown as string | QueryGetter,
                variables: variablesGetter
            };
            // const config = {};
            expect(() => getQueryAndVariables(type, path, context, selectedQuery)).toThrow('Query for content type contenttype should be a string or function, not: boolean');
        });

        it("should return query and variables when selectedQuery is an function", () => {
            const type = 'contenttype';
            const path = 'path';
            const context: Context = {} as Context;
            const selectedQuery: QueryGetter = () => 'query';
            const config = {
                what: 'ever'
            };
            expect(getQueryAndVariables(type, path, context, selectedQuery, config)).toEqual({
                query: 'query',
                variables: {
                    path: 'path'
                }
            });
        });
    });
});