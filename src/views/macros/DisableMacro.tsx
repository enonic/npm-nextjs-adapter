import type {MacroProps} from '../../types';


const DisableMacro = ({name, config, meta}: MacroProps) => (
    typeof config.body === 'string' ? config.body : null
);

export default DisableMacro;
