import { Bounds } from '../../css/layout/bounds';
import { BACKGROUND_CLIP } from '../../css/property-descriptors/background-clip';
import { BORDER_IMAGE_REPEAT } from '../../css/property-descriptors/border-image-repeat';
import { BorderImageWidthValue } from '../../css/property-descriptors/border-image-width';
import { BORDER_STYLE } from '../../css/property-descriptors/border-style';
import { BOX_DECORATION_BREAK } from '../../css/property-descriptors/box-decoration-break';
import { DIRECTION } from '../../css/property-descriptors/direction';
import { DISPLAY } from '../../css/property-descriptors/display';
import { WRITING_MODE } from '../../css/property-descriptors/writing-mode';
import { asString, isTransparent, pack } from '../../css/types/color';
import { calculateGradientDirection, calculateRadius, processColorStops } from '../../css/types/functions/gradient';
import {
    CSSImageType,
    CSSURLImage,
    ICSSImage,
    isConicGradient,
    isLinearGradient,
    isRadialGradient,
    isRepeatingConicGradient,
    isRepeatingLinearGradient,
    isRepeatingRadialGradient,
} from '../../css/types/image';
import { FIFTY_PERCENT, getAbsoluteValue, ZERO_LENGTH } from '../../css/types/length-percentage';
import { ElementContainer } from '../../dom/element-container';
import { calculateBackgroundRendering, getBackgroundValueForIndex } from '../background';
import { BezierCurve, isBezierCurve } from '../bezier-curve';
import {
    parsePathForBorder,
    parsePathForBorderDoubleInner,
    parsePathForBorderDoubleOuter,
    parsePathForBorderStroke,
} from '../border';
import {
    BoundCurves,
    calculateBorderBoxPath,
    calculateContentBoxPath,
    calculatePaddingBoxPath,
    expandBorderBoxPath,
} from '../bound-curves';
import { Path } from '../path';
import { ElementPaint } from '../stacking-context';
import { Vector } from '../vector';
import {
    canvasMask,
    canvasPath,
    CanvasRenderState,
    formatPath,
    getLinearGradientCanvas,
    renderRepeat,
    resizeImage,
} from './canvas-render-state';
import { createFontStyle, drawTextWithLetterSpacing } from './canvas-text-renderer';

/**
 * Builds a stable cache key fragment from processed gradient stops.
 * Colours are packed numbers and stops are normalised numbers, so a simple
 * join uniquely identifies the gradient's appearance.
 */
const gradientStopsKey = (stops: ReadonlyArray<{ color: number; stop: number }>): string =>
    stops.map(s => `${s.color}@${s.stop}`).join(',');

// ---------------------------------------------------------------------------
// Inline fragment bounds (for box-decoration-break)
// ---------------------------------------------------------------------------

/**
 * Describes one visual-line fragment of an inline element.
 *
 *   borderBox  – full border-box bounds of this fragment (text + padding + border)
 *   isFirst    – true for the first fragment on the first line
 *   isLast     – true for the last fragment on the last line
 */
export interface InlineFragment {
    /** Full border-box bounds (text + padding + border on all sides).
     *  Used by `clone` mode and for border rendering in `slice` mode. */
    borderBox: Bounds;
    /** Slice-specific border-box: padding/border left only on first fragment,
     *  padding/border right only on last fragment.  Top/bottom always included. */
    sliceBox: Bounds;
    /** Raw text bounds without any padding or border expansion. */
    textBox: Bounds;
    isFirst: boolean;
    isLast: boolean;
}

/**
 * Groups all textBounds from every textNode of `container` by visual line and
 * returns one InlineFragment per line with three sets of bounds:
 *
 *   borderBox – full expansion (padding + border on all sides)
 *   sliceBox  – top/bottom expansion on every fragment, but left expansion only
 *               on the first fragment and right expansion only on the last
 *   textBox   – raw text extents without any expansion
 *
 * Returns `null` when there are no textBounds (e.g. replaced inline elements),
 * so callers can fall back to the normal single-box path.
 */
export const getInlineFragmentBounds = (container: ElementContainer): InlineFragment[] | null => {
    const styles = container.styles;

    // Collect all textBounds across every child textNode.
    const allTextBounds = container.textNodes.flatMap(tn => tn.textBounds);
    if (allTextBounds.length === 0) {
        return null;
    }

    const bt = styles.borderTopWidth;
    const br = styles.borderRightWidth;
    const bb = styles.borderBottomWidth;
    const bl = styles.borderLeftWidth;

    // Resolve padding to absolute pixel values.
    const refWidth = container.bounds.width;
    const pt = getAbsoluteValue(styles.paddingTop, refWidth);
    const pr = getAbsoluteValue(styles.paddingRight, refWidth);
    const pb = getAbsoluteValue(styles.paddingBottom, refWidth);
    const pl = getAbsoluteValue(styles.paddingLeft, refWidth);

    // Group textBounds by visual line (rounded bounds.top for horizontal text).
    const lineMap = new Map<number, { minLeft: number; maxRight: number; minTop: number; maxBottom: number }>();
    for (const tb of allTextBounds) {
        const key = Math.round(tb.bounds.top);
        const entry = lineMap.get(key);
        const left = tb.bounds.left;
        const right = tb.bounds.left + tb.bounds.width;
        const top = tb.bounds.top;
        const bottom = tb.bounds.top + tb.bounds.height;
        if (!entry) {
            lineMap.set(key, { minLeft: left, maxRight: right, minTop: top, maxBottom: bottom });
        } else {
            entry.minLeft = Math.min(entry.minLeft, left);
            entry.maxRight = Math.max(entry.maxRight, right);
            entry.minTop = Math.min(entry.minTop, top);
            entry.maxBottom = Math.max(entry.maxBottom, bottom);
        }
    }

    // Sort lines top-to-bottom.
    const lines = Array.from(lineMap.values()).sort((a, b) => a.minTop - b.minTop);
    const total = lines.length;

    return lines.map((line, idx) => {
        const isFirst = idx === 0;
        const isLast = idx === total - 1;

        // textBox — raw text extents, no expansion.
        const textBox = new Bounds(
            line.minLeft,
            line.minTop,
            line.maxRight - line.minLeft,
            line.maxBottom - line.minTop,
        );

        // borderBox — full expansion on all sides (for clone mode).
        const borderBox = new Bounds(
            line.minLeft - pl - bl,
            line.minTop - pt - bt,
            line.maxRight - line.minLeft + pl + pr + bl + br,
            line.maxBottom - line.minTop + pt + pb + bt + bb,
        );

        // sliceBox — top/bottom always expanded; left only on first, right only on last.
        const sliceLeft = isFirst ? pl + bl : 0;
        const sliceRight = isLast ? pr + br : 0;
        const sliceBox = new Bounds(
            line.minLeft - sliceLeft,
            line.minTop - pt - bt,
            line.maxRight - line.minLeft + sliceLeft + sliceRight,
            line.maxBottom - line.minTop + pt + pb + bt + bb,
        );

        return { borderBox, sliceBox, textBox, isFirst, isLast };
    });
};

// ---------------------------------------------------------------------------
// Lightweight container proxy for per-fragment rendering
// ---------------------------------------------------------------------------

/**
 * Creates a minimal ElementContainer-like object (duck-typed) with overridden
 * `bounds` so that BoundCurves and calculateBackgroundRendering work correctly
 * on a single inline fragment instead of the full element bounding box.
 */
const makeFragmentContainer = (original: ElementContainer, fragmentBounds: Bounds): ElementContainer => {
    // We cast — only `styles`, `bounds`, and `textNodes` are accessed by the
    // rendering helpers we call, and all are present.
    return Object.create(original, {
        bounds: { value: fragmentBounds, writable: false },
    }) as ElementContainer;
};

// ---------------------------------------------------------------------------
// Background painting area
// ---------------------------------------------------------------------------

export const calculateBackgroundCurvedPaintingArea = (clip: BACKGROUND_CLIP, curves: BoundCurves): Path[] => {
    switch (clip) {
        case BACKGROUND_CLIP.BORDER_BOX:
            return calculateBorderBoxPath(curves);
        case BACKGROUND_CLIP.CONTENT_BOX:
            return calculateContentBoxPath(curves);
        case BACKGROUND_CLIP.TEXT:
            // For background-clip: text, use padding-box as the initial painting area.
            // The actual text-shape clipping is handled via offscreen canvas compositing.
            return calculatePaddingBoxPath(curves);
        case BACKGROUND_CLIP.PADDING_BOX:
        default:
            return calculatePaddingBoxPath(curves);
    }
};

// ---------------------------------------------------------------------------
// Background image (all gradient types + URL images)
// ---------------------------------------------------------------------------

