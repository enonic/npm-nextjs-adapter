import type {ComponentDescriptor, QueryAndVariables} from '../types';


const ALIAS_PREFIX = 'request';

const GRAPHQL_FRAGMENTS_REGEXP = /fragment\s+.+\s+on\s+.+\s*{[\s\w{}().,:"'`]+}/;

// const GUILLOTINE_QUERY_REGEXP = /^\s*query\s*(?:\((.*)*\))?\s*{\s*guillotine\s*{((?:.|\s)+)}\s*}\s*$/;
const GUILLOTINE_QUERY_REGEXP = /^\s*query\s*(?:\(([^)]*)\))?\s*{\s*((?:.|\s)+)\s*}\s*$/;

const GLOBAL_PARAMS = [{key: 'path', type: 'ID!'}, {key: 'siteKey', type: 'String'}, {key: 'project', type: 'String'},
    {key: 'branch', type: 'String'}];


export function combineMultipleQueries(queriesWithVars: ComponentDescriptor[]): QueryAndVariables {
    const queries: string[] = [];
    const fragments: string[] = [];
    const superVars: Record<string,any> = {};
    const superParams: string[] = [];

    queriesWithVars.forEach((componentDescriptor: ComponentDescriptor, index: number) => {
        const queryAndVars = componentDescriptor.queryAndVariables;
        if (!queryAndVars) {
            return;
        }
        const currentAlias = `${ALIAS_PREFIX}${index}`;

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
        match = q.match(GUILLOTINE_QUERY_REGEXP) || [''];
        const args = match[1];
        let query = match[2];

        if (args) {
            args.split(',').forEach(originalParamString => {
                const [originalKey, originalVal] = originalParamString.trim().split(':').map(s => s.trim());
                const [prefixedKey, prefixedVal] = [`$${currentAlias}_${originalKey.substring(1)}`, originalVal];
                superParams.push(`${prefixedKey}:${prefixedVal}`);
                // Replace param usages in the query
                query = query.replace(new RegExp(`\\${originalKey}`, 'g'), prefixedKey);
                // Variables are updated later
            });
        }

        // Update variables with the same prefixes
        Object.entries(queryAndVars.variables || {}).forEach(entry => {
            superVars[`${currentAlias}_${entry[0]}`] = entry[1];
        });

        if (query?.length) {
            queries.push(`${currentAlias}:${query}`);

            // Find global params used in the query and add them to superParams
            GLOBAL_PARAMS.forEach(param => {
                const def = `$${param.key}:${param.type}`;
                if (query.includes(`$${param.key}`) && superParams.indexOf(def) < 0) {
                    superParams.push(def);
                }
            });
        }
    });

    // Compose the super query
    const superQuery = `query ${superParams.length ? `(${superParams.join(', ')})` : ''} {
        ${queries.join('\n')}
    }
    ${fragments.join('\n')}
    `;

    return {
        query: superQuery,
        variables: superVars
    };
}
