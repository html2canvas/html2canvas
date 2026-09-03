import { Bounds } from '../css/layout/bounds';
import { Cache, ResourceOptions } from './cache-storage';
import { Logger } from './logger';

export type ContextOptions = {
    logging: boolean;
    cache?: Cache;
    /**
     * Called whenever a resource (image, svg, background-image, etc.) fails to
     * load or render. Rendering continues; this is a notification hook so callers
     * can surface or track failures. Errors are also written to the logger.
     */
    onError?: (error: Error) => void;
} & ResourceOptions;

export class Context {
    private readonly instanceName = `#${Context.instanceCount++}`;
    readonly logger: Logger;
    readonly cache: Cache;
    private readonly _onError?: (error: Error) => void;

    private static instanceCount = 1;

    constructor(
        options: ContextOptions,
        public windowBounds: Bounds,
    ) {
        this.logger = new Logger({ id: this.instanceName, enabled: options.logging });
        this.cache = options.cache ?? new Cache(this, options);
        this._onError = options.onError;
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
}
