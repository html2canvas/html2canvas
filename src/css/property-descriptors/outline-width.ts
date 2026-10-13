import { Context } from '../../core/context';
import { IPropertyValueDescriptor, PropertyDescriptorParsingType } from '../IPropertyDescriptor';
import { CSSValue, isDimensionToken } from '../syntax/parser';

export const outlineWidth: IPropertyValueDescriptor<number> = {
    name: 'outline-width',
    initialValue: '0',
    prefix: false,
    type: PropertyDescriptorParsingType.VALUE,
    parse: (_context: Context, token: CSSValue): number => {
        if (isDimensionToken(token)) {
            return token.number;
        }
        return 0;
    },
};
