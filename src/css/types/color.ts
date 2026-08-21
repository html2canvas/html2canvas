import { Context } from '../../core/context';
import { ITypeDescriptor } from '../ITypeDescriptor';
import { CSSValue, nonFunctionArgSeparator, Parser } from '../syntax/parser';
import { TokenType } from '../syntax/tokenizer';

import Color from './colorjs-minimal';

export type PackedColor = number;

// Keep backward-compatible type alias
export type { PackedColor as Color };

export const color: ITypeDescriptor<PackedColor> = {
    name: 'color',
    parse: (context: Context, value: CSSValue): PackedColor => {
        if (value.type === TokenType.FUNCTION) {
            const colorFunction = SUPPORTED_COLOR_FUNCTIONS[value.name];
            if (typeof colorFunction === 'undefined') {
                // Fallback to colorjs.io for unsupported color functions
                const raw = reconstructFunctionString(value);
                return parseWithColorJs(raw);
            }
            return colorFunction(context, value.values);
        }

        if (value.type === TokenType.HASH_TOKEN) {
            if (value.value.length === 3) {
                const r = value.value.substring(0, 1);
                const g = value.value.substring(1, 2);
                const b = value.value.substring(2, 3);
                return pack(parseInt(r + r, 16), parseInt(g + g, 16), parseInt(b + b, 16), 1);
            }

            if (value.value.length === 4) {
                const r = value.value.substring(0, 1);
                const g = value.value.substring(1, 2);
                const b = value.value.substring(2, 3);
                const a = value.value.substring(3, 4);
                return pack(parseInt(r + r, 16), parseInt(g + g, 16), parseInt(b + b, 16), parseInt(a + a, 16) / 255);
            }

            if (value.value.length === 6) {
                const r = value.value.substring(0, 2);
                const g = value.value.substring(2, 4);
                const b = value.value.substring(4, 6);
                return pack(parseInt(r, 16), parseInt(g, 16), parseInt(b, 16), 1);
            }

            if (value.value.length === 8) {
                const r = value.value.substring(0, 2);
                const g = value.value.substring(2, 4);
                const b = value.value.substring(4, 6);
                const a = value.value.substring(6, 8);
                return pack(parseInt(r, 16), parseInt(g, 16), parseInt(b, 16), parseInt(a, 16) / 255);
            }
        }

        if (value.type === TokenType.IDENT_TOKEN) {
            const namedColor = COLORS[value.value.toUpperCase()];
            if (typeof namedColor !== 'undefined') {
                return namedColor;
            }
        }

        return COLORS.TRANSPARENT;
    },
};

export const isTransparent = (color: PackedColor): boolean => (0xff & color) === 0;

export const asString = (color: PackedColor): string => {
    const alpha = 0xff & color;
    const blue = 0xff & (color >> 8);
    const green = 0xff & (color >> 16);
    const red = 0xff & (color >> 24);
    return alpha < 255 ? `rgba(${red},${green},${blue},${alpha / 255})` : `rgb(${red},${green},${blue})`;
};

export const pack = (r: number, g: number, b: number, a: number): PackedColor =>
    ((r << 24) | (g << 16) | (b << 8) | (Math.round(a * 255) << 0)) >>> 0;

/**
 * Converts a colorjs.io Color instance to a packed uint32 color.
 * The color is gamut-mapped to sRGB before packing.
 */
const colorJsToPacked = (c: Color): PackedColor => {
    const srgb = c.toGamut({ space: 'srgb' }).to('srgb');
    const r = Math.round(Math.min(255, Math.max(0, (srgb.coords[0] || 0) * 255)));
    const g = Math.round(Math.min(255, Math.max(0, (srgb.coords[1] || 0) * 255)));
    const b = Math.round(Math.min(255, Math.max(0, (srgb.coords[2] || 0) * 255)));
    const a = srgb.alpha;
    return pack(r, g, b, a);
};

/**
 * Parses a raw CSS color string using colorjs.io and returns the packed uint32 representation.
 */
const parseWithColorJs = (raw: string): PackedColor => {
    try {
        const c = new Color(raw);
        return colorJsToPacked(c);
    } catch {
        return COLORS.TRANSPARENT;
    }
};

/**
 * Reconstructs a CSS function string from parsed CSSValue tokens.
 * Used to pass unsupported color functions to colorjs.io.
 */
const reconstructFunctionString = (value: CSSValue): string => {
    if (value.type === TokenType.FUNCTION) {
        const args = value.values.map((v: CSSValue) => reconstructToken(v)).join('');
        return `${value.name}(${args})`;
    }
    return reconstructToken(value);
};

