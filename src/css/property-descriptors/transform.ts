import { Context } from '../../core/context';
import { IPropertyValueDescriptor, PropertyDescriptorParsingType } from '../IPropertyDescriptor';
import { CSSValue } from '../syntax/parser';
import { DimensionToken, NumberValueToken, TokenType } from '../syntax/tokenizer';
import { isAngle } from '../types/angle';

export type Matrix = [number, number, number, number, number, number];
export type Transform = Matrix | null;

export const transform: IPropertyValueDescriptor<Transform> = {
    name: 'transform',
    initialValue: 'none',
    prefix: true,
    type: PropertyDescriptorParsingType.VALUE,
    parse: (_context: Context, token: CSSValue) => {
        if (token.type === TokenType.IDENT_TOKEN && token.value === 'none') {
            return null;
        }

        if (token.type === TokenType.FUNCTION) {
            const transformFunction = SUPPORTED_TRANSFORM_FUNCTIONS[token.name];
            if (typeof transformFunction === 'undefined') {
                throw new Error(`Attempting to parse an unsupported transform function "${token.name}"`);
            }
            return transformFunction(token.values);
        }

        return null;
    },
};

// ─── helpers ────────────────────────────────────────────────────────────────

/** Extract numeric values from a token list (NUMBER_TOKEN only). */
const numbers = (args: CSSValue[]): number[] =>
    args.filter(arg => arg.type === TokenType.NUMBER_TOKEN).map((arg: NumberValueToken) => arg.number);

/** Parse a length token to pixels. Browsers always resolve lengths to px before
 *  exposing them via getComputedStyle, so the unit is virtually always 'px'.
 *  Falls back to 0 for unrecognised units. */
const lengthToPx = (token: CSSValue): number => {
    if (token.type === TokenType.DIMENSION_TOKEN) {
        return (token as DimensionToken).number;
    }
    if (token.type === TokenType.NUMBER_TOKEN) {
        return (token as NumberValueToken).number;
    }
    return 0;
};

/** Parse an angle token (deg / grad / rad / turn) and return radians. */
const angleToRad = (token: CSSValue): number => {
    if (token.type === TokenType.DIMENSION_TOKEN) {
        const dim = token as DimensionToken;
        switch (dim.unit) {
            case 'deg':
                return (Math.PI * dim.number) / 180;
            case 'grad':
                return (Math.PI / 200) * dim.number;
            case 'rad':
                return dim.number;
            case 'turn':
                return Math.PI * 2 * dim.number;
        }
    }
    // <number> 0 is a valid angle
    if (token.type === TokenType.NUMBER_TOKEN) {
        return (token as NumberValueToken).number;
    }
    return 0;
};

/** Find the first length/dimension token in a list. */
const firstLength = (args: CSSValue[]): number => {
    const t = args.find(a => a.type === TokenType.DIMENSION_TOKEN || a.type === TokenType.NUMBER_TOKEN);
    return t ? lengthToPx(t) : 0;
};

/** Find all length/dimension tokens in a list. */
const allLengths = (args: CSSValue[]): number[] =>
    args.filter(a => a.type === TokenType.DIMENSION_TOKEN || a.type === TokenType.NUMBER_TOKEN).map(lengthToPx);

/** Find the first angle token in a list. */
const firstAngle = (args: CSSValue[]): number => {
    const t = args.find(a => isAngle(a) || a.type === TokenType.NUMBER_TOKEN);
    return t ? angleToRad(t) : 0;
};

/** Find all angle tokens in a list. */
const allAngles = (args: CSSValue[]): number[] =>
    args.filter(a => isAngle(a) || a.type === TokenType.NUMBER_TOKEN).map(angleToRad);

// ─── CSS Transform Level 1 ──────────────────────────────────────────────────

/** matrix(a, b, c, d, e, f) */
const matrix = (args: CSSValue[]): Transform => {
    const values = numbers(args);
    return values.length === 6 ? (values as Matrix) : null;
};

/** translate(tx, ty?) — ty defaults to 0 */
const translate = (args: CSSValue[]): Transform => {
    const values = allLengths(args);
    const tx = values[0] ?? 0;
    const ty = values[1] ?? 0;
    return [1, 0, 0, 1, tx, ty];
};

/** translateX(tx) */
const translateX = (args: CSSValue[]): Transform => [1, 0, 0, 1, firstLength(args), 0];

/** translateY(ty) */
const translateY = (args: CSSValue[]): Transform => [1, 0, 0, 1, 0, firstLength(args)];

/** scale(sx, sy?) — sy defaults to sx */
const scale = (args: CSSValue[]): Transform => {
    const values = numbers(args);
    const sx = values[0] ?? 1;
    const sy = values[1] ?? sx;
    return [sx, 0, 0, sy, 0, 0];
};

