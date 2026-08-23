import { Context } from '../../core/context';
import { IPropertyListDescriptor, PropertyDescriptorParsingType } from '../IPropertyDescriptor';
import { CSSValue, isIdentWithValue, CSSFunction } from '../syntax/parser';
import { TokenType } from '../syntax/tokenizer';
import { isLengthPercentage, LengthPercentage, FIFTY_PERCENT, ZERO_LENGTH } from '../types/length-percentage';

// ---------------------------------------------------------------------------
// Public types
// ---------------------------------------------------------------------------

export const enum ClipPathType {
    NONE = 0,
    INSET = 1,
    CIRCLE = 2,
    ELLIPSE = 3,
    POLYGON = 4,
    PATH = 5,
}

export interface NoneClipPath {
    type: ClipPathType.NONE;
}

/**
 * inset( <top> <right> <bottom> <left> [ round <border-radius> ] )
 * All four sides default to 0 when omitted per CSS spec short-hand expansion.
 * The optional `round` keyword introduces per-corner radii stored as horizontal/vertical pairs.
 */
export interface InsetClipPath {
    type: ClipPathType.INSET;
    top: LengthPercentage;
    right: LengthPercentage;
    bottom: LengthPercentage;
    left: LengthPercentage;
    /** One entry per corner: [TL, TR, BR, BL], each a [horizontal, vertical] pair. */
    radii: [LengthPercentage, LengthPercentage][];
}

/**
 * circle( [ <radius> ]? [ at <cx> <cy> ]? )
 * radius defaults to `closest-side` (stored as 50% here for simplicity).
 */
export interface CircleClipPath {
    type: ClipPathType.CIRCLE;
    radius: LengthPercentage;
    cx: LengthPercentage;
    cy: LengthPercentage;
}

/**
 * ellipse( [ <rx> <ry> ]? [ at <cx> <cy> ]? )
 */
export interface EllipseClipPath {
    type: ClipPathType.ELLIPSE;
    rx: LengthPercentage;
    ry: LengthPercentage;
    cx: LengthPercentage;
    cy: LengthPercentage;
}

/**
 * polygon( [ <fill-rule>, ]? <x1> <y1> [, <x2> <y2>]* )
 */
export interface PolygonClipPath {
    type: ClipPathType.POLYGON;
    points: [LengthPercentage, LengthPercentage][];
    fillRule: 'nonzero' | 'evenodd';
}

/**
 * path( <string> ) — SVG path data string.
 */
export interface PathClipPath {
    type: ClipPathType.PATH;
    d: string;
}

export type CSSClipPath =
    | NoneClipPath
    | InsetClipPath
    | CircleClipPath
    | EllipseClipPath
    | PolygonClipPath
    | PathClipPath;

export const NONE_CLIP_PATH: NoneClipPath = { type: ClipPathType.NONE };

// ---------------------------------------------------------------------------
// Property descriptor
// ---------------------------------------------------------------------------

export const clipPath: IPropertyListDescriptor<CSSClipPath> = {
    name: 'clip-path',
    initialValue: 'none',
    prefix: false,
    type: PropertyDescriptorParsingType.LIST,
    parse: (_context: Context, tokens: CSSValue[]): CSSClipPath => {
        // Filter whitespace for easier iteration
        const filtered = tokens.filter(t => t.type !== TokenType.WHITESPACE_TOKEN);

        if (filtered.length === 0) {
            return NONE_CLIP_PATH;
        }

        // none
        if (filtered.length === 1 && isIdentWithValue(filtered[0], 'none')) {
            return NONE_CLIP_PATH;
        }

        // Expect a CSS function token (inset, circle, ellipse, polygon, path)
        const token = filtered[0];
        if (token.type === TokenType.FUNCTION) {
            return parseClipPathFunction(token as CSSFunction);
        }

        return NONE_CLIP_PATH;
    },
};

// ---------------------------------------------------------------------------
// Function parsers
// ---------------------------------------------------------------------------

