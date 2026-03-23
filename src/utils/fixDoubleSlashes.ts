export function fixDoubleSlashes(str: string) {
    return str.replace(/(^|[^:/])\/{2,}/g, '$1/');
}

export function stripTrailingSlashes(str: string) {
    return str.replace(/\/+$/, '');
}

export function stripLeadingSlashes(str: string) {
    return str.replace(/^\/+/, '');
}

export function stripOutsideSlashes(str: string) {
    return str.replace(/^\/+|\/+$/g, '');
}
