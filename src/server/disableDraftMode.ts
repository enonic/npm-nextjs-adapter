'use server';
import {draftMode} from 'next/headers';

// Keep this file to async exports only: Next.js rejects anything else in a 'use server' module
export async function disableDraftMode(): Promise<void> {
    (await draftMode()).disable();
}
