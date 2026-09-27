import { Context } from '../../core/context';
import { IMAGE_RENDERING } from '../../css/property-descriptors/image-rendering';
import { BezierCurve, isBezierCurve } from '../bezier-curve';
import { FontMetrics } from '../font-metrics';
import { Path, reversePath } from '../path';
import { Vector } from '../vector';
import { CanvasPool } from './canvas-pool';
import { RenderConfigurations } from './canvas-renderer';

/**
 * Shared mutable state passed to all sub-renderers.
 * canvas/ctx can be temporarily swapped during offscreen rendering.
 */
export interface CanvasRenderState {
    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;
    options: RenderConfigurations;
    context: Context;
    fontMetrics: FontMetrics;
    isFirefox: boolean;
    isChrome: boolean;
    /** Pool of reusable offscreen canvases for temporary rendering. */
    canvasPool: CanvasPool;
    /**
     * Memoises resized-image canvases keyed by source + target size, so a
     * background image drawn at the same size on several elements is only
     * rescaled once. Canvases stored here are owned by the cache and must NOT
     * be returned to `canvasPool`.
     */
    resizeCache: Map<string, HTMLCanvasElement>;
    /**
     * Memoises painted linear-gradient source canvases keyed by gradient shape +
     * size, so the same gradient reused across elements is only rasterised once.
     * As with resizeCache, these canvases are owned by the cache and must NOT be
     * returned to `canvasPool`. A fresh CanvasPattern is created per use, since a
     * pattern is bound to the context that created it.
     */
    gradientCanvasCache: Map<string, HTMLCanvasElement>;
}

// ---------------------------------------------------------------------------
// Image smoothing resolution
// ---------------------------------------------------------------------------

/**
 * Resolves the effective image-smoothing settings for a given element, applying
 * the precedence rule:
 *
 *   forceImageQuality === true   -> always use the global options (ignore CSS)
 *   otherwise                    -> the element's CSS `image-rendering` wins when
 *                                   it is not `auto`; if it is `auto`, fall back
 *                                   to the global options.
 *
 * `pixelated` and `crisp-edges` disable smoothing; `smooth` forces it on (high
 * quality); `auto` defers to the global default.
 *
 * Returns the enabled flag and quality so callers can apply them to whichever
 * context actually performs the draw/scale (main context or an offscreen resize).
 */
export function resolveImageSmoothing(
    state: CanvasRenderState,
    imageRendering: IMAGE_RENDERING,
): { enabled: boolean; quality: ImageSmoothingQuality } {
    const globalEnabled = state.options.imageSmoothing ?? true;
    const globalQuality = state.options.imageSmoothingQuality ?? 'low';

    if (state.options.forceImageQuality || imageRendering === IMAGE_RENDERING.AUTO) {
        return { enabled: globalEnabled, quality: globalQuality };
    }

    switch (imageRendering) {
        case IMAGE_RENDERING.PIXELATED:
        case IMAGE_RENDERING.CRISP_EDGES:
            return { enabled: false, quality: globalQuality };
        case IMAGE_RENDERING.SMOOTH:
            return { enabled: true, quality: 'high' };
        default:
            return { enabled: globalEnabled, quality: globalQuality };
    }
}

// ---------------------------------------------------------------------------
// Low-level path primitives
// These are plain functions so any renderer can call them without inheritance.
// ---------------------------------------------------------------------------

export function formatPath(ctx: CanvasRenderingContext2D, paths: Path[]): void {
    paths.forEach((point, index) => {
        const start: Vector = isBezierCurve(point) ? point.start : point;
        if (index === 0) {
            ctx.moveTo(start.x, start.y);
        } else {
            ctx.lineTo(start.x, start.y);
        }
        if (isBezierCurve(point)) {
            ctx.bezierCurveTo(
                (point as BezierCurve).startControl.x,
                (point as BezierCurve).startControl.y,
                (point as BezierCurve).endControl.x,
                (point as BezierCurve).endControl.y,
                (point as BezierCurve).end.x,
                (point as BezierCurve).end.y,
            );
        }
    });
}

