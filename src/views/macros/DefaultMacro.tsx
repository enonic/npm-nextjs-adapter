import type {MacroProps} from '../../types';
import HTMLReactParser from 'html-react-parser';


const DefaultMacro = ({name, config, meta}: MacroProps) => (
    HTMLReactParser(typeof config.body === 'string' ? config.body : '')
);

export default DefaultMacro;
