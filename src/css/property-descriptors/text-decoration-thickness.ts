import { Context } from '../../core/context';
import { IPropertyValueDescriptor, PropertyDescriptorParsingType } from '../IPropertyDescriptor';
import { CSSValue, isIdentToken } from '../syntax/parser';
import { isDimensionToken } from '../syntax/parser';
import { getNumber } from '../types/length-percentage';

export type TextDecorationThickness = number | 'auto' | 'from-font';

export const textDecorationThickness: IPropertyValueDescriptor<TextDecorationThickness> = {
    name: 'text-decoration-thickness',
    initialValue: 'auto',
    prefix: false,
    type: PropertyDescriptorParsingType.VALUE,
    parse: (_context: Context, token: CSSValue): TextDecorationThickness => {
        if (isIdentToken(token)) {
            if (token.value === 'from-font') {
                return 'from-font';
            }
            return 'auto';
        }
        if (isDimensionToken(token)) {
            return getNumber(token);
        }
        return 'auto';
    },
};
