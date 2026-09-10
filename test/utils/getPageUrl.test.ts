import {describe, expect, test as it} from '@jest/globals';
import {getPageUrl} from '../../src/utils/getPageUrl';


describe('utils', () => {
    describe('getPageUrl', () => {
        const en = {locale: 'en', defaultLocale: 'en'};
        const no = {locale: 'no', defaultLocale: 'en'};

        it('omits the prefix for the default locale', () => {
            expect(getPageUrl('/persons/lea', en)).toEqual('/persons/lea');
            expect(getPageUrl('persons/lea/', en)).toEqual('/persons/lea');
            expect(getPageUrl('', en)).toEqual('/');
            expect(getPageUrl(undefined, en)).toEqual('/');
        });

        it('prefixes other locales and maps the site root to the bare locale', () => {
            expect(getPageUrl('/persons/lea', no)).toEqual('/no/persons/lea');
            expect(getPageUrl('/', no)).toEqual('/no');
            expect(getPageUrl(null, no)).toEqual('/no');
        });

        it('always prefixes when the default locale is unknown (route path)', () => {
            expect(getPageUrl('/persons/lea', {locale: 'en'})).toEqual('/en/persons/lea');
            expect(getPageUrl('', {locale: 'en'})).toEqual('/en');
        });
    });
});
