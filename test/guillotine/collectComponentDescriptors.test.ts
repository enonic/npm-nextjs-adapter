// This must come before the imports to suppress logging.
globalThis.console = {
    ...console,
    error: jest.fn(),
    warn: jest.fn(),
    log: jest.fn(),
    info: jest.fn(),
    // debug: jest.fn()
} as Console;


import type {Context, PageComponent} from '../../src/types';


import {beforeAll, describe, expect, jest, test as it} from '@jest/globals';
import {ComponentRegistry} from '../../src/common/ComponentRegistry';
import {ENONIC_APP_NAME, setupServerEnv} from '../constants';
import {XP_COMPONENT_TYPE} from '../../src/common/constants';


const PART_NAME_HEADING = `${ENONIC_APP_NAME}:heading`;
const PART_COMPONENT: PageComponent = {
    type: XP_COMPONENT_TYPE.PART,
    path: '/',
    part: {
        config: {},
        descriptor: PART_NAME_HEADING
    }
};
const PART_CATCH_ALL = false;
const PART_CONFIG_QUERY = '{heading}';
const PART_QUERY = 'query';

const FRAGMENT_COMPONENT: PageComponent = {
    type: XP_COMPONENT_TYPE.FRAGMENT,
    path: '/main/0',
    fragment: {
        id: 'fragmentId',
        fragment: {
            components: [PART_COMPONENT]
        }
    }
};

const FRAGMENT_COMPONENT_BROKEN: PageComponent = {
    type: XP_COMPONENT_TYPE.FRAGMENT,
    path: '/main/0'
};

beforeAll(() => {
    setupServerEnv();

    ComponentRegistry.addPart(PART_NAME_HEADING, {
        // catchAll: PART_CATCH_ALL
        configQuery: PART_CONFIG_QUERY,
        query: PART_QUERY
        // processor
        // view: Heading
    });
});

describe('guillotine', () => {

    describe('collectComponentDescriptors', () => {
        it('should return an empty array when components is empty', () => {
            const components: PageComponent[] = [];
            const xpContentPath = '';
            const context: Context = {
                contentPath: '/contextContentPath'
            }
            import('../../src/guillotine/collectComponentDescriptors').then((moduleName) => {
                expect(moduleName.collectComponentDescriptors({
                    components, xpContentPath, context
                })).toEqual([]);
            });
        });

        it('should return part descriptor when components contain a registered part', () => {
            const components: PageComponent[] = [PART_COMPONENT];
            const xpContentPath = '/xpContentPath';
            const context: Context = {
                contentPath: '/contextContentPath'
            }
            import('../../src/guillotine/collectComponentDescriptors').then((moduleName) => {
                expect(moduleName.collectComponentDescriptors({
                    components, xpContentPath, context
                })).toEqual([{
                    component: PART_COMPONENT,
                    queryAndVariables: {
                        query: PART_QUERY,
                        variables: {
                            path: xpContentPath
                        }
                    },
                    type: {
                        catchAll: PART_CATCH_ALL,
                        configQuery: PART_CONFIG_QUERY,
                        query: PART_QUERY
                    }
                }]);
            });
        });

        it('should return part descriptor when components contain a fragment with a registered part', () => {
            const components: PageComponent[] = [FRAGMENT_COMPONENT];
            const xpContentPath = '/xpContentPath';
            const context: Context = {
                contentPath: '/contextContentPath'
            }

            import('../../src/guillotine/collectComponentDescriptors').then((moduleName) => {
                expect(moduleName.collectComponentDescriptors({
                    components, xpContentPath, context
                })).toEqual([{
                    component: PART_COMPONENT,
                    queryAndVariables: {
                        query: PART_QUERY,
                        variables: {
                            path: xpContentPath
                        }
                    },
                    type: {
                        catchAll: PART_CATCH_ALL,
                        configQuery: PART_CONFIG_QUERY,
                        query: PART_QUERY
                    }
                }]);
            });
        });

        it('should return an empty array when components contain a fragment without components', () => {
            const components: PageComponent[] = [FRAGMENT_COMPONENT_BROKEN];
            const xpContentPath = '/xpContentPath';
            const context: Context = {
                contentPath: '/contextContentPath'
            }
            import('../../src/guillotine/collectComponentDescriptors').then((moduleName) => {
                expect(moduleName.collectComponentDescriptors({
                    components, xpContentPath, context
                })).toEqual([]);
            });
        });
    });
});
