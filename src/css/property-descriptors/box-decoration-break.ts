import { Context } from '../../core/context';
import { IPropertyIdentValueDescriptor, PropertyDescriptorParsingType } from '../IPropertyDescriptor';

export const enum BOX_DECORATION_BREAK {
    SLICE = 0,
    CLONE = 1,
}

export const boxDecorationBreak: IPropertyIdentValueDescriptor<BOX_DECORATION_BREAK> = {
    name: 'box-decoration-break',
    initialValue: 'slice',
    prefix: true,
    type: PropertyDescriptorParsingType.IDENT_VALUE,
    parse: (_context: Context, value: string): BOX_DECORATION_BREAK => {
        switch (value) {
            case 'clone':
                return BOX_DECORATION_BREAK.CLONE;
            case 'slice':
            default:
                return BOX_DECORATION_BREAK.SLICE;
        }
    },
};
