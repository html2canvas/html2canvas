import {IPropertyListDescriptor, PropertyDescriptorParsingType} from '../IPropertyDescriptor';
import {CSSValue, isIdentToken} from '../syntax/parser';
import {TokenType} from '../syntax/tokenizer';
import {Context} from '../../core/context';

export interface TextDecorationInset {
    start: number;
    end: number;
}

export const textDecorationInset: IPropertyListDescriptor<TextDecorationInset> = {
    name: 'text-decoration-inset',
    initialValue: '0',
    prefix: false,
    type: PropertyDescriptorParsingType.LIST,
    parse: (_context: Context, tokens: CSSValue[]): TextDecorationInset => {
        const values: number[] = [];

        for (const token of tokens) {
            if (isIdentToken(token) && token.value === 'auto') {
                // 'auto' — browser decides a small gap; approximate with a small positive value
                values.push(2);
            } else if (
                token.type === TokenType.DIMENSION_TOKEN ||
                token.type === TokenType.NUMBER_TOKEN
            ) {
                values.push(token.number);
            } else if (token.type === TokenType.PERCENTAGE_TOKEN) {
                // Store percentage as fraction — will be resolved at render time against line length
                values.push(token.number / 100);
            }
        }

        if (values.length === 0) {
            return {start: 0, end: 0};
        }
        if (values.length === 1) {
            return {start: values[0], end: values[0]};
        }
        return {start: values[0], end: values[1]};
    }
};