const parseClipPathFunction = (fn: CSSFunction): CSSClipPath => {
    const name = fn.name.toLowerCase();
    switch (name) {
        case 'inset':
            return parseInset(fn.values);
        case 'circle':
            return parseCircle(fn.values);
        case 'ellipse':
            return parseEllipse(fn.values);
        case 'polygon':
            return parsePolygon(fn.values);
        case 'path':
            return parsePath(fn.values);
        default:
            return NONE_CLIP_PATH;
    }
};

// ---------------------------------------------------------------------------
// inset()
// ---------------------------------------------------------------------------

const parseInset = (values: CSSValue[]): InsetClipPath | NoneClipPath => {
    const tokens = values.filter(t => t.type !== TokenType.WHITESPACE_TOKEN);

    const lengths: LengthPercentage[] = [];
    let roundIndex = -1;

    for (let i = 0; i < tokens.length; i++) {
        const t = tokens[i];
        if (isLengthPercentage(t)) {
            lengths.push(t);
        } else if (t.type === TokenType.IDENT_TOKEN && (t as { value: string }).value.toLowerCase() === 'round') {
            roundIndex = i + 1; // tokens after this index are the border-radius values
            break;
        }
    }

    // CSS short-hand expansion: 1→all, 2→TB/RL, 3→T/RL/B, 4→T/R/B/L
    const [top, right, bottom, left] = expandSides(lengths);

    // Parse optional border-radius after `round`
    const radii = roundIndex >= 0 ? parseInsetRadii(tokens.slice(roundIndex)) : [];

    return { type: ClipPathType.INSET, top, right, bottom, left, radii };
};

/**
 * Expand 1–4 length values to [top, right, bottom, left] following CSS shorthand rules.
 */
const expandSides = (values: LengthPercentage[]): [LengthPercentage, LengthPercentage, LengthPercentage, LengthPercentage] => {
    const z = ZERO_LENGTH;
    switch (values.length) {
        case 0: return [z, z, z, z];
        case 1: return [values[0], values[0], values[0], values[0]];
        case 2: return [values[0], values[1], values[0], values[1]];
        case 3: return [values[0], values[1], values[2], values[1]];
        default: return [values[0], values[1], values[2], values[3]];
    }
};

/**
 * Parse border-radius specification after `round` keyword.
 * Syntax: <length-percentage>{1,4} [ / <length-percentage>{1,4} ]?
 * Returns an array of 4 [h, v] pairs in [TL, TR, BR, BL] order.
 */
const parseInsetRadii = (tokens: CSSValue[]): [LengthPercentage, LengthPercentage][] => {
    // Split on '/' delimiter
    const slashIndex = tokens.findIndex(
        t => t.type === TokenType.DELIM_TOKEN && (t as { value: string }).value === '/',
    );

    const hTokens = tokens
        .slice(0, slashIndex < 0 ? tokens.length : slashIndex)
        .filter(isLengthPercentage);
    const vTokens = slashIndex >= 0
        ? tokens.slice(slashIndex + 1).filter(isLengthPercentage)
        : [];

    const hSides = expandSides(hTokens);
    const vSides = vTokens.length > 0 ? expandSides(vTokens) : hSides;

    return [
        [hSides[0], vSides[0]],
        [hSides[1], vSides[1]],
        [hSides[2], vSides[2]],
        [hSides[3], vSides[3]],
    ];
};

// ---------------------------------------------------------------------------
// circle()
// ---------------------------------------------------------------------------

