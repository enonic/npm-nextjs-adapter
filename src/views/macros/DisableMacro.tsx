import type {MacroProps} from '../../types';


const DisableMacro = ({name, config, meta}: MacroProps) => (
    config.body
);

export default DisableMacro;
