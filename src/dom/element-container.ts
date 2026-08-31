import { Context } from '../core/context';
import { DebuggerType, isDebugging } from '../core/debugger';
import { CSSParsedDeclaration } from '../css/index';
import { Bounds, parseBounds } from '../css/layout/bounds';
import { isHTMLElementNode } from './node-parser';
import { TextContainer } from './text-container';

export const enum FLAGS {
    CREATES_STACKING_CONTEXT = 1 << 1,
    CREATES_REAL_STACKING_CONTEXT = 1 << 2,
    IS_LIST_OWNER = 1 << 3,
    DEBUG_RENDER = 1 << 4,
}

export class ElementContainer {
    readonly styles: CSSParsedDeclaration;
    readonly textNodes: TextContainer[] = [];
    readonly elements: ElementContainer[] = [];
    bounds: Bounds;
    flags = 0;
    /** Computed styles for ::first-line, populated by parseNodeTree when the pseudo-element has effective styling. */
    firstLineStyles: CSSParsedDeclaration | null = null;

    constructor(
        protected readonly context: Context,
        element: Element,
    ) {
        if (isDebugging(element, DebuggerType.PARSE)) {
            debugger;
        }

        const computedStyle = (element.ownerDocument?.defaultView ?? window).getComputedStyle(element, null);

        // Detect the effective CSS zoom factor by comparing the visual size
        // (getBoundingClientRect, post-zoom accumulated) with the layout size
        // (offsetWidth, pre-zoom of this element only).
        //
        // We use offsetWidth rather than computedStyle.width because:
        //   - computedStyle.zoom returns only the element's own zoom (not accumulated)
        //   - offsetWidth is in CSS pixels of the current element, unaffected by
        //     ancestor zoom, so rect.width / offsetWidth gives the full accumulated factor.
        //
        // Temporarily neutralise transform so getBoundingClientRect reflects
        // only zoom, not any CSS transform on this element.
        let zoomFactor = 1;
        if (isHTMLElementNode(element)) {
            const htmlEl = element as HTMLElement;
            let savedTransform: string | null = null;
            if (computedStyle.transform !== 'none') {
                savedTransform = htmlEl.style.transform;
                htmlEl.style.transform = 'none';
            }
            const rect = htmlEl.getBoundingClientRect();
            if (savedTransform !== null) {
                htmlEl.style.transform = savedTransform ?? '';
            }
            const offsetWidth = htmlEl.offsetWidth;
            if (offsetWidth > 0) {
                const ratio = rect.width / offsetWidth;
                // Only treat it as a real zoom if the ratio deviates by more than
                // 0.5% to avoid floating-point noise on non-zoomed elements.
                if (Math.abs(ratio - 1) > 0.005) {
                    zoomFactor = ratio;
                }
            }
        }

        this.styles = new CSSParsedDeclaration(context, computedStyle, zoomFactor);

        if (isHTMLElementNode(element)) {
            if (this.styles.animationDuration.some(duration => duration > 0)) {
                element.style.animationDuration = '0s';
            }

            if (this.styles.transform !== null) {
                // getBoundingClientRect takes transforms into account
                element.style.transform = 'none';
            }
        }

        this.bounds = parseBounds(this.context, element);

        if (isDebugging(element, DebuggerType.RENDER)) {
            this.flags |= FLAGS.DEBUG_RENDER;
        }
    }
}
