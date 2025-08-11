import {afterEach as afterEachTestInDescribe, describe, expect, test as it} from '@jest/globals';
import '@testing-library/jest-dom/jest-globals';
import {cleanup, render, screen, waitFor} from '@testing-library/react'
import * as React from 'react'
import PropsView from '../../src/views/PropsView';


describe('views', () => {
    describe('PropsView', () => {

        afterEachTestInDescribe(() => {
            cleanup(); // Resets the DOM after each test suite
        })

        it('should render when there are no props', () => {
            render(<PropsView/>);
            const bodyEl = screen.queryAllByText('')[0];
            expect(bodyEl).toContainHTML(`<body><div><div class="debug" style="margin: 10px; padding: 10px; border: 2px solid lightgrey;" /></div></body>`);
        });

        it('should render when there is a page prop', async () => {
            render(<PropsView page={{key: 'value'}}/>);
            await waitFor(() => {
                expect(screen.queryByText('Page:')).toBeInTheDocument();
            });
            const bodyEl = screen.queryAllByText('')[0];
            expect(bodyEl).toContainHTML(
                `<body><div><div class="debug" style="margin: 10px; padding: 10px; border: 2px solid lightgrey;"><h5 style="margin-top: 0px; margin-bottom: 0px;">Page:</h5><pre style="font-size: .8em; width: 100%; white-space: pre-wrap; word-wrap: break-word;">{\n  "key": "value"\n}</pre></div></div></body>`);
        });
    });
});
