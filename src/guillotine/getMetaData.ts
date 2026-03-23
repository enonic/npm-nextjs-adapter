import {ComponentRegistry} from '../common/ComponentRegistry';
import {configQuery} from './metadata/configQuery';
import {richTextQuery} from './metadata/richTextQuery';
import {indent} from '../utils/indent';


const partConfigQuery = (): string => {
    return configQuery(ComponentRegistry.getParts());
};

const layoutConfigQuery = (): string => {
    return configQuery(ComponentRegistry.getLayouts());
};

const pageConfigQuery = (): string => {
    return configQuery(ComponentRegistry.getPages());
};


/*
    IMPORTANT: make sure to transform your queries into functions too when using this function inside them !!!
 */
const componentsQuery = () => `type
path
page {
    descriptor
${indent(pageConfigQuery(), 4)}
    template {
      _path
    }
}
layout {
    descriptor
${indent(layoutConfigQuery(), 4)}
}
text {
${indent(richTextQuery('value'), 4)}
}
part {
    descriptor
${indent(partConfigQuery(), 4)}
}
image {
    caption
    image {
      imageUrl (type:absolute, scale: "width-768")
    }
}`;

// THIS QUERY DOES NOT SUPPORT NESTED FRAGMENTS
export const pageFragmentQuery = () => `components(resolveFragment: false, resolveTemplate: true) {
    fragment {
        id
        fragment {
            components {
${indent(componentsQuery(), 16)}
            }
        }
    }
${indent(componentsQuery(), 4)}
}`;

export function getMetaQuery(pageFragment?: string): string {
    return queryGuillotineWithPath(`get(key:$path) {
    _id
    _path
    type
${indent(pageFragment || '', 4)}
}`);
}

export function queryGuillotine(query: string, args?: Record<string, string>): string {
    const argsString = args && Object.entries(args).map(([name, type]) => `${name}: ${type}`);
    return `query($siteKey: String, $project: String, $branch: String${argsString ? ', ' + argsString.join(', ') : ''}) {
              guillotine(siteKey: $siteKey, project: $project, branch: $branch) {
                ${query}
              }
            }`;
}

export function queryGuillotineWithPath(query: string, args?: Record<string, string>): string {
    return queryGuillotine(query, Object.assign({'$path': 'ID!'}, args));
}
