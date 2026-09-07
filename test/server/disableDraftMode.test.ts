import {afterEach as afterEachTestInDescribe, describe, expect, jest, test as it} from '@jest/globals';


async function importAction(disable = jest.fn()) {
    jest.mock('next/headers', () => ({
        draftMode: () => Promise.resolve({disable})
    }), {virtual: true});

    const {disableDraftMode} = await import('../../src/server/disableDraftMode');
    return {disableDraftMode, disable};
}

describe('server', () => {
    describe('disableDraftMode', () => {

        afterEachTestInDescribe(() => {
            jest.resetModules();
            jest.restoreAllMocks();
        });

        it('stays a native async function, as Next.js requires for Server Actions', async () => {
            const {disableDraftMode} = await importAction();
            expect(disableDraftMode.constructor.name).toBe('AsyncFunction');
        });

        it('disables draft mode', async () => {
            const {disableDraftMode, disable} = await importAction();
            await disableDraftMode();
            expect(disable).toHaveBeenCalledTimes(1);
        });
    });
});
