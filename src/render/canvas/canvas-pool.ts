/**
 * Reusable pool of offscreen HTMLCanvasElement objects.
 *
 * The renderer allocates many short-lived temporary canvases (CSS filters,
 * text shadows, gradients, background-clip:text, image resizing, border-image
 * tiling). Each `document.createElement('canvas')` allocates GPU/CPU backing
 * store that is then discarded, creating GC pressure and visible jank on
 * documents with many filtered/shadowed elements.
 *
 * `CanvasPool` recycles canvases instead. Callers `acquire()` a canvas at the
 * size they need and `release()` it when done. Released canvases are reset
 * (transform + full clear) before being handed out again so no state leaks
 * between uses.
 */
export class CanvasPool {
    private readonly _pool: HTMLCanvasElement[] = [];

    constructor(private readonly _ownerDocument: Document = document) {}

    /**
     * Get a canvas sized to `width` x `height`. Reuses a pooled canvas when
     * available, otherwise creates a new one. Dimensions are clamped to a
     * minimum of 1px (a 0-sized canvas throws in some browsers).
     */
    acquire(width: number, height: number): HTMLCanvasElement {
        const w = Math.max(1, Math.floor(width));
        const h = Math.max(1, Math.floor(height));
        const canvas = this._pool.pop() ?? this._ownerDocument.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        return canvas;
    }

    /**
     * Return a canvas to the pool. Resets the 2D context transform and clears
     * the full bitmap so stale pixels/state are never visible on next use.
     */
    release(canvas: HTMLCanvasElement): void {
        const ctx = canvas.getContext('2d');
        if (ctx) {
            ctx.setTransform(1, 0, 0, 1, 0, 0);
            ctx.filter = 'none';
            ctx.globalAlpha = 1;
            ctx.globalCompositeOperation = 'source-over';
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
        this._pool.push(canvas);
    }

    /**
     * Drop all pooled canvases. Call when the renderer is done so the backing
     * memory can be reclaimed.
     */
    clear(): void {
        this._pool.length = 0;
    }
}