const reconstructToken = (token: CSSValue): string => {
    switch (token.type) {
        case TokenType.NUMBER_TOKEN:
            return String(token.number);
        case TokenType.PERCENTAGE_TOKEN:
            return `${token.number}%`;
        case TokenType.DIMENSION_TOKEN:
            return `${token.number}${token.unit}`;
        case TokenType.HASH_TOKEN:
            return `#${token.value}`;
        case TokenType.IDENT_TOKEN:
        case TokenType.STRING_TOKEN:
        case TokenType.DELIM_TOKEN:
            return token.value;
        case TokenType.WHITESPACE_TOKEN:
            return ' ';
        case TokenType.COMMA_TOKEN:
            return ', ';
        case TokenType.FUNCTION:
            return reconstructFunctionString(token);
        default:
            return '';
    }
};

const getTokenColorValue = (token: CSSValue, i: number): number => {
    if (token.type === TokenType.NUMBER_TOKEN) {
        return token.number;
    }

    if (token.type === TokenType.PERCENTAGE_TOKEN) {
        const max = i === 3 ? 1 : 255;
        return i === 3 ? (token.number / 100) * max : Math.round((token.number / 100) * max);
    }

    return 0;
};

const rgb = (_context: Context, args: CSSValue[]): number => {
    const tokens = args.filter(nonFunctionArgSeparator);

    if (tokens.length === 3) {
        const [r, g, b] = tokens.map(getTokenColorValue);
        return pack(r, g, b, 1);
    }

    if (tokens.length === 4) {
        const [r, g, b, a] = tokens.map(getTokenColorValue);
        return pack(r, g, b, a);
    }

    return 0;
};

/**
 * Delegates color function parsing to colorjs.io by reconstructing the CSS string from tokens.
 * Preserves all tokens (including '/' delimiters for alpha) to maintain correct CSS syntax.
 */
const delegateToColorJs = (functionName: string, args: CSSValue[]): number => {
    const raw = functionName + '(' + args.map((t: CSSValue) => reconstructToken(t)).join('') + ')';
    return parseWithColorJs(raw);
};

const hsl = (_context: Context, args: CSSValue[]): number => delegateToColorJs('hsl', args);
const hwb = (_context: Context, args: CSSValue[]): number => delegateToColorJs('hwb', args);
const lch = (_context: Context, args: CSSValue[]): number => delegateToColorJs('lch', args);
const lab = (_context: Context, args: CSSValue[]): number => delegateToColorJs('lab', args);
const oklch = (_context: Context, args: CSSValue[]): number => delegateToColorJs('oklch', args);
const oklab = (_context: Context, args: CSSValue[]): number => delegateToColorJs('oklab', args);
const colorFunction = (_context: Context, args: CSSValue[]): number => delegateToColorJs('color', args);

/**
 * Parses `color-mix(in <space>, <color1> <pct1>%, <color2> <pct2>%)`.
 * colorjs.io doesn't support parsing color-mix as a string, so we parse the arguments
 * manually and use Color.mix().
 */
const colorMix = (_context: Context, args: CSSValue[]): number => {
    // color-mix args structure: in <space> , <color1-tokens> <pct>% , <color2-tokens> <pct>%
    // After tokenization, commas are COMMA_TOKEN. We split by commas.
    const groups: CSSValue[][] = [[]];
    for (const token of args) {
        if (token.type === TokenType.COMMA_TOKEN) {
            groups.push([]);
        } else {
            groups[groups.length - 1].push(token);
        }
    }

    // We expect 3 groups: [in <space>], [<color1> <pct>%], [<color2> <pct>%?]
    if (groups.length < 3) {
        return COLORS.TRANSPARENT;
    }

    try {
        // Parse interpolation space from first group (skip "in" keyword)
        const spaceTokens = groups[0].filter((t: CSSValue) => t.type !== TokenType.WHITESPACE_TOKEN);
        const inKeyword = spaceTokens[0];
        if (!inKeyword || inKeyword.type !== TokenType.IDENT_TOKEN || inKeyword.value !== 'in') {
            return COLORS.TRANSPARENT;
        }
        const spaceToken = spaceTokens[1];
        if (!spaceToken || spaceToken.type !== TokenType.IDENT_TOKEN) {
            return COLORS.TRANSPARENT;
        }
        const space = spaceToken.value;

        // Parse color1 + percentage from second group
        const { colorStr: color1Str, percentage: pct1 } = extractColorAndPercentage(groups[1]);
        // Parse color2 + percentage from third group
        const { colorStr: color2Str, percentage: pct2 } = extractColorAndPercentage(groups[2]);

        const p1 = pct1 !== null ? pct1 / 100 : pct2 !== null ? 1 - pct2 / 100 : 0.5;

        const c1 = new Color(color1Str);
        const c2 = new Color(color2Str);
        const mixed = Color.mix(c1, c2, 1 - p1, { space });
        return colorJsToPacked(mixed);
    } catch {
        return COLORS.TRANSPARENT;
    }
};

