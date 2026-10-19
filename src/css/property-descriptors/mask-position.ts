import { PropertyDescriptorParsingType, IPropertyListDescriptor } from '../IPropertyDescriptor';
import { CSSValue, parseFunctionArgs } from '../syntax/parser';
import { isLengthPercentage, LengthPercentageTuple, parseLengthPercentageTuple } from '../types/length-percentage';
import { Context } from '../../core/context';

export type MaskPosition = LengthPercentageTuple[];

export const maskPosition: IPropertyListDescriptor<MaskPosition> = {
    name: 'mask-position',
    initialValue: '0% 0%',
    type: PropertyDescriptorParsingType.LIST,
    prefix: true,
    parse: (_context: Context, tokens: CSSValue[]): MaskPosition => {
        return parseFunctionArgs(tokens)
            .map((values: CSSValue[]) => values.filter(isLengthPercentage))
            .map(parseLengthPercentageTuple);
    },
};
