export interface AddLocalePrefixOptions {
    locale?: string;
    locales: readonly string[];
}

/** Adds a locale to a root-relative pathname unless a recognized locale is already present. */
export function addLocalePrefix(pathname: string, {locale, locales}: AddLocalePrefixOptions): string {
    const firstSegment = pathname.split('/')[1];
    if (!locale || locales.includes(firstSegment)) {
        return pathname;
    }
    // Avoid a second trailing-slash redirect for locale roots.
    return `/${locale}${pathname}`.replace(/\/$/, '');
}

/** Removes only the specified complete locale segment from a root-relative pathname. */
export function removeLocalePrefix(pathname: string, {locale}: {locale?: string}): string {
    const [, firstSegment, ...rest] = pathname.split('/');
    return locale && firstSegment === locale ? `/${rest.join('/')}` : pathname;
}
