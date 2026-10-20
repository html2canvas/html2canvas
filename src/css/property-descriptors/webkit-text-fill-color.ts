import { IPropertyTypeValueDescriptor, PropertyDescriptorParsingType } from '../IPropertyDescriptor';

/**
 * -webkit-text-fill-color
 *
 * Overrides the fill colour of text glyphs independently of `color`.
 * When set to a non-transparent value it takes precedence over `color`
 * for the fill paint layer (but not for decorations or shadows).
 *
 * Initial value: `currentcolor` — treated as transparent/absent so that
 * the normal `color` property is used when the fill colour is not explicitly
 * set.
 */
export const webkitTextFillColor: IPropertyTypeValueDescriptor = {
    name: '-webkit-text-fill-color',
    initialValue: 'transparent',
    prefix: false,
    type: PropertyDescriptorParsingType.TYPE_VALUE,
    format: 'color',
};
