import { Context } from '../../core/context';
import { IPropertyValueDescriptor, PropertyDescriptorParsingType } from '../IPropertyDescriptor';
import { CSSValue } from '../syntax/parser';
import { TokenType } from '../syntax/tokenizer';
import { ICSSImage, image, isSupportedImage } from '../types/image';

export const borderImageSource: IPropertyValueDescriptor<ICSSImage | null> = {
    name: 'border-image-source',
    initialValue: 'none',
    type: PropertyDescriptorParsingType.VALUE,
    prefix: false,
    parse: (context: Context, token: CSSValue): ICSSImage | null => {
        if (token.type === TokenType.IDENT_TOKEN && token.value === 'none') {
            return null;
        }

        if (!isSupportedImage(token)) {
            return null;
        }

        try {
            return image.parse(context, token);
        } catch (e) {
            return null;
        }
    },
};
