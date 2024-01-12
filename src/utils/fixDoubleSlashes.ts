export function fixDoubleSlashes(str: string) {
    return str.replace(/(^|[^:/])\/{2,}/g, '$1/');
}