/**
 * Extracts a color string and an optional trailing percentage from a group of tokens.
 * e.g. tokens for "hsl(120 100% 50%) 25%" → { colorStr: "hsl(120 100% 50%)", percentage: 25 }
 */
const extractColorAndPercentage = (tokens: CSSValue[]): { colorStr: string; percentage: number | null } => {
    // Check if the last non-whitespace token is a percentage
    const nonWs = tokens.filter((t: CSSValue) => t.type !== TokenType.WHITESPACE_TOKEN);
    const lastToken = nonWs[nonWs.length - 1];
    let percentage: number | null = null;
    let colorTokens = tokens;

    if (lastToken && lastToken.type === TokenType.PERCENTAGE_TOKEN) {
        percentage = lastToken.number;
        // Remove the trailing percentage (and any whitespace before it) from the color tokens
        const lastIndex = tokens.lastIndexOf(lastToken);
        colorTokens = tokens.slice(0, lastIndex);
    }

    const colorStr = colorTokens
        .map((t: CSSValue) => reconstructToken(t))
        .join('')
        .trim();
    return { colorStr, percentage };
};

const SUPPORTED_COLOR_FUNCTIONS: {
    [key: string]: (context: Context, args: CSSValue[]) => number;
} = {
    hsl: hsl,
    hsla: hsl,
    rgb: rgb,
    rgba: rgb,
    lch: lch,
    lab: lab,
    oklch: oklch,
    oklab: oklab,
    hwb: hwb,
    color: colorFunction,
    'color-mix': colorMix,
};

export const parseColor = (context: Context, value: string): PackedColor =>
    color.parse(context, Parser.create(value).parseComponentValue());