export async function renderBackgroundImage(state: CanvasRenderState, container: ElementContainer): Promise<void> {
    let index = container.styles.backgroundImage.length - 1;
    for (const backgroundImage of container.styles.backgroundImage.slice(0).reverse()) {
        const blendMode = getBackgroundValueForIndex(container.styles.backgroundBlendMode, index);
        if (blendMode !== 'source-over') {
            state.ctx.globalCompositeOperation = blendMode;
        }

        if (backgroundImage.type === CSSImageType.URL) {
            let image;
            const url = (backgroundImage as CSSURLImage).url;
            try {
                image = await state.context.cache.match(url);
            } catch (e) {
                state.context.error(`Error loading background-image ${url}`, e);
            }

            if (image && image.width > 0 && image.height > 0) {
                const [path, x, y, width, height] = calculateBackgroundRendering(
                    container,
                    index,
                    [image.width, image.height, image.width / image.height],
                    state.context.windowBounds,
                );
                const pattern = state.ctx.createPattern(
                    resizeImage(state, image, width, height),
                    'repeat',
                ) as CanvasPattern;
                renderRepeat(state, path, pattern, x, y);
            }
        } else if (isLinearGradient(backgroundImage)) {
            const [path, x, y, width, height] = calculateBackgroundRendering(
                container,
                index,
                [null, null, null],
                state.context.windowBounds,
            );
            const [lineLength, x0, x1, y0, y1] = calculateGradientDirection(backgroundImage.angle, width, height);
            const stops = processColorStops(backgroundImage.stops, lineLength || 1);

            if (width > 0 && height > 0) {
                const key = `lin|${x0},${y0},${x1},${y1}|${gradientStopsKey(stops)}|${width}x${height}`;
                const canvas = getLinearGradientCanvas(state, key, width, height, (gCtx, w, h) => {
                    const gradient = gCtx.createLinearGradient(x0, y0, x1, y1);
                    stops.forEach(colorStop => gradient.addColorStop(colorStop.stop, asString(colorStop.color)));
                    gCtx.fillStyle = gradient;
                    gCtx.fillRect(0, 0, w, h);
                });
                // A pattern is bound to the context that creates it, so build a
                // fresh one from the cached canvas on the current state.ctx.
                const pattern = state.ctx.createPattern(canvas, 'repeat') as CanvasPattern;
                renderRepeat(state, path, pattern, x, y);
            }
        } else if (isRepeatingLinearGradient(backgroundImage)) {
            const [path, x, y, width, height] = calculateBackgroundRendering(
                container,
                index,
                [null, null, null],
                state.context.windowBounds,
            );
            const [lineLength, x0, x1, y0, y1] = calculateGradientDirection(backgroundImage.angle, width, height);

            // processColorStops normalises stops to [0,1] relative to lineLength
            const processedStops = processColorStops(backgroundImage.stops, lineLength || 1);
            const tileStart = processedStops[0].stop;
            const tileEnd = processedStops[processedStops.length - 1].stop;
            const tileSize = tileEnd - tileStart;

            // Resolve the final stop list once (tiled for repeating gradients).
            let finalStops = processedStops;
            if (tileSize > 0) {
                // Build all tiled stops in [0,1] by repeating the tile backward and forward.
                // Use a max-iterations guard to prevent runaway loops on degenerate inputs.
                const MAX_ITER = 512;
                const allStops: Array<{ stop: number; color: (typeof processedStops)[0]['color'] }> = [];

                // Tile backward: while the tile still contributes stops >= 0
                for (let iter = 1; iter <= MAX_ITER && tileStart - iter * tileSize > -tileSize; iter++) {
                    const offset = iter * tileSize;
                    processedStops.forEach(s => {
                        allStops.push({ stop: Math.max(0, s.stop - offset), color: s.color });
                    });
                    if (tileStart - offset <= 0) break;
                }
                processedStops.forEach(s => allStops.push({ stop: s.stop, color: s.color }));
                // Tile forward: while the tile still contributes stops <= 1
                for (let iter = 1; iter <= MAX_ITER && tileEnd + (iter - 1) * tileSize < 1; iter++) {
                    const offset = iter * tileSize;
                    processedStops.forEach(s => {
                        allStops.push({ stop: Math.min(1, s.stop + offset), color: s.color });
                    });
                }

                // Clamp edges: ensure 0 and 1 are covered with the boundary stop's colour
                if (allStops[0].stop > 0) {
                    allStops.unshift({ stop: 0, color: allStops[0].color });
                }
                if (allStops[allStops.length - 1].stop < 1) {
                    allStops.push({ stop: 1, color: allStops[allStops.length - 1].color });
                }

                finalStops = allStops;
            }

            if (width > 0 && height > 0) {
                const key = `rlin|${x0},${y0},${x1},${y1}|${gradientStopsKey(finalStops)}|${width}x${height}`;
                const canvas = getLinearGradientCanvas(state, key, width, height, (gCtx, w, h) => {
                    const gradient = gCtx.createLinearGradient(x0, y0, x1, y1);
                    finalStops.forEach(s => gradient.addColorStop(s.stop, asString(s.color)));
                    gCtx.fillStyle = gradient;
                    gCtx.fillRect(0, 0, w, h);
                });
                const pattern = state.ctx.createPattern(canvas, 'repeat') as CanvasPattern;
                renderRepeat(state, path, pattern, x, y);
            }
        } else if (isRadialGradient(backgroundImage)) {
            const [path, left, top, width, height] = calculateBackgroundRendering(
                container,
                index,
                [null, null, null],
                state.context.windowBounds,
            );
            const position = backgroundImage.position.length === 0 ? [FIFTY_PERCENT] : backgroundImage.position;
            const x = getAbsoluteValue(position[0], width);
            const y = getAbsoluteValue(position[position.length - 1], height);

            const [rx, ry] = calculateRadius(backgroundImage, x, y, width, height);
            if (rx > 0 && ry > 0) {
                const radialGradient = state.ctx.createRadialGradient(left + x, top + y, 0, left + x, top + y, rx);

                processColorStops(backgroundImage.stops, rx * 2).forEach(colorStop =>
                    radialGradient.addColorStop(colorStop.stop, asString(colorStop.color)),
                );

                canvasPath(state, path);
                state.ctx.fillStyle = radialGradient;
                if (rx !== ry) {
                    // transforms for elliptical radial gradient
                    const midX = container.bounds.left + 0.5 * container.bounds.width;
                    const midY = container.bounds.top + 0.5 * container.bounds.height;
                    const f = ry / rx;
                    const invF = 1 / f;

                    state.ctx.save();
                    state.ctx.translate(midX, midY);
                    state.ctx.transform(1, 0, 0, f, 0, 0);
                    state.ctx.translate(-midX, -midY);

                    state.ctx.fillRect(left, invF * (top - midY) + midY, width, height * invF);
                    state.ctx.restore();
                } else {
                    state.ctx.fill();
                }
            }
        } else if (isRepeatingRadialGradient(backgroundImage)) {
            const [path, left, top, width, height] = calculateBackgroundRendering(
                container,
                index,
                [null, null, null],
                state.context.windowBounds,
            );
            const position = backgroundImage.position.length === 0 ? [FIFTY_PERCENT] : backgroundImage.position;
            const x = getAbsoluteValue(position[0], width);
            const y = getAbsoluteValue(position[position.length - 1], height);

            const [rx, ry] = calculateRadius(backgroundImage, x, y, width, height);
            if (rx > 0 && ry > 0) {
                // Centre in page-space coordinates
                const cx = left + x;
                const cy = top + y;

                // Calculate maxRadius based on the deformation (f)
                const f = rx !== ry ? ry / rx : 1;
                const invF = rx !== ry ? rx / ry : 1;

                // Apply the inverse ratio (invF) to the Y distance to compensate for the subsequent transform
                const maxDistX = Math.max(x, width - x);
                const maxDistY = Math.max(y, height - y) * invF;
                const maxRadius = Math.sqrt(maxDistX ** 2 + maxDistY ** 2);
                const drawRadius = Math.max(rx, maxRadius);

                // Normalise stops against rx...
                const processedStops = processColorStops(backgroundImage.stops, rx);
                const scale = rx / drawRadius;
                const scaledStops = processedStops.map(s => ({ color: s.color, stop: s.stop * scale }));
                const tileStart = scaledStops[0].stop;
                const tileEnd = scaledStops[scaledStops.length - 1].stop;
                const tileSize = tileEnd - tileStart;

                const allStops: Array<{ stop: number; color: (typeof scaledStops)[0]['color'] }> = [];
                if (tileSize > 0) {
                    const MAX_ITER = 512;
                    for (let iter = 1; iter <= MAX_ITER && tileStart - iter * tileSize > -tileSize; iter++) {
                        const offset = iter * tileSize;
                        scaledStops.forEach(s => {
                            allStops.push({ color: s.color, stop: Math.max(0, s.stop - offset) });
                        });
                        if (tileStart - offset <= 0) break;
                    }
                    scaledStops.forEach(s => allStops.push({ color: s.color, stop: s.stop }));
                    for (let iter = 1; iter <= MAX_ITER && tileEnd + (iter - 1) * tileSize < 1; iter++) {
                        const offset = iter * tileSize;
                        scaledStops.forEach(s => {
                            allStops.push({ color: s.color, stop: Math.min(1, s.stop + offset) });
                        });
                    }
                } else {
                    scaledStops.forEach(s => allStops.push({ stop: s.stop, color: s.color }));
                }

                const radialGradient = state.ctx.createRadialGradient(cx, cy, 0, cx, cy, drawRadius);
                allStops.forEach(s => radialGradient.addColorStop(s.stop, asString(s.color)));

                canvasPath(state, path);
                state.ctx.fillStyle = radialGradient;

                if (rx !== ry) {
                    // Ellipse
                    state.ctx.save();
                    state.ctx.clip();
                    state.ctx.translate(cx, cy);
                    state.ctx.transform(1, 0, 0, f, 0, 0);
                    state.ctx.translate(-cx, -cy);
                    state.ctx.fillRect(left, invF * (top - cy) + cy, width, height * invF);
                    state.ctx.restore();
                } else {
                    // Perfect circle
                    state.ctx.fill();
                }
            }
        } else if (isConicGradient(backgroundImage)) {
            if (
                typeof CanvasRenderingContext2D !== 'undefined' &&
                typeof CanvasRenderingContext2D.prototype.createConicGradient === 'function'
            ) {
                const [path, left, top, width, height] = calculateBackgroundRendering(
                    container,
                    index,
                    [null, null, null],
                    state.context.windowBounds,
                );
                const position = backgroundImage.position.length === 0 ? [FIFTY_PERCENT] : backgroundImage.position;
                const cx = left + getAbsoluteValue(position[0], width);
                const cy = top + getAbsoluteValue(position[position.length - 1], height);

                // CSS conic starts at top (12 o'clock); Canvas starts at right (3 o'clock). Subtract π/2.
                const conicGrad = state.ctx.createConicGradient(backgroundImage.startAngle - Math.PI / 2, cx, cy);
                processColorStops(backgroundImage.stops, 360).forEach(colorStop =>
                    conicGrad.addColorStop(colorStop.stop, asString(colorStop.color)),
                );

                canvasPath(state, path);
                state.ctx.fillStyle = conicGrad;
                state.ctx.fill();
            } else {
                state.context.logger.error('conic-gradient is not supported in this browser');
            }
        } else if (isRepeatingConicGradient(backgroundImage)) {
            if (
                typeof CanvasRenderingContext2D !== 'undefined' &&
                typeof CanvasRenderingContext2D.prototype.createConicGradient === 'function'
            ) {
                const [path, left, top, width, height] = calculateBackgroundRendering(
                    container,
                    index,
                    [null, null, null],
                    state.context.windowBounds,
                );
                const position = backgroundImage.position.length === 0 ? [FIFTY_PERCENT] : backgroundImage.position;
                const cx = left + getAbsoluteValue(position[0], width);
                const cy = top + getAbsoluteValue(position[position.length - 1], height);

                const processedStops = processColorStops(backgroundImage.stops, 360);
                const tileStart = processedStops[0].stop;
                const tileEnd = processedStops[processedStops.length - 1].stop;
                const tileSize = tileEnd - tileStart;

                const conicGrad = state.ctx.createConicGradient(backgroundImage.startAngle - Math.PI / 2, cx, cy);
                if (tileSize > 0) {
                    const MAX_ITER = 512;
                    const allStops: Array<{ stop: number; color: (typeof processedStops)[0]['color'] }> = [];

                    for (let iter = 1; iter <= MAX_ITER && tileStart - iter * tileSize > -tileSize; iter++) {
                        const offset = iter * tileSize;
                        processedStops.forEach(s => {
                            allStops.push({ stop: Math.max(0, s.stop - offset), color: s.color });
                        });
                        if (tileStart - offset <= 0) break;
                    }
                    processedStops.forEach(s => allStops.push({ stop: s.stop, color: s.color }));
                    for (let iter = 1; iter <= MAX_ITER && tileEnd + (iter - 1) * tileSize < 1; iter++) {
                        const offset = iter * tileSize;
                        processedStops.forEach(s => {
                            allStops.push({ stop: Math.min(1, s.stop + offset), color: s.color });
                        });
                        const tilePos = 1 - processedStops[0].stop - offset;
                        if (tilePos >= 0 && tilePos <= tileSize) {
                            for (let si = processedStops.length - 1; si >= 0; si--) {
                                if (processedStops[si].stop + offset <= 1) {
                                    allStops.push({ stop: 1, color: processedStops[si].color });
                                    break;
                                }
                            }
                        }
                    }

                    if (allStops[0].stop > 0) {
                        allStops.unshift({ stop: 0, color: allStops[0].color });
                    }
                    if (allStops[allStops.length - 1].stop < 1) {
                        allStops.push({ stop: 1, color: allStops[allStops.length - 1].color });
                    }

                    allStops.forEach(s => conicGrad.addColorStop(s.stop, asString(s.color)));
                } else {
                    processedStops.forEach(s => conicGrad.addColorStop(s.stop, asString(s.color)));
                }

                canvasPath(state, path);
                state.ctx.fillStyle = conicGrad;
                state.ctx.fill();
            } else {
                state.context.logger.error('repeating-conic-gradient is not supported in this browser');
            }
        }

        index--;
        if (blendMode !== 'source-over') {
            state.ctx.globalCompositeOperation = 'source-over';
        }
    }
}

