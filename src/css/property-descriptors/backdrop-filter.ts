import { Context } from '../../core/context';
import { IPropertyListDescriptor, PropertyDescriptorParsingType } from '../IPropertyDescriptor';
import { CSSValue } from '../syntax/parser';
import { CSSFilter, CSSFilterList, filter as filterDescriptor } from './filter';

// backdrop-filter accepts the same function syntax as filter.
// We reuse CSSFilter / CSSFilterList types and the same parser.
export const backdropFilter: IPropertyListDescriptor<CSSFilterList> = {
    name: 'backdrop-filter',
    initialValue: 'none',
    type: PropertyDescriptorParsingType.LIST,
    prefix: false,
    parse: (context: Context, tokens: CSSValue[]): CSSFilterList => {
        return filterDescriptor.parse(context, tokens);
    },
};

export type { CSSFilter, CSSFilterList };
