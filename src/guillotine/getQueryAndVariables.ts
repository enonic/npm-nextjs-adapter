import type {
    Context,
    QueryAndVariables,
    SelectedQueryMaybeVariablesFunc
} from '../types';


export function getQueryAndVariables(type: string,
    path: string,
    context: Context,
    selectedQuery ? : SelectedQueryMaybeVariablesFunc,
    config ? : any): QueryAndVariables | undefined {

    let query, getVariables;

    if (typeof selectedQuery === 'string' || typeof selectedQuery === 'function') {
        query = selectedQuery;

    } else if (Array.isArray(selectedQuery)) {
        query = selectedQuery[0];
        getVariables = selectedQuery[1];

    } else if (typeof selectedQuery === 'object') {
        query = selectedQuery.query;
        getVariables = selectedQuery.variables;
    }

    if (getVariables && typeof getVariables !== 'function') {
        throw Error(`getVariables for content type ${type} should be a function, not: ${typeof getVariables}`);
    }

    if (query && typeof query !== 'string' && typeof query !== 'function') {
        throw Error(`Query for content type ${type} should be a string or function, not: ${typeof query}`);
    }

    if (typeof query === 'function') {
        query = query(path, context, config);
    }

    if (query) {
        return {
            query,
            variables: getVariables ? getVariables(path, context, config) : {
                path
            },
        };
    }
}