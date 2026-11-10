import {describe, expect, test} from '@jest/globals';
import {renderToStaticMarkup} from 'react-dom/server';
import DefaultMacro from '../../src/views/macros/DefaultMacro';
import DisableMacro from '../../src/views/macros/DisableMacro';
import type {MacroProps} from '../../src/types';

const props: MacroProps = {name: 'example', config: {}, children: null, meta: {} as MacroProps['meta']};

describe('built-in macro bodies', () => {
    test('parses HTML for the default macro and preserves literal text for disable', () => {
        const config = {body: '<strong>Body</strong>'};
        expect(renderToStaticMarkup(<DefaultMacro {...props} config={config}/>)).toEqual('<strong>Body</strong>');
        expect(renderToStaticMarkup(<DisableMacro {...props} config={config}/>)).toEqual('&lt;strong&gt;Body&lt;/strong&gt;');
    });

    test('parses sibling elements, entities and React attributes with parser v6', () => {
        const config = {body: '<label for="field" class="caption">A &amp; B</label><input id="field" disabled>'};
        expect(renderToStaticMarkup(<DefaultMacro {...props} config={config}/>)).toEqual(
            '<label for="field" class="caption">A &amp; B</label><input id="field" disabled=""/>'
        );
    });

    test.each([undefined, null, 1, {}, []])('ignores non-string bodies: %p', (body) => {
        const config = {body};
        expect(renderToStaticMarkup(<DefaultMacro {...props} config={config}/>)).toEqual('');
        expect(renderToStaticMarkup(<DisableMacro {...props} config={config}/>)).toEqual('');
    });
});
