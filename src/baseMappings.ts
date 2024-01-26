import {ComponentRegistry} from './common/ComponentRegistry';
import {FRAGMENT_CONTENTTYPE_NAME, XP_COMPONENT_TYPE} from './common/constants';
import FragmentView from './views/Fragment';
import BasePage from './views/BasePage';
import BasePart from './views/BasePart';
import BaseLayout from './views/BaseLayout';
import TextView from './views/Text';
import DefaultMacro from './views/macros/DefaultMacro';
import DisableMacro from './views/macros/DisableMacro';
import {getShortcutQuery} from './query/Shortcut';


// Base Content Types

ComponentRegistry.addContentType(FRAGMENT_CONTENTTYPE_NAME, {
    view: FragmentView,
});

ComponentRegistry.addContentType('base:shortcut', {
    query: getShortcutQuery,
});

// Base Components

ComponentRegistry.addComponent(XP_COMPONENT_TYPE.PAGE, {
    view: BasePage,
});

ComponentRegistry.addComponent(XP_COMPONENT_TYPE.PART, {
    view: BasePart,
});

ComponentRegistry.addComponent(XP_COMPONENT_TYPE.LAYOUT, {
    view: BaseLayout,
});

ComponentRegistry.addComponent(XP_COMPONENT_TYPE.FRAGMENT, {
    view: FragmentView,
});

ComponentRegistry.addComponent(XP_COMPONENT_TYPE.TEXT, {
    view: TextView,
});

// Macro mappings
ComponentRegistry.addMacro('system:embed', {
    view: DefaultMacro,
    configQuery: '{body}',
});
ComponentRegistry.addMacro('system:disable', {
    view: DisableMacro,
    configQuery: '{body}',
});
