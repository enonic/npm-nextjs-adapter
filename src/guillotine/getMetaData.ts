import {RENDER_MODE, sanitizeGraphqlName, XP_COMPONENT_TYPE, XP_REQUEST_TYPE} from '../utils';
import {ComponentDefinition, ComponentRegistry} from '../ComponentRegistry';

const macroConfigQuery = (): string => {
    return configQuery(ComponentRegistry.getMacros(), false, false);
};

const partConfigQuery = (): string => {
    return configQuery(ComponentRegistry.getParts());
};

const layoutConfigQuery = (): string => {
    return configQuery(ComponentRegistry.getLayouts());
};

const pageConfigQuery = (): string => {
    return configQuery(ComponentRegistry.getPages());
};

const configQuery = (list: [string, ComponentDefinition][], includeAppName = true, canUseConfigAsJson = true): string => {
    const hasQueryList = list?.filter(([key, def]) => def.configQuery) || [];
    if (hasQueryList.length === 0) {
        return canUseConfigAsJson ? 'configAsJson' : '';
    }

    const configsByApp: { [app: string]: string[] } = {};
    hasQueryList
        .forEach((entry) => {
            const nameParts = entry[0].split(':');
            if (nameParts.length === 2) {
                const sanitizedAppName = sanitizeGraphqlName(nameParts[0]);
                let existingConfigs = configsByApp[sanitizedAppName];
                if (!existingConfigs) {
                    existingConfigs = [];
                    configsByApp[sanitizedAppName] = existingConfigs;
                }
                existingConfigs.push(`${sanitizeGraphqlName(nameParts[1])}${entry[1].configQuery}`);
            }
        });

    // Still query for configAsJson if at least one item has no configQuery defined
    const configAsJsonQuery = canUseConfigAsJson && hasQueryList.length < list.length ? 'configAsJson' : '';

    if (!includeAppName) {
        return `${configAsJsonQuery}
                config {
                    ${Object.values(configsByApp).reduce((arr, curr) => arr.concat(curr), []).join('\n')}
                }`;
    } else {
        return `${configAsJsonQuery}
                config {
                    ${Object.entries(configsByApp).map(entry => entry[0] + '{\n' + entry[1].join('\n') + '\n}')}
                }`;
    }
};

/*
    IMPORTANT: make sure to transform your queries into functions too when using this function inside them !!!
 */
export const richTextQuery = (fieldName: string) => {
    return `${fieldName}(processHtml:{type:absolute, imageWidths:[400, 800, 1200], imageSizes:"(max-width: 400px) 400px, (max-width: 800px) 800px, 1200px"}) {
                processedHtml
                macros {
                    ref
                    name
                    descriptor
                    ${macroConfigQuery()}
                }
                links {
                    ref
                    media {
                        content {
                            _id
                        }
                    }
                }
                images {
                    ref
                    image {
                        _id
                    }
                }
            }`;
};

const componentsQuery = () => `
        type
        path
        page {
          descriptor
          ${pageConfigQuery()}
          template {
            _path
          }
        }
        layout {
          descriptor
          ${layoutConfigQuery()}
        }
        text {
            ${richTextQuery('value')}
        }
        part {
          descriptor
          ${partConfigQuery()}
        }
        image {
          caption
          image {
            imageUrl (type:absolute, scale: "width-768")
          }
        }
`;

// THIS QUERY DOES NOT SUPPORT NESTED FRAGMENTS
export const pageFragmentQuery = () => `
      components(resolveFragment: false, resolveTemplate: true) {
        fragment {
          id
          fragment {
            components {
              ${componentsQuery()}
            }
          }
        }
        ${componentsQuery()}
      }`;

export function getMetaQuery(pageFragment?: string): string {
    return `query($path:ID!, $siteKey: String, $repo: String, $branch: String){
              guillotine(siteKey: $siteKey, repo: $repo, branch: $branch) {
                get(key:$path) {
                  _path
                  type
                  ${pageFragment || ''}
                }
              }
            }`;
}

export interface PageComponent {
    [key: string]: any; // keeps ts happy when accessing component data field by XP_COMPONENT_TYPE type
    type: XP_COMPONENT_TYPE;
    path: string;
    page?: PageData;
    part?: PartData;
    layout?: LayoutData;
    fragment?: FragmentData;
    text?: TextData;
    image?: any;
    regions?: RegionTree;
    data?: any;
    error?: any;
}

export interface TextData {
    value: RichTextData;
}

export interface RichTextData {
    processedHtml: string,
    links: LinkData[],
    macros: MacroData[],
    images: ImageData[],
}

export interface LinkData {
    ref: string,
    media: {
        content: {
            id: string,
        }
    } | null,
}

export interface MacroData {
    ref: string;
    name: string;
    descriptor: string;
    config: {
        [name: string]: MacroConfig;
    };
}

export interface ImageData {
    ref: string;
    image: {
        id: string,
    } | null,
}

export interface MacroConfig {
    [key: string]: any;
}


export interface RegionTree {
    [key: string]: PageRegion;
}

export interface PageRegion {
    name: string;
    components: PageComponent[];
}

export interface PartData {
    descriptor: string;
    config: any;

    [customKeysFromQuery: string]: any;
}

export interface LayoutData {
    descriptor: string;
    config?: any;

    [customKeysFromQuery: string]: any;
}

export interface PageData {
    descriptor: string;
    config?: any;
    template?: string | null;
    regions?: RegionTree;
}

export interface FragmentData {
    id: string;
    fragment: {
        components: PageComponent[];
    }
}

export interface MetaData {
    type: string,
    path: string,
    requestType: XP_REQUEST_TYPE,
    renderMode: RENDER_MODE,
    requestedComponent?: PageComponent,
    canRender: boolean,
    catchAll: boolean,
    branch: string,
    project: string,
    site: string,
    baseUrl: string,
    locale: string,
    defaultLocale: string,
}
