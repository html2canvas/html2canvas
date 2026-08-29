import { Context } from '../../core/context';
import { IPropertyListDescriptor, PropertyDescriptorParsingType } from '../IPropertyDescriptor';
import { CSSValue, isIdentToken } from '../syntax/parser';
import { TokenType } from '../syntax/tokenizer';

export const enum BORDER_IMAGE_REPEAT {
    STRETCH = 0,
    REPEAT = 1,
    ROUND = 2,
    SPACE = 3,
}

/** [horizontal, vertical] repeat modes */
export type BorderImageRepeatTuple = [BORDER_IMAGE_REPEAT, BORDER_IMAGE_REPEAT];

export const borderImageRepeat: IPropertyListDescriptor<BorderImageRepeatTuple> = {
    name: 'border-image-repeat',
    initialValue: 'stretch',
    type: PropertyDescriptorParsingType.LIST,
    prefix: false,
    parse: (_context: Context, tokens: CSSValue[]): BorderImageRepeatTuple => {
        const values: BORDER_IMAGE_REPEAT[] = [];

        for (const token of tokens) {
            if (token.type === TokenType.WHITESPACE_TOKEN) {
                continue;
            }
            if (isIdentToken(token)) {
                values.push(parseRepeatKeyword(token.value));
            }
        }

        if (values.length === 0) {
            return [BORDER_IMAGE_REPEAT.STRETCH, BORDER_IMAGE_REPEAT.STRETCH];
        }
        if (values.length === 1) {
            return [values[0], values[0]];
        }
        return [values[0], values[1]];
    },
};

function parseRepeatKeyword(value: string): BORDER_IMAGE_REPEAT {
    switch (value) {
        case 'repeat':
            return BORDER_IMAGE_REPEAT.REPEAT;
        case 'round':
            return BORDER_IMAGE_REPEAT.ROUND;
        case 'space':
            return BORDER_IMAGE_REPEAT.SPACE;
        case 'stretch':
        default:
            return BORDER_IMAGE_REPEAT.STRETCH;
    }
}
