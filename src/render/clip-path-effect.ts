/**
 * clip-path-effect.ts
 *
 * Converts a parsed CSSClipPath value into the Path[] arrays (Vector / BezierCurve)
 * expected by ClipEffect / CanvasRenderer.path().
 *
 * For the `path()` function the SVG path string is returned separately so the
 * renderer can apply it via Path2D (which the canvas API accepts natively).
 */

import { Bounds } from '../css/layout/bounds';
import {
    ClipPathType,
    CSSClipPath,
    InsetClipPath,
    CircleClipPath,
    EllipseClipPath,
    PolygonClipPath,
    PathClipPath,
} from '../css/property-descriptors/clip-path';
import { getAbsoluteValue } from '../css/types/length-percentage';
import { BezierCurve } from './bezier-curve';
import { Path } from './path';
import { Vector } from './vector';

// ---------------------------------------------------------------------------
// Public result types
// ---------------------------------------------------------------------------

export interface ClipPathVectorResult {
    kind: 'path';
    paths: Path[];
    fillRule?: CanvasFillRule;
}

export interface ClipPathPath2DResult {
    kind: 'path2d';
    path2d: Path2D;
}

export type ClipPathResult = ClipPathVectorResult | ClipPathPath2DResult;

// ---------------------------------------------------------------------------
// Main entry point
// ---------------------------------------------------------------------------

/**
 * Build a clip shape from a parsed CSSClipPath and the element's bounding box.
 *
 * @param clipPath  - the parsed clip-path value
 * @param bounds    - the element's border-box in page coordinates
 * @returns  a ClipPathResult, or null when the clip-path is `none` / unsupported
 */
export const buildClipPath = (clipPath: CSSClipPath, bounds: Bounds): ClipPathResult | null => {
    switch (clipPath.type) {
        case ClipPathType.NONE:
            return null;
        case ClipPathType.INSET:
            return { kind: 'path', paths: buildInsetPath(clipPath, bounds) };
        case ClipPathType.CIRCLE:
            return { kind: 'path', paths: buildCirclePath(clipPath, bounds) };
        case ClipPathType.ELLIPSE:
            return { kind: 'path', paths: buildEllipsePath(clipPath, bounds) };
        case ClipPathType.POLYGON:
            return {
                kind: 'path',
                paths: buildPolygonPath(clipPath, bounds),
                fillRule: clipPath.fillRule as CanvasFillRule,
            };
        case ClipPathType.PATH:
            return buildPath2D(clipPath, bounds);
    }
};

// ---------------------------------------------------------------------------
// Bézier circle/ellipse approximation helpers
// ---------------------------------------------------------------------------

/** κ constant for cubic Bézier approximation of a quarter circle arc. */
const KAPPA = 4 * ((Math.sqrt(2) - 1) / 3);

/**
 * Approximate a full ellipse with 4 cubic Bézier curves in clockwise order.
 * The returned Path[] contains 4 BezierCurve segments (one per quadrant).
 *
 * @param cx  - centre x (page coordinates)
 * @param cy  - centre y (page coordinates)
 * @param rx  - horizontal radius
 * @param ry  - vertical radius
 */
const buildEllipsePaths = (cx: number, cy: number, rx: number, ry: number): Path[] => {
    const ox = rx * KAPPA; // control-point offset horizontal
    const oy = ry * KAPPA; // control-point offset vertical

    // 4 quadrant Bézier curves drawn clockwise from top-centre:
    // Q1: top   → right
    // Q2: right → bottom
    // Q3: bottom→ left
    // Q4: left  → top
    return [
        new BezierCurve(
            new Vector(cx, cy - ry),         // start: top centre
            new Vector(cx + ox, cy - ry),    // ctrl1
            new Vector(cx + rx, cy - oy),    // ctrl2
            new Vector(cx + rx, cy),         // end: right centre
        ),
        new BezierCurve(
            new Vector(cx + rx, cy),         // start: right centre
            new Vector(cx + rx, cy + oy),    // ctrl1
            new Vector(cx + ox, cy + ry),    // ctrl2
            new Vector(cx, cy + ry),         // end: bottom centre
        ),
        new BezierCurve(
            new Vector(cx, cy + ry),         // start: bottom centre
            new Vector(cx - ox, cy + ry),    // ctrl1
            new Vector(cx - rx, cy + oy),    // ctrl2
            new Vector(cx - rx, cy),         // end: left centre
        ),
        new BezierCurve(
            new Vector(cx - rx, cy),         // start: left centre
            new Vector(cx - rx, cy - oy),    // ctrl1
            new Vector(cx - ox, cy - ry),    // ctrl2
            new Vector(cx, cy - ry),         // end: top centre
        ),
    ];
};

