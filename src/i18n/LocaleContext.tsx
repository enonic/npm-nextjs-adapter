'use client';
import type {Dict, LocaleContextType} from '../types';


import React, {createContext, useContext, useEffect, useState} from 'react';
import {getPhrase, loadPhrases} from './i18n';


const LocaleContext = createContext<LocaleContextType>({
    dictionary: {},
    locale: '',
    localize: (key: string, ...args: any[]) => key,
    setLocale: (locale: string) => {/* no return, so type is void */}
});

export const useLocaleContext = () => useContext(LocaleContext);

export const LocaleContextProvider = ({
    children,
    locale: localeProps = ''
}: {
    children: any
    locale?: string
}) => {
    const [currentLocale, setLocaleState] = useState(localeProps);
    const [dictionary, setPhrasesState] = useState<Dict>({});

    const setLocale = async (locale: string): Promise<Dict> => {
        setLocaleState(locale);
        return loadPhrases(locale).then((phrases) => {
            setPhrasesState(phrases);
            console.info(`Loaded client-side phrases for locale "${locale}"`);
            return phrases;
        });
    };

    useEffect(() => {
        if (localeProps) {
            setLocale(localeProps);
        }
    }, []);

    const localize = (key: string, ...args: any[]) => getPhrase(currentLocale, dictionary, key, ...args);

    return (
        <LocaleContext.Provider value={{
            setLocale,
            locale: currentLocale,
            dictionary,
            localize
        }}>
            {children}
        </LocaleContext.Provider>
    );
};
