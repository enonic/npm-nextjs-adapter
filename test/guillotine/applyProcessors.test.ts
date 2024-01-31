import type {ComponentDescriptor, ContentResult, Context} from '../../src/types';


import {
    describe,
    expect,
    test as it
} from '@jest/globals';
import {applyProcessors} from '../../src/guillotine/applyProcessors';
import {XP_COMPONENT_TYPE} from '../../src/common/constants';


describe('guillotine', () => {
    describe('applyProcessors', () => {
        it("should resolve to an empty array when componentDescriptors is an empty array", () => {
            const componentDescriptors: ComponentDescriptor[] = [];
            const contentResults: ContentResult = {
                // contents: []
            };
            const context: Context = {
                contentPath: 'contentPath',
            };
            expect(applyProcessors(componentDescriptors, contentResults, context)).resolves.toEqual([]);
        });

        it("should resolve to  when componentDescriptors contains a single ComponentDescriptor without queryAndVariables", () => {
            const componentDescriptors: ComponentDescriptor[] = [{
                type: {
                    processor: async (props: any) => await props ?? {},
                },
                component: {
                    type: XP_COMPONENT_TYPE.PART,
                    path: 'path',
                    part: {
                        name: 'partName',
                        descriptor: 'partDescriptor',
                        config: {
                            key1: 'value1',
                        },
                    },
                },
            }];
            const contentResults: ContentResult = {
                // contents: []
            };
            const context: Context = {
                contentPath: 'contentPath',
            };
            expect(applyProcessors(componentDescriptors, contentResults, context)).resolves.toEqual([{
                status: 'fulfilled',
                value: {}
            }]);
        });

        it("should resolve to rejected when contentResults has no contents", () => {
            const componentDescriptors: ComponentDescriptor[] = [{
                type: {
                    processor: async (props: any) => await props ?? {},
                },
                component: {
                    type: XP_COMPONENT_TYPE.PART,
                    path: 'path',
                    part: {
                        name: 'partName',
                        descriptor: 'partDescriptor',
                        config: {
                            key1: 'value1',
                        },
                    },
                },
                queryAndVariables: {
                    query: 'query',
                    variables: {
                        key2: 'value2',
                    },
                },
            }];
            const contentResults: ContentResult = {
                // contents: []
            };
            const context: Context = {
                contentPath: 'contentPath',
            };
            expect(applyProcessors(componentDescriptors, contentResults, context)).resolves.toEqual([{
                status: 'rejected',
                reason: TypeError("Cannot read properties of undefined (reading '0')")
            }]);
        });

        it("should apply processor from ComponentDescriptor.type.processor unto contentResults", () => {
            const componentDescriptors: ComponentDescriptor[] = [{
                type: {
                    processor: async (data: any, context?: Context, config?: any) => {
                        // console.debug('data', data);
                        data['key3'] = 'changedValue';
                        return data;
                    }
                },
                component: {
                    type: XP_COMPONENT_TYPE.PART,
                    path: 'path',
                    part: {
                        name: 'partName',
                        descriptor: 'partDescriptor',
                        config: {
                            key1: 'value1',
                        },
                    },
                },
                queryAndVariables: {
                    query: 'query',
                    variables: {
                        key2: 'value2',
                    },
                },
            }];
            const contentResults: ContentResult = {
                contents: [{
                    key3: 'value3',
                }]
            };
            const context: Context = {
                contentPath: 'contentPath',
            };
            expect(applyProcessors(componentDescriptors, contentResults, context)).resolves.toEqual([{
                status: 'fulfilled',
                value: {
                    key3: 'changedValue',
                }
            }]);
        });

        it("should resolve to fulfilled when contentResults has contents even though a ComponentDescriptor has no type?.processor", () => {
            const componentDescriptors: ComponentDescriptor[] = [{
                component: {
                    type: XP_COMPONENT_TYPE.PART,
                    path: 'path',
                    part: {
                        name: 'partName',
                        descriptor: 'partDescriptor',
                        config: {
                            key1: 'value1',
                        },
                    },
                },
                queryAndVariables: {
                    query: 'query',
                    variables: {
                        key2: 'value2',
                    },
                },
            }];
            const contentResults: ContentResult = {
                contents: [{
                    key3: 'value3',
                }]
            };
            const context: Context = {
                contentPath: 'contentPath',
            };
            expect(applyProcessors(componentDescriptors, contentResults, context)).resolves.toEqual([{
                status: 'fulfilled',
                value: {
                    key3: 'value3',
                }
            }]);
        });
    });
});