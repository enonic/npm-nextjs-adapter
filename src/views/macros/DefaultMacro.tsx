import React from 'react';
import {MacroProps} from '../BaseMacro';
import HTMLReactParser from 'html-react-parser';

const DefaultMacro = ({name, config, meta}: MacroProps) => (
    HTMLReactParser(config.body) as JSX.Element
);

export default DefaultMacro;
