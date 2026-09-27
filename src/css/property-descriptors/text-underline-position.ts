import { IPropertyIdentValueDescriptor, PropertyDescriptorParsingType } from '../IPropertyDescriptor';
import { Context } from '../../core/context';

export const enum TEXT_UNDERLINE_POSITION {
    AUTO = 0,
    UNDER = 1,
    LEFT = 2,
    RIGHT = 3,
}

export const textUnderlinePosition: IPropertyIdentValueDescriptor<TEXT_UNDERLINE_POSITION> = {
    name: 'text-underline-position',
    initialValue: 'auto',
    prefix: false,
    type: PropertyDescriptorParsingType.IDENT_VALUE,
    parse: (_context: Context, position: string): TEXT_UNDERLINE_POSITION => {
        switch (position) {
            case 'under':
                return TEXT_UNDERLINE_POSITION.UNDER;
            case 'left':
                return TEXT_UNDERLINE_POSITION.LEFT;
            case 'right':
                return TEXT_UNDERLINE_POSITION.RIGHT;
        }
        return TEXT_UNDERLINE_POSITION.AUTO;
    },
};
