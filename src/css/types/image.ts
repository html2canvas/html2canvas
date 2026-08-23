import { Context } from '../../core/context';
import { ITypeDescriptor } from '../ITypeDescriptor';
import { CSSValue } from '../syntax/parser';
import { TokenType } from '../syntax/tokenizer';
import { Color } from './color';
import { prefixLinearGradient } from './functions/-prefix-linear-gradient';
import { prefixRadialGradient } from './functions/-prefix-radial-gradient';
import { webkitGradient } from './functions/-webkit-gradient';
import { conicGradient } from './functions/conic-gradient';
import { linearGradient } from './functions/linear-gradient';
import { radialGradient } from './functions/radial-gradient';
import { repeatingConicGradient } from './functions/repeating-conic-gradient';
import { repeatingLinearGradient } from './functions/repeating-linear-gradient';
import { repeatingRadialGradient } from './functions/repeating-radial-gradient';
import { LengthPercentage } from './length-percentage';

export const enum CSSImageType {
    URL,
    LINEAR_GRADIENT,
    RADIAL_GRADIENT,
    REPEATING_LINEAR_GRADIENT,
    REPEATING_RADIAL_GRADIENT,
    CONIC_GRADIENT,
    REPEATING_CONIC_GRADIENT,
}

export const isLinearGradient = (background: ICSSImage): background is CSSLinearGradientImage => {
    return background.type === CSSImageType.LINEAR_GRADIENT;
};

export const isRadialGradient = (background: ICSSImage): background is CSSRadialGradientImage => {
    return background.type === CSSImageType.RADIAL_GRADIENT;
};

export const isRepeatingLinearGradient = (background: ICSSImage): background is CSSRepeatingLinearGradientImage => {
    return background.type === CSSImageType.REPEATING_LINEAR_GRADIENT;
};

export const isRepeatingRadialGradient = (background: ICSSImage): background is CSSRepeatingRadialGradientImage => {
    return background.type === CSSImageType.REPEATING_RADIAL_GRADIENT;
};

export const isConicGradient = (background: ICSSImage): background is CSSConicGradientImage => {
    return background.type === CSSImageType.CONIC_GRADIENT;
};

export const isRepeatingConicGradient = (background: ICSSImage): background is CSSRepeatingConicGradientImage => {
    return background.type === CSSImageType.REPEATING_CONIC_GRADIENT;
};

export interface UnprocessedGradientColorStop {
    color: Color;
    stop: LengthPercentage | null;
}

export interface GradientColorStop {
    color: Color;
    stop: number;
}

export interface ICSSImage {
    type: CSSImageType;
}

export interface CSSURLImage extends ICSSImage {
    url: string;
    type: CSSImageType.URL;
}

// interface ICSSGeneratedImage extends ICSSImage {}

export type GradientCorner = [LengthPercentage, LengthPercentage];

interface ICSSGradientImage extends ICSSImage {
    stops: UnprocessedGradientColorStop[];
}

export interface CSSLinearGradientImage extends ICSSGradientImage {
    angle: number | GradientCorner;
    type: CSSImageType.LINEAR_GRADIENT;
}

export interface CSSRepeatingLinearGradientImage extends ICSSGradientImage {
    angle: number | GradientCorner;
    type: CSSImageType.REPEATING_LINEAR_GRADIENT;
}

export const enum CSSRadialShape {
    CIRCLE,
    ELLIPSE,
}

export const enum CSSRadialExtent {
    CLOSEST_SIDE,
    FARTHEST_SIDE,
    CLOSEST_CORNER,
    FARTHEST_CORNER,
}

export type CSSRadialSize = CSSRadialExtent | LengthPercentage[];

export interface CSSRadialGradientImage extends ICSSGradientImage {
    type: CSSImageType.RADIAL_GRADIENT;
    shape: CSSRadialShape;
    size: CSSRadialSize;
    position: LengthPercentage[];
}

export interface CSSRepeatingRadialGradientImage extends ICSSGradientImage {
    type: CSSImageType.REPEATING_RADIAL_GRADIENT;
    shape: CSSRadialShape;
    size: CSSRadialSize;
    position: LengthPercentage[];
}

export interface CSSConicGradientImage extends ICSSGradientImage {
    type: CSSImageType.CONIC_GRADIENT;
    /** Start angle in radians (from CSS `from <angle>`, default 0) */
    startAngle: number;
    position: LengthPercentage[];
}

export interface CSSRepeatingConicGradientImage extends ICSSGradientImage {
    type: CSSImageType.REPEATING_CONIC_GRADIENT;
    /** Start angle in radians (from CSS `from <angle>`, default 0) */
    startAngle: number;
    position: LengthPercentage[];
}

export const image: ITypeDescriptor<ICSSImage> = {
    name: 'image',
    parse: (context: Context, value: CSSValue): ICSSImage => {
        if (value.type === TokenType.URL_TOKEN) {
            const image: CSSURLImage = { url: value.value, type: CSSImageType.URL };
            context.cache.addImage(value.value);
            return image;
        }

        if (value.type === TokenType.FUNCTION) {
            const imageFunction = SUPPORTED_IMAGE_FUNCTIONS[value.name];
            if (typeof imageFunction === 'undefined') {
                throw new Error(`Attempting to parse an unsupported image function "${value.name}"`);
            }
            return imageFunction(context, value.values);
        }

        throw new Error(`Unsupported image type ${value.type}`);
    },
};

export function isSupportedImage(value: CSSValue): boolean {
    return (
        !(value.type === TokenType.IDENT_TOKEN && value.value === 'none') &&
        (value.type !== TokenType.FUNCTION || !!SUPPORTED_IMAGE_FUNCTIONS[value.name])
    );
}

const SUPPORTED_IMAGE_FUNCTIONS: Record<string, (context: Context, args: CSSValue[]) => ICSSImage> = {
    'linear-gradient': linearGradient,
    '-moz-linear-gradient': prefixLinearGradient,
    '-webkit-linear-gradient': prefixLinearGradient,
    'radial-gradient': radialGradient,
    '-moz-radial-gradient': prefixRadialGradient,
    '-webkit-radial-gradient': prefixRadialGradient,
    '-webkit-gradient': webkitGradient,
    'repeating-linear-gradient': repeatingLinearGradient,
    'repeating-radial-gradient': repeatingRadialGradient,
    'conic-gradient': conicGradient,
    'repeating-conic-gradient': repeatingConicGradient,
};
