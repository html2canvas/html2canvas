import { Context } from '../../core/context';
import { IPropertyListDescriptor, PropertyDescriptorParsingType } from '../IPropertyDescriptor';
import { CSSValue, isIdentToken, parseFunctionArgs } from '../syntax/parser';
import { StringValueToken } from '../syntax/tokenizer';
import { isLengthPercentage, LengthPercentage } from '../types/length-percentage';

// Reuse background-size types — mask-size accepts the same values.
export {
    BACKGROUND_SIZE as MASK_SIZE, BackgroundSize as MaskSize, BackgroundSizeInfo as MaskSizeInfo
} from './background-size';

export const maskSize: IPropertyListDescriptor<(LengthPercentage | StringValueToken)[][]> = {
    name: 'mask-size',
    initialValue: 'auto',
    prefix: true,
    type: PropertyDescriptorParsingType.LIST,
    parse: (_context: Context, tokens: CSSValue[]): (LengthPercentage | StringValueToken)[][] => {
        return parseFunctionArgs(tokens).map(values =>
            values.filter((v): v is LengthPercentage | StringValueToken => isIdentToken(v) || isLengthPercentage(v)),
        );
    },
};
