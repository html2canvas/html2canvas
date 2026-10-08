import { StackingContext } from '../render/stacking-context';

/**
 * Describes the current rendering stage.
 *
 * - `start`    – rendering has just begun (percentage = 0).
 * - `progress` – an intermediate step completed; `percentage` is in [0, 100].
 * - `end`      – rendering is fully complete (percentage = 100).
 */
export type ProgressState = 'start' | 'progress' | 'end';

/** Identifies the high-level pipeline phase that just completed. */
export type ProgressPhase =
    | 'clone' // DOM clone + iframe injection complete
    | 'parse' // element tree parsed
    | 'render' // canvas drawing finished
    | 'element'; // a single element has been drawn (fine-grained)

/**
 * Sub-steps of the (usually long) clone phase. Reported through the optional
 * `step` field of `ProgressEvent` so callers can see *which* part of cloning
 * is slow — the clone phase is frequently the dominant cost, especially on
 * pages with many nodes, web fonts, or (on WebKit) many images.
 *
 * - `dom-cloned`    – the synchronous DOM deep-clone finished.
 * - `html-written`  – the clone was serialised to HTML and written to the iframe.
 * - `iframe-loaded` – the iframe document reached `readyState: 'complete'`.
 * - `fonts-ready`   – web fonts finished loading (`document.fonts.ready`).
 * - `images-ready`  – (WebKit only) all `<img>` in the clone finished loading.
 * - `onclone-done`  – the user `onclone` callback resolved.
 */
export type CloneStep =
    'dom-cloned' | 'html-written' | 'iframe-loaded' | 'fonts-ready' | 'images-ready' | 'onclone-done';

export interface ProgressEvent {
    /** Current pipeline stage. */
    state: ProgressState;
    /** Completion percentage, 0–100 (integer). */
    percentage: number;
    /** Which phase just completed. */
    phase: ProgressPhase;
    /**
     * For `phase === 'clone'`: the specific clone sub-step that just completed.
     * `undefined` for the other phases.
     */
    step?: CloneStep;
    /** Elapsed milliseconds since rendering started. */
    elapsedMs: number;
    /**
     * For `phase === 'element'`: how many elements have been drawn so far.
     * `undefined` for phase-level events.
     */
    renderedElements?: number;
    /**
     * For `phase === 'element'`: total number of elements to draw.
     * `undefined` for phase-level events.
     */
    totalElements?: number;
}

export type OnProgressCallback = (event: ProgressEvent) => void;

// ---------------------------------------------------------------------------
// Progress weights
// ---------------------------------------------------------------------------

/**
 * Relative weights for the three pipeline phases. Each value is a positive
 * number; only the ratios between them matter — they are normalised
 * internally to produce percentages in [0, 100].
 *
 * | Phase    | What it covers                                      | Default |
 * |----------|-----------------------------------------------------|---------|
 * | `clone`  | DOM clone, iframe injection, fonts ready            | `1`     |
 * | `parse`  | Element tree built from the clone                   | `1`     |
 * | `render` | All canvas drawing (per-element events live here)   | `8`     |
 *
 * **Example** — make cloning feel heavier (e.g. many images, slow network):
 * ```ts
 * progressWeights: { clone: 4, parse: 1, render: 5 }
 * // → clone ends at 40 %, parse at 50 %, render fills 50–100 %
 * ```
 */
export interface ProgressWeights {
    /** Weight for the DOM-clone + iframe phase. Default `1`. */
    clone: number;
    /** Weight for the element-tree parsing phase. Default `1`. */
    parse: number;
    /** Weight for the canvas-rendering phase. Default `8`. */
    render: number;
}

/** Default weights — render gets the lion's share because it has per-element events. */
export const DEFAULT_PROGRESS_WEIGHTS: Readonly<ProgressWeights> = {
    clone: 1,
    parse: 1,
    render: 8,
};

/**
 * Pre-computed percentage thresholds derived from the weights.
 *
 * - `cloneEnd`  : percentage emitted when the clone phase completes.
 * - `parseEnd`  : percentage emitted when the parse phase completes.
 * - `renderEnd` : always 100.
 *
 * The render band spans `parseEnd → 95`, leaving 5 % as a margin before
 * the final `end` event at 100 %. This avoids the callback hitting 100 %
 * during element drawing and being confused with the true `end`.
 */
export interface ProgressThresholds {
    cloneEnd: number;
    parseEnd: number;
}

/**
 * Builds `ProgressThresholds` from a (possibly partial) `ProgressWeights`
 * object, merging in `DEFAULT_PROGRESS_WEIGHTS` for any missing fields.
 */
export function buildProgressThresholds(weights?: Partial<ProgressWeights>): ProgressThresholds {
    const w = { ...DEFAULT_PROGRESS_WEIGHTS, ...weights };

    // Guard against zero or negative values.
    const clone = Math.max(0, w.clone);
    const parse = Math.max(0, w.parse);
    const render = Math.max(0, w.render);
    const total = clone + parse + render;

    if (total === 0) {
        // Degenerate: all zero — fall back to defaults.
        return { cloneEnd: 10, parseEnd: 20 };
    }

    const cloneEnd = (clone / total) * 95; // cap at 95 to leave room for the 'end' event
    const parseEnd = ((clone + parse) / total) * 95;

    return {
        cloneEnd: Math.round(cloneEnd),
        parseEnd: Math.round(parseEnd),
    };
}

/**
 * Relative position (0..1) of each clone sub-step within the clone band.
 * These are rough estimates of how far through cloning each milestone is;
 * they only drive the progress bar, not any timing logic.
 */
const CLONE_STEP_FRACTION: Record<CloneStep, number> = {
    'dom-cloned': 0.25,
    'html-written': 0.4,
    'iframe-loaded': 0.75,
    'fonts-ready': 0.9,
    'images-ready': 0.95,
    'onclone-done': 1,
};

/**
 * Maps a clone sub-step to an absolute percentage within the `[0, cloneEnd]`
 * band, so sub-events advance the bar smoothly during the (often long) clone
 * phase instead of jumping straight to `cloneEnd`.
 */
export function cloneStepPercentage(step: CloneStep, cloneEnd: number): number {
    return CLONE_STEP_FRACTION[step] * cloneEnd;
}

// ---------------------------------------------------------------------------
// Node counting helper
// ---------------------------------------------------------------------------

/**
 * Counts the total number of renderable nodes in a StackingContext tree.
 * This is used upfront to compute per-element percentages during rendering.
 */
export function countStackingContextNodes(stack: StackingContext): number {
    let count = 1; // the root element itself
    for (const child of stack.negativeZIndex) {
        count += countStackingContextNodes(child);
    }
    for (const _child of stack.nonInlineLevel) {
        count += 1; // renderNode (leaf, not a stack)
    }
    for (const child of stack.nonPositionedFloats) {
        count += countStackingContextNodes(child);
    }
    for (const child of stack.nonPositionedInlineLevel) {
        count += countStackingContextNodes(child);
    }
    for (const _child of stack.inlineLevel) {
        count += 1; // renderNode (leaf)
    }
    for (const child of stack.zeroOrAutoZIndexOrTransformedOrOpacity) {
        count += countStackingContextNodes(child);
    }
    for (const child of stack.positiveZIndex) {
        count += countStackingContextNodes(child);
    }
    return count;
}
