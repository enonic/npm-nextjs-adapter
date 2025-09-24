import React from 'react';
import type {MacroProps} from '../../types';
import HTMLReactParser from 'html-react-parser';


const DefaultMacro = ({name, config, meta}: MacroProps) => (
    HTMLReactParser(config.body) as React.JSX.Element
);

export default DefaultMacro;
