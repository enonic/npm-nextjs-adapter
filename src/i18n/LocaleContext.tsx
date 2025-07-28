'use client';
import type {Dict, LocaleContextType} from '../types';

import React, {createContext, useContext, useEffect, useState} from 'react';
import {getPhrase, loadPhrases} from './i18n';


const LocaleContext = createContext<LocaleContextType>({
    dictionary: {},
    locale: '',
    localize: (key: string, ...args: any[]) => key,
    setLocale: (locale: string) => Promise.resolve({})
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
    const [isLoaded, setLoadedState] = useState(false);

    const setLocale = async (locale: string): Promise<Dict> => {
        setLocaleState(locale);
        setLoadedState(false);

        return loadPhrases(locale).then((phrases) => {
            setPhrasesState(phrases);
            setLoadedState(true);
            return phrases;
        });
    };

    useEffect(() => {
        if (localeProps) {
            void setLocale(localeProps); // void to avoid @typescript-eslint/no-floating-promises
        }
    }, []);

    const localize = (key: string, ...args: any[]) => {
        return isLoaded ? getPhrase(currentLocale, dictionary, key, ...args) : key;
    };

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
