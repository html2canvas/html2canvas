import { Bounds } from '../css/layout/bounds';
import { Cache, ResourceOptions } from './cache-storage';
import { Logger } from './logger';
import {
    buildProgressThresholds,
    OnProgressCallback,
    ProgressEvent,
    ProgressPhase,
    ProgressState,
    ProgressThresholds,
    ProgressWeights,
} from './progress';

export type ContextOptions = {
    logging: boolean;
    cache?: Cache;
    /**
     * Called whenever a resource (image, svg, background-image, etc.) fails to
     * load or render. Rendering continues; this is a notification hook so callers
     * can surface or track failures. Errors are also written to the logger.
     */
    onError?: (error: Error) => void;
    /**
     * Called at each significant step of the rendering pipeline.
     *
     * Events fire at:
     * - `state: 'start'`    (phase `'clone'`)     — immediately when rendering begins.
     * - `state: 'progress'` (phase `'clone'`)     — DOM clone + iframe ready.
     * - `state: 'progress'` (phase `'parse'`)     — element tree built.
     * - `state: 'progress'` (phase `'element'`)   — after each element is drawn
     *                                               (percentage based on element count).
     * - `state: 'end'`      (phase `'render'`)    — canvas fully rendered.
     */
    onProgress?: OnProgressCallback;
    /**
     * Relative weights for the three pipeline phases used to compute progress
     * percentages. Only the ratios matter; they are normalised to [0, 100]
     * automatically. Defaults to `{ clone: 1, parse: 1, render: 8 }`.
     */
    progressWeights?: Partial<ProgressWeights>;
} & ResourceOptions;

export class Context {
    private readonly instanceName = `#${Context.instanceCount++}`;
    readonly logger: Logger;
    readonly cache: Cache;
    private readonly _onError?: (error: Error) => void;
    private readonly _onProgress?: OnProgressCallback;
    private _progressStartTime = 0;
    /** Pre-computed phase thresholds derived from `progressWeights`. */
    readonly progressThresholds: ProgressThresholds;

    private static instanceCount = 1;

    constructor(
        options: ContextOptions,
        public windowBounds: Bounds,
    ) {
        this.logger = new Logger({ id: this.instanceName, enabled: options.logging });
        this.cache = options.cache ?? new Cache(this, options);
        this._onError = options.onError;
        this._onProgress = options.onProgress;
        this._progressStartTime = Date.now();
        this.progressThresholds = buildProgressThresholds(options.progressWeights);
    }

    /**
     * Logs an error and notifies the `onError` callback (if provided).
     * Use this instead of `logger.error` for recoverable resource failures that
     * callers may want to observe.
     */
    error(message: string, error?: unknown): void {
        this.logger.error(message, ...(error !== undefined ? [error] : []));
        if (this._onError) {
            const err = error instanceof Error ? error : new Error(message);
            this._onError(err);
        }
    }

    /**
     * Fires the `onProgress` callback (if provided) with the supplied event data.
     * Safe to call even when no callback is registered.
     */
    progress(
        state: ProgressState,
        phase: ProgressPhase,
        percentage: number,
        extra?: Pick<ProgressEvent, 'renderedElements' | 'totalElements' | 'step'>,
    ): void {
        if (!this._onProgress) {
            return;
        }
        const event: ProgressEvent = {
            state,
            phase,
            percentage: Math.min(100, Math.max(0, Math.round(percentage))),
            elapsedMs: Date.now() - this._progressStartTime,
            ...extra,
        };
        try {
            this._onProgress(event);
        } catch (_e) {
            // Never let a user callback crash the renderer.
        }
    }
}
