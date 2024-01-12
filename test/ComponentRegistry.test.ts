import type { PageComponent } from '../src/types';


import {
    beforeAll,
    describe,
    expect,
    jest,
    test as it
} from '@jest/globals';
// import DefaultMacro from '../src/views/macros/DefaultMacro';
import {
    ENONIC_API,
    ENONIC_APP_NAME,
    ENONIC_APP_NAME_UNDERSCORED,
    ENONIC_PROJECTS,
} from './constants'

// const OLD_ENV = process.env;

const COMPONENT_NAME_TEXT = 'text';
const CONTENT_TYPE_NAME_PERSON = `${ENONIC_APP_NAME}:person`;
const LAYOUT_NAME_2_COLUMN = `${ENONIC_APP_NAME}:2-column`;
const PAGE_NAME_MAIN = `${ENONIC_APP_NAME}:main`;
const PART_NAME_HEADING = `${ENONIC_APP_NAME}:heading`;
const MACRO_NAME_SYSTEM_EMBED = 'system:embed';

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
    type: 'layout',
    path: 'test',
    layout: {
        descriptor: LAYOUT_NAME_2_COLUMN,
    },
};

const PAGE_COMPONENT: PageComponent = {
    type: 'page',
    path: 'test',
    page: {
        descriptor: PAGE_NAME_MAIN,
    },
};

const PART_COMPONENT: PageComponent = {
    type: 'part',
    path: 'test',
    part: {
        config: {},
        descriptor: PART_NAME_HEADING,
    },
}

const REGISTERED_LAYOUT_COMPONENT = {
    catchAll: false,
    // view: TwoColumnLayout,

};

const REGISTERED_MACRO_COMPONENT = {
    catchAll: false,
    // view: DefaultMacro,
    configQuery: '{body}'
}

const REGISTERED_PAGE_COMPONENT = {
    catchAll: false,
    // view: MainPage,
};

const REGISTERED_PART_COMPONENT = {
    catchAll: false,
    configQuery: '{heading}'
    // query: ,
    // view: Heading,
}

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

    describe('addComponent', () => {
        it('adds a component', () => {
            expect(ComponentRegistry.addComponent(COMPONENT_NAME_TEXT, {
                // view: CustomTextView,
            })).toBeUndefined();
            expect(ComponentRegistry.getComponent(COMPONENT_NAME_TEXT))
                .toStrictEqual({
                    catchAll: false,
                    // view: CustomTextView,
                });
        });
    });

    describe('addContentType', () => {
        it('adds a content type', () => {
            expect(ComponentRegistry.addContentType(CONTENT_TYPE_NAME_PERSON, {
                query: QUERY_GET_PERSON,
                // view: Person,
            })).toBeUndefined();
            expect(ComponentRegistry.getContentType(CONTENT_TYPE_NAME_PERSON)).toStrictEqual({
                catchAll: false,
                query: QUERY_GET_PERSON,
            });
        });
    });

    describe('addLayout', () => {
        it('adds a layout', () => {
            expect(ComponentRegistry.addLayout(LAYOUT_NAME_2_COLUMN, {
                // view: TwoColumnLayout,
            })).toBeUndefined();
            expect(ComponentRegistry.getLayout(LAYOUT_NAME_2_COLUMN))
                .toStrictEqual(REGISTERED_LAYOUT_COMPONENT);
        });
    });

    describe('addMacro', () => {
        it('adds a macro', () => {
            expect(ComponentRegistry.addMacro(MACRO_NAME_SYSTEM_EMBED, {
                // view: DefaultMacro, // Is this what makes tests fail on GitHub?
                configQuery: '{body}'
            })).toBeUndefined();
            expect(ComponentRegistry.getMacro(MACRO_NAME_SYSTEM_EMBED))
                .toStrictEqual(REGISTERED_MACRO_COMPONENT);
        });
    });

    describe('addPage', () => {
        it('adds a page', () => {
            expect(ComponentRegistry.addPage(PAGE_NAME_MAIN, {
                // view: MainPage,
            })).toBeUndefined();
            expect(ComponentRegistry.getPage(PAGE_NAME_MAIN))
                .toStrictEqual(REGISTERED_PAGE_COMPONENT);
        });
    });

    describe('addPart', () => {
        it('adds a part', () => {
            expect(ComponentRegistry.addPart(PART_NAME_HEADING, {
                // view: Heading,
                configQuery: '{heading}'
            })).toBeUndefined();
            expect(ComponentRegistry.getPart(PART_NAME_HEADING))
                .toStrictEqual(REGISTERED_PART_COMPONENT);
        });
    });

    describe('getByComponent', () => {
        it('gets registered page component from component.type', () => {
            expect(ComponentRegistry.getByComponent(PAGE_COMPONENT))
                .toStrictEqual(REGISTERED_PAGE_COMPONENT);
        });

        it('gets registered part component from component.type', () => {
           
            expect(ComponentRegistry.getByComponent(PART_COMPONENT))
                .toStrictEqual(REGISTERED_PART_COMPONENT);
            
        });

        it('gets registered layout component from component.type', () => {
            expect(ComponentRegistry.getByComponent(LAYOUT_COMPONENT))
                .toStrictEqual(REGISTERED_LAYOUT_COMPONENT);
        });
    });
}); // describe ComponentRegistry