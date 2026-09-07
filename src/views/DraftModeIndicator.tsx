/// <reference types="react" />
import type {DraftModeIndicatorProps} from '../types';

import {draftMode} from 'next/headers';
import DraftModeButton from '../client/DraftModeButton';
import {disableDraftMode} from '../server/disableDraftMode';

const DEFAULT_LABEL = 'Draft Mode';

export default async function DraftModeIndicator({label}: DraftModeIndicatorProps) {
    const {isEnabled} = await draftMode();
    if (!isEnabled) {
        return null;
    }

    return <DraftModeButton action={disableDraftMode} label={label || DEFAULT_LABEL}/>;
}
