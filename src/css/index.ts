import { contains } from '../core/bitwise';
import { Context } from '../core/context';
import { CSSPropertyDescriptor, PropertyDescriptorParsingType } from './IPropertyDescriptor';
import {
    BACKGROUND_BLEND_MODE,
    backgroundBlendMode as backgroundBlendModeDescriptor,
} from './property-descriptors/background-blend-mode';
import { backgroundClip } from './property-descriptors/background-clip';
import { backgroundColor } from './property-descriptors/background-color';
import { backgroundImage } from './property-descriptors/background-image';
import { backgroundOrigin } from './property-descriptors/background-origin';
import { backgroundPosition } from './property-descriptors/background-position';
import { backgroundRepeat } from './property-descriptors/background-repeat';
import { backgroundSize } from './property-descriptors/background-size';
import {
    borderBottomColor,
    borderLeftColor,
    borderRightColor,
    borderTopColor,
} from './property-descriptors/border-color';
import {
    borderBottomLeftRadius,
    borderBottomRightRadius,
    borderTopLeftRadius,
    borderTopRightRadius,
} from './property-descriptors/border-radius';
import {
    borderBottomStyle,
    borderLeftStyle,
    borderRightStyle,
    borderTopStyle,
} from './property-descriptors/border-style';
import {
    borderBottomWidth,
    borderLeftWidth,
    borderRightWidth,
    borderTopWidth,
} from './property-descriptors/border-width';
import { boxShadow } from './property-descriptors/box-shadow';
import { clip as clipDescriptor } from './property-descriptors/clip';
import { clipPath as clipPathDescriptor } from './property-descriptors/clip-path';
import { color } from './property-descriptors/color';
import { content } from './property-descriptors/content';
import { counterIncrement } from './property-descriptors/counter-increment';
import { counterReset } from './property-descriptors/counter-reset';
import { direction } from './property-descriptors/direction';
import { DISPLAY, display } from './property-descriptors/display';
import { duration } from './property-descriptors/duration';
import { filter as filterDescriptor } from './property-descriptors/filter';
import { FLOAT, float } from './property-descriptors/float';
import { fontFamily } from './property-descriptors/font-family';
import { fontSize } from './property-descriptors/font-size';
import { fontStyle } from './property-descriptors/font-style';
import { fontVariant } from './property-descriptors/font-variant';
import { fontWeight } from './property-descriptors/font-weight';
import { letterSpacing } from './property-descriptors/letter-spacing';
import { lineBreak } from './property-descriptors/line-break';
import { lineHeight } from './property-descriptors/line-height';
import { listStyleImage } from './property-descriptors/list-style-image';
import { listStylePosition } from './property-descriptors/list-style-position';
import { listStyleType } from './property-descriptors/list-style-type';
import { marginBottom, marginLeft, marginRight, marginTop } from './property-descriptors/margin';
import { MIX_BLEND_MODE, mixBlendMode as mixBlendModeDescriptor } from './property-descriptors/mix-blend-mode';
import { objectFit } from './property-descriptors/object-fit';
import { opacity } from './property-descriptors/opacity';
import { OVERFLOW, overflow } from './property-descriptors/overflow';
import { overflowWrap } from './property-descriptors/overflow-wrap';
import { paddingBottom, paddingLeft, paddingRight, paddingTop } from './property-descriptors/padding';
import { paintOrder } from './property-descriptors/paint-order';
import { POSITION, position } from './property-descriptors/position';
import { quotes } from './property-descriptors/quotes';
import { textAlign } from './property-descriptors/text-align';
import { textDecorationColor } from './property-descriptors/text-decoration-color';
import { textDecorationLine } from './property-descriptors/text-decoration-line';
import { TEXT_DECORATION_STYLE, textDecorationStyle } from './property-descriptors/text-decoration-style';
import { TextDecorationThickness, textDecorationThickness } from './property-descriptors/text-decoration-thickness';
import { textShadow } from './property-descriptors/text-shadow';
import { textTransform } from './property-descriptors/text-transform';
import { transform } from './property-descriptors/transform';
import { transformOrigin } from './property-descriptors/transform-origin';
import { VISIBILITY, visibility } from './property-descriptors/visibility';
import { webkitTextStrokeColor } from './property-descriptors/webkit-text-stroke-color';
import { webkitTextStrokeWidth } from './property-descriptors/webkit-text-stroke-width';
import { wordBreak } from './property-descriptors/word-break';
import { writingMode } from './property-descriptors/writing-mode';
import { zIndex } from './property-descriptors/z-index';
import { CSSValue, Parser, isIdentToken } from './syntax/parser';
import { Tokenizer } from './syntax/tokenizer';
import { angle } from './types/angle';
import { Color, color as colorType, isTransparent } from './types/color';
import { image } from './types/image';
import { isLength } from './types/length';
import { LengthPercentage, ZERO_LENGTH, isLengthPercentage } from './types/length-percentage';
import { time } from './types/time';

