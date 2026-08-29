import { Context } from '../../core/context';
import { IPropertyListDescriptor, PropertyDescriptorParsingType } from '../IPropertyDescriptor';
import { CSSValue } from '../syntax/parser';
import { isLengthPercentage, LengthPercentageTuple, parseLengthPercentageTuple } from '../types/length-percentage';

export const objectPosition: IPropertyListDescriptor<LengthPercentageTuple> = {
    name: 'object-position',
    initialValue: '50% 50%',
    type: PropertyDescriptorParsingType.LIST,
    prefix: false,
    parse: (_context: Context, tokens: CSSValue[]): LengthPercentageTuple => {
        return parseLengthPercentageTuple(tokens.filter(isLengthPercentage));
    },
};
