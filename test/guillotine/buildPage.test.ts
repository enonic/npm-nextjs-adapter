import {
    describe,
    expect,
    test as it
} from '@jest/globals';
import {buildPage} from '../../src/guillotine/buildPage';
import {XP_COMPONENT_TYPE} from '../../src/constants';


describe('guillotine', () => {
    describe('buildPage', () => {
        it('should return a default when contentType is empty', () => {
            const contentType = '';
            expect(buildPage(contentType)).toEqual({
                path: '/',
                type: XP_COMPONENT_TYPE.PAGE,
            });
        });
    });
});