export class CSSParsedDeclaration {
    animationDuration: ReturnType<typeof duration.parse>;
    backgroundClip: ReturnType<typeof backgroundClip.parse>;
    backgroundBlendMode: BACKGROUND_BLEND_MODE[];
    backgroundColor: Color;
    backgroundImage: ReturnType<typeof backgroundImage.parse>;
    backgroundOrigin: ReturnType<typeof backgroundOrigin.parse>;
    backgroundPosition: ReturnType<typeof backgroundPosition.parse>;
    backgroundRepeat: ReturnType<typeof backgroundRepeat.parse>;
    backgroundSize: ReturnType<typeof backgroundSize.parse>;
    borderTopColor: Color;
    borderRightColor: Color;
    borderBottomColor: Color;
    borderLeftColor: Color;
    borderTopLeftRadius: ReturnType<typeof borderTopLeftRadius.parse>;
    borderTopRightRadius: ReturnType<typeof borderTopRightRadius.parse>;
    borderBottomRightRadius: ReturnType<typeof borderBottomRightRadius.parse>;
    borderBottomLeftRadius: ReturnType<typeof borderBottomLeftRadius.parse>;
    borderTopStyle: ReturnType<typeof borderTopStyle.parse>;
    borderRightStyle: ReturnType<typeof borderRightStyle.parse>;
    borderBottomStyle: ReturnType<typeof borderBottomStyle.parse>;
    borderLeftStyle: ReturnType<typeof borderLeftStyle.parse>;
    borderTopWidth: ReturnType<typeof borderTopWidth.parse>;
    borderRightWidth: ReturnType<typeof borderRightWidth.parse>;
    borderBottomWidth: ReturnType<typeof borderBottomWidth.parse>;
    borderLeftWidth: ReturnType<typeof borderLeftWidth.parse>;
    boxShadow: ReturnType<typeof boxShadow.parse>;
    clip: ReturnType<typeof clipDescriptor.parse>;
    clipPath: ReturnType<typeof clipPathDescriptor.parse>;
    color: Color;
    direction: ReturnType<typeof direction.parse>;
    display: ReturnType<typeof display.parse>;
    filter: ReturnType<typeof filterDescriptor.parse>;
    float: ReturnType<typeof float.parse>;
    fontFamily: ReturnType<typeof fontFamily.parse>;
    fontSize: LengthPercentage;
    fontStyle: ReturnType<typeof fontStyle.parse>;
    fontVariant: ReturnType<typeof fontVariant.parse>;
    fontWeight: ReturnType<typeof fontWeight.parse>;
    letterSpacing: ReturnType<typeof letterSpacing.parse>;
    lineBreak: ReturnType<typeof lineBreak.parse>;
    lineHeight: CSSValue;
    listStyleImage: ReturnType<typeof listStyleImage.parse>;
    listStylePosition: ReturnType<typeof listStylePosition.parse>;
    listStyleType: ReturnType<typeof listStyleType.parse>;
    marginTop: CSSValue;
    marginRight: CSSValue;
    marginBottom: CSSValue;
    marginLeft: CSSValue;
    objectFit: ReturnType<typeof objectFit.parse>;
    opacity: ReturnType<typeof opacity.parse>;
    mixBlendMode: MIX_BLEND_MODE;
    overflowX: OVERFLOW;
    overflowY: OVERFLOW;
    overflowWrap: ReturnType<typeof overflowWrap.parse>;
    paddingTop: LengthPercentage;
    paddingRight: LengthPercentage;
    paddingBottom: LengthPercentage;
    paddingLeft: LengthPercentage;
    paintOrder: ReturnType<typeof paintOrder.parse>;
    position: ReturnType<typeof position.parse>;
    textAlign: ReturnType<typeof textAlign.parse>;
    textDecorationColor: Color;
    textDecorationLine: ReturnType<typeof textDecorationLine.parse>;
    textDecorationStyle: TEXT_DECORATION_STYLE;
    textDecorationThickness: TextDecorationThickness;
    textShadow: ReturnType<typeof textShadow.parse>;
    textTransform: ReturnType<typeof textTransform.parse>;
    transform: ReturnType<typeof transform.parse>;
    transformOrigin: ReturnType<typeof transformOrigin.parse>;
    visibility: ReturnType<typeof visibility.parse>;
    webkitTextStrokeColor: Color;
    webkitTextStrokeWidth: ReturnType<typeof webkitTextStrokeWidth.parse>;
    wordBreak: ReturnType<typeof wordBreak.parse>;
    writingMode: ReturnType<typeof writingMode.parse>;
    zIndex: ReturnType<typeof zIndex.parse>;

