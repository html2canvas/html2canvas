/**
 * -webkit-box-reflect
 *
 * Creates a mirrored reflection of the element below, above, to the left or
 * right, with an optional offset and optional mask image (usually a gradient).
 *
 * Syntax: -webkit-box-reflect: <direction> <offset> [ <image> ]?
 *   direction : above | below | left | right
 *   offset    : <length> | <percentage>   (default 0)
 *   image     : none | <gradient> | url(…) (optional mask)
 *
 * The parsed value carries enough information for the renderer to:
 *   1. Identify which axis to flip (direction → scaleX / scaleY of -1).
 *   2. Know how far from the element edge to place the reflection (offset).
 *   3. Optionally apply a gradient mask to the reflection.
 */

import { Context } from '../../core/context';
import { IPropertyListDescriptor, PropertyDescriptorParsingType } from '../IPropertyDescriptor';
import { CSSValue, isIdentToken, isIdentWithValue } from '../syntax/parser';
import { TokenType } from '../syntax/tokenizer';
import { ICSSImage, image as imageParse, isSupportedImage } from '../types/image';
import { isLengthPercentage, LengthPercentage, ZERO_LENGTH } from '../types/length-percentage';

// ---------------------------------------------------------------------------
// Public types
// ---------------------------------------------------------------------------

export type BoxReflectDirection = 'above' | 'below' | 'left' | 'right';

export interface CSSBoxReflect {
    direction: BoxReflectDirection;
    /** Distance between the element edge and the reflection edge. */
    offset: LengthPercentage;
    /** Optional mask image (gradient or URL). Null when none / absent. */
    mask: ICSSImage | null;
}

export const NONE_BOX_REFLECT: null = null;

// ---------------------------------------------------------------------------
// Property descriptor
// ---------------------------------------------------------------------------

export const webkitBoxReflect: IPropertyListDescriptor<CSSBoxReflect | null> = {
    name: '-webkit-box-reflect',
    initialValue: 'none',
    prefix: true,
    type: PropertyDescriptorParsingType.LIST,
    parse: (context: Context, tokens: CSSValue[]): CSSBoxReflect | null => {
        const filtered = tokens.filter(t => t.type !== TokenType.WHITESPACE_TOKEN);

        if (filtered.length === 0) return NONE_BOX_REFLECT;

        // First token must be the direction keyword
        const first = filtered[0];
        if (!isIdentToken(first)) return NONE_BOX_REFLECT;

        const dirValue = first.value.toLowerCase();
        if (dirValue === 'none') return NONE_BOX_REFLECT;
        if (dirValue !== 'above' && dirValue !== 'below' && dirValue !== 'left' && dirValue !== 'right') {
            return NONE_BOX_REFLECT;
        }
        const direction = dirValue as BoxReflectDirection;

        // Second token (optional): offset length/percentage
        let offset: LengthPercentage = ZERO_LENGTH;
        let maskStartIndex = 1;

        if (filtered.length > 1) {
            const second = filtered[1];
            if (isLengthPercentage(second)) {
                offset = second;
                maskStartIndex = 2;
            }
        }

        // Remaining tokens (optional): mask image (gradient or url)
        let mask: ICSSImage | null = null;
        if (filtered.length > maskStartIndex) {
            const maskToken = filtered[maskStartIndex];
            // 'none' keyword → no mask
            if (isIdentWithValue(maskToken, 'none')) {
                mask = null;
            } else if (isSupportedImage(maskToken)) {
                try {
                    mask = imageParse.parse(context, maskToken);
                } catch {
                    mask = null;
                }
            }
        }

        return { direction, offset, mask };
    },
};
