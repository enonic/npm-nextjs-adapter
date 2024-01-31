export type Dict = Record<string, string>;

export interface LocaleContextType {
    dictionary: Dict
    locale: string
    localize: (key: string, ...args: any[]) => string
    setLocale: (locale: string) => Promise<Dict>
}