export function canvasPath(state: CanvasRenderState, paths: Path[]): void {
    state.ctx.beginPath();
    formatPath(state.ctx, paths);
    state.ctx.closePath();
}

export function canvasMask(state: CanvasRenderState, paths: Path[]): void {
    state.ctx.beginPath();
    state.ctx.save();
    state.ctx.setTransform(1, 0, 0, 1, 0, 0);
    state.ctx.moveTo(0, 0);
    state.ctx.lineTo(state.canvas.width, 0);
    state.ctx.lineTo(state.canvas.width, state.canvas.height);
    state.ctx.lineTo(0, state.canvas.height);
    state.ctx.lineTo(0, 0);
    state.ctx.restore();
    formatPath(state.ctx, reversePath(paths));
    state.ctx.closePath();
}

export function renderRepeat(
    state: CanvasRenderState,
    path: Path[],
    pattern: CanvasPattern | CanvasGradient,
    offsetX: number,
    offsetY: number,
): void {
    canvasPath(state, path);
    state.ctx.fillStyle = pattern;
    state.ctx.translate(offsetX, offsetY);
    state.ctx.fill();
    state.ctx.translate(-offsetX, -offsetY);
}

export function resizeImage(
    state: CanvasRenderState,
    image: HTMLImageElement,
    width: number,
    height: number,
    smoothing?: { enabled: boolean; quality: ImageSmoothingQuality },
): HTMLCanvasElement | HTMLImageElement {
    // Note: the "return image unchanged when sizes match" shortcut is deliberately
    // NOT used — it triggers "Operation is insecure" on Safari (see upstream
    // niklasvh/html2canvas#2911). We always draw to a canvas, but memoise the
    // result so identical (source, size) requests reuse it.
    // The smoothing mode is part of the cache key so a crisp (pixelated) resize
    // and a smooth resize of the same source+size don't collide.
    const smoothingKey = smoothing ? `|${smoothing.enabled ? 's' : 'n'}${smoothing.quality}` : '';
    const key = `${image.src}|${width}|${height}${smoothingKey}`;

    const cached = state.resizeCache.get(key);
    if (cached) {
        return cached;
    }

    // Dimensions computed exactly as before (the canvas.width/height setters
    // truncate to integers) to keep pixel output identical; only add caching.
    const ownerDocument = state.canvas.ownerDocument ?? document;
    const canvas = ownerDocument.createElement('canvas');
    canvas.width = Math.max(1, width);
    canvas.height = Math.max(1, height);
    const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
    if (smoothing) {
        ctx.imageSmoothingEnabled = smoothing.enabled;
        ctx.imageSmoothingQuality = smoothing.quality;
    }
    ctx.drawImage(image, 0, 0, image.width, image.height, 0, 0, width, height);

    // Owned by the resize cache — never released to canvasPool.
    state.resizeCache.set(key, canvas);
    return canvas;
}

/**
 * Returns a canvas containing a rasterised linear gradient, memoised by `key`.
 *
 * `key` must uniquely describe the gradient's appearance at the requested size
 * (type, angle, stops, width, height). `paint` receives a fresh 2D context and
 * must draw the gradient into it (it is only called on a cache miss).
 *
 * The returned canvas is owned by the gradient cache and must NOT be released
 * to `canvasPool`. Callers create their own CanvasPattern from it, since a
 * pattern is bound to the context that created it.
 */
export function getLinearGradientCanvas(
    state: CanvasRenderState,
    key: string,
    width: number,
    height: number,
    paint: (ctx: CanvasRenderingContext2D, w: number, h: number) => void,
): HTMLCanvasElement {
    const cached = state.gradientCanvasCache.get(key);
    if (cached) {
        return cached;
    }

    const ownerDocument = state.canvas.ownerDocument ?? document;
    const canvas = ownerDocument.createElement('canvas');
    canvas.width = Math.max(1, width);
    canvas.height = Math.max(1, height);
    const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
    paint(ctx, width, height);

    state.gradientCanvasCache.set(key, canvas);
    return canvas;
}
