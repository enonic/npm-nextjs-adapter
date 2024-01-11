import type {
    ComponentDescriptor,
    QueryAndVariables,
} from '../types';


const ALIAS_PREFIX = 'request';

const GRAPHQL_FRAGMENTS_REGEXP = /fragment\s+.+\s+on\s+.+\s*{[\s\w{}().,:"'`]+}/;

const GUILLOTINE_QUERY_REGEXP = /^\s*query\s*(?:\((.*)*\))?\s*{\s*guillotine\s*{((?:.|\s)+)}\s*}\s*$/;


export function combineMultipleQueries(queriesWithVars: ComponentDescriptor[]): QueryAndVariables {
    const queries: string[] = [];
    const fragments: string[] = [];
    const superVars: { [key: string]: any } = {};
    const superParams: string[] = [];

    queriesWithVars.forEach((componentDescriptor: ComponentDescriptor, index: number) => {
        const queryAndVars = componentDescriptor.queryAndVariables;
        if (!queryAndVars) {
            return;
        }

        // Extract fragments first if exist
        let q = queryAndVars.query;
        let match = q.match(GRAPHQL_FRAGMENTS_REGEXP);
        if (match?.length === 1) {
            // extract a fragment to put it at root level
            fragments.push(match[0]);
            // remove it from query because queries are going to get wrapped
            q = q.replace(match[0], '');
        }

        // Extract graphql query and its params and add prefixes to exclude collisions with other queries
        match = q.match(GUILLOTINE_QUERY_REGEXP);
        let query = '';
        if (match && match.length === 2) {
            // no params, just query
            query = match[1];
        } else if (match && match.length === 3) {
            // both query and params are present
            query = match[2];
            // process args
            const args = match[1];
            if (args) {
                args.split(',').forEach(originalParamString => {
                    const [originalKey, originalVal] = originalParamString.trim().split(':');
                    const [prefixedKey, prefixedVal] = [`$${ALIAS_PREFIX}${index}_${originalKey.substr(1)}`, originalVal];
                    superParams.push(`${prefixedKey}:${prefixedVal}`);
                    // also update param references in query itself !
                    // query = query.replaceAll(originalKey, prefixedKey);
                    // replaceAll is not supported in older nodejs versions
                    const origKeyPattern = new RegExp(originalKey.replace(/\$/g, '\\$'), 'g');
                    query = query.replace(origKeyPattern, prefixedKey);
                });
            }
        }
        if (query.length) {
            queries.push(`${ALIAS_PREFIX}${index}:guillotine {${query}}`);
        }

        // Update variables with the same prefixes
        Object.entries(queryAndVars.variables || {}).forEach(entry => {
            superVars[`${ALIAS_PREFIX}${index}_${entry[0]}`] = entry[1];
        });
    });

    // Compose the super query
    const superQuery = `query ${superParams.length ? `(${superParams.join(', ')})` : ''} {
        ${queries.join('\n')}
    }
    ${fragments.join('\n')}
    `;

    return {
        query: superQuery,
        variables: superVars,
    };
}