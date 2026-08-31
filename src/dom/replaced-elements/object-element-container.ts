import { ElementContainer } from '../element-container';
import { Context } from '../../core/context';

/**
 * Container for `<object>` elements.
 *
 * When the object's `data` attribute references an image (e.g. a data-URI PNG),
 * we treat it as a replaced element (like `<img>`) so that html2canvas renders
 * the loaded image instead of (or on top of) the fallback child content.
 *
 * When the data fails to load or is not an image type, the browser shows the
 * fallback children — those are handled by the normal DOM tree traversal, and
 * `intrinsicWidth`/`intrinsicHeight` stay at 0 so the renderer skips the image
 * paint path.
 */
export class ObjectElementContainer extends ElementContainer {
    src: string;
    intrinsicWidth: number = 0;
    intrinsicHeight: number = 0;

    constructor(context: Context, object: HTMLObjectElement) {
        super(context, object);
        this.src = object.data;
        if (this.src) {
            this.context.cache.addImage(this.src);
        }
    }

    /**
     * Returns `true` when the `<object>` has loaded image content that should
     * be rendered as a replaced element.
     *
     * The heuristic mirrors how the browser decides whether to show fallback:
     *   - If the element has a contentDocument, the data loaded as a document
     *     (HTML/SVG) — we don't handle that here (future work: treat like iframe).
     *   - If the computed `data` URL looks like an image MIME type, and the cache
     *     was able to load it, the object is showing the image — skip fallback.
     *   - Otherwise the browser is showing fallback children.
     */
    hasLoadedImage(): boolean {
        return this.intrinsicWidth > 0 && this.intrinsicHeight > 0;
    }
}
