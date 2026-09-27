import { Context } from './context';
import { FEATURES } from './features';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const cache: { [key: string]: Promise<any> } = {};

export class CacheStorage {
    private static _link?: HTMLAnchorElement;
    private static _origin = 'about:blank';

    static getOrigin(url: string): string {
        const link = CacheStorage._link;
        if (!link) {
            return 'about:blank';
        }

        link.href = url;
        link.href = link.href; // IE9, LOL! - http://jsfiddle.net/niklasvh/2e48b/
        return link.protocol + link.hostname + link.port;
    }

    static isSameOrigin(src: string): boolean {
        return CacheStorage.getOrigin(src) === CacheStorage._origin;
    }

    static setContext(window: Window): void {
        CacheStorage._link = window.document.createElement('a');
        CacheStorage._origin = CacheStorage.getOrigin(window.location.href);
    }
}

export interface ResourceOptions {
    imageTimeout: number;
    useCORS: boolean;
    allowTaint: boolean;
    proxy?: string;
    /**
     * Overrides the same-origin check for resource URLs. Return `true`/`false` to
     * force the decision for a given URL, or `undefined` to fall back to the
     * default origin comparison. Useful when assets are served from a CDN that
     * should be treated as same-origin.
     */
    isResourceSameOrigin?: (src: string) => boolean | undefined;
    /**
     * Maximum number of images to keep in the shared cache. When the limit is
     * exceeded, the least-recently-used entries are evicted. Leave undefined (or
     * <= 0) for an unbounded cache — the historical behaviour.
     */
    maxCacheSize?: number;
}

/**
 * Insertion/access order of keys in `cache`, oldest first. Kept in sync with
 * `cache` so that LRU eviction can drop the least-recently-used entry.
 */
const cacheOrder: string[] = [];

const removeFromOrder = (key: string): void => {
    const i = cacheOrder.indexOf(key);
    if (i !== -1) {
        cacheOrder.splice(i, 1);
    }
};

// Mark `key` as most-recently-used (moves it to the end of the order list).
const touchOrder = (key: string): void => {
    removeFromOrder(key);
    cacheOrder.push(key);
};

export class Cache {
    constructor(
        private readonly context: Context,
        private readonly _options: ResourceOptions,
    ) {}

    deleteImage(src: string): boolean {
        if (this.has(src)) {
            delete cache[src];
            removeFromOrder(src);
            return true;
        }

        return false;
    }

    /**
     * Removes every entry from the (module-level, shared) image cache.
     *
     * Because the cache is global and persists across `html2canvas()` calls, it
     * grows without bound in long-lived applications (e.g. SPAs) that capture
     * many screenshots. Call this to reclaim the memory held by cached images.
     *
     * Note: the cache is shared, so clearing it affects any other in-flight or
     * subsequent render that relies on the same entries. Only clear when no
     * other capture depends on the cached resources.
     *
     * @returns the number of entries removed.
     */
    clear(): number {
        const keys = Object.keys(cache);
        for (const key of keys) {
            delete cache[key];
        }
        cacheOrder.length = 0;
        return keys.length;
    }

