import { Context } from '../../core/context';
import { IPropertyListDescriptor, PropertyDescriptorParsingType } from '../IPropertyDescriptor';
import { CSSValue } from '../syntax/parser';
import { TokenType } from '../syntax/tokenizer';

/**
 * A single border-image-outset value is either:
 *   - a length in px
 *   - a number (multiplier of the corresponding border-width)
 */
export interface BorderImageOutsetValue {
    value: number;
    type: 'length' | 'number';
}

export type BorderImageOutset = [BorderImageOutsetValue, BorderImageOutsetValue, BorderImageOutsetValue, BorderImageOutsetValue];

const DEFAULT_VALUE: BorderImageOutsetValue = { value: 0, type: 'length' };

export const borderImageOutset: IPropertyListDescriptor<BorderImageOutset> = {
    name: 'border-image-outset',
    initialValue: '0',
    type: PropertyDescriptorParsingType.LIST,
    prefix: false,
    parse: (_context: Context, tokens: CSSValue[]): BorderImageOutset => {
        const parsed: BorderImageOutsetValue[] = [];

        for (const token of tokens) {
            if (token.type === TokenType.WHITESPACE_TOKEN) {
                continue;
            }
            if (token.type === TokenType.NUMBER_TOKEN) {
                parsed.push({ value: token.number, type: 'number' });
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

function expandFour(arr: BorderImageOutsetValue[]): BorderImageOutset {
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
