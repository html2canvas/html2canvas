import { Context } from '../../core/context';
import { IPropertyValueDescriptor, PropertyDescriptorParsingType } from '../IPropertyDescriptor';
import { CSSValue, isDimensionToken, isNumberToken } from '../syntax/parser';

// outline-offset can be negative (outline moves inside the border-box)
export const outlineOffset: IPropertyValueDescriptor<number> = {
    name: 'outline-offset',
    initialValue: '0',
    prefix: false,
    type: PropertyDescriptorParsingType.VALUE,
    parse: (_context: Context, token: CSSValue): number => {
        if (isDimensionToken(token)) {
            return token.number;
        }
        if (isNumberToken(token)) {
            return token.number;
        }
        return 0;
    },
};
