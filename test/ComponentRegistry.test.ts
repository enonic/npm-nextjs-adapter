import type {ComponentDefinitionParams, PageComponent} from '../src/types';


import {beforeAll, describe, expect, jest, test as it} from '@jest/globals';
import DefaultMacro from '../src/views/macros/DefaultMacro';
import PropsView from '../src/views/PropsView';
import {
    ENONIC_API,
    ENONIC_APP_NAME,
    ENONIC_APP_NAME_UNDERSCORED,
    ENONIC_PROJECTS,
} from './constants'
import {
    CATCH_ALL,
    XP_COMPONENT_TYPE,
} from '../src/common/constants';


globalThis.console = {
    error: console.error,
    // error: jest.fn(),
    warn: jest.fn(),
    log: jest.fn(),
    info: jest.fn(),
    debug: jest.fn(),
} as unknown as Console;


// const OLD_ENV = process.env;

const COMPONENT_NAME_TEXT = 'text';
const CONTENT_TYPE_NAME_PERSON = `${ENONIC_APP_NAME}:person`;
const LAYOUT_NAME_2_COLUMN = `${ENONIC_APP_NAME}:2-column`;
const PAGE_NAME_MAIN = `${ENONIC_APP_NAME}:main`;
const PART_NAME_HEADING = `${ENONIC_APP_NAME}:heading`;
const MACRO_NAME_SYSTEM_EMBED = 'system:embed';

const QUERY_COMMON = `query($path:ID!){
  guillotine {
    get(key:$path) {
      displayName
      _id
      type
      dataAsJson
      xAsJson
    }
    getSite {
      displayName
      _path
    }
  }
}`;

const QUERY_GET_PERSON = `
query($path:ID!){
  guillotine {
    get(key:$path) {
      displayName
      ... on ${ENONIC_APP_NAME_UNDERSCORED}_Person {
        data {
          bio
          dateofbirth
          photos {
           ... on media_Image {
              imageUrl: imageUrl(type: absolute, scale: "width(500)")
              attachments {
                name
              }
            }
          }
        }
      }
      parent {
        _path(type: siteRelative)
      }
    }
  }
}`;

const LAYOUT_COMPONENT: PageComponent = {
    type: XP_COMPONENT_TYPE.LAYOUT,
    path: 'test',
    layout: {
        descriptor: LAYOUT_NAME_2_COLUMN,
    },
};

const PAGE_COMPONENT: PageComponent = {
    type: XP_COMPONENT_TYPE.PAGE,
    path: 'test',
    page: {
        descriptor: PAGE_NAME_MAIN,
    },
};

const PART_COMPONENT: PageComponent = {
    type: XP_COMPONENT_TYPE.PART,
    path: 'test',
    part: {
        config: {},
        descriptor: PART_NAME_HEADING,
    },
}

const REGISTERED_LAYOUT_COMPONENT: ComponentDefinitionParams = {
    // view: TwoColumnLayout,
};

const REGISTERED_MACRO_COMPONENT: ComponentDefinitionParams = {
    view: DefaultMacro,
    configQuery: '{body}'
}

const REGISTERED_PAGE_COMPONENT: ComponentDefinitionParams = {
    // view: MainPage,
};

const REGISTERED_PART_COMPONENT: ComponentDefinitionParams = {
    configQuery: '{heading}'
    // query: ,
    // view: Heading,
}

const REGISTERED_TEXT_COMPONENT: ComponentDefinitionParams = {
    // view: CustomTextView,
};

const REGISTERED_CONTENT_TYPE_PERSON: ComponentDefinitionParams = {
    query: QUERY_GET_PERSON,
};

const REGISTERED_CONTENT_TYPE_CATCH_ALL: ComponentDefinitionParams = {
    view: PropsView,
};

let ComponentRegistry;

