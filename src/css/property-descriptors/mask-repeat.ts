import { IPropertyListDescriptor, PropertyDescriptorParsingType } from '../IPropertyDescriptor';
import { CSSValue, isIdentToken, parseFunctionArgs } from '../syntax/parser';
import { Context } from '../../core/context';

// mask-repeat accepts the same values as background-repeat.
export { BACKGROUND_REPEAT as MASK_REPEAT } from './background-repeat';
import { BACKGROUND_REPEAT } from './background-repeat';

export type MaskRepeat = BACKGROUND_REPEAT[];

export const maskRepeat: IPropertyListDescriptor<MaskRepeat> = {
    name: 'mask-repeat',
    initialValue: 'no-repeat',
    prefix: true,
    type: PropertyDescriptorParsingType.LIST,
    parse: (_context: Context, tokens: CSSValue[]): MaskRepeat => {
        return parseFunctionArgs(tokens)
            .map(values =>
                values
                    .filter(isIdentToken)
                    .map(token => token.value)
                    .join(' '),
            )
            .map(parseMaskRepeat);
    },
};

const parseMaskRepeat = (value: string): BACKGROUND_REPEAT => {
    switch (value) {
        case 'no-repeat':
            return BACKGROUND_REPEAT.NO_REPEAT;
        case 'repeat-x':
        case 'repeat no-repeat':
            return BACKGROUND_REPEAT.REPEAT_X;
        case 'repeat-y':
        case 'no-repeat repeat':
            return BACKGROUND_REPEAT.REPEAT_Y;
        case 'repeat':
        default:
            return BACKGROUND_REPEAT.REPEAT;
    }
};
