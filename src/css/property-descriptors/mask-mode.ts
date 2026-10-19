import { Context } from '../../core/context';
import { IPropertyListDescriptor, PropertyDescriptorParsingType } from '../IPropertyDescriptor';
import { CSSValue, isIdentToken } from '../syntax/parser';

// mask-mode determines whether the mask uses its alpha channel or luminance as alpha.
// 'match-source' is treated as ALPHA (the common case for URL images).
export const enum MASK_MODE {
    ALPHA = 0,
    LUMINANCE = 1,
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
