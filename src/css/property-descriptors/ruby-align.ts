import { IPropertyIdentValueDescriptor, PropertyDescriptorParsingType } from '../IPropertyDescriptor';
import { Context } from '../../core/context';

export const enum RUBY_ALIGN {
    START = 0,
    CENTER = 1,
    SPACE_BETWEEN = 2,
    SPACE_AROUND = 3,
}

export const rubyAlign: IPropertyIdentValueDescriptor<RUBY_ALIGN> = {
    name: 'ruby-align',
    initialValue: 'space-around',
    prefix: false,
    type: PropertyDescriptorParsingType.IDENT_VALUE,
    parse: (_context: Context, value: string) => {
        switch (value) {
            case 'start':
                return RUBY_ALIGN.START;
            case 'center':
                return RUBY_ALIGN.CENTER;
            case 'space-between':
                return RUBY_ALIGN.SPACE_BETWEEN;
            case 'space-around':
            default:
                return RUBY_ALIGN.SPACE_AROUND;
        }
    },
};