    constructor(context: Context, declaration: CSSStyleDeclaration) {
        this.animationDuration = parse(context, duration, declaration.animationDuration);
        this.backgroundClip = parse(context, backgroundClip, declaration.backgroundClip);
        this.backgroundBlendMode = parse(context, backgroundBlendModeDescriptor, declaration.backgroundBlendMode);
        this.backgroundColor = parse(context, backgroundColor, declaration.backgroundColor);
        this.backgroundImage = parse(context, backgroundImage, declaration.backgroundImage);
        this.backgroundOrigin = parse(context, backgroundOrigin, declaration.backgroundOrigin);
        this.backgroundPosition = parse(context, backgroundPosition, declaration.backgroundPosition);
        this.backgroundRepeat = parse(context, backgroundRepeat, declaration.backgroundRepeat);
        this.backgroundSize = parse(context, backgroundSize, declaration.backgroundSize);
        this.borderTopColor = parse(context, borderTopColor, declaration.borderTopColor);
        this.borderRightColor = parse(context, borderRightColor, declaration.borderRightColor);
        this.borderBottomColor = parse(context, borderBottomColor, declaration.borderBottomColor);
        this.borderLeftColor = parse(context, borderLeftColor, declaration.borderLeftColor);
        this.borderTopLeftRadius = parse(context, borderTopLeftRadius, declaration.borderTopLeftRadius);
        this.borderTopRightRadius = parse(context, borderTopRightRadius, declaration.borderTopRightRadius);
        this.borderBottomRightRadius = parse(context, borderBottomRightRadius, declaration.borderBottomRightRadius);
        this.borderBottomLeftRadius = parse(context, borderBottomLeftRadius, declaration.borderBottomLeftRadius);
        this.borderTopStyle = parse(context, borderTopStyle, declaration.borderTopStyle);
        this.borderRightStyle = parse(context, borderRightStyle, declaration.borderRightStyle);
        this.borderBottomStyle = parse(context, borderBottomStyle, declaration.borderBottomStyle);
        this.borderLeftStyle = parse(context, borderLeftStyle, declaration.borderLeftStyle);
        this.borderTopWidth = parse(context, borderTopWidth, declaration.borderTopWidth);
        this.borderRightWidth = parse(context, borderRightWidth, declaration.borderRightWidth);
        this.borderBottomWidth = parse(context, borderBottomWidth, declaration.borderBottomWidth);
        this.borderLeftWidth = parse(context, borderLeftWidth, declaration.borderLeftWidth);
        this.boxShadow = parse(context, boxShadow, declaration.boxShadow);
        this.clip = parse(context, clipDescriptor, declaration.clip);
        this.clipPath = parse(context, clipPathDescriptor, declaration.clipPath);
        this.color = parse(context, color, declaration.color);
        this.direction = parse(context, direction, declaration.direction);
        this.display = parse(context, display, declaration.display);
        this.float = parse(context, float, declaration.cssFloat);
        this.filter = parse(context, filterDescriptor, declaration.filter);
        this.fontFamily = parse(context, fontFamily, declaration.fontFamily);
        this.fontSize = parse(context, fontSize, declaration.fontSize);
        this.fontStyle = parse(context, fontStyle, declaration.fontStyle);
        this.fontVariant = parse(context, fontVariant, declaration.fontVariant);
        this.fontWeight = parse(context, fontWeight, declaration.fontWeight);
        this.letterSpacing = parse(context, letterSpacing, declaration.letterSpacing);
        this.lineBreak = parse(context, lineBreak, declaration.lineBreak);
        this.lineHeight = parse(context, lineHeight, declaration.lineHeight);
        this.listStyleImage = parse(context, listStyleImage, declaration.listStyleImage);
        this.listStylePosition = parse(context, listStylePosition, declaration.listStylePosition);
        this.listStyleType = parse(context, listStyleType, declaration.listStyleType);
        this.marginTop = parse(context, marginTop, declaration.marginTop);
        this.marginRight = parse(context, marginRight, declaration.marginRight);
        this.marginBottom = parse(context, marginBottom, declaration.marginBottom);
        this.marginLeft = parse(context, marginLeft, declaration.marginLeft);
        this.objectFit = parse(context, objectFit, declaration.objectFit);
        this.opacity = parse(context, opacity, declaration.opacity);
        this.mixBlendMode = parse(context, mixBlendModeDescriptor, declaration.mixBlendMode);
        const overflowTuple = parse(context, overflow, declaration.overflow);
        this.overflowX = overflowTuple[0];
        this.overflowY = overflowTuple[overflowTuple.length > 1 ? 1 : 0];
        this.overflowWrap = parse(context, overflowWrap, declaration.overflowWrap);
        this.paddingTop = parse(context, paddingTop, declaration.paddingTop);
        this.paddingRight = parse(context, paddingRight, declaration.paddingRight);
        this.paddingBottom = parse(context, paddingBottom, declaration.paddingBottom);
        this.paddingLeft = parse(context, paddingLeft, declaration.paddingLeft);
        this.paintOrder = parse(context, paintOrder, declaration.paintOrder);
        this.position = parse(context, position, declaration.position);
        this.textAlign = parse(context, textAlign, declaration.textAlign);
        this.textDecorationColor = parse(
            context,
            textDecorationColor,
            declaration.textDecorationColor ?? declaration.color,
        );
        this.textDecorationLine = parse(
            context,
            textDecorationLine,
            declaration.textDecorationLine ?? declaration.textDecoration,
        );
        this.textDecorationStyle = parse(context, textDecorationStyle, declaration.textDecorationStyle);
        this.textDecorationThickness = parse(context, textDecorationThickness, declaration.textDecorationThickness);
        this.textShadow = parse(context, textShadow, declaration.textShadow);
        this.textTransform = parse(context, textTransform, declaration.textTransform);
        this.transform = parse(context, transform, declaration.transform);
        this.transformOrigin = parse(context, transformOrigin, declaration.transformOrigin);
        this.visibility = parse(context, visibility, declaration.visibility);
        this.webkitTextStrokeColor = parse(context, webkitTextStrokeColor, declaration.webkitTextStrokeColor);
        this.webkitTextStrokeWidth = parse(context, webkitTextStrokeWidth, declaration.webkitTextStrokeWidth);
        this.wordBreak = parse(context, wordBreak, declaration.wordBreak);
        this.writingMode = parse(context, writingMode, declaration.writingMode);
        this.zIndex = parse(context, zIndex, declaration.zIndex);
    }

