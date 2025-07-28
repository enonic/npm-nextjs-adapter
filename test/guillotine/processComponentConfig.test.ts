import type {PageComponent} from '../../src/types';


import {describe, expect, test as it} from '@jest/globals';
import {processComponentConfig} from '../../src/guillotine/processComponentConfig';
import {XP_COMPONENT_TYPE} from '../../src/common/constants';


describe('guillotine', () => {
    describe('processComponentConfig', () => {
        it("should return undefined when myAppName doesn't match component descriptor", () => {
            const myAppName = 'com.enonic.app.my';
            const myAppNameDashed = 'com-enonic-app-my';
            const cmp: PageComponent = {
                type: XP_COMPONENT_TYPE.PART,
                path: 'main/0',
                part: {
                    descriptor: 'com.enonic.app.another:myPart',
                    config: undefined/*{
                        'my-app': {
                            'my-part': {
                                foo: 'bar'
                            }
                        }
                    }*/
                }
            };
            const dereffedCmp = JSON.parse(JSON.stringify(cmp));
            expect(processComponentConfig(myAppName, myAppNameDashed, cmp)).toEqual(undefined);
            expect(cmp).toEqual(dereffedCmp);
        });

        it("should move configAsJson to config", () => {
            const myAppName = 'com.enonic.app.my';
            const myAppNameDashed = 'com-enonic-app-my';
            const cmp: PageComponent = {
                type: XP_COMPONENT_TYPE.PART,
                path: 'main/0',
                part: {
                    descriptor: 'com.enonic.app.my:myPart',
                    config: undefined,
                    configAsJson: {
                        [`${myAppNameDashed}`]: {
                            myPart: {
                                key: 'value'
                            }
                        }
                    }
                }
            };
            const dereffedCmp = JSON.parse(JSON.stringify(cmp));
            expect(processComponentConfig(myAppName, myAppNameDashed, cmp)).toEqual(undefined);
            expect(cmp).not.toEqual(dereffedCmp);
            expect(cmp.part?.config).toEqual({key: 'value'});
            expect(cmp.part?.configAsJson).toEqual(undefined);
        });

        it("should massage config", () => {
            const myAppName = 'com.enonic.app.my';
            const myAppNameDashed = 'com-enonic-app-my';
            const cmp: PageComponent = {
                type: XP_COMPONENT_TYPE.PART,
                path: 'main/0',
                part: {
                    descriptor: 'com.enonic.app.my:myPart',
                    config: {
                        ignored: 'value',
                        com_enonic_app_my: {
                            myPart: {
                                key: 'value'
                            }
                        }
                    }
                }
            };
            const dereffedCmp = JSON.parse(JSON.stringify(cmp));
            expect(processComponentConfig(myAppName, myAppNameDashed, cmp)).toEqual(undefined);
            expect(cmp).not.toEqual(dereffedCmp);
            expect(cmp.part?.config).toEqual({key: 'value'});
            expect(cmp.part?.configAsJson).toEqual(undefined);
        });

    });
});