// ---------------------------------------------------------------------------
// Per-layer background image rendering with individual curved clips
// Used when multiple background-clip values are specified (e.g. padding-box, border-box)
// ---------------------------------------------------------------------------

async function renderBackgroundImagePerLayer(
    state: CanvasRenderState,
    paint: ElementPaint,
    container: ElementContainer,
): Promise<void> {
    let index = container.styles.backgroundImage.length - 1;
    for (const backgroundImage of container.styles.backgroundImage.slice(0).reverse()) {
        const clip = getBackgroundValueForIndex(container.styles.backgroundClip, index);
        const clipPath = calculateBackgroundCurvedPaintingArea(clip, paint.curves);

        state.ctx.save();
        canvasPath(state, clipPath);
        state.ctx.clip();

        const blendMode = getBackgroundValueForIndex(container.styles.backgroundBlendMode, index);
        if (blendMode !== 'source-over') {
            state.ctx.globalCompositeOperation = blendMode;
        }

        if (backgroundImage.type === CSSImageType.URL) {
            let image;
            const url = (backgroundImage as CSSURLImage).url;
            try {
                image = await state.context.cache.match(url);
            } catch (e) {
                state.context.error(`Error loading background-image ${url}`, e);
            }

            if (image && image.width > 0 && image.height > 0) {
                const [path, x, y, width, height] = calculateBackgroundRendering(
                    container,
                    index,
                    [image.width, image.height, image.width / image.height],
                    state.context.windowBounds,
                );
                const pattern = state.ctx.createPattern(
                    resizeImage(state, image, width, height),
                    'repeat',
                ) as CanvasPattern;
                renderRepeat(state, path, pattern, x, y);
            }
        } else if (isLinearGradient(backgroundImage)) {
            const [path, x, y, width, height] = calculateBackgroundRendering(
                container,
                index,
                [null, null, null],
                state.context.windowBounds,
            );
            const [lineLength, x0, x1, y0, y1] = calculateGradientDirection(backgroundImage.angle, width, height);
            const stops = processColorStops(backgroundImage.stops, lineLength || 1);

            if (width > 0 && height > 0) {
                const key = `lin|${x0},${y0},${x1},${y1}|${gradientStopsKey(stops)}|${width}x${height}`;
                const canvas = getLinearGradientCanvas(state, key, width, height, (gCtx, w, h) => {
                    const gradient = gCtx.createLinearGradient(x0, y0, x1, y1);
                    stops.forEach(colorStop => gradient.addColorStop(colorStop.stop, asString(colorStop.color)));
                    gCtx.fillStyle = gradient;
                    gCtx.fillRect(0, 0, w, h);
                });
                const pattern = state.ctx.createPattern(canvas, 'repeat') as CanvasPattern;
                renderRepeat(state, path, pattern, x, y);
            }
        }
        // For simplicity, other gradient types fall through to renderBackgroundImage
        // TODO: handle all gradient types per-layer if needed

        if (blendMode !== 'source-over') {
            state.ctx.globalCompositeOperation = 'source-over';
        }
        state.ctx.restore();
        index--;
    }
}

// ---------------------------------------------------------------------------
// background-clip: text offscreen compositing
// ---------------------------------------------------------------------------

export async function renderBackgroundClipText(state: CanvasRenderState, paint: ElementPaint): Promise<void> {
    const container = paint.container;
    const styles = container.styles;
    const bounds = container.bounds;

    if (container.textNodes.length === 0) {
        return;
    }

    const width = Math.ceil(bounds.width * state.options.scale);
    const height = Math.ceil(bounds.height * state.options.scale);
    if (width <= 0 || height <= 0) {
        return;
    }

    const offscreen = state.canvasPool.acquire(width, height);
    const offCtx = offscreen.getContext('2d') as CanvasRenderingContext2D;

    offCtx.scale(state.options.scale, state.options.scale);
    offCtx.translate(-bounds.left, -bounds.top);

    // Step 1: Draw the background onto the offscreen canvas.
    // Temporarily swap state.ctx so rendering methods target the offscreen canvas.
    const mainCtx = state.ctx;
    state.ctx = offCtx;

    if (!isTransparent(styles.backgroundColor)) {
        state.ctx.fillStyle = asString(styles.backgroundColor);
        state.ctx.fillRect(bounds.left, bounds.top, bounds.width, bounds.height);
    }
    await renderBackgroundImage(state, container);

    state.ctx = mainCtx;

    // Step 2: create text mask canvas
    // All text is drawn as opaque black on a separate canvas so we can apply
    // the mask in a single 'destination-in' operation (avoiding the problem
    // where multiple fillText calls with destination-in erase each other).
    const maskCanvas = state.canvasPool.acquire(width, height);
    const maskCtx = maskCanvas.getContext('2d') as CanvasRenderingContext2D;
    maskCtx.scale(state.options.scale, state.options.scale);
    maskCtx.translate(-bounds.left, -bounds.top);

    const [font, fontFamily, fontSize] = createFontStyle(styles);
    maskCtx.font = font;
    maskCtx.direction = styles.direction === DIRECTION.RTL ? 'rtl' : 'ltr';
    maskCtx.textAlign = 'left';
    maskCtx.fillStyle = '#000000';

    const wm = styles.writingMode;
    const { baseline } = state.fontMetrics.getMetrics(fontFamily, fontSize);
    const isVertical =
        wm === WRITING_MODE.VERTICAL_RL ||
        wm === WRITING_MODE.VERTICAL_LR ||
        wm === WRITING_MODE.SIDEWAYS_RL ||
        wm === WRITING_MODE.SIDEWAYS_LR;

    for (const textNode of container.textNodes) {
        for (const textBound of textNode.textBounds) {
            if (isVertical) {
                const cx = textBound.bounds.left + textBound.bounds.width / 2;
                const cy = textBound.bounds.top + textBound.bounds.height / 2;
                const isSidewaysLR = wm === WRITING_MODE.SIDEWAYS_LR;
                const angle = isSidewaysLR ? -Math.PI / 2 : Math.PI / 2;
                maskCtx.save();
                maskCtx.translate(cx, cy);
                maskCtx.rotate(angle);
                maskCtx.translate(-cx, -cy);
                const rotatedBounds = new Bounds(
                    cx - textBound.bounds.height / 2,
                    cy - textBound.bounds.width / 2,
                    textBound.bounds.height,
                    textBound.bounds.width,
                );
                if (!state.isFirefox) {
                    maskCtx.textBaseline = 'ideographic';
                    maskCtx.fillText(textBound.text, rotatedBounds.left, rotatedBounds.top + rotatedBounds.height);
                } else {
                    maskCtx.textBaseline = 'alphabetic';
                    maskCtx.fillText(textBound.text, rotatedBounds.left, rotatedBounds.top + baseline);
                }
                maskCtx.restore();
            } else {
                if (styles.letterSpacing === 0 && !state.isFirefox) {
                    maskCtx.textBaseline = 'ideographic';
                    maskCtx.fillText(
                        textBound.text,
                        textBound.bounds.left,
                        textBound.bounds.top + textBound.bounds.height,
                    );
                } else {
                    // letterSpacing !== 0, or Firefox (which needs the baseline offset).
                    maskCtx.textBaseline = 'alphabetic';
                    drawTextWithLetterSpacing(
                        maskCtx,
                        textBound.text,
                        textBound.bounds.left,
                        textBound.bounds.top + baseline,
                        styles.letterSpacing,
                    );
                }
            }
        }
    }

    // Step 3: clip background to text shape with destination-in
    // This is a single drawImage call so it clips the entire background at once.
    offCtx.globalCompositeOperation = 'destination-in';
    offCtx.setTransform(1, 0, 0, 1, 0, 0); // Reset transform for pixel-to-pixel copy
    offCtx.drawImage(maskCanvas, 0, 0);

    // Step 4: Draw the clipped result onto the main canvas
    state.ctx.drawImage(offscreen, 0, 0, width, height, bounds.left, bounds.top, bounds.width, bounds.height);

    // Return offscreen canvases to the pool for reuse.
    state.canvasPool.release(maskCanvas);
    state.canvasPool.release(offscreen);
}

