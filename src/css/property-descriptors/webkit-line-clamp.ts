import { Context } from '../../core/context';
import { IPropertyValueDescriptor, PropertyDescriptorParsingType } from '../IPropertyDescriptor';
import { CSSValue, isNumberToken } from '../syntax/parser';

/**
 * `-webkit-line-clamp`: limits the content to the given number of lines,
 * adding an ellipsis after the last visible line.
 *
 * Parsed to a number of lines. `0` means "no clamp" (the `none` keyword or any
 * non-positive/invalid value).
 */
export const webkitLineClamp: IPropertyValueDescriptor<number> = {
    name: `-webkit-line-clamp`,
    initialValue: 'none',
    type: PropertyDescriptorParsingType.VALUE,
    prefix: false,
    parse: (_context: Context, token: CSSValue): number => {
        if (isNumberToken(token) && token.number > 0) {
            return Math.floor(token.number);
        }
        return 0;
    },
};
