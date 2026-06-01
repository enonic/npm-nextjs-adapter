/** Prepends the site path to a site-relative content path so Guillotine can resolve content by its
 *  full path (e.g. /content/path -> /sitename/content/path). Incoming paths are site-relative because
 *  the site name is stripped from urls upstream. Ensures a leading slash. No-op when the site is
 *  empty/root or the path already starts with the site prefix. */
export function prependSitePath(path: string, site: string | undefined): string {
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    if (!site || site === '/') {
        return normalizedPath;
    }
    if (normalizedPath === site || normalizedPath.startsWith(`${site}/`)) {
        return normalizedPath;
    }
    return `${site}${normalizedPath === '/' ? '' : normalizedPath}`;
}