// ---------------------------------------------------------------------------
// Borders
// ---------------------------------------------------------------------------

export async function renderSolidBorder(
    state: CanvasRenderState,
    color: import('../../css/types/color').Color,
    side: number,
    curvePoints: BoundCurves,
): Promise<void> {
    const paths = parsePathForBorder(curvePoints, side);
    const fillStyle = asString(color);

    canvasPath(state, paths);
    state.ctx.fillStyle = fillStyle;
    state.ctx.fill();

    // Each side is filled as a separate trapezoid. Where two differently-coloured
    // sides meet along a corner's diagonal miter, the two independently
    // anti-aliased edges do not overlap perfectly and leave a thin lighter/jagged
    // seam. Stroking the same trapezoid outline in the same colour paints a hairline
    // that straddles the edge and covers that seam. lineWidth is kept at ~1 device
    // pixel (divided by scale, since the stroke is applied in the scaled CTM) so it
    // never visibly thickens the border. Adjacent sides paint over each other in
    // T→R→B→L order, sealing every diagonal.
    if (!isTransparent(color)) {
        state.ctx.strokeStyle = fillStyle;
        state.ctx.lineWidth = 1 / state.options.scale;
        state.ctx.lineJoin = 'round';
        state.ctx.stroke();
    }
}

export async function renderDoubleBorder(
    state: CanvasRenderState,
    color: import('../../css/types/color').Color,
    width: number,
    side: number,
    curvePoints: BoundCurves,
): Promise<void> {
    if (width < 3) {
        await renderSolidBorder(state, color, side, curvePoints);
        return;
    }

    const outerPaths = parsePathForBorderDoubleOuter(curvePoints, side);
    canvasPath(state, outerPaths);
    state.ctx.fillStyle = asString(color);
    state.ctx.fill();
    const innerPaths = parsePathForBorderDoubleInner(curvePoints, side);
    canvasPath(state, innerPaths);
    state.ctx.fill();
}

// ---------------------------------------------------------------------------
// 3D border styles (groove / ridge / inset / outset)
// ---------------------------------------------------------------------------

/**
 * Extracts the RGBA components from a packed color.
 */
const unpackColor = (color: number): [number, number, number, number] => [
    0xff & (color >> 24),
    0xff & (color >> 16),
    0xff & (color >> 8),
    0xff & color,
];

/**
 * Returns a darker shade of the given color by scaling RGB by `factor` (0..1).
 * Alpha is preserved. Matches how browsers derive the "dark" side of 3D borders.
 */
const darkenColor = (color: number, factor: number): number => {
    const [r, g, b, a] = unpackColor(color);
    return pack(Math.round(r * factor), Math.round(g * factor), Math.round(b * factor), a / 255);
};

/**
 * Resolves the two shades used for 3D borders on a given side.
 *
 * Browsers render inset/outset/groove/ridge by lighting the box as if from the
 * top-left: the top and left sides use one shade, the bottom and right the other.
 * The base color is used as the "light" shade; a darkened variant (~50%) as the
 * "dark" shade — this matches the common browser behaviour for a mid-tone base.
 *
 * @param side 0=top, 1=right, 2=bottom, 3=left
 * @returns the color to use for that side's (outer, inner) halves
 */
const resolve3dBorderShades = (color: number, style: BORDER_STYLE, side: number): { outer: number; inner: number } => {
    const light = color;
    const dark = darkenColor(color, 0.5);
    const isTopLeft = side === 0 || side === 3;

    switch (style) {
        case BORDER_STYLE.INSET:
            // Top/left dark, bottom/right light (looks pressed in).
            return { outer: isTopLeft ? dark : light, inner: isTopLeft ? dark : light };
        case BORDER_STYLE.OUTSET:
            // Top/left light, bottom/right dark (looks raised).
            return { outer: isTopLeft ? light : dark, inner: isTopLeft ? light : dark };
        case BORDER_STYLE.GROOVE:
            // Carved-in: outer half like inset, inner half like outset.
            return { outer: isTopLeft ? dark : light, inner: isTopLeft ? light : dark };
        case BORDER_STYLE.RIDGE:
            // Raised: outer half like outset, inner half like inset.
            return { outer: isTopLeft ? light : dark, inner: isTopLeft ? dark : light };
        default:
            return { outer: color, inner: color };
    }
};

/**
 * Renders inset/outset borders: a single flat shade per side, chosen by the
 * lighting model (top/left vs bottom/right).
 */
export async function renderInsetOutsetBorder(
    state: CanvasRenderState,
    color: import('../../css/types/color').Color,
    side: number,
    style: BORDER_STYLE,
    curvePoints: BoundCurves,
): Promise<void> {
    const { outer } = resolve3dBorderShades(color, style, side);
    canvasPath(state, parsePathForBorder(curvePoints, side));
    state.ctx.fillStyle = asString(outer);
    state.ctx.fill();
}

/**
 * Renders groove/ridge borders: the border is split into an outer and inner half
 * along the border-stroke centre line, each half painted with a different shade
 * to create the carved (groove) or raised (ridge) 3D effect.
 */
export async function renderGrooveRidgeBorder(
    state: CanvasRenderState,
    color: import('../../css/types/color').Color,
    width: number,
    side: number,
    style: BORDER_STYLE,
    curvePoints: BoundCurves,
): Promise<void> {
    // For hairline borders there is no room for two halves — fall back to a flat shade.
    if (width < 2) {
        await renderInsetOutsetBorder(state, color, side, style, curvePoints);
        return;
    }

    const { outer, inner } = resolve3dBorderShades(color, style, side);
    const fullBorder = parsePathForBorder(curvePoints, side);
    const strokePath = parsePathForBorderStroke(curvePoints, side);

    // Outer half: clip to the full border trapezoid, then fill the region on the
    // border-box side of the stroke centre line.
    // Inner half: same clip, fill the region on the padding-box side.
    // We approximate the two halves using the border-box→stroke and
    // stroke→padding-box sub-trapezoids built from the stroke centre line.

    // Outer half — border-box edge to stroke centre.
    state.ctx.save();
    canvasPath(state, fullBorder);
    state.ctx.clip();

    // Fill outer half: the border-box outer boundary down to the stroke line.
    canvasPath(state, _buildHalfBorderPath(curvePoints, side, 'outer', strokePath));
    state.ctx.fillStyle = asString(outer);
    state.ctx.fill();

    // Fill inner half: the stroke line down to the padding-box boundary.
    canvasPath(state, _buildHalfBorderPath(curvePoints, side, 'inner', strokePath));
    state.ctx.fillStyle = asString(inner);
    state.ctx.fill();

    state.ctx.restore();
}

/**
 * Builds the path for one half (outer=border-box→stroke, inner=stroke→padding-box)
 * of a border side, used to paint groove/ridge halves. The stroke centre line is
 * shared between the two halves so they meet without a gap.
 */
const _buildHalfBorderPath = (
    curvePoints: BoundCurves,
    side: number,
    half: 'outer' | 'inner',
    strokePath: Path[],
): Path[] => {
    const border = parsePathForBorder(curvePoints, side);
    // border = [outerStart, outerEnd, innerEnd, innerStart] (trapezoid corners).
    // strokePath = [strokeStart, strokeEnd] (centre line of the border).
    const outerEdge = border.slice(0, 2); // border-box edge (2 points)
    const innerEdge = border.slice(2, 4); // padding-box edge (2 points)
    const stroke = strokePath.slice(0, 2);
    const strokeReversed = [stroke[1], stroke[0]];

    if (half === 'outer') {
        // border-box edge → stroke centre (reversed to close the polygon)
        return [...outerEdge, ...strokeReversed];
    }
    // stroke centre → padding-box edge
    return [...stroke, ...innerEdge];
};

/**
 * Fast path for a uniform solid border: all four sides share the same colour
 * and style, so browsers paint one continuous ring with NO diagonal miter seam
 * between the sides. html2canvas normally fills the four sides as separate
 * trapezoids, whose shared diagonal edges get independently anti-aliased and
 * leave a faint seam (or a double-blended line) at each corner.
 *
 * Here we instead paint the whole border as a single closed ring: the outer
 * border-box path with the inner padding-box path punched out via the even-odd
 * fill rule. Because it is one fill(), there are no internal edges to anti-alias,
 * matching the browser's continuous-ring rendering exactly.
 *
 * This works for any corner radius (the border-box / padding-box paths already
 * carry the Bézier curves), so rounded uniform borders benefit too.
 */
function renderUniformSolidBorder(
    state: CanvasRenderState,
    color: import('../../css/types/color').Color,
    curvePoints: BoundCurves,
): void {
    const ctx = state.ctx;
    ctx.beginPath();
    // Outer contour: border-box.
    formatPath(ctx, calculateBorderBoxPath(curvePoints));
    ctx.closePath();
    // Inner contour: padding-box. With the even-odd rule this becomes a hole
    // regardless of winding order.
    formatPath(ctx, calculatePaddingBoxPath(curvePoints));
    ctx.closePath();
    ctx.fillStyle = asString(color);
    ctx.fill('evenodd');
}

/**
 * Dispatches border rendering for a single side to the appropriate renderer
 * based on the border-style. Centralises the style switch so the three border
 * loops (inline slice fragments, single box, fieldset top) stay in sync.
 */
export async function renderBorderSide(
    state: CanvasRenderState,
    color: import('../../css/types/color').Color,
    width: number,
    side: number,
    style: BORDER_STYLE,
    curvePoints: BoundCurves,
): Promise<void> {
    switch (style) {
        case BORDER_STYLE.DASHED:
            await renderDashedDottedBorder(state, color, width, side, curvePoints, BORDER_STYLE.DASHED);
            break;
        case BORDER_STYLE.DOTTED:
            await renderDashedDottedBorder(state, color, width, side, curvePoints, BORDER_STYLE.DOTTED);
            break;
        case BORDER_STYLE.DOUBLE:
            await renderDoubleBorder(state, color, width, side, curvePoints);
            break;
        case BORDER_STYLE.INSET:
        case BORDER_STYLE.OUTSET:
            await renderInsetOutsetBorder(state, color, side, style, curvePoints);
            break;
        case BORDER_STYLE.GROOVE:
        case BORDER_STYLE.RIDGE:
            await renderGrooveRidgeBorder(state, color, width, side, style, curvePoints);
            break;
        default:
            await renderSolidBorder(state, color, side, curvePoints);
    }
}

