import { IPropertyTypeValueDescriptor, PropertyDescriptorParsingType } from '../IPropertyDescriptor';

/**
 * text-emphasis-color
 *
 * Sets the colour of emphasis marks. Defaults to `currentcolor` (same as
 * the text colour). We store it as `transparent` so that the renderer can
 * detect "not set" and fall back to `styles.color`.
 */
export const textEmphasisColor: IPropertyTypeValueDescriptor = {
    name: 'text-emphasis-color',
    initialValue: 'transparent',
    prefix: false,
    type: PropertyDescriptorParsingType.TYPE_VALUE,
    format: 'color',
};
