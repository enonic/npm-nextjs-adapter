import {afterEach as afterEachTestInDescribe, beforeEach as beforeEachTestInDescribe, describe, expect, jest, test as it} from '@jest/globals';
import '@testing-library/jest-dom/jest-globals';
import {cleanup, fireEvent, render, screen, waitFor} from '@testing-library/react';
import * as React from 'react';
import DraftModeButton from '../../src/client/DraftModeButton';
import * as location from '../../src/client/replaceLocation';


const noopAction = () => Promise.resolve();

describe('client', () => {
    describe('DraftModeButton', () => {

        let replaceLocation: jest.SpiedFunction<typeof location.replaceLocation>;

        beforeEachTestInDescribe(() => {
            replaceLocation = jest.spyOn(location, 'replaceLocation').mockImplementation(() => undefined);
        });

        afterEachTestInDescribe(() => {
            cleanup();
            jest.restoreAllMocks();
            window.history.replaceState({}, '', '/');
        });

        it('renders the label followed by a close glyph in a top-level window', () => {
            render(<DraftModeButton action={noopAction} label="Draft"/>);
            expect(screen.getByRole('button', {name: 'Draft ✕'})).toBeInTheDocument();
        });

        it('is styled by the CSS module', () => {
            render(<DraftModeButton action={noopAction} label="Draft"/>);
            expect(screen.getByRole('button')).toHaveClass('button');
            expect(screen.getByText('✕')).toHaveClass('glyph');
        });

        it('renders a custom label', () => {
            render(<DraftModeButton action={noopAction} label="Utkast"/>);
            expect(screen.getByRole('button', {name: 'Utkast ✕'})).toBeInTheDocument();
        });

        it('renders nothing inside an iframe', () => {
            jest.spyOn(window, 'self', 'get').mockReturnValue({} as unknown as Window & typeof globalThis);
            render(<DraftModeButton action={noopAction} label="Draft"/>);
            expect(screen.queryByRole('button')).toBeNull();
        });

        it('calls the action once when clicked', async () => {
            const action = jest.fn(() => Promise.resolve());
            render(<DraftModeButton action={action} label="Draft"/>);
            fireEvent.click(screen.getByRole('button'));
            await waitFor(() => {
                expect(action).toHaveBeenCalledTimes(1);
            });
        });

        it('is disabled while the action is pending', async () => {
            let finish: () => void = () => undefined;
            const action = () => new Promise<void>((resolve) => {
                finish = resolve;
            });
            render(<DraftModeButton action={action} label="Draft"/>);
            const button = screen.getByRole('button');
            fireEvent.click(button);
            await waitFor(() => {
                expect(button).toBeDisabled();
            });
            finish();
            await waitFor(() => {
                expect(button).toBeEnabled();
            });
        });

        it('reloads the page without the xp parameter after the action has run', async () => {
            window.history.replaceState({}, '', '/en?xp=abc&foo=1');
            const action = jest.fn(() => Promise.resolve());
            render(<DraftModeButton action={action} label="Draft"/>);
            fireEvent.click(screen.getByRole('button'));
            await waitFor(() => {
                expect(replaceLocation).toHaveBeenCalledWith('http://localhost/en?foo=1');
            });
            expect(action).toHaveBeenCalledTimes(1);
            expect(action.mock.invocationCallOrder[0]).toBeLessThan(replaceLocation.mock.invocationCallOrder[0]);
        });

        it('reloads the current page when there is no xp parameter', async () => {
            window.history.replaceState({}, '', '/en?foo=1');
            render(<DraftModeButton action={noopAction} label="Draft"/>);
            fireEvent.click(screen.getByRole('button'));
            await waitFor(() => {
                expect(replaceLocation).toHaveBeenCalledWith('http://localhost/en?foo=1');
            });
        });
    });
});