export async function renderDashedDottedBorder(
    state: CanvasRenderState,
    color: import('../../css/types/color').Color,
    width: number,
    side: number,
    curvePoints: BoundCurves,
    style: BORDER_STYLE,
): Promise<void> {
    state.ctx.save();

    const strokePaths = parsePathForBorderStroke(curvePoints, side);
    const boxPaths = parsePathForBorder(curvePoints, side);

    if (style === BORDER_STYLE.DASHED) {
        canvasPath(state, boxPaths);
        state.ctx.clip();
    }

    let startX: number, startY: number, endX: number, endY: number;
    if (isBezierCurve(boxPaths[0])) {
        startX = (boxPaths[0] as BezierCurve).start.x;
        startY = (boxPaths[0] as BezierCurve).start.y;
    } else {
        startX = (boxPaths[0] as Vector).x;
        startY = (boxPaths[0] as Vector).y;
    }
    if (isBezierCurve(boxPaths[1])) {
        endX = (boxPaths[1] as BezierCurve).end.x;
        endY = (boxPaths[1] as BezierCurve).end.y;
    } else {
        endX = (boxPaths[1] as Vector).x;
        endY = (boxPaths[1] as Vector).y;
    }

    let length: number;
    if (side === 0 || side === 2) {
        length = Math.abs(startX - endX);
    } else {
        length = Math.abs(startY - endY);
    }

    state.ctx.beginPath();
    if (style === BORDER_STYLE.DOTTED) {
        formatPath(state.ctx, strokePaths);
    } else {
        formatPath(state.ctx, boxPaths.slice(0, 2));
    }

    let dashLength = width < 3 ? width * 3 : width * 2;
    let spaceLength = width < 3 ? width * 2 : width;
    if (style === BORDER_STYLE.DOTTED) {
        dashLength = width;
        spaceLength = width;
    }

    let useLineDash = true;
    if (length <= dashLength * 2) {
        useLineDash = false;
    } else if (length <= dashLength * 2 + spaceLength) {
        const multiplier = length / (2 * dashLength + spaceLength);
        dashLength *= multiplier;
        spaceLength *= multiplier;
    } else {
        const numberOfDashes = Math.floor((length + spaceLength) / (dashLength + spaceLength));
        const minSpace = (length - numberOfDashes * dashLength) / (numberOfDashes - 1);
        const maxSpace = (length - (numberOfDashes + 1) * dashLength) / numberOfDashes;
        spaceLength =
            maxSpace <= 0 || Math.abs(spaceLength - minSpace) < Math.abs(spaceLength - maxSpace) ? minSpace : maxSpace;
    }

    if (useLineDash) {
        if (style === BORDER_STYLE.DOTTED) {
            state.ctx.setLineDash([0, dashLength + spaceLength]);
        } else {
            state.ctx.setLineDash([dashLength, spaceLength]);
        }
    }

    if (style === BORDER_STYLE.DOTTED) {
        state.ctx.lineCap = 'round';
        state.ctx.lineWidth = width;
    } else {
        state.ctx.lineWidth = width * 2 + 1.1;
    }
    state.ctx.strokeStyle = asString(color);
    state.ctx.stroke();
    state.ctx.setLineDash([]);

    // dashed round edge gap
    if (style === BORDER_STYLE.DASHED) {
        if (isBezierCurve(boxPaths[0])) {
            const path1 = boxPaths[3] as BezierCurve;
            const path2 = boxPaths[0] as BezierCurve;
            state.ctx.beginPath();
            formatPath(state.ctx, [new Vector(path1.end.x, path1.end.y), new Vector(path2.start.x, path2.start.y)]);
            state.ctx.stroke();
        }
        if (isBezierCurve(boxPaths[1])) {
            const path1 = boxPaths[1] as BezierCurve;
            const path2 = boxPaths[2] as BezierCurve;
            state.ctx.beginPath();
            formatPath(state.ctx, [new Vector(path1.end.x, path1.end.y), new Vector(path2.start.x, path2.start.y)]);
            state.ctx.stroke();
        }
    }

    state.ctx.restore();
}

// ---------------------------------------------------------------------------
// Full background + borders node rendering
// ---------------------------------------------------------------------------

export async function renderNodeBackgroundAndBorders(state: CanvasRenderState, paint: ElementPaint): Promise<void> {
    const styles = paint.container.styles;
    const isInline = styles.display === DISPLAY.INLINE;

    // For inline elements with box-decoration-break: clone, delegate to the
    // fragment-based renderer which repeats the full decoration on each line.
    if (isInline && styles.boxDecorationBreak === BOX_DECORATION_BREAK.CLONE) {
        const fragments = getInlineFragmentBounds(paint.container);
        if (fragments && fragments.length > 0) {
            for (const fragment of fragments) {
                const fragContainer = makeFragmentContainer(paint.container, fragment.borderBox);
                const fragCurves = new BoundCurves(fragContainer);
                const fragPaint: ElementPaint = Object.create(paint, {
                    container: { value: fragContainer },
                    curves: { value: fragCurves },
                });
                await _renderSingleBoxBackgroundAndBorders(state, fragPaint);
            }
            return;
        }
    }

    // Default path: single box (block elements) or inline slice (default).
    // For inline slice we use fragment-based rendering only when the element
    // actually contains text that can wrap across lines.  Replaced inline
    // elements (img, input, etc.) have no textNodes and must go through the
    // normal single-box path.
    if (isInline && styles.boxDecorationBreak !== BOX_DECORATION_BREAK.CLONE && paint.container.textNodes.length > 0) {
        await _renderInlineSlice(state, paint);
        return;
    }

    await _renderSingleBoxBackgroundAndBorders(state, paint);
}

// ---------------------------------------------------------------------------
// Inline slice renderer (box-decoration-break: slice — the default)
// ---------------------------------------------------------------------------

async function _renderInlineSlice(state: CanvasRenderState, paint: ElementPaint): Promise<void> {
    const styles = paint.container.styles;
    const hasBackground = !isTransparent(styles.backgroundColor) || styles.backgroundImage.length;
    const hasBorders =
        (styles.borderTopStyle !== BORDER_STYLE.NONE && styles.borderTopWidth > 0) ||
        (styles.borderRightStyle !== BORDER_STYLE.NONE && styles.borderRightWidth > 0) ||
        (styles.borderBottomStyle !== BORDER_STYLE.NONE && styles.borderBottomWidth > 0) ||
        (styles.borderLeftStyle !== BORDER_STYLE.NONE && styles.borderLeftWidth > 0);

    if (!hasBackground && !styles.boxShadow.length && !hasBorders) {
        return;
    }

    const fragments = getInlineFragmentBounds(paint.container);

    // No text-bounds available — fall back to single-box rendering.
    if (!fragments || fragments.length === 0) {
        await _renderSingleBoxBackgroundAndBorders(state, paint);
        return;
    }

    // In slice mode the background/border is drawn as if the inline element
    // were one continuous box that gets "sliced" at each line break:
    //   • Background hugs the text on each line (textBox + top/bottom padding)
    //     but only extends left/right padding on the first/last fragment.
    //   • Borders top/bottom run across every fragment.
    //   • Border left only on the first fragment, border right only on the last.
    //   • Border-radius: TL/BL on first fragment only, TR/BR on last only.

    if (hasBackground) {
        const isBackgroundClipText = getBackgroundValueForIndex(styles.backgroundClip, 0) === BACKGROUND_CLIP.TEXT;

        if (isBackgroundClipText) {
            await renderBackgroundClipText(state, paint);
        } else {
            // In slice mode the gradient/background-image is computed as if the
            // inline content were laid out in a single continuous strip (all
            // fragments concatenated left-to-right).  Each fragment then clips
            // its own portion of that strip.
            //
            // We achieve this by building, per fragment, a synthetic container
            // whose width = totalWidth (the sum of all fragment widths) and
            // whose left is shifted so that the visible area of that container
            // (after the clip) shows the correct portion of the gradient.
            const hasBackgroundImage = styles.backgroundImage.length > 0;

            // Pre-compute per-fragment cumulative offsets in the virtual strip.
            let totalWidth = 0;
            const fragOffsets: number[] = [];
            for (const f of fragments) {
                fragOffsets.push(totalWidth);
                totalWidth += f.sliceBox.width;
            }

            for (let i = 0; i < fragments.length; i++) {
                const fragment = fragments[i];
                const sliceContainer = _makeSliceFragmentContainer(paint.container, fragment);
                const fragCurves = new BoundCurves(sliceContainer);

                const backgroundPaintingArea = calculateBackgroundCurvedPaintingArea(
                    getBackgroundValueForIndex(styles.backgroundClip, 0),
                    fragCurves,
                );

                state.ctx.save();
                canvasPath(state, backgroundPaintingArea);
                state.ctx.clip();

                if (!isTransparent(styles.backgroundColor)) {
                    state.ctx.fillStyle = asString(styles.backgroundColor);
                    state.ctx.fill();
                }

                // Gradient / background-image: create a virtual container that
                // represents the full unbroken strip.  Its left is positioned so
                // that the portion of the strip visible in this fragment's clip
                // region corresponds to the correct offset.
                //
                //   virtualLeft = fragment.sliceBox.left - cumulativeOffset
                //
                // This way the gradient starts at virtualLeft, extends for
                // totalWidth, and the clip only reveals [cumulativeOffset,
                // cumulativeOffset + fragmentWidth] of the gradient.
                if (hasBackgroundImage) {
                    const virtualLeft = fragment.sliceBox.left - fragOffsets[i];
                    const virtualBounds = new Bounds(
                        virtualLeft,
                        fragment.sliceBox.top,
                        totalWidth,
                        fragment.sliceBox.height,
                    );
                    const virtualContainer = makeFragmentContainer(paint.container, virtualBounds);
                    await renderBackgroundImage(state, virtualContainer);
                }

                state.ctx.restore();
            }
        }
    }

    // box-shadow per fragment using sliceBox.
    if (styles.boxShadow.length) {
        for (const fragment of fragments) {
            const sliceContainer = _makeSliceFragmentContainer(paint.container, fragment);
            const fragCurves = new BoundCurves(sliceContainer);
            const fragPaint: ElementPaint = Object.create(paint, {
                container: { value: sliceContainer },
                curves: { value: fragCurves },
            });
            _renderBoxShadows(state, fragPaint);
        }
    }

    // Borders: left only on first, right only on last, top/bottom on all.
    if (hasBorders) {
        const borders = [
            { style: styles.borderTopStyle, color: styles.borderTopColor, width: styles.borderTopWidth },
            { style: styles.borderRightStyle, color: styles.borderRightColor, width: styles.borderRightWidth },
            { style: styles.borderBottomStyle, color: styles.borderBottomColor, width: styles.borderBottomWidth },
            { style: styles.borderLeftStyle, color: styles.borderLeftColor, width: styles.borderLeftWidth },
        ];

        for (const fragment of fragments) {
            const sliceContainer = _makeSliceFragmentContainer(paint.container, fragment);
            const fragCurves = new BoundCurves(sliceContainer);

            let side = 0;
            for (const border of borders) {
                // side 1 = right: skip on all but last fragment
                // side 3 = left:  skip on all but first fragment
                const skipRight = side === 1 && !fragment.isLast;
                const skipLeft = side === 3 && !fragment.isFirst;
                if (
                    !skipRight &&
                    !skipLeft &&
                    border.style !== BORDER_STYLE.NONE &&
                    !isTransparent(border.color) &&
                    border.width > 0
                ) {
                    await renderBorderSide(state, border.color, border.width, side, border.style, fragCurves);
                }
                side++;
            }
        }
    }
}

