import type {MacroProps} from '../../types';
import HTMLReactParser from 'html-react-parser';
import type {ReactElement} from 'react';


const DefaultMacro = ({name, config, meta}: MacroProps) => (
    HTMLReactParser(config.body) as ReactElement
);

export default DefaultMacro;
