import {ComponentRegistry} from '../../common/ComponentRegistry';
import {configQuery} from './configQuery';
import {indent} from '../../utils/indent';


const macroConfigQuery = (): string => {
    return configQuery(ComponentRegistry.getMacros(), false, false);
};

export const richTextQuery = (fieldName: string) => {
    return `${fieldName}(processHtml:{type:absolute, imageWidths:[400, 800, 1200], imageSizes:"(max-width: 400px) 400px, (max-width: 800px) 800px, 1200px"}) {
    processedHtml
    macros {
        ref
        name
        descriptor
        ${indent(macroConfigQuery(), 8)}
    }
    links {
        ref
        media {
            content {
                _id
            }
        }
    }
    images {
        ref
        image {
            _id
        }
    }
}`;
};