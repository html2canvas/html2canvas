import { Context } from '../../core/context';
import { IPropertyListDescriptor, PropertyDescriptorParsingType } from '../IPropertyDescriptor';
import { CSSValue, isIdentToken } from '../syntax/parser';
import { BACKGROUND_ORIGIN } from './background-origin';

// mask-origin values mirror background-origin (border-box / padding-box / content-box).
export { BACKGROUND_ORIGIN as MASK_ORIGIN } from './background-origin';

export type MaskOrigin = BACKGROUND_ORIGIN[];

export const maskOrigin: IPropertyListDescriptor<MaskOrigin> = {
    name: 'mask-origin',
    initialValue: 'border-box',
    prefix: true,
    type: PropertyDescriptorParsingType.LIST,
    parse: (_context: Context, tokens: CSSValue[]): MaskOrigin => {
        return tokens.map(token => {
            if (isIdentToken(token)) {
                switch (token.value) {
                    case 'padding-box':
                        return BACKGROUND_ORIGIN.PADDING_BOX;
                    case 'content-box':
                        return BACKGROUND_ORIGIN.CONTENT_BOX;
                }
            }
            return BACKGROUND_ORIGIN.BORDER_BOX;
        });
    },
};
