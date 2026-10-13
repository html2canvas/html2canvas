import { IPropertyTypeValueDescriptor, PropertyDescriptorParsingType } from '../IPropertyDescriptor';

export const outlineColor: IPropertyTypeValueDescriptor = {
    name: 'outline-color',
    initialValue: 'transparent',
    prefix: false,
    type: PropertyDescriptorParsingType.TYPE_VALUE,
    format: 'color',
};