// ---------------------------------------------------------------------------
// Helper: builds a container with radii suppressed for slice middle fragments
// ---------------------------------------------------------------------------

/** A zero-value LengthPercentageTuple used to suppress border-radius on slice fragments. */
const ZERO_RADIUS: import('../../css/types/length-percentage').LengthPercentageTuple = [ZERO_LENGTH, ZERO_LENGTH];

function _makeSliceFragmentContainer(original: ElementContainer, fragment: InlineFragment): ElementContainer {
    if (fragment.isFirst && fragment.isLast) {
        // Single-line element — keep all radii, use sliceBox (= full border-box).
        return makeFragmentContainer(original, fragment.sliceBox);
    }

    // Suppress radii on the sides that are in the "middle" of the slice.
    // isFirst → keep TL + BL; isLast → keep TR + BR; middle → no radii.
    const fragContainer = makeFragmentContainer(original, fragment.sliceBox);
    const overrideStyles = Object.create(original.styles, {
        borderTopLeftRadius: { value: fragment.isFirst ? original.styles.borderTopLeftRadius : ZERO_RADIUS },
        borderBottomLeftRadius: { value: fragment.isFirst ? original.styles.borderBottomLeftRadius : ZERO_RADIUS },
        borderTopRightRadius: { value: fragment.isLast ? original.styles.borderTopRightRadius : ZERO_RADIUS },
        borderBottomRightRadius: { value: fragment.isLast ? original.styles.borderBottomRightRadius : ZERO_RADIUS },
    });
    return Object.create(fragContainer, {
        styles: { value: overrideStyles },
        bounds: { value: fragment.sliceBox },
    }) as ElementContainer;
}

// ---------------------------------------------------------------------------
// Helper: render box-shadows for a single paint box
// ---------------------------------------------------------------------------

function _renderBoxShadows(state: CanvasRenderState, paint: ElementPaint): void {
    const styles = paint.container.styles;
    styles.boxShadow
        .slice(0)
        .reverse()
        .forEach(shadow => {
            state.ctx.save();
            const borderBoxArea = calculateBorderBoxPath(paint.curves);
            const effectiveSpread = shadow.inset ? -shadow.spread.number : shadow.spread.number;
            const shadowPaintingArea = expandBorderBoxPath(paint.curves, effectiveSpread).map((p: Path) =>
                p.add(shadow.offsetX.number, shadow.offsetY.number),
            );
            if (shadow.inset) {
                canvasPath(state, borderBoxArea);
                state.ctx.clip();
                canvasMask(state, shadowPaintingArea);
            } else {
                canvasMask(state, borderBoxArea);
                state.ctx.clip();
                canvasPath(state, shadowPaintingArea);
            }
            state.ctx.fillStyle = asString(shadow.color);
            if (shadow.blur.number) {
                state.ctx.filter = `blur(${shadow.blur.number / 2}px)`;
            }
            state.ctx.fill();
            state.ctx.restore();
        });
}

// ---------------------------------------------------------------------------
// Border-image 9-slice rendering
// ---------------------------------------------------------------------------

/**
 * Resolves a border-image source to an HTMLImageElement or HTMLCanvasElement.
 * For URL images, fetches from the cache. For gradients, renders to an offscreen canvas.
 */
/**
 * Applies color stops to a CanvasGradient for a repeating-linear-gradient,
 * tiling the stops across [0,1] the same way `renderBackgroundImage` does.
 */
function _applyRepeatingLinearStops(
    gradient: CanvasGradient,
    rawStops: import('../../css/types/image').UnprocessedGradientColorStop[],
    lineLength: number,
): void {
    const processedStops = processColorStops(rawStops, lineLength);
    const tileStart = processedStops[0].stop;
    const tileEnd = processedStops[processedStops.length - 1].stop;
    const tileSize = tileEnd - tileStart;

    if (tileSize <= 0) {
        processedStops.forEach(s => gradient.addColorStop(s.stop, asString(s.color)));
        return;
    }

    const MAX_ITER = 512;
    const allStops: { stop: number; color: import('../../css/types/color').Color }[] = [];

    for (let iter = 1; iter <= MAX_ITER && tileStart - iter * tileSize > -tileSize; iter++) {
        const offset = iter * tileSize;
        processedStops.forEach(s => allStops.push({ stop: Math.max(0, s.stop - offset), color: s.color }));
        if (tileStart - offset <= 0) break;
    }
    processedStops.forEach(s => allStops.push({ stop: s.stop, color: s.color }));
    for (let iter = 1; iter <= MAX_ITER && tileEnd + (iter - 1) * tileSize < 1; iter++) {
        const offset = iter * tileSize;
        processedStops.forEach(s => allStops.push({ stop: Math.min(1, s.stop + offset), color: s.color }));
    }

    if (allStops[0].stop > 0) allStops.unshift({ stop: 0, color: allStops[0].color });
    if (allStops[allStops.length - 1].stop < 1) allStops.push({ stop: 1, color: allStops[allStops.length - 1].color });

    allStops.forEach(s => gradient.addColorStop(s.stop, asString(s.color)));
}

async function _resolveBorderImageSource(
    state: CanvasRenderState,
    source: ICSSImage,
    width: number,
    height: number,
): Promise<HTMLImageElement | HTMLCanvasElement | null> {
    if (source.type === CSSImageType.URL) {
        const url = (source as CSSURLImage).url;
        try {
            return await state.context.cache.match(url);
        } catch (e) {
            state.context.error(`Error loading border-image-source ${url}`, e);
            return null;
        }
    }

    // For gradients, render to an offscreen canvas at the border-image area size
    if (width <= 0 || height <= 0) {
        return null;
    }

    // Not pooled on purpose: this function returns either this canvas or a
    // cache-owned HTMLImageElement (the URL branch above). Callers can't tell
    // which, so recycling it into the pool could reinject a cache-owned image.
    // It's also allocated once per border-image element, so the reuse win is small.
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.ceil(width));
    canvas.height = Math.max(1, Math.ceil(height));
    const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;

    if (isLinearGradient(source) || isRepeatingLinearGradient(source)) {
        const [lineLength, x0, x1, y0, y1] = calculateGradientDirection(source.angle, width, height);
        const gradient = ctx.createLinearGradient(x0, y0, x1, y1);

        if (isRepeatingLinearGradient(source)) {
            _applyRepeatingLinearStops(gradient, source.stops, lineLength || 1);
        } else {
            processColorStops(source.stops, lineLength || 1).forEach(cs =>
                gradient.addColorStop(cs.stop, asString(cs.color)),
            );
        }

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);
    } else if (isRadialGradient(source) || isRepeatingRadialGradient(source)) {
        const position = source.position.length === 0 ? [FIFTY_PERCENT] : source.position;
        const x = getAbsoluteValue(position[0], width);
        const y = getAbsoluteValue(position[position.length - 1], height);
        const [rx, ry] = calculateRadius(source, x, y, width, height);
        if (rx > 0 && ry > 0) {
            const gradient = ctx.createRadialGradient(x, y, 0, x, y, rx);
            processColorStops(source.stops, rx * 2).forEach(cs => gradient.addColorStop(cs.stop, asString(cs.color)));
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, width, height);
        }
    } else if (isConicGradient(source) || isRepeatingConicGradient(source)) {
        if (
            typeof CanvasRenderingContext2D !== 'undefined' &&
            typeof CanvasRenderingContext2D.prototype.createConicGradient === 'function'
        ) {
            const position = source.position.length === 0 ? [FIFTY_PERCENT] : source.position;
            const cx = getAbsoluteValue(position[0], width);
            const cy = getAbsoluteValue(position[position.length - 1], height);
            const conicGrad = ctx.createConicGradient(source.startAngle - Math.PI / 2, cx, cy);
            processColorStops(source.stops, 360).forEach(cs => conicGrad.addColorStop(cs.stop, asString(cs.color)));
            ctx.fillStyle = conicGrad;
            ctx.fillRect(0, 0, width, height);
        }
    }

    return canvas;
}

/**
 * Resolves a border-image-width value to an absolute pixel size.
 */
function _resolveBorderImageWidth(
    val: BorderImageWidthValue,
    borderWidth: number,
    borderImageAreaSize: number,
    sliceValue: number,
): number {
    switch (val.type) {
        case 'length':
            return val.value;
        case 'percentage':
            return (val.value / 100) * borderImageAreaSize;
        case 'number':
            return val.value * borderWidth;
        case 'auto':
            // 'auto' uses the corresponding slice value
            return sliceValue;
    }
}

/**
 * Renders the border-image for an element using the CSS 9-slice algorithm.
 *
 * Per the CSS spec, when border-image-source is set and loads successfully,
 * it replaces the normal border drawing entirely.
 *
 * @returns true if border-image was rendered (callers should skip normal borders)
 */
