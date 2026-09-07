'use client';
import type {DraftModeButtonProps} from '../types';

import {useSyncExternalStore, useTransition} from 'react';
import {FROM_XP_PARAM} from '../common/constants';
import {replaceLocation} from './replaceLocation';
import styles from './DraftModeButton.module.css';

const subscribe = () => () => undefined;
const isTopWindow = () => window.self === window.top;
const isTopWindowOnServer = () => false;

function urlWithoutXpParam(): string {
    const url = new URL(window.location.href);
    url.searchParams.delete(FROM_XP_PARAM);
    return url.toString();
}

export default function DraftModeButton({action, label}: DraftModeButtonProps) {
    const visible = useSyncExternalStore(subscribe, isTopWindow, isTopWindowOnServer);
    const [isPending, startTransition] = useTransition();

    if (!visible) {
        return null;
    }

    return (
        <button type="button"
                className={styles.button}
                disabled={isPending}
                onClick={() => startTransition(async () => {
                    await action();
                    // Full reload without the CS marker: with it and no draft cookie the proxy would re-enable draft mode
                    replaceLocation(urlWithoutXpParam());
                })}>
            {label} <span className={styles.glyph}>✕</span>
        </button>
    );
}
