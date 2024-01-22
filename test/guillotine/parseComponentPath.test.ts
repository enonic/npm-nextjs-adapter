import {
    describe,
    expect,
    test as it
} from '@jest/globals';
import {parseComponentPath} from '../../src/guillotine/parseComponentPath';
import {FRAGMENT_CONTENTTYPE_NAME} from '../../src/constants';


describe('guillotine', () => {
    describe('parseComponentPath', () => {
        it('should handle contenttype fragment', () => {
            expect(parseComponentPath(FRAGMENT_CONTENTTYPE_NAME, '')).toEqual([{
                index: 0,
                region: 'fragment',
            }]);
        });

        it('should return an empty array when the path is empty', () => {
            expect(parseComponentPath('ignored unless portal:fragment', '')).toEqual([]);
        });

        it('should return an Array of Objects with index and region properties', () => {
            expect(parseComponentPath('ignored unless portal:fragment', 'a/0/b/1')).toEqual([{
                index: 0,
                region: 'a',
            }, {
                index: 1,
                region: 'b',
            }]);
        });
    });
});