async function _renderBorderImage(state: CanvasRenderState, paint: ElementPaint): Promise<boolean> {
    const styles = paint.container.styles;
    const source = styles.borderImageSource;

    if (!source) {
        return false;
    }

    const bounds = paint.container.bounds;

    // Resolve outset to expand the border-image area beyond the border box
    const outset = styles.borderImageOutset;
    const outsetTop = outset[0].type === 'number' ? outset[0].value * styles.borderTopWidth : outset[0].value;
    const outsetRight = outset[1].type === 'number' ? outset[1].value * styles.borderRightWidth : outset[1].value;
    const outsetBottom = outset[2].type === 'number' ? outset[2].value * styles.borderBottomWidth : outset[2].value;
    const outsetLeft = outset[3].type === 'number' ? outset[3].value * styles.borderLeftWidth : outset[3].value;

    // Border-image area (border box expanded by outset)
    const areaLeft = bounds.left - outsetLeft;
    const areaTop = bounds.top - outsetTop;
    const areaWidth = bounds.width + outsetLeft + outsetRight;
    const areaHeight = bounds.height + outsetTop + outsetBottom;

    // For URL images, load at actual size.
    // For gradients, we need to know the widths first to pick the right render size,
    // so we do a two-step: render at area size to resolve slices/widths, then re-render
    // at tile size if needed for repeat modes.
    // Actually simpler: render at area size, use it for corners + stretch edges,
    // and for repeat/round/space edges render a separate small canvas at tile size.

    // Step 1 — load/render source at full area size (used for corners & slice math)
    const img = await _resolveBorderImageSource(state, source, areaWidth, areaHeight);
    if (!img || img.width <= 0 || img.height <= 0) {
        return false;
    }

    const imgW = img.width;
    const imgH = img.height;

    // Resolve slice values (top, right, bottom, left) into pixel offsets in the source image
    const slice = styles.borderImageSlice;
    const sliceTop = slice.percentages[0] ? (slice.values[0] / 100) * imgH : Math.min(slice.values[0], imgH);
    const sliceRight = slice.percentages[1] ? (slice.values[1] / 100) * imgW : Math.min(slice.values[1], imgW);
    const sliceBottom = slice.percentages[2] ? (slice.values[2] / 100) * imgH : Math.min(slice.values[2], imgH);
    const sliceLeft = slice.percentages[3] ? (slice.values[3] / 100) * imgW : Math.min(slice.values[3], imgW);

    // Resolve border-image-width (top, right, bottom, left)
    const biw = styles.borderImageWidth;
    const widthTop = _resolveBorderImageWidth(biw[0], styles.borderTopWidth, areaHeight, sliceTop);
    const widthRight = _resolveBorderImageWidth(biw[1], styles.borderRightWidth, areaWidth, sliceRight);
    const widthBottom = _resolveBorderImageWidth(biw[2], styles.borderBottomWidth, areaHeight, sliceBottom);
    const widthLeft = _resolveBorderImageWidth(biw[3], styles.borderLeftWidth, areaWidth, sliceLeft);

    // Repeat modes: [horizontal, vertical]
    const [repeatH, repeatV] = styles.borderImageRepeat;

    // Source middle dimensions
    const srcMiddleW = imgW - sliceLeft - sliceRight;
    const srcMiddleH = imgH - sliceTop - sliceBottom;

    // Destination middle dimensions
    const dstMiddleW = areaWidth - widthLeft - widthRight;
    const dstMiddleH = areaHeight - widthTop - widthBottom;

    // Step 2 — source image is rendered once at full area size.
    // All 9 regions are extracted from this single image, preserving gradient continuity.
    // For repeat/round/space, we use CanvasPattern on a per-tile canvas extracted
    // from the source region, scaled to border-image-width.

    const ctx = state.ctx;

    // --- 4 Corners (always stretched with drawImage) ---

    const _corner = (
        sx: number,
        sy: number,
        sw: number,
        sh: number,
        dx: number,
        dy: number,
        dw: number,
        dh: number,
    ) => {
        if (sw > 0 && sh > 0 && dw > 0 && dh > 0) {
            ctx.drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh);
        }
    };

    _corner(0, 0, sliceLeft, sliceTop, areaLeft, areaTop, widthLeft, widthTop);
    _corner(
        imgW - sliceRight,
        0,
        sliceRight,
        sliceTop,
        areaLeft + areaWidth - widthRight,
        areaTop,
        widthRight,
        widthTop,
    );
    _corner(
        imgW - sliceRight,
        imgH - sliceBottom,
        sliceRight,
        sliceBottom,
        areaLeft + areaWidth - widthRight,
        areaTop + areaHeight - widthBottom,
        widthRight,
        widthBottom,
    );
    _corner(
        0,
        imgH - sliceBottom,
        sliceLeft,
        sliceBottom,
        areaLeft,
        areaTop + areaHeight - widthBottom,
        widthLeft,
        widthBottom,
    );

    // --- 4 Edges + Center ---
    // For gradient sources, we render each tile directly at its final size to preserve
    // gradient continuity and avoid period compression. For URL images, we extract from img.

    const _makeTile = async (
        sx: number,
        sy: number,
        sw: number,
        sh: number,
        tileW: number,
        tileH: number,
    ): Promise<HTMLCanvasElement> => {
        const c = state.canvasPool.acquire(Math.round(tileW), Math.round(tileH));
        const cCtx = c.getContext('2d') as CanvasRenderingContext2D;
        // Always extract from the full source image (img) and scale to tile size.
        // This preserves gradient continuity and angle between corners and edges —
        // the same approach Chromium uses (uniform tile_scale from one source image).
        cCtx.drawImage(img, sx, sy, sw, sh, 0, 0, c.width, c.height);
        return c;
    };

    const _edge = async (
        sx: number,
        sy: number,
        sw: number,
        sh: number,
        dx: number,
        dy: number,
        dw: number,
        dh: number,
        repeat: BORDER_IMAGE_REPEAT,
        tileW: number,
        tileH: number,
        isHorizontal: boolean, // true for top/bottom edges, false for left/right
    ): Promise<void> => {
        if (sw <= 0 || sh <= 0 || dw <= 0 || dh <= 0 || tileW <= 0 || tileH <= 0) return;

        if (repeat === BORDER_IMAGE_REPEAT.STRETCH) {
            ctx.drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh);
            return;
        }

        // For ROUND, compute the final tile dimensions before rendering the tile so
        // the gradient is rendered at the exact size it will be drawn (no resampling).
        let finalTileW = tileW;
        let finalTileH = tileH;
        if (repeat === BORDER_IMAGE_REPEAT.ROUND) {
            if (isHorizontal) {
                // H-edge: free axis = W, fixed axis H = dh
                const n = Math.max(1, Math.round(dw / tileW));
                finalTileW = dw / n;
                finalTileH = dh;
            } else {
                // V-edge: free axis = H, fixed axis W = dw
                const m = Math.max(1, Math.round(dh / tileH));
                finalTileH = dh / m;
                finalTileW = dw;
            }
        }

        const tileCanvas = await _makeTile(sx, sy, sw, sh, finalTileW, finalTileH);

        ctx.save();
        ctx.beginPath();
        ctx.rect(dx, dy, dw, dh);
        ctx.clip();

        if (repeat === BORDER_IMAGE_REPEAT.SPACE) {
            const nx = Math.floor(dw / finalTileW);
            const ny = Math.floor(dh / finalTileH);
            if (nx <= 0 || ny <= 0) {
                // Tile larger than destination — don't draw (per Chromium behavior)
                ctx.restore();
                state.canvasPool.release(tileCanvas);
                return;
            }
            const gapX = nx > 1 ? (dw - nx * finalTileW) / (nx - 1) : 0;
            const gapY = ny > 1 ? (dh - ny * finalTileH) / (ny - 1) : 0;
            const startX = nx <= 1 ? (dw - finalTileW) / 2 : 0;
            const startY = ny <= 1 ? (dh - finalTileH) / 2 : 0;
            for (let row = 0; row < ny; row++) {
                const y = startY + row * (finalTileH + gapY);
                for (let col = 0; col < nx; col++) {
                    const x = startX + col * (finalTileW + gapX);
                    ctx.drawImage(tileCanvas, dx + x, dy + y, finalTileW, finalTileH);
                }
            }
        } else if (repeat === BORDER_IMAGE_REPEAT.ROUND) {
            for (let y = 0; y < dh - 0.5; y += finalTileH) {
                for (let x = 0; x < dw - 0.5; x += finalTileW) {
                    ctx.drawImage(tileCanvas, dx + x, dy + y, finalTileW, finalTileH);
                }
            }
        } else {
            // REPEAT: center on the free axis
            let offsetX = 0;
            let offsetY = 0;
            if (isHorizontal) {
                offsetX = (dw % finalTileW) / 2 - finalTileW;
            } else {
                offsetY = (dh % finalTileH) / 2 - finalTileH;
            }
            const pm = state.canvasPool.acquire(Math.round(finalTileW), Math.round(finalTileH));
            (pm.getContext('2d') as CanvasRenderingContext2D).drawImage(tileCanvas, 0, 0, pm.width, pm.height);
            const pat = ctx.createPattern(pm, 'repeat');
            if (pat) {
                const mat = new DOMMatrix();
                mat.translateSelf(dx + offsetX, dy + offsetY);
                pat.setTransform(mat);
                ctx.fillStyle = pat;
                // createPattern sampled pm synchronously; fillRect consumes it now,
                // so the pattern source can be recycled after this fill.
                ctx.fillRect(dx, dy, dw, dh);
            }
            state.canvasPool.release(pm);
        }

        ctx.restore();

        // Recycle the tile canvas now that all draws referencing it are done.
        state.canvasPool.release(tileCanvas);
    };

    // Tile size per CSS spec (same formula for gradients and URL images):
    // H-edge: tile = (srcMiddleW × scale) × widthTop, where scale = widthTop / sliceTop
    // V-edge: tile = widthLeft × (srcMiddleH × scale), where scale = widthLeft / sliceLeft
    // For gradients, _makeTile renders the gradient fresh at this exact size.
    // For URL images, _makeTile extracts and scales the source slice.
    const tileWforH = sliceTop > 0 ? srcMiddleW * (widthTop / sliceTop) : srcMiddleW;
    const tileHforH = widthTop;
    const tileWforHB = sliceBottom > 0 ? srcMiddleW * (widthBottom / sliceBottom) : srcMiddleW;
    const tileHforHB = widthBottom;
    const tileWforV = widthLeft;
    const tileHforV = sliceLeft > 0 ? srcMiddleH * (widthLeft / sliceLeft) : srcMiddleH;
    const tileWforVR = widthRight;
    const tileHforVR = sliceRight > 0 ? srcMiddleH * (widthRight / sliceRight) : srcMiddleH;

    // Top edge
    if (srcMiddleW > 0 && sliceTop > 0 && dstMiddleW > 0 && widthTop > 0) {
        await _edge(
            sliceLeft,
            0,
            srcMiddleW,
            sliceTop,
            areaLeft + widthLeft,
            areaTop,
            dstMiddleW,
            widthTop,
            repeatH,
            tileWforH,
            tileHforH,
            true,
        );
    }
    // Bottom edge
    if (srcMiddleW > 0 && sliceBottom > 0 && dstMiddleW > 0 && widthBottom > 0) {
        await _edge(
            sliceLeft,
            imgH - sliceBottom,
            srcMiddleW,
            sliceBottom,
            areaLeft + widthLeft,
            areaTop + areaHeight - widthBottom,
            dstMiddleW,
            widthBottom,
            repeatH,
            tileWforHB,
            tileHforHB,
            true,
        );
    }
    // Right edge
    if (sliceRight > 0 && srcMiddleH > 0 && widthRight > 0 && dstMiddleH > 0) {
        await _edge(
            imgW - sliceRight,
            sliceTop,
            sliceRight,
            srcMiddleH,
            areaLeft + areaWidth - widthRight,
            areaTop + widthTop,
            widthRight,
            dstMiddleH,
            repeatV,
            tileWforVR,
            tileHforVR,
            false,
        );
    }
    // Left edge
    if (sliceLeft > 0 && srcMiddleH > 0 && widthLeft > 0 && dstMiddleH > 0) {
        await _edge(
            0,
            sliceTop,
            sliceLeft,
            srcMiddleH,
            areaLeft,
            areaTop + widthTop,
            widthLeft,
            dstMiddleH,
            repeatV,
            tileWforV,
            tileHforV,
            false,
        );
    }
    // Center (fill)
    if (slice.fill && srcMiddleW > 0 && srcMiddleH > 0 && dstMiddleW > 0 && dstMiddleH > 0) {
        const scaleW = sliceTop > 0 ? widthTop / sliceTop : 1;
        await _edge(
            sliceLeft,
            sliceTop,
            srcMiddleW,
            srcMiddleH,
            areaLeft + widthLeft,
            areaTop + widthTop,
            dstMiddleW,
            dstMiddleH,
            repeatH,
            srcMiddleW * scaleW,
            srcMiddleH * scaleW,
            true,
        );
    }

    return true;
}

