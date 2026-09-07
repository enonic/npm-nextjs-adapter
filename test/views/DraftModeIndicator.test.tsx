import type {ReactElement} from 'react';
import type {DraftModeButtonProps, DraftModeIndicatorProps} from '../../src/types';

import {afterEach as afterEachTestInDescribe, describe, expect, jest, test as it} from '@jest/globals';


async function renderIndicator(draftEnabled: boolean, props: DraftModeIndicatorProps = {}) {
    jest.mock('next/headers', () => ({
        draftMode: () => Promise.resolve({isEnabled: draftEnabled})
    }), {virtual: true});

    const {default: DraftModeIndicator} = await import('../../src/views/DraftModeIndicator');
    return await DraftModeIndicator(props) as ReactElement<DraftModeButtonProps> | null;
}

describe('views', () => {
    describe('DraftModeIndicator', () => {

        afterEachTestInDescribe(() => {
            jest.resetModules();
            jest.restoreAllMocks();
        });

        it('renders nothing when draft mode is disabled', async () => {
            expect(await renderIndicator(false)).toBeNull();
        });

        it('renders the button with the bundled disable action in draft mode', async () => {
            const element = await renderIndicator(true);
            const {default: DraftModeButton} = await import('../../src/client/DraftModeButton');
            const {disableDraftMode} = await import('../../src/server/disableDraftMode');

            expect(element?.type).toBe(DraftModeButton);
            expect(element?.props.action).toBe(disableDraftMode);
        });

        it('labels the button "Draft Mode" when no label is given', async () => {
            const element = await renderIndicator(true);
            expect(element?.props.label).toBe('Draft Mode');
        });

        it('passes an explicit label through to the button', async () => {
            const element = await renderIndicator(true, {label: 'Utkast'});
            expect(element?.props.label).toBe('Utkast');
        });
    });
});