/** scaleX(sx) */
const scaleX = (args: CSSValue[]): Transform => {
    const sx = numbers(args)[0] ?? 1;
    return [sx, 0, 0, 1, 0, 0];
};

/** scaleY(sy) */
const scaleY = (args: CSSValue[]): Transform => {
    const sy = numbers(args)[0] ?? 1;
    return [1, 0, 0, sy, 0, 0];
};

/** rotate(angle) */
const rotate = (args: CSSValue[]): Transform => {
    const a = firstAngle(args);
    const c = Math.cos(a);
    // Math.sin(0) returns -0 on some engines; normalize to avoid -0 in output
    const s = a === 0 ? 0 : Math.sin(a);
    return [c, s, -s, c, 0, 0];
};

/** skew(ax, ay?) — ay defaults to 0 */
const skew = (args: CSSValue[]): Transform => {
    const angles = allAngles(args);
    const ax = angles[0] ?? 0;
    const ay = angles[1] ?? 0;
    return [1, Math.tan(ay), Math.tan(ax), 1, 0, 0];
};

/** skewX(angle) */
const skewX = (args: CSSValue[]): Transform => [1, 0, Math.tan(firstAngle(args)), 1, 0, 0];

/** skewY(angle) */
const skewY = (args: CSSValue[]): Transform => [1, Math.tan(firstAngle(args)), 0, 1, 0, 0];

// ─── CSS Transform Level 2 (3D — projected to 2D) ───────────────────────────

/** matrix3d(…16 values…) — extract the 2D-relevant components */
const matrix3d = (args: CSSValue[]): Transform => {
    const values = numbers(args);
    const [a1, b1, , , a2, b2, , , , , , , a4, b4] = values;
    return values.length === 16 ? [a1, b1, a2, b2, a4, b4] : null;
};

/** translate3d(tx, ty, tz) — tz is ignored (no depth in 2D canvas) */
const translate3d = (args: CSSValue[]): Transform => {
    const values = allLengths(args);
    return [1, 0, 0, 1, values[0] ?? 0, values[1] ?? 0];
};

/** translateZ(tz) — no-op in 2D */
const translateZ = (_args: CSSValue[]): Transform => [1, 0, 0, 1, 0, 0];

/** scale3d(sx, sy, sz) — sz is ignored */
const scale3d = (args: CSSValue[]): Transform => {
    const values = numbers(args);
    return [values[0] ?? 1, 0, 0, values[1] ?? 1, 0, 0];
};

/** scaleZ(sz) — no-op in 2D */
const scaleZ = (_args: CSSValue[]): Transform => [1, 0, 0, 1, 0, 0];

/** rotateZ(angle) — identical to rotate() */
const rotateZ = (args: CSSValue[]): Transform => rotate(args);

/** rotateX(angle) — no visible effect when projected to 2D */
const rotateX = (_args: CSSValue[]): Transform => [1, 0, 0, 1, 0, 0];

/** rotateY(angle) — no visible effect when projected to 2D */
const rotateY = (_args: CSSValue[]): Transform => [1, 0, 0, 1, 0, 0];

/** rotate3d(x, y, z, angle)
 *  Only the common case x=0,y=0,z≠0 maps cleanly to a 2D rotation.
 *  All other axis combinations produce a partial projection and are treated
 *  as identity. */
const rotate3d = (args: CSSValue[]): Transform => {
    const nums = numbers(args);
    // The angle is always a DIMENSION_TOKEN (deg/rad/…); NUMBER_TOKEN values
    // are the x/y/z components — so we must NOT use allAngles() which would
    // also pick up the plain NUMBER_TOKENs.
    const angleDim = args.find(a => isAngle(a));
    const a = angleDim ? angleToRad(angleDim) : 0;
    const [x, y, z] = nums;
    // z-axis rotation maps directly to 2D rotate
    if (x === 0 && y === 0 && z !== 0) {
        const c = Math.cos(a);
        const s = Math.sin(a);
        return [c, s, -s, c, 0, 0];
    }
    return [1, 0, 0, 1, 0, 0];
};

/** perspective(d) — no-op in 2D canvas rendering */
const perspective = (_args: CSSValue[]): Transform => [1, 0, 0, 1, 0, 0];

// ─── function map ────────────────────────────────────────────────────────────

const SUPPORTED_TRANSFORM_FUNCTIONS: {
    [key: string]: (args: CSSValue[]) => Transform;
} = {
    // Level 1
    matrix,
    translate,
    translateX,
    translateY,
    scale,
    scaleX,
    scaleY,
    rotate,
    skew,
    skewX,
    skewY,
    // Level 2
    matrix3d,
    translate3d,
    translateZ,
    scale3d,
    scaleZ,
    rotateZ,
    rotateX,
    rotateY,
    rotate3d,
    perspective,
};
