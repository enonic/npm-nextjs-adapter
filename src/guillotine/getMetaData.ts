import type {PageComponent} from '../types';


import {ComponentRegistry} from '../ComponentRegistry';
import {configQuery} from './metadata/configQuery';
import {richTextQuery} from './metadata/richTextQuery';


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
    return `query($path:ID!){
              guillotine {
                get(key:$path) {
                  _path
                  type
                  ${pageFragment || ''}
                }
              }
            }`;
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

export interface LayoutData {
    descriptor: string;
    config?: any;

    [customKeysFromQuery: string]: any;
}

export interface FragmentData {
    id: string;
    fragment: {
        components: PageComponent[];
    }
}


