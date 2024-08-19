import {FRAGMENT_CONTENTTYPE_NAME, FRAGMENT_DEFAULT_REGION_NAME} from '../common/constants';


export function prefixFragmentCmpPath(contentType: string, path: string): string {
    if (contentType !== FRAGMENT_CONTENTTYPE_NAME) {
        return path;
    } else {
        // prepend FRAGMENT_DEFAULT_REGION_NAME to path to conform to page structure
        // so that component with path '/' becomes /FRAGMENT_DEFAULT_REGION_NAME/0
        // path /left/1 becomes /FRAGMENT_DEFAULT_REGION_NAME/0/left/1
        return `/${FRAGMENT_DEFAULT_REGION_NAME}/0${path === '/' ? '' : path}`;
    }
}
