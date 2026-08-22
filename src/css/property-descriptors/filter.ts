import { Context } from '../../core/context';
import { IPropertyListDescriptor, PropertyDescriptorParsingType } from '../IPropertyDescriptor';
import { CSSValue, isIdentWithValue } from '../syntax/parser';
import { TokenType } from '../syntax/tokenizer';
import { Color, color as colorParse, COLORS } from '../types/color';
import { isLength, Length } from '../types/length';
import { ZERO_LENGTH } from '../types/length-percentage';

export const enum FilterType {
    DROP_SHADOW = 0,
    BLUR = 1,
    BRIGHTNESS = 2,
    CONTRAST = 3,
    GRAYSCALE = 4,
    HUE_ROTATE = 5,
    INVERT = 6,
    OPACITY = 7,
    SATURATE = 8,
    SEPIA = 9,
}

export interface DropShadowFilter {
    type: FilterType.DROP_SHADOW;
    color: Color;
    offsetX: Length;
    offsetY: Length;
    blur: Length;
}

export interface BlurFilter {
    type: FilterType.BLUR;
    radius: Length;
}

export interface AmountFilter {
    type:
        | FilterType.BRIGHTNESS
        | FilterType.CONTRAST
        | FilterType.GRAYSCALE
        | FilterType.INVERT
        | FilterType.OPACITY
        | FilterType.SATURATE
        | FilterType.SEPIA;
    amount: number; // normalized value (1 = 100%)
}

export interface HueRotateFilter {
    type: FilterType.HUE_ROTATE;
    angle: number; // in degrees
}

export type CSSFilter = DropShadowFilter | BlurFilter | AmountFilter | HueRotateFilter;
export type CSSFilterList = CSSFilter[];

export const filter: IPropertyListDescriptor<CSSFilterList> = {
    name: 'filter',
    initialValue: 'none',
    type: PropertyDescriptorParsingType.LIST,
    prefix: false,
    parse: (context: Context, tokens: CSSValue[]): CSSFilterList => {
        if (tokens.length === 1 && isIdentWithValue(tokens[0], 'none')) {
            return [];
        }

        const filters: CSSFilterList = [];

        for (let i = 0; i < tokens.length; i++) {
            const token = tokens[i];
            if (token.type === TokenType.FUNCTION) {
                const parsed = parseFilterFunction(context, token.name, token.values);
                if (parsed) {
                    filters.push(parsed);
                }
            }
        }

        return filters;
    },
};

const parseFilterFunction = (context: Context, name: string, values: CSSValue[]): CSSFilter | null => {
    switch (name) {
        case 'drop-shadow':
            return parseDropShadow(context, values);
        case 'blur':
            return parseBlur(values);
        case 'brightness':
            return parseAmountFilter(FilterType.BRIGHTNESS, values);
        case 'contrast':
            return parseAmountFilter(FilterType.CONTRAST, values);
        case 'grayscale':
            return parseAmountFilter(FilterType.GRAYSCALE, values);
        case 'invert':
            return parseAmountFilter(FilterType.INVERT, values);
        case 'opacity':
            return parseAmountFilter(FilterType.OPACITY, values);
        case 'saturate':
            return parseAmountFilter(FilterType.SATURATE, values);
        case 'sepia':
            return parseAmountFilter(FilterType.SEPIA, values);
        case 'hue-rotate':
            return parseHueRotate(values);
        default:
            return null;
    }
};

const parseDropShadow = (context: Context, values: CSSValue[]): DropShadowFilter | null => {
    const shadow: DropShadowFilter = {
        type: FilterType.DROP_SHADOW,
        color: COLORS.TRANSPARENT,
        offsetX: ZERO_LENGTH,
        offsetY: ZERO_LENGTH,
        blur: ZERO_LENGTH,
    };

    let lengthCount = 0;
    for (let i = 0; i < values.length; i++) {
        const token = values[i];
        if (token.type === TokenType.WHITESPACE_TOKEN) {
            continue;
        }
        if (isLength(token)) {
            if (lengthCount === 0) {
                shadow.offsetX = token;
            } else if (lengthCount === 1) {
                shadow.offsetY = token;
            } else if (lengthCount === 2) {
                shadow.blur = token;
            }
            lengthCount++;
        } else {
            shadow.color = colorParse.parse(context, token);
        }
    }

    // At minimum, offsetX and offsetY are required
    if (lengthCount < 2) {
        return null;
    }

    return shadow;
};

const parseBlur = (values: CSSValue[]): BlurFilter => {
    const result: BlurFilter = {
        type: FilterType.BLUR,
        radius: ZERO_LENGTH,
    };

    for (let i = 0; i < values.length; i++) {
        const token = values[i];
        if (isLength(token)) {
            result.radius = token;
            break;
        }
    }

    return result;
};

const parseAmountFilter = (type: AmountFilter['type'], values: CSSValue[]): AmountFilter => {
    const result: AmountFilter = {
        type,
        amount: 1, // default is 1 (100%) for most filters
    };

    for (let i = 0; i < values.length; i++) {
        const token = values[i];
        if (token.type === TokenType.PERCENTAGE_TOKEN) {
            result.amount = token.number / 100;
            break;
        }
        if (token.type === TokenType.NUMBER_TOKEN) {
            result.amount = token.number;
            break;
        }
    }

    return result;
};

const parseHueRotate = (values: CSSValue[]): HueRotateFilter => {
    const result: HueRotateFilter = {
        type: FilterType.HUE_ROTATE,
        angle: 0,
    };

    for (let i = 0; i < values.length; i++) {
        const token = values[i];
        if (token.type === TokenType.DIMENSION_TOKEN) {
            switch (token.unit) {
                case 'deg':
                    result.angle = token.number;
                    break;
                case 'rad':
                    result.angle = (token.number * 180) / Math.PI;
                    break;
                case 'grad':
                    result.angle = (token.number * 180) / 200;
                    break;
                case 'turn':
                    result.angle = token.number * 360;
                    break;
            }
            break;
        }
        if (token.type === TokenType.NUMBER_TOKEN && token.number === 0) {
            result.angle = 0;
            break;
        }
    }

    return result;
};
