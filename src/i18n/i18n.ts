import type {Dict} from '../types';


export class I18n {
    private static locale = '';
    private static dictionary: Dict = {};
    private static isLoaded = false;

    public static async setLocale(locale: string): Promise<Dict> {
        this.locale = locale;
        this.isLoaded = false;

        return loadPhrases(locale).then((phrases) => {
            this.dictionary = phrases;
            this.isLoaded = true;
            return phrases;
        });
    }

    public static localize(key: string, ...args: any[]): string {
        return this.isLoaded ? getPhrase(this.locale, this.dictionary, key, ...args) : key;
    }

    public static getLocale() {
        return this.locale;
    }

    public static getDictionary() {
        return this.dictionary;
    }
}

export const loadPhrases = async (locale: string): Promise<Dict> => {
    return import(`@phrases/${locale}.json`)
        .then((module) => module.default)
        .catch((e) => {
            console.error(`Failed to load phrases for locale "${locale}"`, e);
            return {};
        });
};

export const getPhrase = (locale: string, dict: Dict, key: string, ...args: any[]) => {
    const template = dict[key];
    if (!template) {
        console.warn(`Missing localization phrase for locale "${locale}": <${key}>`);
        return `<${key}>`;
    }
    if (args.length) {
        let index = -1;
        return template.replace(/{(\d+)?}/g, (match, digit) => {
            index++;
            return args[digit || index] ?? match;
        });
    }
    return template;
};

