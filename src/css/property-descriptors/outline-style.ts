import { Context } from '../../core/context';
import { IPropertyIdentValueDescriptor, PropertyDescriptorParsingType } from '../IPropertyDescriptor';

// outline-style supports the same values as border-style, plus 'auto'
// (which browsers render similarly to solid). We reuse the BORDER_STYLE enum
// so the same renderBorderSide() dispatcher handles outline painting.
export { BORDER_STYLE as OUTLINE_STYLE } from './border-style';

import { BORDER_STYLE } from './border-style';

export const outlineStyle: IPropertyIdentValueDescriptor<BORDER_STYLE> = {
    name: 'outline-style',
    initialValue: 'none',
    prefix: false,
    type: PropertyDescriptorParsingType.IDENT_VALUE,
    parse: (_context: Context, style: string): BORDER_STYLE => {
        switch (style) {
            case 'none':
                return BORDER_STYLE.NONE;
            case 'dashed':
                return BORDER_STYLE.DASHED;
            case 'dotted':
                return BORDER_STYLE.DOTTED;
            case 'double':
                return BORDER_STYLE.DOUBLE;
            case 'groove':
                return BORDER_STYLE.GROOVE;
            case 'ridge':
                return BORDER_STYLE.RIDGE;
            case 'inset':
                return BORDER_STYLE.INSET;
            case 'outset':
                return BORDER_STYLE.OUTSET;
            case 'auto':
            // 'auto' is browser-specific; treat as solid for canvas rendering
            default:
                return BORDER_STYLE.SOLID;
        }
    },
};
