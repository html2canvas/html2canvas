import { Context } from '../../core/context';
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
): HTMLCanvasElement | HTMLImageElement {
    // Note: the "return image unchanged when sizes match" shortcut is deliberately
    // NOT used — it triggers "Operation is insecure" on Safari (see upstream
    // niklasvh/html2canvas#2911). We always draw to a canvas, but memoise the
    // result so identical (source, size) requests reuse it.
    const key = `${image.src}|${width}|${height}`;

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
    ctx.drawImage(image, 0, 0, image.width, image.height, 0, 0, width, height);

    // Owned by the resize cache — never released to canvasPool.
    state.resizeCache.set(key, canvas);
    return canvas;
}