    isVisible(): boolean {
        return this.display > 0 && this.opacity > 0 && this.visibility === VISIBILITY.VISIBLE;
    }

    isTransparent(): boolean {
        return isTransparent(this.backgroundColor);
    }

    isTransformed(): boolean {
        return this.transform !== null;
    }

    isFiltered(): boolean {
        return this.filter.length > 0;
    }

    isPositioned(): boolean {
        return this.position !== POSITION.STATIC;
    }

    isPositionedWithZIndex(): boolean {
        return this.isPositioned() && !this.zIndex.auto;
    }

    isFloating(): boolean {
        return this.float !== FLOAT.NONE;
    }

    isInlineLevel(): boolean {
        return (
            contains(this.display, DISPLAY.INLINE) ||
            contains(this.display, DISPLAY.INLINE_BLOCK) ||
            contains(this.display, DISPLAY.INLINE_FLEX) ||
            contains(this.display, DISPLAY.INLINE_GRID) ||
            contains(this.display, DISPLAY.INLINE_LIST_ITEM) ||
            contains(this.display, DISPLAY.INLINE_TABLE)
        );
    }
}

export class CSSParsedPseudoDeclaration {
    content: ReturnType<typeof content.parse>;
    quotes: ReturnType<typeof quotes.parse>;

