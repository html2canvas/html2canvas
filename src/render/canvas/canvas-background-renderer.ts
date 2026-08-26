import { Bounds } from '../../css/layout/bounds';
import { segmentGraphemes } from '../../css/layout/text';
import { BACKGROUND_CLIP } from '../../css/property-descriptors/background-clip';
import { BORDER_STYLE } from '../../css/property-descriptors/border-style';
import { DIRECTION } from '../../css/property-descriptors/direction';
import { DISPLAY } from '../../css/property-descriptors/display';
import { WRITING_MODE } from '../../css/property-descriptors/writing-mode';
import { asString, isTransparent } from '../../css/types/color';
import { calculateGradientDirection, calculateRadius, processColorStops } from '../../css/types/functions/gradient';
import {
    CSSImageType,
    CSSURLImage,
    isConicGradient,
    isLinearGradient,
    isRadialGradient,
    isRepeatingConicGradient,
    isRepeatingLinearGradient,
    isRepeatingRadialGradient,
} from '../../css/types/image';
import { FIFTY_PERCENT, getAbsoluteValue } from '../../css/types/length-percentage';
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
    CanvasRenderState,
    canvasMask,
    canvasPath,
    formatPath,
    renderRepeat,
    resizeImage,
} from './canvas-render-state';
import { createFontStyle } from './canvas-text-renderer';

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
                state.context.logger.error(`Error loading background-image ${url}`);
            }

            if (image && image.width > 0 && image.height > 0) {
                const [path, x, y, width, height] = calculateBackgroundRendering(container, index, [
                    image.width,
                    image.height,
                    image.width / image.height,
                ]);
                const pattern = state.ctx.createPattern(
                    resizeImage(state, image, width, height),
                    'repeat',
                ) as CanvasPattern;
                renderRepeat(state, path, pattern, x, y);
            }
        } else if (isLinearGradient(backgroundImage)) {
            const [path, x, y, width, height] = calculateBackgroundRendering(container, index, [null, null, null]);
            const [lineLength, x0, x1, y0, y1] = calculateGradientDirection(backgroundImage.angle, width, height);

            const canvas = document.createElement('canvas');
            canvas.width = Math.max(1, width);
            canvas.height = Math.max(1, height);
            const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
            const gradient = ctx.createLinearGradient(x0, y0, x1, y1);

            processColorStops(backgroundImage.stops, lineLength || 1).forEach(colorStop =>
                gradient.addColorStop(colorStop.stop, asString(colorStop.color)),
            );

            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, width, height);
            if (width > 0 && height > 0) {
                const pattern = state.ctx.createPattern(canvas, 'repeat') as CanvasPattern;
                renderRepeat(state, path, pattern, x, y);
            }
        } else if (isRepeatingLinearGradient(backgroundImage)) {
            const [path, x, y, width, height] = calculateBackgroundRendering(container, index, [null, null, null]);
            const [lineLength, x0, x1, y0, y1] = calculateGradientDirection(backgroundImage.angle, width, height);

            const canvas = document.createElement('canvas');
            canvas.width = Math.max(1, width);
            canvas.height = Math.max(1, height);
            const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
            const gradient = ctx.createLinearGradient(x0, y0, x1, y1);

            // processColorStops normalises stops to [0,1] relative to lineLength
            const processedStops = processColorStops(backgroundImage.stops, lineLength || 1);
            const tileStart = processedStops[0].stop;
            const tileEnd = processedStops[processedStops.length - 1].stop;
            const tileSize = tileEnd - tileStart;

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

                allStops.forEach(s => gradient.addColorStop(s.stop, asString(s.color)));
            } else {
                processedStops.forEach(s => gradient.addColorStop(s.stop, asString(s.color)));
            }

            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, width, height);
            if (width > 0 && height > 0) {
                const pattern = state.ctx.createPattern(canvas, 'repeat') as CanvasPattern;
                renderRepeat(state, path, pattern, x, y);
            }
        } else if (isRadialGradient(backgroundImage)) {
            const [path, left, top, width, height] = calculateBackgroundRendering(container, index, [null, null, null]);
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
            const [path, left, top, width, height] = calculateBackgroundRendering(container, index, [null, null, null]);
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
                const [path, left, top, width, height] = calculateBackgroundRendering(container, index, [
                    null,
                    null,
                    null,
                ]);
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
                const [path, left, top, width, height] = calculateBackgroundRendering(container, index, [
                    null,
                    null,
                    null,
                ]);
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

    const offscreen = document.createElement('canvas');
    offscreen.width = width;
    offscreen.height = height;
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
    const maskCanvas = document.createElement('canvas');
    maskCanvas.width = width;
    maskCanvas.height = height;
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
                if (styles.letterSpacing === 0) {
                    if (!state.isFirefox) {
                        maskCtx.textBaseline = 'ideographic';
                        maskCtx.fillText(
                            textBound.text,
                            textBound.bounds.left,
                            textBound.bounds.top + textBound.bounds.height,
                        );
                    } else {
                        maskCtx.textBaseline = 'alphabetic';
                        maskCtx.fillText(textBound.text, textBound.bounds.left, textBound.bounds.top + baseline);
                    }
                } else {
                    maskCtx.textBaseline = 'alphabetic';
                    const letters = segmentGraphemes(textBound.text);
                    letters.reduce((left, letter, index) => {
                        maskCtx.fillText(letter, left, textBound.bounds.top + baseline);
                        const isLast = index === letters.length - 1;
                        return left + maskCtx.measureText(letter).width + (isLast ? 0 : styles.letterSpacing - 1);
                    }, textBound.bounds.left);
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
    canvasPath(state, parsePathForBorder(curvePoints, side));
    state.ctx.fillStyle = asString(color);
    state.ctx.fill();
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
    const hasBackground = !isTransparent(styles.backgroundColor) || styles.backgroundImage.length;

    const borders = [
        { style: styles.borderTopStyle, color: styles.borderTopColor, width: styles.borderTopWidth },
        { style: styles.borderRightStyle, color: styles.borderRightColor, width: styles.borderRightWidth },
        { style: styles.borderBottomStyle, color: styles.borderBottomColor, width: styles.borderBottomWidth },
        { style: styles.borderLeftStyle, color: styles.borderLeftColor, width: styles.borderLeftWidth },
    ];
    const backgroundPaintingArea = calculateBackgroundCurvedPaintingArea(
        getBackgroundValueForIndex(styles.backgroundClip, 0),
        paint.curves,
    );

    if (hasBackground || styles.boxShadow.length) {
        const isBackgroundClipText = getBackgroundValueForIndex(styles.backgroundClip, 0) === BACKGROUND_CLIP.TEXT;

        if (isBackgroundClipText && hasBackground) {
            await renderBackgroundClipText(state, paint);
        } else if (hasBackground) {
            state.ctx.save();
            canvasPath(state, backgroundPaintingArea);
            state.ctx.clip();

            if (!isTransparent(styles.backgroundColor)) {
                state.ctx.fillStyle = asString(styles.backgroundColor);

                if (styles.display === DISPLAY.INLINE) {
                    for (const textNode of paint.container.textNodes) {
                        for (const textBound of textNode.textBounds) {
                            state.ctx.fillRect(
                                textBound.bounds.left,
                                textBound.bounds.top,
                                textBound.bounds.width,
                                textBound.bounds.height,
                            );
                        }
                    }
                } else {
                    state.ctx.fill();
                }
            }

            await renderBackgroundImage(state, paint.container);
            state.ctx.restore();
        }

        styles.boxShadow
            .slice(0)
            .reverse()
            .forEach(shadow => {
                state.ctx.save();
                const borderBoxArea = calculateBorderBoxPath(paint.curves);
                // Build the painting area by applying offset and spread.
                // expandBorderBoxPath rebuilds the Bézier curves with adjusted radii
                // (border-radius ± spread) per the CSS spec, unlike transformPath which
                // only translates corners without updating the curve geometry.
                // ctx.filter = blur() is the sole blur mechanism, avoiding the double-blur
                // that occurred when both ctx.shadowBlur and ctx.filter were set simultaneously.
                // See https://github.com/html2canvas/html2canvas/issues/21
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

    let side = 0;
    for (const border of borders) {
        if (border.style !== BORDER_STYLE.NONE && !isTransparent(border.color) && border.width > 0) {
            if (border.style === BORDER_STYLE.DASHED) {
                await renderDashedDottedBorder(
                    state,
                    border.color,
                    border.width,
                    side,
                    paint.curves,
                    BORDER_STYLE.DASHED,
                );
            } else if (border.style === BORDER_STYLE.DOTTED) {
                await renderDashedDottedBorder(
                    state,
                    border.color,
                    border.width,
                    side,
                    paint.curves,
                    BORDER_STYLE.DOTTED,
                );
            } else if (border.style === BORDER_STYLE.DOUBLE) {
                await renderDoubleBorder(state, border.color, border.width, side, paint.curves);
            } else {
                await renderSolidBorder(state, border.color, side, paint.curves);
            }
        }
        side++;
    }
}