// ---------------------------------------------------------------------------
// Single-box background + borders renderer (block elements & clone fragments)
// ---------------------------------------------------------------------------

async function _renderSingleBoxBackgroundAndBorders(state: CanvasRenderState, paint: ElementPaint): Promise<void> {
    const styles = paint.container.styles;
    const hasBackground = !isTransparent(styles.backgroundColor) || styles.backgroundImage.length;

    const borders = [
        { style: styles.borderTopStyle, color: styles.borderTopColor, width: styles.borderTopWidth },
        { style: styles.borderRightStyle, color: styles.borderRightColor, width: styles.borderRightWidth },
        { style: styles.borderBottomStyle, color: styles.borderBottomColor, width: styles.borderBottomWidth },
        { style: styles.borderLeftStyle, color: styles.borderLeftColor, width: styles.borderLeftWidth },
    ];
    // Compute the broadest background-clip among all layers as the outer clip.
    // Individual per-layer clipping is handled inside renderBackgroundImage.
    // Order: BORDER_BOX (0) > PADDING_BOX (1) > CONTENT_BOX (2) > TEXT (3)
    let broadestClip = getBackgroundValueForIndex(styles.backgroundClip, 0);
    for (let i = 1; i < styles.backgroundClip.length; i++) {
        const clip = styles.backgroundClip[i];
        if (clip === BACKGROUND_CLIP.BORDER_BOX) {
            broadestClip = BACKGROUND_CLIP.BORDER_BOX;
            break;
        }
        if (clip === BACKGROUND_CLIP.PADDING_BOX && broadestClip !== BACKGROUND_CLIP.BORDER_BOX) {
            broadestClip = BACKGROUND_CLIP.PADDING_BOX;
        }
    }
    const backgroundPaintingArea = calculateBackgroundCurvedPaintingArea(broadestClip, paint.curves);

    if (hasBackground || styles.boxShadow.length) {
        const isBackgroundClipText = getBackgroundValueForIndex(styles.backgroundClip, 0) === BACKGROUND_CLIP.TEXT;

        if (isBackgroundClipText && hasBackground) {
            await renderBackgroundClipText(state, paint);
        } else if (hasBackground) {
            // Background color: clip to the broadest area
            if (!isTransparent(styles.backgroundColor)) {
                state.ctx.save();
                canvasPath(state, backgroundPaintingArea);
                state.ctx.clip();
                state.ctx.fillStyle = asString(styles.backgroundColor);
                state.ctx.fill();
                state.ctx.restore();
            }

            // Background images: clip each layer to its own per-layer background-clip
            // using curved paths (respects border-radius)
            const hasMultipleClips = styles.backgroundClip.length > 1;
            if (hasMultipleClips) {
                // Render each layer individually with its own curved clip
                await renderBackgroundImagePerLayer(state, paint, paint.container);
            } else {
                // Single clip for all layers (common case, more efficient)
                state.ctx.save();
                canvasPath(state, backgroundPaintingArea);
                state.ctx.clip();
                await renderBackgroundImage(state, paint.container);
                state.ctx.restore();
            }
        }

        _renderBoxShadows(state, paint);
    }

    // When border-image-source is set, it replaces normal border rendering.
    const borderImageRendered = await _renderBorderImage(state, paint);

    if (!borderImageRendered) {
        // Fast path: a fully uniform solid border (all four sides same style,
        // colour and width, all visible, and no fieldset legend gap) is painted
        // as a single continuous ring to avoid diagonal miter seams between the
        // separately-filled sides. See renderUniformSolidBorder.
        if (_isUniformSolidBorder(borders) && !paint.container.legendBounds) {
            renderUniformSolidBorder(state, borders[0].color, paint.curves);
        } else {
            let side = 0;
            for (const border of borders) {
                if (border.style !== BORDER_STYLE.NONE && !isTransparent(border.color) && border.width > 0) {
                    // For the top border of a <fieldset> with a <legend>, punch a gap
                    // where the legend sits so the border visually wraps around it.
                    const legendBounds = side === 0 ? paint.container.legendBounds : undefined;
                    if (legendBounds) {
                        await _renderFieldsetTopBorder(state, paint, border, legendBounds);
                    } else {
                        await renderBorderSide(state, border.color, border.width, side, border.style, paint.curves);
                    }
                }
                side++;
            }
        }
    }
}

/**
 * True when all four borders are solid, visible, and share the same colour and
 * width — the case a browser paints as one continuous ring. Only then is it safe
 * to replace the four per-side fills with a single ring fill.
 */
function _isUniformSolidBorder(
    borders: { style: BORDER_STYLE; color: import('../../css/types/color').Color; width: number }[],
): boolean {
    const [top, right, bottom, left] = borders;
    return (
        top.style === BORDER_STYLE.SOLID &&
        right.style === BORDER_STYLE.SOLID &&
        bottom.style === BORDER_STYLE.SOLID &&
        left.style === BORDER_STYLE.SOLID &&
        top.width > 0 &&
        right.width > 0 &&
        bottom.width > 0 &&
        left.width > 0 &&
        !isTransparent(top.color) &&
        top.color === right.color &&
        top.color === bottom.color &&
        top.color === left.color &&
        top.width === right.width &&
        top.width === bottom.width &&
        top.width === left.width
    );
}

// ---------------------------------------------------------------------------
// Fieldset top-border with legend gap
// ---------------------------------------------------------------------------

/**
 * Renders the top border of a <fieldset> with a gap punched out where the
 * <legend> sits, matching how browsers wrap the border around the legend.
 *
 * Strategy: apply an even-odd clip built from two rects — the full canvas area
 * (outer) and the legend gap (inner). The evenodd fill rule turns the inner rect
 * into a hole, so the border paints everywhere except behind the legend. The clip
 * is scoped by ctx.save()/ctx.restore() so it does not affect subsequent drawing.
 */
async function _renderFieldsetTopBorder(
    state: CanvasRenderState,
    paint: ElementPaint,
    border: { style: BORDER_STYLE; color: import('../../css/types/color').Color; width: number },
    legendBounds: import('../../css/layout/bounds').Bounds,
): Promise<void> {
    const ctx = state.ctx;
    const scale = state.options.scale;

    // The actual top border edge: legend vertical centre minus half border thickness.
    // bounds.top == legendBounds.top in Chromium (fieldset bounding rect starts at
    // the legend top, not the border top), so we compute border position from legendBounds.
    const borderTopY = legendBounds.top + legendBounds.height / 2 - border.width / 2;

    // Gap horizontal: half border-width padding on each side (matches browsers).
    const gap = border.width / 2;
    const gapLeft = legendBounds.left - gap;
    const gapWidth = legendBounds.width + gap * 2;
    // Gap vertical: the actual border stripe + 1px antialiasing margin on each side.
    const gapTop = borderTopY - 1;
    const gapHeight = border.width + 2;

    // Outer rect in page-space coordinates (same CTM as main canvas).
    // Must be large enough to cover the entire renderable area.
    const pageW = state.canvas.width / scale;
    const pageH = state.canvas.height / scale;
    const outerLeft = state.options.x - 1;
    const outerTop = state.options.y - 1;

    ctx.save();
    // Build an even-odd clip with two rects: the full canvas area (outer) and the
    // legend gap (inner). With the evenodd fill rule the inner rect becomes a hole,
    // so the border is drawn everywhere except behind the legend. We use the direct
    // ctx.beginPath()/ctx.rect() path API (a Path2D-based clip did not behave
    // consistently across Chromium versions here).
    ctx.beginPath();
    ctx.rect(outerLeft, outerTop, pageW + 2, pageH + 2);
    ctx.rect(gapLeft, gapTop, gapWidth, gapHeight);
    ctx.clip('evenodd');

    await renderBorderSide(state, border.color, border.width, 0, border.style, paint.curves);

    ctx.restore();
}
