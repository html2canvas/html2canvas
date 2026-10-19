import { Context } from '../../core/context';
import { IPropertyListDescriptor, PropertyDescriptorParsingType } from '../IPropertyDescriptor';
import { CSSValue, nonFunctionArgSeparator } from '../syntax/parser';
import { TokenType } from '../syntax/tokenizer';
import { ICSSImage, image, isSupportedImage } from '../types/image';

export const maskImage: IPropertyListDescriptor<ICSSImage[]> = {
    name: 'mask-image',
    initialValue: 'none',
    type: PropertyDescriptorParsingType.LIST,
    prefix: true,
    parse: (context: Context, tokens: CSSValue[]): ICSSImage[] => {
        if (tokens.length === 0) {
            return [];
        }

        const first = tokens[0];
        if (first.type === TokenType.IDENT_TOKEN && first.value === 'none') {
            return [];
        }

        return tokens
            .filter(value => nonFunctionArgSeparator(value) && isSupportedImage(value))
            .reduce((acc: ICSSImage[], value) => {
                try {
                    acc.push(image.parse(context, value));
                } catch (e) {
                    context.logger.error(`Error parsing mask-image: ${e}`);
                }
                return acc;
            }, []);
    },
};
