import type {FetchContentResult} from '../types';


import {validateNotFound} from './validateNotFound';
import {validateShortcut} from './validateShortcut';


export function validateData(props: FetchContentResult): void {
    validateNotFound(props);
    validateShortcut(props);
}