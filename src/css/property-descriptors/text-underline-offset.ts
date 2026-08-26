import { IPropertyValueDescriptor, PropertyDescriptorParsingType } from '../IPropertyDescriptor';
import { CSSValue } from '../syntax/parser';
import { TokenType } from '../syntax/tokenizer';
import { Context } from '../../core/context';

// Sentinel value for 'auto'
export const TEXT_UNDERLINE_OFFSET_AUTO = 0;

export const textUnderlineOffset: IPropertyValueDescriptor<number> = {
    name: 'text-underline-offset',
    initialValue: 'auto',
    prefix: false,
    type: PropertyDescriptorParsingType.VALUE,
    parse: (_context: Context, token: CSSValue): number => {
        if (token.type === TokenType.IDENT_TOKEN && token.value === 'auto') {
            return TEXT_UNDERLINE_OFFSET_AUTO;
        }

        if (token.type === TokenType.DIMENSION_TOKEN || token.type === TokenType.NUMBER_TOKEN) {
            return token.number;
        }

        if (token.type === TokenType.PERCENTAGE_TOKEN) {
            // Percentage of 1em — stored as fraction, resolved at render time
            return token.number / 100;
        }

        return TEXT_UNDERLINE_OFFSET_AUTO;
    },
};
