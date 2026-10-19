import { Context } from '../../core/context';
import { IPropertyListDescriptor, PropertyDescriptorParsingType } from '../IPropertyDescriptor';
import { CSSValue, isIdentToken } from '../syntax/parser';

// mask-mode determines whether the mask uses its alpha channel or luminance as alpha.
export const enum MASK_MODE {
    // Use the alpha channel of the mask image directly.
    ALPHA = 0,
    // Convert the RGB luminance of the mask image to alpha.
    LUMINANCE = 1,
    // 'match-source': for URL images use alpha, for gradients use luminance.
    // We treat it as ALPHA since URLs are by far the common case.
    MATCH_SOURCE = 0,
}

export type MaskModeList = MASK_MODE[];

export const maskMode: IPropertyListDescriptor<MaskModeList> = {
    name: 'mask-mode',
    initialValue: 'match-source',
    prefix: false,
    type: PropertyDescriptorParsingType.LIST,
    parse: (_context: Context, tokens: CSSValue[]): MaskModeList => {
        return tokens.map(token => {
            if (isIdentToken(token)) {
                switch (token.value) {
                    case 'luminance':
                        return MASK_MODE.LUMINANCE;
                    case 'alpha':
                    case 'match-source':
                    default:
                        return MASK_MODE.ALPHA;
                }
            }
            return MASK_MODE.ALPHA;
        });
    },
};