// ---------------------------------------------------------------------------
// inset()
// ---------------------------------------------------------------------------

/**
 * Build a rectangular clip path (with optional rounded corners) for inset().
 *
 * Each corner is represented as a BezierCurve if radii > 0, or a Vector otherwise.
 * The order is [TL, TR, BR, BL] matching calculateBorderBoxPath().
 */
const buildInsetPath = (clip: InsetClipPath, bounds: Bounds): Path[] => {
    const { left: bLeft, top: bTop, width: bWidth, height: bHeight } = bounds;

    const topVal    = getAbsoluteValue(clip.top,    bHeight);
    const rightVal  = getAbsoluteValue(clip.right,  bWidth);
    const bottomVal = getAbsoluteValue(clip.bottom, bHeight);
    const leftVal   = getAbsoluteValue(clip.left,   bWidth);

    // Inset rectangle corners
    const x0 = bLeft  + leftVal;
    const y0 = bTop   + topVal;
    const x1 = bLeft  + bWidth  - rightVal;
    const y1 = bTop   + bHeight - bottomVal;
    const w  = x1 - x0;
    const h  = y1 - y0;

    if (w <= 0 || h <= 0) {
        // Collapsed — return a degenerate path that clips everything
        const mid = new Vector(x0, y0);
        return [mid, mid, mid, mid];
    }

    if (clip.radii.length === 0) {
        // Sharp rectangle
        return [
            new Vector(x0, y0),
            new Vector(x1, y0),
            new Vector(x1, y1),
            new Vector(x0, y1),
        ];
    }

    // Resolve radii — 4 entries [TL, TR, BR, BL] of [h, v] pairs
    // If fewer than 4 entries were parsed, fall back to zero.
    const getR = (index: number): [number, number] => {
        if (index < clip.radii.length) {
            return [
                getAbsoluteValue(clip.radii[index][0], w),
                getAbsoluteValue(clip.radii[index][1], h),
            ];
        }
        return [0, 0];
    };

    let [tlH, tlV] = getR(0);
    let [trH, trV] = getR(1);
    let [brH, brV] = getR(2);
    let [blH, blV] = getR(3);

    // Clamp overlapping radii (CSS spec §4.3)
    const factors = [
        (tlH + trH) / w,
        (blH + brH) / w,
        (tlV + blV) / h,
        (trV + brV) / h,
    ];
    const maxFactor = Math.max(...factors);
    if (maxFactor > 1) {
        tlH /= maxFactor; tlV /= maxFactor;
        trH /= maxFactor; trV /= maxFactor;
        brH /= maxFactor; brV /= maxFactor;
        blH /= maxFactor; blV /= maxFactor;
    }

    // Build corner Bézier curves using the same getCurvePoints logic as BoundCurves
    const kappa = KAPPA;

    // TOP-LEFT corner: starts at (x0, y0+tlV), ends at (x0+tlH, y0)
    const topLeft: Path = (tlH > 0 || tlV > 0)
        ? new BezierCurve(
            new Vector(x0,       y0 + tlV),
            new Vector(x0,       y0 + tlV - tlV * kappa),
            new Vector(x0 + tlH - tlH * kappa, y0),
            new Vector(x0 + tlH, y0),
        )
        : new Vector(x0, y0);

    // TOP-RIGHT corner: starts at (x1-trH, y0), ends at (x1, y0+trV)
    const topRight: Path = (trH > 0 || trV > 0)
        ? new BezierCurve(
            new Vector(x1 - trH, y0),
            new Vector(x1 - trH + trH * kappa, y0),
            new Vector(x1,       y0 + trV - trV * kappa),
            new Vector(x1,       y0 + trV),
        )
        : new Vector(x1, y0);

    // BOTTOM-RIGHT corner: starts at (x1, y1-brV), ends at (x1-brH, y1)
    const bottomRight: Path = (brH > 0 || brV > 0)
        ? new BezierCurve(
            new Vector(x1,       y1 - brV),
            new Vector(x1,       y1 - brV + brV * kappa),
            new Vector(x1 - brH + brH * kappa, y1),
            new Vector(x1 - brH, y1),
        )
        : new Vector(x1, y1);

    // BOTTOM-LEFT corner: starts at (x0+blH, y1), ends at (x0, y1-blV)
    const bottomLeft: Path = (blH > 0 || blV > 0)
        ? new BezierCurve(
            new Vector(x0 + blH, y1),
            new Vector(x0 + blH - blH * kappa, y1),
            new Vector(x0,       y1 - blV + blV * kappa),
            new Vector(x0,       y1 - blV),
        )
        : new Vector(x0, y1);

    return [topLeft, topRight, bottomRight, bottomLeft];
};