export const COLORS: { [key: string]: PackedColor } = {
    ALICEBLUE: 0xf0f8ffff,
    ANTIQUEWHITE: 0xfaebd7ff,
    AQUA: 0x00ffffff,
    AQUAMARINE: 0x7fffd4ff,
    AZURE: 0xf0ffffff,
    BEIGE: 0xf5f5dcff,
    BISQUE: 0xffe4c4ff,
    BLACK: 0x000000ff,
    BLANCHEDALMOND: 0xffebcdff,
    BLUE: 0x0000ffff,
    BLUEVIOLET: 0x8a2be2ff,
    BROWN: 0xa52a2aff,
    BURLYWOOD: 0xdeb887ff,
    CADETBLUE: 0x5f9ea0ff,
    CHARTREUSE: 0x7fff00ff,
    CHOCOLATE: 0xd2691eff,
    CORAL: 0xff7f50ff,
    CORNFLOWERBLUE: 0x6495edff,
    CORNSILK: 0xfff8dcff,
    CRIMSON: 0xdc143cff,
    CYAN: 0x00ffffff,
    DARKBLUE: 0x00008bff,
    DARKCYAN: 0x008b8bff,
    DARKGOLDENROD: 0xb886bbff,
    DARKGRAY: 0xa9a9a9ff,
    DARKGREEN: 0x006400ff,
    DARKGREY: 0xa9a9a9ff,
    DARKKHAKI: 0xbdb76bff,
    DARKMAGENTA: 0x8b008bff,
    DARKOLIVEGREEN: 0x556b2fff,
    DARKORANGE: 0xff8c00ff,
    DARKORCHID: 0x9932ccff,
    DARKRED: 0x8b0000ff,
    DARKSALMON: 0xe9967aff,
    DARKSEAGREEN: 0x8fbc8fff,
    DARKSLATEBLUE: 0x483d8bff,
    DARKSLATEGRAY: 0x2f4f4fff,
    DARKSLATEGREY: 0x2f4f4fff,
    DARKTURQUOISE: 0x00ced1ff,
    DARKVIOLET: 0x9400d3ff,
    DEEPPINK: 0xff1493ff,
    DEEPSKYBLUE: 0x00bfffff,
    DIMGRAY: 0x696969ff,
    DIMGREY: 0x696969ff,
    DODGERBLUE: 0x1e90ffff,
    FIREBRICK: 0xb22222ff,
    FLORALWHITE: 0xfffaf0ff,
    FORESTGREEN: 0x228b22ff,
    FUCHSIA: 0xff00ffff,
    GAINSBORO: 0xdcdcdcff,
    GHOSTWHITE: 0xf8f8ffff,
    GOLD: 0xffd700ff,
    GOLDENROD: 0xdaa520ff,
    GRAY: 0x808080ff,
    GREEN: 0x008000ff,
    GREENYELLOW: 0xadff2fff,
    GREY: 0x808080ff,
    HONEYDEW: 0xf0fff0ff,
    HOTPINK: 0xff69b4ff,
    INDIANRED: 0xcd5c5cff,
    INDIGO: 0x4b0082ff,
    IVORY: 0xfffff0ff,
    KHAKI: 0xf0e68cff,
    LAVENDER: 0xe6e6faff,
    LAVENDERBLUSH: 0xfff0f5ff,
    LAWNGREEN: 0x7cfc00ff,
    LEMONCHIFFON: 0xfffacdff,
    LIGHTBLUE: 0xadd8e6ff,
    LIGHTCORAL: 0xf08080ff,
    LIGHTCYAN: 0xe0ffffff,
    LIGHTGOLDENRODYELLOW: 0xfafad2ff,
    LIGHTGRAY: 0xd3d3d3ff,
    LIGHTGREEN: 0x90ee90ff,
    LIGHTGREY: 0xd3d3d3ff,
    LIGHTPINK: 0xffb6c1ff,
    LIGHTSALMON: 0xffa07aff,
    LIGHTSEAGREEN: 0x20b2aaff,
    LIGHTSKYBLUE: 0x87cefaff,
    LIGHTSLATEGRAY: 0x778899ff,
    LIGHTSLATEGREY: 0x778899ff,
    LIGHTSTEELBLUE: 0xb0c4deff,
    LIGHTYELLOW: 0xffffe0ff,
    LIME: 0x00ff00ff,
    LIMEGREEN: 0x32cd32ff,
    LINEN: 0xfaf0e6ff,
    MAGENTA: 0xff00ffff,
    MAROON: 0x800000ff,
    MEDIUMAQUAMARINE: 0x66cdaaff,
    MEDIUMBLUE: 0x0000cdff,
    MEDIUMORCHID: 0xba55d3ff,
    MEDIUMPURPLE: 0x9370dbff,
    MEDIUMSEAGREEN: 0x3cb371ff,
    MEDIUMSLATEBLUE: 0x7b68eeff,
    MEDIUMSPRINGGREEN: 0x00fa9aff,
    MEDIUMTURQUOISE: 0x48d1ccff,
    MEDIUMVIOLETRED: 0xc71585ff,
    MIDNIGHTBLUE: 0x191970ff,
    MINTCREAM: 0xf5fffaff,
    MISTYROSE: 0xffe4e1ff,
    MOCCASIN: 0xffe4b5ff,
    NAVAJOWHITE: 0xffdeadff,
    NAVY: 0x000080ff,
    OLDLACE: 0xfdf5e6ff,
    OLIVE: 0x808000ff,
    OLIVEDRAB: 0x6b8e23ff,
    ORANGE: 0xffa500ff,
    ORANGERED: 0xff4500ff,
    ORCHID: 0xda70d6ff,
    PALEGOLDENROD: 0xeee8aaff,
    PALEGREEN: 0x98fb98ff,
    PALETURQUOISE: 0xafeeeeff,
    PALEVIOLETRED: 0xdb7093ff,
    PAPAYAWHIP: 0xffefd5ff,
    PEACHPUFF: 0xffdab9ff,
    PERU: 0xcd853fff,
    PINK: 0xffc0cbff,
    PLUM: 0xdda0ddff,
    POWDERBLUE: 0xb0e0e6ff,
    PURPLE: 0x800080ff,
    REBECCAPURPLE: 0x663399ff,
    RED: 0xff0000ff,
    ROSYBROWN: 0xbc8f8fff,
    ROYALBLUE: 0x4169e1ff,
    SADDLEBROWN: 0x8b4513ff,
    SALMON: 0xfa8072ff,
    SANDYBROWN: 0xf4a460ff,
    SEAGREEN: 0x2e8b57ff,
    SEASHELL: 0xfff5eeff,
    SIENNA: 0xa0522dff,
    SILVER: 0xc0c0c0ff,
    SKYBLUE: 0x87ceebff,
    SLATEBLUE: 0x6a5acdff,
    SLATEGRAY: 0x708090ff,
    SLATEGREY: 0x708090ff,
    SNOW: 0xfffafaff,
    SPRINGGREEN: 0x00ff7fff,
    STEELBLUE: 0x4682b4ff,
    TAN: 0xd2b48cff,
    TEAL: 0x008080ff,
    THISTLE: 0xd8bfd8ff,
    TOMATO: 0xff6347ff,
    TRANSPARENT: 0x00000000,
    TURQUOISE: 0x40e0d0ff,
    VIOLET: 0xee82eeff,
    WHEAT: 0xf5deb3ff,
    WHITE: 0xffffffff,
    WHITESMOKE: 0xf5f5f5ff,
    YELLOW: 0xffff00ff,
    YELLOWGREEN: 0x9acd32ff,
};
