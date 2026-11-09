import type {Context} from '../types';


import {RENDER_MODE} from '../common/constants';
import {getRenderMode} from './getRenderMode';


/** Resolves the branch from an explicit render mode, or from request context and environment defaults. */
export function getContentBranch(contextOrRenderMode?: Context | RENDER_MODE): string {
    const renderMode = typeof contextOrRenderMode === 'string' ? contextOrRenderMode : getRenderMode(contextOrRenderMode);
    return renderMode === RENDER_MODE.NEXT
           ? 'master'
           : renderMode === RENDER_MODE.LIVE
             ? 'master'
             : 'draft';
}
