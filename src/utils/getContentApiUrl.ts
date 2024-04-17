import type {Context} from '../types';


import {RENDER_MODE} from '../common/constants';
import {API_URL} from '../common/env';
import {getLocaleMapping} from './getLocaleMapping';
import {fixDoubleSlashes} from './fixDoubleSlashes';
import {getRenderMode} from './getRenderMode';


export function getContentApiUrl(context: Context): string {
    const project = getLocaleMapping(context).project;
    const branch = getRenderMode(context) === RENDER_MODE.NEXT
        ? 'master'
        : getRenderMode(context) === RENDER_MODE.LIVE
            ? 'master'
            : 'draft';

    return fixDoubleSlashes(`${API_URL}/${project}/${branch}`);
}
