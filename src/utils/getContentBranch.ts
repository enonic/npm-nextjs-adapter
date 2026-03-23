import type {Context} from '../types';


import {RENDER_MODE} from '../common/constants';
import {getRenderMode} from './getRenderMode';


export function getContentBranch(context?: Context): string {
    const renderMode = getRenderMode(context);
    return renderMode === RENDER_MODE.NEXT
           ? 'master'
           : renderMode === RENDER_MODE.LIVE
             ? 'master'
             : 'draft';
}