describe('ComponentRegistry', () => {

    beforeAll((done) => {
        jest.replaceProperty(process, 'env', {
            // ...OLD_ENV,
            ENONIC_API,
            ENONIC_APP_NAME,
            ENONIC_PROJECTS,
        });
        import('../src').then((moduleName) => {
            ComponentRegistry = moduleName.ComponentRegistry;
            done();
        });
    }); // beforeAll

    describe('addComponent, getComponent & getComponents', () => {
        it('adds a component', () => {
            expect(ComponentRegistry.addComponent(COMPONENT_NAME_TEXT, {
                // view: CustomTextView,
            })).toBeUndefined();
            expect(ComponentRegistry.getComponent(COMPONENT_NAME_TEXT))
                .toStrictEqual({
                    ...REGISTERED_TEXT_COMPONENT,
                    catchAll: false
                });
            expect(ComponentRegistry.getComponents()).toStrictEqual([
                [COMPONENT_NAME_TEXT, {
                    ...REGISTERED_TEXT_COMPONENT,
                    catchAll: false
                }],
            ]);
        });
    });

    describe('addContentType, getContentType & getContentTypes', () => {
        it('adds a content type', () => {
            expect(ComponentRegistry.addContentType(CONTENT_TYPE_NAME_PERSON, {
                query: QUERY_GET_PERSON,
                // view: Person,
            })).toBeUndefined();
            expect(ComponentRegistry.getContentType(CONTENT_TYPE_NAME_PERSON))
                .toStrictEqual({
                    ...REGISTERED_CONTENT_TYPE_PERSON,
                    catchAll: false
                });
            expect(ComponentRegistry.addContentType(CATCH_ALL, {
                view: PropsView,
            })).toBeUndefined();
            expect(ComponentRegistry.getContentType(CATCH_ALL))
                .toStrictEqual({
                    ...REGISTERED_CONTENT_TYPE_CATCH_ALL,
                    catchAll: true
                });
            expect(ComponentRegistry.getContentTypes()).toStrictEqual([
                [CONTENT_TYPE_NAME_PERSON, {
                    ...REGISTERED_CONTENT_TYPE_PERSON,
                    catchAll: false
                }],
                [CATCH_ALL, {
                    ...REGISTERED_CONTENT_TYPE_CATCH_ALL,
                    catchAll: true
                }],
            ]);
        });
    });

    describe('addLayout, getLayout & getLayouts', () => {
        it('adds a layout', () => {
            expect(ComponentRegistry.addLayout(LAYOUT_NAME_2_COLUMN, {
                // view: TwoColumnLayout,
            })).toBeUndefined();
            expect(ComponentRegistry.getLayout(LAYOUT_NAME_2_COLUMN))
                .toStrictEqual({
                    ...REGISTERED_LAYOUT_COMPONENT,
                    catchAll: false
                });
            expect(ComponentRegistry.getLayouts()).toStrictEqual([
                [LAYOUT_NAME_2_COLUMN, {
                    ...REGISTERED_LAYOUT_COMPONENT,
                    catchAll: false
                }]
            ]);
        });
    });

    describe('addMacro, getMacro & getMacros', () => {
        it('adds a macro', () => {
            expect(ComponentRegistry.addMacro(MACRO_NAME_SYSTEM_EMBED, {
                view: DefaultMacro,
                configQuery: '{body}'
            })).toBeUndefined();
        });
        it('gets a macro', () => {
            expect(ComponentRegistry.getMacro(MACRO_NAME_SYSTEM_EMBED))
                .toStrictEqual({
                    ...REGISTERED_MACRO_COMPONENT,
                    catchAll: false
                });
        });
        it('gets all macros', () => {
            expect(ComponentRegistry.getMacros()).toStrictEqual([
                [MACRO_NAME_SYSTEM_EMBED, {
                    ...REGISTERED_MACRO_COMPONENT,
                    catchAll: false
                }],
            ]);
        });
    });

    describe('addPage, getPage & getPages', () => {
        it('adds a page', () => {
            expect(ComponentRegistry.addPage(PAGE_NAME_MAIN, {
                // view: MainPage,
            })).toBeUndefined();
            expect(ComponentRegistry.getPage(PAGE_NAME_MAIN))
                .toStrictEqual({
                    ...REGISTERED_PAGE_COMPONENT,
                    catchAll: false
                });
            expect(ComponentRegistry.getPages()).toStrictEqual([
                [PAGE_NAME_MAIN, {
                    ...REGISTERED_PAGE_COMPONENT,
                    catchAll: false
                }]
            ]);
        });
    });

    describe('addPart, getPart & getParts', () => {
        it('adds a part', () => {
            expect(ComponentRegistry.addPart(PART_NAME_HEADING, {
                // view: Heading,
                configQuery: '{heading}'
            })).toBeUndefined();
            expect(ComponentRegistry.getPart(PART_NAME_HEADING))
                .toStrictEqual({
                    ...REGISTERED_PART_COMPONENT,
                    catchAll: false
                });
            expect(ComponentRegistry.getParts()).toStrictEqual([
                [PART_NAME_HEADING, {
                    ...REGISTERED_PART_COMPONENT,
                    catchAll: false
                }]
            ]);
        });
    });

    describe('getByComponent', () => {
        it('gets registered page component from component.type', () => {
            expect(ComponentRegistry.getByComponent(PAGE_COMPONENT))
                .toStrictEqual({
                    ...REGISTERED_PAGE_COMPONENT,
                    catchAll: false
                });
        });

        it('gets registered part component from component.type', () => {
           
            expect(ComponentRegistry.getByComponent(PART_COMPONENT))
                .toStrictEqual({
                    ...REGISTERED_PART_COMPONENT,
                    catchAll: false
                });
            
        });

        it('gets registered layout component from component.type', () => {
            expect(ComponentRegistry.getByComponent(LAYOUT_COMPONENT))
                .toStrictEqual({
                    ...REGISTERED_LAYOUT_COMPONENT,
                    catchAll: false
                });
        });
    });

    describe('getType', () => {
        it('gets registered page component from type and name', () => {
            expect(ComponentRegistry.getType('page', PAGE_NAME_MAIN))
                .toStrictEqual({
                    ...REGISTERED_PAGE_COMPONENT,
                    catchAll: false
                });
        });
        it('catchAll', () => {
            expect(ComponentRegistry.getType('contentType', 'non-existent'))
                .toStrictEqual({
                    ...REGISTERED_CONTENT_TYPE_CATCH_ALL,
                    catchAll: true,
                });
        });
    });

    describe('setCommonQuery', () => {
        it('sets common query', () => {
            ComponentRegistry.setCommonQuery(QUERY_COMMON);
            expect(ComponentRegistry.getCommonQuery()).toBe(QUERY_COMMON);
        });
    }); // setCommonQuery
}); // ComponentRegistry
