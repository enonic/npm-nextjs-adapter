import {describe, expect, test as it} from '@jest/globals';
import {localizeMappings} from '../../src/utils/localizeMappings';


describe('utils', () => {
    describe('localizeMappings', () => {
        const mappings = [
            {sources: ['/.*'], target: '/${siteRelativePath}'},
            {sources: ['type:app:article', '/articles/.*'], target: 'blog/${_name}', matchAny: true}
        ];

        it('prefixes targets of a non-default locale and keeps sources', () => {
            expect(localizeMappings(mappings, {locale: 'no', default: false})).toEqual([
                {sources: ['/.*'], target: '/no/${siteRelativePath}'},
                {sources: ['type:app:article', '/articles/.*'], target: '/no/blog/${_name}', matchAny: true}
            ]);
        });

        it('leaves targets of the default locale untouched', () => {
            expect(localizeMappings(mappings, {locale: 'en', default: true})).toEqual(mappings);
        });

        it('does not mutate the input', () => {
            localizeMappings(mappings, {locale: 'no', default: false});
            expect(mappings[0].target).toEqual('/${siteRelativePath}');
        });
    });
});