    constructor(context: Context, declaration: CSSStyleDeclaration) {
        this.content = parse(context, content, declaration.content);
        this.quotes = parse(context, quotes, declaration.quotes);
    }
}

export class CSSParsedCounterDeclaration {
    counterIncrement: ReturnType<typeof counterIncrement.parse>;
    counterReset: ReturnType<typeof counterReset.parse>;

    constructor(context: Context, declaration: CSSStyleDeclaration) {
        this.counterIncrement = parse(context, counterIncrement, declaration.counterIncrement);
        this.counterReset = parse(context, counterReset, declaration.counterReset);
    }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const parse = (context: Context, descriptor: CSSPropertyDescriptor<any>, style?: string | null) => {
    const value = style !== null && typeof style !== 'undefined' ? style.toString() : descriptor.initialValue;

    // Fast-path for IDENT_VALUE: skip tokenization when the value is a simple identifier
    if (descriptor.type === PropertyDescriptorParsingType.IDENT_VALUE) {
        // Simple ident values contain only letters, hyphens, and don't need full parsing
        if (/^[a-zA-Z-]+$/.test(value)) {
            return descriptor.parse(context, value);
        }
    }

    const tokenizer = new Tokenizer();
    tokenizer.write(value);
    const parser = new Parser(tokenizer.read());
    switch (descriptor.type) {
        case PropertyDescriptorParsingType.IDENT_VALUE:
            const token = parser.parseComponentValue();
            return descriptor.parse(context, isIdentToken(token) ? token.value : descriptor.initialValue);
        case PropertyDescriptorParsingType.VALUE:
            return descriptor.parse(context, parser.parseComponentValue());
        case PropertyDescriptorParsingType.LIST:
            return descriptor.parse(context, parser.parseComponentValues());
        case PropertyDescriptorParsingType.TOKEN_VALUE:
            return parser.parseComponentValue();
        case PropertyDescriptorParsingType.TYPE_VALUE:
            switch (descriptor.format) {
                case 'angle':
                    return angle.parse(context, parser.parseComponentValue());
                case 'color':
                    return colorType.parse(context, parser.parseComponentValue());
                case 'image':
                    return image.parse(context, parser.parseComponentValue());
                case 'length':
                    const length = parser.parseComponentValue();
                    return isLength(length) ? length : ZERO_LENGTH;
                case 'length-percentage':
                    const lpValue = parser.parseComponentValue();
                    return isLengthPercentage(lpValue) ? lpValue : ZERO_LENGTH;
                case 'time':
                    return time.parse(context, parser.parseComponentValue());
            }
    }
};