const parseCircle = (values: CSSValue[]): CircleClipPath => {
    const tokens = values.filter(t => t.type !== TokenType.WHITESPACE_TOKEN);

    // Default: r=50%, center=50% 50%
    let radius: LengthPercentage = FIFTY_PERCENT;
    let cx: LengthPercentage = FIFTY_PERCENT;
    let cy: LengthPercentage = FIFTY_PERCENT;

    // Find `at` keyword position
    const atIndex = tokens.findIndex(
        t => t.type === TokenType.IDENT_TOKEN && (t as { value: string }).value.toLowerCase() === 'at',
    );

    const radiusTokens = atIndex >= 0 ? tokens.slice(0, atIndex) : tokens;
    const positionTokens = atIndex >= 0 ? tokens.slice(atIndex + 1) : [];

    // Parse radius (may be a keyword like `closest-side`/`farthest-side` — treat as 50%)
    const rToken = radiusTokens.find(isLengthPercentage);
    if (rToken) {
        radius = rToken;
    }

    // Parse center position
    const posLengths = positionTokens.filter(isLengthPercentage);
    if (posLengths.length >= 1) cx = posLengths[0];
    if (posLengths.length >= 2) cy = posLengths[1];

    return { type: ClipPathType.CIRCLE, radius, cx, cy };
};

// ---------------------------------------------------------------------------
// ellipse()
// ---------------------------------------------------------------------------

const parseEllipse = (values: CSSValue[]): EllipseClipPath => {
    const tokens = values.filter(t => t.type !== TokenType.WHITESPACE_TOKEN);

    let rx: LengthPercentage = FIFTY_PERCENT;
    let ry: LengthPercentage = FIFTY_PERCENT;
    let cx: LengthPercentage = FIFTY_PERCENT;
    let cy: LengthPercentage = FIFTY_PERCENT;

    const atIndex = tokens.findIndex(
        t => t.type === TokenType.IDENT_TOKEN && (t as { value: string }).value.toLowerCase() === 'at',
    );

    const sizeTokens = atIndex >= 0 ? tokens.slice(0, atIndex) : tokens;
    const positionTokens = atIndex >= 0 ? tokens.slice(atIndex + 1) : [];

    const sizeLengths = sizeTokens.filter(isLengthPercentage);
    if (sizeLengths.length >= 1) rx = sizeLengths[0];
    if (sizeLengths.length >= 2) ry = sizeLengths[1];

    const posLengths = positionTokens.filter(isLengthPercentage);
    if (posLengths.length >= 1) cx = posLengths[0];
    if (posLengths.length >= 2) cy = posLengths[1];

    return { type: ClipPathType.ELLIPSE, rx, ry, cx, cy };
};

// ---------------------------------------------------------------------------
// polygon()
// ---------------------------------------------------------------------------

const parsePolygon = (values: CSSValue[]): PolygonClipPath => {
    let fillRule: 'nonzero' | 'evenodd' = 'nonzero';
    const points: [LengthPercentage, LengthPercentage][] = [];

    // Split the flat token list into comma-separated groups
    const groups: CSSValue[][] = [[]];
    for (const token of values) {
        if (token.type === TokenType.COMMA_TOKEN) {
            groups.push([]);
        } else {
            groups[groups.length - 1].push(token);
        }
    }

    for (const group of groups) {
        const nonWs = group.filter(t => t.type !== TokenType.WHITESPACE_TOKEN);
        if (nonWs.length === 0) continue;

        // First group may start with fill-rule ident
        if (nonWs.length === 1 && nonWs[0].type === TokenType.IDENT_TOKEN) {
            const val = (nonWs[0] as { value: string }).value.toLowerCase();
            if (val === 'evenodd') {
                fillRule = 'evenodd';
                continue;
            } else if (val === 'nonzero') {
                fillRule = 'nonzero';
                continue;
            }
        }

        const lengths = nonWs.filter(isLengthPercentage);
        if (lengths.length >= 2) {
            points.push([lengths[0], lengths[1]]);
        }
    }

    return { type: ClipPathType.POLYGON, points, fillRule };
};

// ---------------------------------------------------------------------------
// path()
// ---------------------------------------------------------------------------

const parsePath = (values: CSSValue[]): PathClipPath | NoneClipPath => {
    // path() contains a string token with the SVG path data
    for (const token of values) {
        if (token.type === TokenType.STRING_TOKEN) {
            const d = (token as { value: string }).value;
            return { type: ClipPathType.PATH, d };
        }
    }
    return NONE_CLIP_PATH;
};
