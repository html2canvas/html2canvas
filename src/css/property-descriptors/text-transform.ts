import { Context } from '../../core/context';
import { IPropertyIdentValueDescriptor, PropertyDescriptorParsingType } from '../IPropertyDescriptor';
export const enum TEXT_TRANSFORM {
    NONE = 0,
    LOWERCASE = 1,
    UPPERCASE = 2,
    CAPITALIZE = 3,
    FULL_WIDTH = 4,
    FULL_SIZE_KANA = 5,
    MATH_AUTO = 6,
}

export const textTransform: IPropertyIdentValueDescriptor<TEXT_TRANSFORM> = {
    name: 'text-transform',
    initialValue: 'none',
    prefix: false,
    type: PropertyDescriptorParsingType.IDENT_VALUE,
    parse: (_context: Context, textTransform: string) => {
        switch (textTransform) {
            case 'uppercase':
                return TEXT_TRANSFORM.UPPERCASE;
            case 'lowercase':
                return TEXT_TRANSFORM.LOWERCASE;
            case 'capitalize':
                return TEXT_TRANSFORM.CAPITALIZE;
            case 'full-width':
                return TEXT_TRANSFORM.FULL_WIDTH;
            case 'full-size-kana':
                return TEXT_TRANSFORM.FULL_SIZE_KANA;
            case 'math-auto':
                return TEXT_TRANSFORM.MATH_AUTO;
            default:
                return TEXT_TRANSFORM.NONE;
        }
    },
};