    addImage(src: string): boolean {
        if (this.has(src)) return true;
        if (isBlobImage(src) || isRenderable(src)) {
            (cache[src] = this.loadImage(src)).catch(() => {
                // prevent unhandled rejection
            });
            touchOrder(src);
            this._evictIfNeeded();
            return true;
        }
        return false;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    match(src: string): Promise<any> {
        // Accessing an entry marks it as recently used for LRU purposes.
        if (src in cache) {
            touchOrder(src);
        }
        return cache[src];
    }

    /**
     * Evicts least-recently-used entries while the cache exceeds maxCacheSize.
     * No-op when maxCacheSize is undefined or <= 0 (unbounded cache).
     */
    private _evictIfNeeded(): void {
        const max = this._options.maxCacheSize;
        if (!max || max <= 0) {
            return;
        }
        while (cacheOrder.length > max) {
            const oldest = cacheOrder.shift();
            if (oldest !== undefined) {
                delete cache[oldest];
            }
        }
    }

    private isSameOrigin(src: string): boolean {
        // Allow callers to override the same-origin decision per URL. When the
        // custom function returns undefined, fall back to the default check.
        const override = this._options.isResourceSameOrigin;
        if (override) {
            const result = override(src);
            if (typeof result === 'boolean') {
                return result;
            }
        }
        return CacheStorage.isSameOrigin(src);
    }

    private async loadImage(key: string) {
        const isExtensionImage = key.startsWith('chrome-extension://');
        const isSameOrigin = this.isSameOrigin(key) || isExtensionImage;
        const useCORS =
            !isInlineImage(key) && this._options.useCORS === true && FEATURES.SUPPORT_CORS_IMAGES && !isSameOrigin;
        const useProxy =
            !isInlineImage(key) &&
            !isSameOrigin &&
            !isBlobImage(key) &&
            typeof this._options.proxy === 'string' &&
            FEATURES.SUPPORT_CORS_XHR &&
            !useCORS &&
            !isExtensionImage;
        if (
            !isSameOrigin &&
            this._options.allowTaint === false &&
            !isInlineImage(key) &&
            !isBlobImage(key) &&
            !useProxy &&
            !useCORS
        ) {
            return;
        }

        let src = key;
        if (useProxy) {
            src = await this.proxy(src);
        }

        this.context.logger.debug(`Added image ${key.substring(0, 256)}`);

        return await new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = reject;
            //ios safari 10.3 taints canvas with data urls unless crossOrigin is set to anonymous
            if (isInlineImage(src) || isInlineBase64Image(src) || useCORS) {
                img.crossOrigin = 'anonymous';
            }
            if (!isInlineImage(src) && useCORS) {
                // in chrome if the image loaded before without crossorigin it will be cached and used later even if the next usage has crossorigin
                // it will fail with CORS error, add a random query parameter just to prevent the chrome from using the cached image
                // see more info about the chrome issue in this link: https://stackoverflow.com/a/49503414
                src = src + (src.includes('?') ? '&' : '?') + `cors=${Math.random()}`;
            }
            img.src = src;
            if (img.complete === true) {
                // Inline XML images may fail to parse, throwing an Error later on
                setTimeout(() => resolve(img), 500);
            }
            if (this._options.imageTimeout > 0) {
                setTimeout(
                    () => reject(`Timed out (${this._options.imageTimeout}ms) loading image`),
                    this._options.imageTimeout,
                );
            }
        });
    }

    private has(key: string): boolean {
        return key in cache;
    }

    keys(): Promise<string[]> {
        return Promise.resolve(Object.keys(cache));
    }

    private proxy(src: string): Promise<string> {
        const proxy = this._options.proxy;

        if (!proxy) {
            throw new Error('No proxy defined');
        }

        const key = src.substring(0, 256);

        return new Promise((resolve, reject) => {
            const responseType = FEATURES.SUPPORT_RESPONSE_TYPE ? 'blob' : 'text';
            const xhr = new XMLHttpRequest();
            xhr.onload = () => {
                if (xhr.status === 200) {
                    if (responseType === 'text') {
                        resolve(xhr.response);
                    } else {
                        const reader = new FileReader();
                        reader.addEventListener('load', () => resolve(reader.result as string), false);
                        reader.addEventListener('error', e => reject(e), false);
                        reader.readAsDataURL(xhr.response);
                    }
                } else {
                    reject(`Failed to proxy resource ${key} with status code ${xhr.status}`);
                }
            };

            xhr.onerror = reject;
            const queryString = proxy.includes('?') ? '&' : '?';
            xhr.open('GET', `${proxy}${queryString}url=${encodeURIComponent(src)}&responseType=${responseType}`);

            if (responseType !== 'text' && xhr instanceof XMLHttpRequest) {
                xhr.responseType = responseType;
            }

            if (this._options.imageTimeout) {
                const timeout = this._options.imageTimeout;
                xhr.timeout = timeout;
                xhr.ontimeout = () => reject(`Timed out (${timeout}ms) proxying ${key}`);
            }

            xhr.send();
        });
    }
}

const INLINE_SVG = /^data:image\/svg\+xml/i;
const INLINE_BASE64 = /^data:image\/.*;base64,/i;
const INLINE_IMG = /^data:image\/.*/i;

const isRenderable = (src: string): boolean => FEATURES.SUPPORT_SVG_DRAWING || !isSVG(src);
const isInlineImage = (src: string): boolean => INLINE_IMG.test(src);
const isInlineBase64Image = (src: string): boolean => INLINE_BASE64.test(src);
const isBlobImage = (src: string): boolean => src.slice(0, 4) === 'blob';

const isSVG = (src: string): boolean => src.slice(-3).toLowerCase() === 'svg' || INLINE_SVG.test(src);
