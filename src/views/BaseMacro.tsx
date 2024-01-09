import React from 'react';
import {MacroConfig, MacroData, MetaData} from '../guillotine/getMetaData';
import {ComponentRegistry} from '../ComponentRegistry';
import {RENDER_MODE} from '../utils';
import {sanitizeGraphqlName} from '../utils/sanitizeGraphqlName';
import HTMLReactParser from 'html-react-parser';

const unescape = require('unescape');

export const MACRO_DISABLE = 'system:disable';
export const MACRO_EMBED = 'system:embed';

interface BaseMacroProps {
    data: MacroData;
    meta: MetaData;
    renderInEditMode?: boolean;
}

export interface MacroProps {
    name: string;
    config: MacroConfig;
    meta: MetaData;
}

const BaseMacro = (props: BaseMacroProps) => {
    const {data, meta, renderInEditMode} = props;

    let config = data.config[sanitizeGraphqlName(data.name)] || {};
    if (data.descriptor !== MACRO_DISABLE) {
        // do not do any processing for disable macro
        config = normalizeValue(config);
    }

    if (!renderInEditMode && meta?.renderMode === RENDER_MODE.EDIT) {
        const attrs = formatAttributes(config);
        if (config.body) {
            // do not parse system macros (embed, disable) in edit mode
            // but parse others because panel macros (for instance) wants its content to be html, not string
            // TODO: should we make this behavior configurable ?
            const bodyString = !data.descriptor.startsWith('system:') ? HTMLReactParser(config.body) : config.body;
            return <>
                {`[${data.name}${attrs}]`}
                {bodyString}
                {`[/${data.name}]`}
            </>;
        } else {
            return <>
                {`[${data.name}${attrs}/]`}
            </>;
        }
    }

    const macro = ComponentRegistry.getMacro(data.descriptor);
    const MacroView = macro?.view;
    if (MacroView) {
        return <MacroView name={data.name} config={config} meta={meta}/>;
    } else if (data.descriptor) {
        console.warn(`BaseMacro: can not render macro '${data.descriptor}': no next view or catch-all defined`);
    }
    return null;
};

function normalizeValue(value: any): any {
    let parsedVal: any;
    if (value instanceof Array) {
        parsedVal = value.map(normalizeValue);
    } else if (value instanceof Object) {
        parsedVal = {};
        Object.entries(value).forEach(entry => parsedVal[entry[0]] = normalizeValue(entry[1]));
    } else if (typeof value === 'string') {
        const unescapedValue = unescape(value);
        if (unescapedValue.startsWith('[') && unescapedValue.endsWith(']')) {
            // Wicked array notation: "[Value 1, Value 2]"
            parsedVal = unescapedValue.substring(1, unescapedValue.length - 1).split(/,\s*/);
        } else {
            try {
                parsedVal = JSON.parse(unescapedValue);
            } catch (e) {
                // simple string or wrongly formatted JSON
                parsedVal = unescapedValue;
            }
        }
    } else {
        // most likely a number or unknown type
        parsedVal = value;
    }
    return parsedVal;
}

function formatAttributes(config: MacroConfig): string {
    const attrs: string[] = Object.entries(config)
        .filter(entry => entry[0] !== 'body')
        .reduce<string[]>((accum, entry) => {
            // concat to make sure we account for arrays
            [].concat(normalizeValue(entry[1])).forEach(val => accum.push(`${entry[0]}="${val}"`));
            return accum;
        }, []);

    return attrs.length ? ` ${attrs.join(' ')}` : '';
}

export default BaseMacro;
