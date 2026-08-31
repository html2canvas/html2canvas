import { Context } from '../../core/context';
import { IPropertyListDescriptor, PropertyDescriptorParsingType } from '../IPropertyDescriptor';
import { CSSValue, isIdentToken } from '../syntax/parser';
import { TokenType } from '../syntax/tokenizer';

/**
 * Parsed result for `border-image-slice`.
 *
 * Values are 1-4 numbers or percentages (top, right, bottom, left — same shorthand
 * expansion as margin/padding).  Unitless numbers represent pixel offsets into the
 * source image; percentages are relative to the source image dimensions.
 *
 * The `fill` flag indicates whether the center region should be drawn.
 */
export interface BorderImageSlice {
    /** [top, right, bottom, left] — each is a raw number (px) or a percentage (0–100). */
    values: [number, number, number, number];
    /** Whether the corresponding value is a percentage (true) or a pixel offset (false). */
    percentages: [boolean, boolean, boolean, boolean];
    /** Whether the `fill` keyword was specified. */
    fill: boolean;
}

export const borderImageSlice: IPropertyListDescriptor<BorderImageSlice> = {
    name: 'border-image-slice',
    initialValue: '100%',
    type: PropertyDescriptorParsingType.LIST,
    prefix: false,
    parse: (_context: Context, tokens: CSSValue[]): BorderImageSlice => {
        let fill = false;
        const nums: number[] = [];
        const pcts: boolean[] = [];

        for (const token of tokens) {
            if (token.type === TokenType.WHITESPACE_TOKEN) {
                continue;
            }
            if (isIdentToken(token) && token.value === 'fill') {
                fill = true;
                continue;
            }
            if (token.type === TokenType.NUMBER_TOKEN) {
                nums.push(token.number);
                pcts.push(false);
            } else if (token.type === TokenType.PERCENTAGE_TOKEN) {
                nums.push(token.number);
                pcts.push(true);
            }
            // Dimension tokens (e.g. 10px) — treat as pixel value
            else if (token.type === TokenType.DIMENSION_TOKEN) {
                nums.push(token.number);
                pcts.push(false);
            }
        }

        // Default: 100%
        if (nums.length === 0) {
            return {
                values: [100, 100, 100, 100],
                percentages: [true, true, true, true],
                fill,
            };
        }

        // Expand shorthand: 1 → all, 2 → TB/LR, 3 → T/LR/B, 4 → T/R/B/L
        const v = expandFourValues(nums);
        const p = expandFourValues(pcts);

        return {
            values: v as [number, number, number, number],
            percentages: p as [boolean, boolean, boolean, boolean],
            fill,
        };
    },
};

function expandFourValues<T>(arr: T[]): [T, T, T, T] {
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