// ---------------------------------------------------------------------------
// circle()
// ---------------------------------------------------------------------------

const buildCirclePath = (clip: CircleClipPath, bounds: Bounds): Path[] => {
    const { left: bLeft, top: bTop, width: bWidth, height: bHeight } = bounds;

    const cx = bLeft + getAbsoluteValue(clip.cx, bWidth);
    const cy = bTop  + getAbsoluteValue(clip.cy, bHeight);

    // For `closest-side` / `farthest-side` keywords we stored 50% as a fallback.
    // Resolve the radius relative to the smaller dimension so circles stay circular.
    const r = getAbsoluteValue(clip.radius, Math.min(bWidth, bHeight) / 2 * 2);

    if (r <= 0) {
        const mid = new Vector(cx, cy);
        return [mid, mid, mid, mid];
    }

    return buildEllipsePaths(cx, cy, r, r);
};

// ---------------------------------------------------------------------------
// ellipse()
// ---------------------------------------------------------------------------

const buildEllipsePath = (clip: EllipseClipPath, bounds: Bounds): Path[] => {
    const { left: bLeft, top: bTop, width: bWidth, height: bHeight } = bounds;

    const cx = bLeft + getAbsoluteValue(clip.cx, bWidth);
    const cy = bTop  + getAbsoluteValue(clip.cy, bHeight);
    const rx = getAbsoluteValue(clip.rx, bWidth);
    const ry = getAbsoluteValue(clip.ry, bHeight);

    if (rx <= 0 || ry <= 0) {
        const mid = new Vector(cx, cy);
        return [mid, mid, mid, mid];
    }

    return buildEllipsePaths(cx, cy, rx, ry);
};

// ---------------------------------------------------------------------------
// polygon()
// ---------------------------------------------------------------------------

const buildPolygonPath = (clip: PolygonClipPath, bounds: Bounds): Path[] => {
    const { left: bLeft, top: bTop, width: bWidth, height: bHeight } = bounds;

    return clip.points.map(
        ([xToken, yToken]) =>
            new Vector(
                bLeft + getAbsoluteValue(xToken, bWidth),
                bTop  + getAbsoluteValue(yToken, bHeight),
            ),
    );
};

// ---------------------------------------------------------------------------
// path()  — uses Path2D so the SVG path string is rendered natively
// ---------------------------------------------------------------------------

const buildPath2D = (clip: PathClipPath, bounds: Bounds): ClipPathPath2DResult | null => {
    if (!clip.d) return null;

    // Path2D is available in all modern browsers; the path data is absolute SVG
    // coordinates and is NOT offset by the element position — the canvas transform
    // already accounts for the page origin, so we apply a translate.
    try {
        // Build the path and translate it to the element's origin.
        const path2d = new Path2D();
        // Apply the element offset via a DOMMatrix translate before adding the path.
        const translated = new Path2D();
        translated.addPath(new Path2D(clip.d), new DOMMatrix([1, 0, 0, 1, bounds.left, bounds.top]));
        path2d.addPath(translated);
        return { kind: 'path2d', path2d };
    } catch {
        return null;
    }
};
