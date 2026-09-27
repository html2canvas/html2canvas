import { Context } from '../../core/context';
import { IPropertyListDescriptor, PropertyDescriptorParsingType } from '../IPropertyDescriptor';
import { CSSValue, isIdentToken } from '../syntax/parser';
import { TokenType } from '../syntax/tokenizer';

/**
 * A single border-image-width value can be:
 *   - a number (multiplier of the corresponding border-width)
 *   - a length in px
 *   - a percentage (relative to the border image area)
 *   - `auto` (use the slice value)
 */
export interface BorderImageWidthValue {
    value: number;
    type: 'number' | 'length' | 'percentage' | 'auto';
}

export type BorderImageWidth = [
    BorderImageWidthValue,
    BorderImageWidthValue,
    BorderImageWidthValue,
    BorderImageWidthValue,
];

const DEFAULT_VALUE: BorderImageWidthValue = { value: 1, type: 'number' };

export const borderImageWidth: IPropertyListDescriptor<BorderImageWidth> = {
    name: 'border-image-width',
    initialValue: '1',
    type: PropertyDescriptorParsingType.LIST,
    prefix: false,
    parse: (_context: Context, tokens: CSSValue[]): BorderImageWidth => {
        const parsed: BorderImageWidthValue[] = [];

        for (const token of tokens) {
            if (token.type === TokenType.WHITESPACE_TOKEN) {
                continue;
            }
            if (isIdentToken(token) && token.value === 'auto') {
                parsed.push({ value: 0, type: 'auto' });
            } else if (token.type === TokenType.NUMBER_TOKEN) {
                parsed.push({ value: token.number, type: 'number' });
            } else if (token.type === TokenType.PERCENTAGE_TOKEN) {
                parsed.push({ value: token.number, type: 'percentage' });
            } else if (token.type === TokenType.DIMENSION_TOKEN) {
                parsed.push({ value: token.number, type: 'length' });
            }
        }

        if (parsed.length === 0) {
            return [DEFAULT_VALUE, DEFAULT_VALUE, DEFAULT_VALUE, DEFAULT_VALUE];
        }

        return expandFour(parsed);
    },
};

function expandFour(arr: BorderImageWidthValue[]): BorderImageWidth {
    if (arr.length === 1) {
        return [arr[0], arr[0], arr[0], arr[0]];
    }
    if (arr.length === 2) {
        return [arr[0], arr[1], arr[0], arr[1]];
    }
    if (arr.length === 3) {
        return [arr[0], arr[1], arr[2], arr[1]];
    }
    return [arr[0], arr[1], arr[2], arr[3]];
}
