import { Context } from '../../core/context';
import { IPropertyListDescriptor, PropertyDescriptorParsingType } from '../IPropertyDescriptor';
import { CSSValue, isIdentToken } from '../syntax/parser';

// mask-clip adds 'no-clip' on top of the background-clip values.
export const enum MASK_CLIP {
    BORDER_BOX = 0,
    PADDING_BOX = 1,
    CONTENT_BOX = 2,
    NO_CLIP = 3,
}

export type MaskClip = MASK_CLIP[];

export const maskClip: IPropertyListDescriptor<MaskClip> = {
    name: 'mask-clip',
    initialValue: 'border-box',
    prefix: true,
    type: PropertyDescriptorParsingType.LIST,
    parse: (_context: Context, tokens: CSSValue[]): MaskClip => {
        return tokens.map(token => {
            if (isIdentToken(token)) {
                switch (token.value) {
                    case 'padding-box':
                        return MASK_CLIP.PADDING_BOX;
                    case 'content-box':
                        return MASK_CLIP.CONTENT_BOX;
                    case 'no-clip':
                        return MASK_CLIP.NO_CLIP;
                }
            }
            return MASK_CLIP.BORDER_BOX;
        });
    },
};
