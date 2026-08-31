import { IPropertyListDescriptor, PropertyDescriptorParsingType } from '../IPropertyDescriptor';
import { CSSValue, isIdentToken } from '../syntax/parser';
import { Context } from '../../core/context';

export const enum BACKGROUND_ATTACHMENT {
    SCROLL = 0,
    FIXED = 1,
    LOCAL = 2,
}

export type BackgroundAttachment = BACKGROUND_ATTACHMENT[];

export const backgroundAttachment: IPropertyListDescriptor<BackgroundAttachment> = {
    name: 'background-attachment',
    initialValue: 'scroll',
    prefix: false,
    type: PropertyDescriptorParsingType.LIST,
    parse: (_context: Context, tokens: CSSValue[]): BackgroundAttachment => {
        return tokens.filter(isIdentToken).map(token => {
            switch (token.value) {
                case 'fixed':
                    return BACKGROUND_ATTACHMENT.FIXED;
                case 'local':
                    return BACKGROUND_ATTACHMENT.LOCAL;
                default:
                    return BACKGROUND_ATTACHMENT.SCROLL;
            }
        });
    },
};
