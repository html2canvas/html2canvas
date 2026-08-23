/**
 * Deprecated CSS `clip` property — only `rect()` values are supported.
 * Syntax: clip: rect(<top>, <right>, <bottom>, <left>)
 * Applies to any positioned element (CSS spec says absolute/fixed, but browsers
 * also apply it to position:relative).
 */

import { Context } from '../../core/context';
import { IPropertyListDescriptor, PropertyDescriptorParsingType } from '../IPropertyDescriptor';
import { CSSFunction, CSSValue } from '../syntax/parser';
import { TokenType } from '../syntax/tokenizer';
import { HUNDRED_PERCENT, isLengthPercentage, LengthPercentage, ZERO_LENGTH } from '../types/length-percentage';

export interface CSSClipRect {
    top: LengthPercentage;
    right: LengthPercentage;
    bottom: LengthPercentage;
    left: LengthPercentage;
}

export const NO_CLIP: null = null;

export type CSSClip = CSSClipRect | null;

export const clip: IPropertyListDescriptor<CSSClip> = {
    name: 'clip',
    initialValue: 'auto',
    prefix: false,
    type: PropertyDescriptorParsingType.LIST,
    parse: (_context: Context, tokens: CSSValue[]): CSSClip => {
        const filtered = tokens.filter(t => t.type !== TokenType.WHITESPACE_TOKEN);

        if (filtered.length === 0) {
            return NO_CLIP;
        }

        // auto keyword — no clipping
        if (filtered.length === 1 && filtered[0].type === TokenType.IDENT_TOKEN) {
            const val = (filtered[0] as { value: string }).value.toLowerCase();
            if (val === 'auto') {
                return NO_CLIP;
            }
        }

        // rect() function
        if (filtered.length === 1 && filtered[0].type === TokenType.FUNCTION) {
            const fn = filtered[0] as CSSFunction;
            if (fn.name.toLowerCase() === 'rect') {
                return parseRect(fn.values);
            }
        }

        return NO_CLIP;
    },
};

/**
 * Parse rect(<top>, <right>, <bottom>, <left>).
 * Comma-separated or space-separated, each value is a length or `auto`.
 * `auto` for top/left → 0 (start edge); `auto` for right → 100% width; `auto` for bottom → 100% height.
 * We store positional index so the resolver in stacking-context can pick the right sentinel.
 */
const parseRect = (values: CSSValue[]): CSSClipRect | null => {
    const lengths: LengthPercentage[] = [];

    for (const token of values) {
        if (token.type === TokenType.WHITESPACE_TOKEN || token.type === TokenType.COMMA_TOKEN) {
            continue;
        }
        if (isLengthPercentage(token)) {
            lengths.push(token);
        } else if (
            token.type === TokenType.IDENT_TOKEN &&
            (token as { value: string }).value.toLowerCase() === 'auto'
        ) {
            // Use a sentinel: 100% for right (index 1) and bottom (index 2), 0 for top/left.
            // We don't know the index here yet, so push a placeholder and fix below.
            lengths.push(null as unknown as LengthPercentage); // placeholder for auto
        }
    }

    if (lengths.length !== 4) {
        return null;
    }

    // Resolve `auto` per position:
    // index 0 = top    → auto means 0 (top edge)
    // index 1 = right  → auto means 100% of width (right edge of element)
    // index 2 = bottom → auto means 100% of height (bottom edge of element)
    // index 3 = left   → auto means 0 (left edge)
    const autoValues: LengthPercentage[] = [ZERO_LENGTH, HUNDRED_PERCENT, HUNDRED_PERCENT, ZERO_LENGTH];
    const resolved = lengths.map((v, i) => (v === null ? autoValues[i] : v));

    return {
        top: resolved[0],
        right: resolved[1],
        bottom: resolved[2],
        left: resolved[3],
    };
};
