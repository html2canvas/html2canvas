import { Context } from '../core/context';
import { DebuggerType, isDebugging } from '../core/debugger';
import { CSSParsedCounterDeclaration, CSSParsedPseudoDeclaration } from '../css/index';
import { Bounds } from '../css/layout/bounds';
import { LIST_STYLE_TYPE, listStyleType } from '../css/property-descriptors/list-style-type';
import { getQuote } from '../css/property-descriptors/quotes';
import { isIdentToken, nonFunctionArgSeparator } from '../css/syntax/parser';
import { TokenType } from '../css/syntax/tokenizer';
import { CounterState, createCounterText } from '../css/types/functions/counter';
import { DATA_ATTR_FIRST_LINE, DATA_ATTR_MARKER, DATA_ATTR_PLACEHOLDER } from './clone-attributes';
import {
    isBodyElement,
    isCanvasElement,
    isCustomElement,
    isDetailsElement,
    isElementNode,
    isHTMLElementNode,
    isIFrameElement,
    isImageElement,
    isScriptElement,
    isSelectElement,
    isSlotElement,
    isStyleElement,
    isSummaryElement,
    isSVGElementNode,
    isTextareaElement,
    isTextNode,
    isVideoElement,
} from './node-parser';

export interface CloneOptions {
    ignoreElements?: (element: Element) => boolean;
    onclone?: (document: Document, element: HTMLElement) => void;
    allowTaint?: boolean;
    /**
     * Callback invoked for each CSS property during cloning. Return `true` to mark the property
     * as handled (html2canvas will skip its default copy), or `false`/`undefined` to let
     * html2canvas apply the default behaviour.
     *
     * Use this to skip or override specific properties, e.g. CSS custom properties (`--*`)
     * that make cloning significantly slower in Firefox when many variables are present.
     *
     * @example
     * // Skip all CSS custom properties
     * html2canvas(el, {
     *   onCopyProperty: (property) => property.startsWith('--')
     * });
     */
    onCopyProperty?: (property: string, style: CSSStyleDeclaration, target: HTMLElement | SVGElement) => boolean | void;
}

export interface WindowOptions {
    scrollX: number;
    scrollY: number;
    windowWidth: number;
    windowHeight: number;
}

export type CloneConfigurations = CloneOptions & {
    inlineImages: boolean;
    copyStyles: boolean;
};

const IGNORE_ATTRIBUTE = 'data-html2canvas-ignore';

export class DocumentCloner {
    private readonly scrolledElements: [Element, number, number][];
    private readonly referenceElement: HTMLElement;
    clonedReferenceElement?: HTMLElement;
    private readonly documentElement: HTMLElement;
    private readonly counters: CounterState;
    private quoteDepth: number;

    constructor(
        private readonly context: Context,
        element: HTMLElement,
        private readonly options: CloneConfigurations,
    ) {
        this.scrolledElements = [];
        this.referenceElement = element;
        this.counters = new CounterState();
        this.quoteDepth = 0;
        if (!element.ownerDocument) {
            throw new Error('Cloned element does not have an owner document');
        }

        this.documentElement = this.cloneNode(element.ownerDocument.documentElement, false) as HTMLElement;
    }

    toIFrame(ownerDocument: Document, windowSize: Bounds): Promise<HTMLIFrameElement> {
        const iframe: HTMLIFrameElement = createIFrameContainer(ownerDocument, windowSize);

        if (!iframe.contentWindow) {
            return Promise.reject(`Unable to find iframe window`);
        }

        const scrollX = (ownerDocument.defaultView as Window).pageXOffset;
        const scrollY = (ownerDocument.defaultView as Window).pageYOffset;

        const cloneWindow = iframe.contentWindow;
        const documentClone: Document = cloneWindow.document;

        /* Chrome doesn't detect relative background-images assigned in inline <style> sheets when fetched through getComputedStyle
         if window url is about:blank, we can assign the url to current by writing onto the document
         */

        // Stamp the reference element with a unique marker attribute so we can locate
        // it in the parsed document after document.write() (which re-parses the HTML
        // and creates new DOM nodes, discarding the in-memory clone references).
        const REFERENCE_ATTR = 'data-html2canvas-ref';
        // clonedReferenceElement is set during cloneNode() in the constructor; stamp it
        // on the in-memory clone so the attribute appears in the serialized HTML.
        if (this.clonedReferenceElement) {
            this.clonedReferenceElement.setAttribute(REFERENCE_ATTR, '1');
        }

        // Serialize the full cloned document as HTML — including the <base> tag — so
        // Chromium parses it natively. This is the only reliable way to ensure that
        // stylesheet rules (including background-image gradients) are applied: Chromium
        // only resolves the cascade during the initial HTML parse, not when nodes are
        // injected via replaceChild/adoptNode after the fact.
        addBase(this.documentElement, documentClone);
        const fullHTML = this.documentElement.outerHTML;

        // Open the document before attaching the load listener so that readyState is
        // 'loading' when iframeLoader registers its onload handler. Without this,
        // Firefox may have already fired onload on the initial empty document and the
        // promise would never resolve.
        documentClone.open();

        const iframeLoad = iframeLoader(iframe).then(async () => {
            this.scrolledElements.forEach(restoreNodeScroll);
            if (cloneWindow) {
                cloneWindow.scrollTo(windowSize.left, windowSize.top);
                if (
                    /(iPad|iPhone|iPod)/g.test(navigator.userAgent) &&
                    (cloneWindow.scrollY !== windowSize.top || cloneWindow.scrollX !== windowSize.left)
                ) {
                    this.context.logger.warn('Unable to restore scroll position for cloned document');
                    this.context.windowBounds = this.context.windowBounds.add(
                        cloneWindow.scrollX - windowSize.left,
                        cloneWindow.scrollY - windowSize.top,
                        0,
                        0,
                    );
                }
            }

            // Locate the reference element by the marker attribute in the freshly parsed DOM.
            // Special case: if the reference was the <html> element itself, the marker may
            // not survive serialization as an attribute on <html>; fall back to documentElement.
            const referenceElement =
                documentClone.querySelector<HTMLElement>(`[${REFERENCE_ATTR}]`) ??
                (this.referenceElement === this.referenceElement.ownerDocument?.documentElement
                    ? (documentClone.documentElement as HTMLElement)
                    : null);
            referenceElement?.removeAttribute(REFERENCE_ATTR);

            if (!referenceElement) {
                return Promise.reject(`Error finding the ${this.referenceElement.nodeName} in the cloned document`);
            }
            this.clonedReferenceElement = referenceElement;

            const onclone = this.options.onclone;

            // Restore canvas pixel data that was lost during outerHTML serialization.
            // Each canvas with a data-html2canvas-canvas attribute contains a data URL
            // captured from the original canvas before serialization.
            await restoreCanvasData(documentClone);

            if (documentClone.fonts && documentClone.fonts.status === 'loading') {
                await Promise.race([
                    documentClone.fonts.ready,
                    new Promise<void>(resolve => {
                        const fontLoadTimer = setInterval(() => {
                            if (documentClone.fonts.status === 'loaded') {
                                clearInterval(fontLoadTimer);
                                resolve();
                            }
                        }, 1000);
                    }),
                ]);
            }

            if (/(AppleWebKit)/g.test(navigator.userAgent)) {
                await imagesReady(documentClone);
            }

            if (typeof onclone === 'function') {
                return Promise.resolve()
                    .then(() => onclone(documentClone, referenceElement))
                    .then(() => iframe);
            }

            return iframe;
        });

        documentClone.write(`${serializeDoctype(document.doctype)}${fullHTML}`);
        // Chrome scrolls the parent document for some reason after the write to the cloned window???
        restoreOwnerScroll(this.referenceElement.ownerDocument, scrollX, scrollY);
        documentClone.close();

        return iframeLoad;
    }

    createElementClone<T extends HTMLElement | SVGElement>(node: T): HTMLElement | SVGElement {
        if (isDebugging(node, DebuggerType.CLONE)) {
            debugger;
        }
        if (isCanvasElement(node)) {
            return this.createCanvasClone(node);
        }
        if (isVideoElement(node)) {
            return this.createVideoClone(node);
        }
        if (isStyleElement(node)) {
            return this.createStyleClone(node);
        }

        const clone = node.cloneNode(false) as T;
        if (isImageElement(clone)) {
            if (isImageElement(node) && node.currentSrc && node.currentSrc !== node.src) {
                clone.src = node.currentSrc;
                clone.srcset = '';
            }

            if (clone.loading === 'lazy') {
                clone.loading = 'eager';
            }
        }

        if (isCustomElement(clone)) {
            return this.createCustomElementClone(clone);
        }

        return clone;
    }

    createCustomElementClone(node: HTMLElement): HTMLElement {
        const clone = document.createElement('html2canvascustomelement');
        copyCSSStyles(node.style, clone, this.options.onCopyProperty);

        return clone;
    }

    createStyleClone(node: HTMLStyleElement): HTMLStyleElement {
        try {
            const sheet = node.sheet as CSSStyleSheet | undefined;
            if (sheet && sheet.cssRules) {
                const rules = sheet.cssRules;
                const parts: string[] = [];
                for (let i = 0; i < rules.length; i++) {
                    const rule = rules[i];
                    if (rule && typeof rule.cssText === 'string') {
                        parts.push(rule.cssText);
                    }
                }
                const style = node.cloneNode(false) as HTMLStyleElement;
                style.textContent = parts.join('');
                return style;
            }
        } catch (e) {
            // accessing node.sheet.cssRules throws a DOMException
            this.context.logger.error('Unable to access cssRules property', e);
            if (e.name !== 'SecurityError') {
                throw e;
            }
        }
        return node.cloneNode(false) as HTMLStyleElement;
    }

    createCanvasClone(canvas: HTMLCanvasElement): HTMLCanvasElement {
        // Capture the canvas pixel data as a data URL and store it in a data attribute
        // so it survives the outerHTML + document.write() serialization round-trip in
        // toIFrame(). After the iframe loads, restoreCanvasData() redraws each canvas
        // from its stored data URL, keeping the original <canvas> tag (and therefore
        // all CSS selectors, CanvasElementContainer parsing, etc.) intact.

        const clonedCanvas = canvas.cloneNode(false) as HTMLCanvasElement;
        clonedCanvas.width = canvas.width;
        clonedCanvas.height = canvas.height;

        // Try to capture pixel data as a data URL
        try {
            const dataUrl = canvas.toDataURL();
            if (dataUrl && dataUrl !== 'data:,') {
                clonedCanvas.setAttribute('data-html2canvas-canvas', dataUrl);
                return clonedCanvas;
            }
        } catch (e) {
            this.context.logger.info(`Unable to serialize canvas via toDataURL, canvas is tainted`, canvas);
        }

        // For tainted canvases with allowTaint, try drawImage to an intermediate canvas
        if (this.options.allowTaint) {
            try {
                const tempCanvas = canvas.ownerDocument.createElement('canvas');
                tempCanvas.width = canvas.width;
                tempCanvas.height = canvas.height;
                const tempCtx = tempCanvas.getContext('2d');
                if (tempCtx) {
                    tempCtx.drawImage(canvas, 0, 0);
                    const dataUrl = tempCanvas.toDataURL();
                    if (dataUrl && dataUrl !== 'data:,') {
                        clonedCanvas.setAttribute('data-html2canvas-canvas', dataUrl);
                        return clonedCanvas;
                    }
                }
            } catch (e) {
                this.context.logger.info(`Unable to clone tainted canvas via drawImage`, canvas);
            }
        }

        // Fallback: try to copy pixels directly (will be lost after serialization,
        // but covers the edge case where the canvas is rendered without toIFrame)
        try {
            const ctx = canvas.getContext('2d');
            const clonedCtx = clonedCanvas.getContext('2d', { willReadFrequently: true });
            if (clonedCtx) {
                if (!this.options.allowTaint && ctx) {
                    clonedCtx.putImageData(ctx.getImageData(0, 0, canvas.width, canvas.height), 0, 0);
                } else {
                    const gl = canvas.getContext('webgl2') ?? canvas.getContext('webgl');
                    if (gl) {
                        const attribs = gl.getContextAttributes();
                        if (attribs?.preserveDrawingBuffer === false) {
                            this.context.logger.warn(
                                'Unable to clone WebGL context as it has preserveDrawingBuffer=false',
                                canvas,
                            );
                        }
                    }
                    clonedCtx.drawImage(canvas, 0, 0);
                }
            }
        } catch (e) {
            this.context.logger.info(`Unable to clone canvas as it is tainted`, canvas);
        }

        return clonedCanvas;
    }

    createVideoClone(video: HTMLVideoElement): HTMLCanvasElement {
        const canvas = video.ownerDocument.createElement('canvas');

        canvas.width = video.offsetWidth;
        canvas.height = video.offsetHeight;
        const ctx = canvas.getContext('2d');

        try {
            if (ctx) {
                ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                if (!this.options.allowTaint) {
                    ctx.getImageData(0, 0, canvas.width, canvas.height);
                }
            }
            return canvas;
        } catch (e) {
            this.context.logger.info(`Unable to clone video as it is tainted`, video);
        }

        const blankCanvas = video.ownerDocument.createElement('canvas');

        blankCanvas.width = video.offsetWidth;
        blankCanvas.height = video.offsetHeight;
        return blankCanvas;
    }

    appendChildNode(clone: HTMLElement | SVGElement, child: Node, copyStyles: boolean): void {
        if (
            !isElementNode(child) ||
            (!isScriptElement(child) &&
                !child.hasAttribute(IGNORE_ATTRIBUTE) &&
                (typeof this.options.ignoreElements !== 'function' || !this.options.ignoreElements(child)))
        ) {
            // Skip <style> elements only when styles are already inlined via copyCSSStyles
            // (either via the global option or the local copyStyles flag propagated from custom elements)
            if (!(this.options.copyStyles || copyStyles) || !isElementNode(child) || !isStyleElement(child)) {
                clone.appendChild(this.cloneNode(child, copyStyles));
            }
        }
    }

    cloneChildNodes(node: Element, clone: HTMLElement | SVGElement, copyStyles: boolean): void {
        // A closed <details> element hides all children except <summary> via browser-
        // internal mechanisms (not purely CSS). Since outerHTML + document.write() may
        // not fully reconstitute that behavior, skip non-<summary> children here so
        // they are never serialized into the iframe.
        const isClosedDetails = isDetailsElement(node) && !node.open;

        for (
            let child = node.shadowRoot ? node.shadowRoot.firstChild : node.firstChild;
            child;
            child = child.nextSibling
        ) {
            if (isClosedDetails) {
                // Only clone <summary> children and text nodes (whitespace) of a closed <details>
                if (isElementNode(child) && !isSummaryElement(child)) {
                    continue;
                }
            }

            if (isElementNode(child) && isSlotElement(child) && typeof child.assignedNodes === 'function') {
                const assignedNodes = child.assignedNodes() as ChildNode[];
                if (assignedNodes.length) {
                    assignedNodes.forEach(assignedNode => this.appendChildNode(clone, assignedNode, copyStyles));
                }
            } else {
                this.appendChildNode(clone, child, copyStyles);
            }
        }
    }

    cloneNode(node: Node, copyStyles: boolean): Node {
        if (isTextNode(node)) {
            return document.createTextNode(node.data);
        }

        if (!node.ownerDocument) {
            return node.cloneNode(false);
        }

        const window = node.ownerDocument.defaultView;

        if (window && isElementNode(node) && (isHTMLElementNode(node) || isSVGElementNode(node))) {
            const clone = this.createElementClone(node);
            clone.style.transitionProperty = 'none';

            const style = window.getComputedStyle(node);
            const styleBefore = window.getComputedStyle(node, ':before');
            const styleAfter = window.getComputedStyle(node, ':after');

            // Chromium bug workaround: when the document is cloned via document.write()
            // into an iframe, percentage-based height/min-height/max-height values may
            // resolve differently than in the original document. This happens because
            // Chromium sometimes resolves percentage heights against the iframe's
            // scrollHeight instead of treating them as auto/0/none when the containing
            // block has no explicit height (CSS2.1 §10.5/§10.7).
            //
            // Fix: inline the computed (pixel) values for these properties when the
            // specified value is a percentage, so the clone preserves the original layout.
            if (isHTMLElementNode(node)) {
                const inlineS = (node as HTMLElement).style;
                _inlinePercentageHeight(clone, style, inlineS, 'height');
                _inlinePercentageHeight(clone, style, inlineS, 'min-height');
                _inlinePercentageHeight(clone, style, inlineS, 'max-height');
            }

            if (this.referenceElement === node && isHTMLElementNode(clone)) {
                this.clonedReferenceElement = clone;
            }
            if (isBodyElement(clone)) {
                createPseudoHideStyles(clone);
            }

            const counters = this.counters.parse(new CSSParsedCounterDeclaration(this.context, style));
            const before = this.resolvePseudoContent(node, clone, styleBefore, PseudoElementType.BEFORE);

            if (isCustomElement(node)) {
                copyStyles = true;
            }

            if (!isVideoElement(node) && !isStyleElement(node)) {
                this.cloneChildNodes(node, clone, copyStyles);
            }

            if (before) {
                clone.insertBefore(before, clone.firstChild);
            }

            const after = this.resolvePseudoContent(node, clone, styleAfter, PseudoElementType.AFTER);
            if (after) {
                clone.appendChild(after);
            }

            this.counters.pop(counters);

            // Resolve ::first-letter after child nodes have been cloned
            // so that the first-letter logic can locate the correct first text node.
            // Also mark elements with ::first-line so the native pseudo is neutralised
            // in the iframe; the actual ::first-line styles are applied at render time
            // using TextBounds line-top coordinates (see canvas-text-renderer.ts).
            if (isHTMLElementNode(node)) {
                const styleFirstLetter = window.getComputedStyle(node, '::first-letter');
                const styleFirstLine = window.getComputedStyle(node, '::first-line');
                this.resolveFirstLetterPseudo(node, clone, styleFirstLetter);
                this.resolveFirstLinePseudo(node, clone, styleFirstLine);

                // Serialize ::placeholder styles for input/textarea elements.
                // The renderer uses these to draw placeholder text with correct appearance.
                const tagName = (node as HTMLElement).tagName;
                if (tagName === 'INPUT' || tagName === 'TEXTAREA') {
                    const placeholderStyle = window.getComputedStyle(node, '::placeholder');
                    const delta: Record<string, string> = {};
                    const phProps = ['color', 'opacity', 'font-weight', 'font-style', 'background-color'] as const;
                    for (const p of phProps) {
                        const pseudoVal = placeholderStyle.getPropertyValue(p);
                        const elemVal = style.getPropertyValue(p);
                        if (pseudoVal && pseudoVal !== elemVal) {
                            delta[p] = pseudoVal;
                        }
                    }
                    if (Object.keys(delta).length > 0) {
                        (clone as HTMLElement).setAttribute(DATA_ATTR_PLACEHOLDER, JSON.stringify(delta));
                    }
                }

                // Serialize ::marker styles for list items.
                // The renderer uses these to draw list markers with the correct color/font.
                if (tagName === 'LI') {
                    const markerStyle = window.getComputedStyle(node, '::marker');
                    const delta: Record<string, string> = {};
                    if (markerStyle.color && markerStyle.color !== style.color) {
                        delta['color'] = markerStyle.color;
                    }
                    if (markerStyle.fontSize && markerStyle.fontSize !== style.fontSize) {
                        delta['font-size'] = markerStyle.fontSize;
                    }
                    if (markerStyle.fontFamily && markerStyle.fontFamily !== style.fontFamily) {
                        delta['font-family'] = markerStyle.fontFamily;
                    }
                    if (Object.keys(delta).length > 0) {
                        (clone as HTMLElement).setAttribute(DATA_ATTR_MARKER, JSON.stringify(delta));
                    }
                }
            }

            if (
                (style && (this.options.copyStyles || isSVGElementNode(node)) && !isIFrameElement(node)) ||
                copyStyles
            ) {
                // Pass node.style as the inline style reference so that background properties
                // defined only in a stylesheet (not inline) are not overwritten by the
                // getComputedStyle value, which Chromium may serialize differently in an iframe.
                const inlineStyle =
                    isHTMLElementNode(node) || isSVGElementNode(node)
                        ? (node as HTMLElement | SVGElement).style
                        : undefined;
                copyCSSStyles(style, clone, this.options.onCopyProperty, inlineStyle);
            }
            if (node.scrollTop !== 0 || node.scrollLeft !== 0) {
                this.scrolledElements.push([clone, node.scrollLeft, node.scrollTop]);
            }

            if (
                (isTextareaElement(node) || isSelectElement(node)) &&
                (isTextareaElement(clone) || isSelectElement(clone))
            ) {
                clone.value = node.value;
            }

            return clone;
        }

        return node.cloneNode(false);
    }

    resolvePseudoContent(
        node: Element,
        clone: Element,
        style: CSSStyleDeclaration,
        pseudoElt: PseudoElementType,
    ): HTMLElement | void {
        if (!style) {
            return;
        }

        const value = style.content;
        const document = clone.ownerDocument;
        if (
            !document ||
            !value ||
            value === 'normal' ||
            value === 'none' ||
            value === '-moz-alt-content' ||
            style.display === 'none'
        ) {
            return;
        }

        this.counters.parse(new CSSParsedCounterDeclaration(this.context, style));
        const declaration = new CSSParsedPseudoDeclaration(this.context, style);

        const anonymousReplacedElement = document.createElement('html2canvaspseudoelement');
        copyCSSStyles(style, anonymousReplacedElement, this.options.onCopyProperty);

        declaration.content.forEach(token => {
            if (token.type === TokenType.STRING_TOKEN) {
                anonymousReplacedElement.appendChild(document.createTextNode(token.value));
            } else if (token.type === TokenType.URL_TOKEN) {
                const img = document.createElement('img');
                img.src = token.value;
                img.style.opacity = '1';
                anonymousReplacedElement.appendChild(img);
            } else if (token.type === TokenType.FUNCTION) {
                if (token.name === 'attr') {
                    const attr = token.values.filter(isIdentToken);
                    if (attr.length) {
                        anonymousReplacedElement.appendChild(
                            document.createTextNode(node.getAttribute(attr[0].value) || ''),
                        );
                    }
                } else if (token.name === 'counter') {
                    const [counter, counterStyle] = token.values.filter(nonFunctionArgSeparator);
                    if (counter && isIdentToken(counter)) {
                        const counterState = this.counters.getCounterValue(counter.value);
                        const counterType =
                            counterStyle && isIdentToken(counterStyle)
                                ? listStyleType.parse(this.context, counterStyle.value)
                                : LIST_STYLE_TYPE.DECIMAL;

                        anonymousReplacedElement.appendChild(
                            document.createTextNode(createCounterText(counterState, counterType, false)),
                        );
                    }
                } else if (token.name === 'counters') {
                    const [counter, delim, counterStyle] = token.values.filter(nonFunctionArgSeparator);
                    if (counter && isIdentToken(counter)) {
                        const counterStates = this.counters.getCounterValues(counter.value);
                        const counterType =
                            counterStyle && isIdentToken(counterStyle)
                                ? listStyleType.parse(this.context, counterStyle.value)
                                : LIST_STYLE_TYPE.DECIMAL;
                        const separator = delim && delim.type === TokenType.STRING_TOKEN ? delim.value : '';
                        const text = counterStates
                            .map(value => createCounterText(value, counterType, false))
                            .join(separator);

                        anonymousReplacedElement.appendChild(document.createTextNode(text));
                    }
                } else {
                    //   console.log('FUNCTION_TOKEN', token);
                }
            } else if (token.type === TokenType.IDENT_TOKEN) {
                switch (token.value) {
                    case 'open-quote':
                        anonymousReplacedElement.appendChild(
                            document.createTextNode(getQuote(declaration.quotes, this.quoteDepth++, true)),
                        );
                        break;
                    case 'close-quote':
                        anonymousReplacedElement.appendChild(
                            document.createTextNode(getQuote(declaration.quotes, --this.quoteDepth, false)),
                        );
                        break;
                    default:
                        // safari doesn't parse string tokens correctly because of lack of quotes
                        anonymousReplacedElement.appendChild(document.createTextNode(token.value));
                }
            }
        });

        anonymousReplacedElement.className = `${PSEUDO_HIDE_ELEMENT_CLASS_BEFORE} ${PSEUDO_HIDE_ELEMENT_CLASS_AFTER}`;
        const newClassName =
            pseudoElt === PseudoElementType.BEFORE
                ? ` ${PSEUDO_HIDE_ELEMENT_CLASS_BEFORE}`
                : ` ${PSEUDO_HIDE_ELEMENT_CLASS_AFTER}`;

        if (isSVGElementNode(clone)) {
            clone.className.baseValue += newClassName;
        } else {
            clone.className += newClassName;
        }

        return anonymousReplacedElement;
    }

    /**
     * Handles ::first-letter by wrapping the first character of the first text node
     * inside the element in a <span> with the computed ::first-letter styles applied.
     * The native ::first-letter pseudo-element is neutralised via an injected stylesheet
     * (all inheritable properties reset to inherit) so only the synthesised span is visible.
     */
    resolveFirstLetterPseudo(node: Element, clone: Element, style: CSSStyleDeclaration): void {
        if (!style) {
            return;
        }

        // Check whether any ::first-letter style differs from the element's own computed style.
        // If the pseudo-element has no effective styling, skip the wrapping entirely.
        const elementStyle = node.ownerDocument?.defaultView?.getComputedStyle(node);
        const hasFirstLetterStyle =
            elementStyle &&
            (style.color !== elementStyle.color ||
                style.fontSize !== elementStyle.fontSize ||
                style.fontWeight !== elementStyle.fontWeight ||
                style.fontStyle !== elementStyle.fontStyle ||
                style.fontFamily !== elementStyle.fontFamily ||
                style.textTransform !== elementStyle.textTransform ||
                style.float !== elementStyle.float ||
                style.letterSpacing !== elementStyle.letterSpacing);

        if (!hasFirstLetterStyle) {
            return;
        }

        const document = clone.ownerDocument;
        if (!document) {
            return;
        }

        // Find the first text node with actual content, descending through element children.
        // We must skip any ::before synthesised element (html2canvaspseudoelement inserted first).
        // Also skip pure-whitespace text nodes — ::first-letter targets the first actual letter.
        const findFirstTextNode = (el: Node): Text | null => {
            for (let child = el.firstChild; child; child = child.nextSibling) {
                if (child.nodeType === Node.TEXT_NODE) {
                    const text = (child as Text).data;
                    // Skip whitespace-only nodes
                    if (text.trim().length > 0) {
                        return child as Text;
                    }
                } else if (
                    child.nodeType === Node.ELEMENT_NODE &&
                    (child as Element).tagName.toLowerCase() !== 'html2canvaspseudoelement'
                ) {
                    const found = findFirstTextNode(child);
                    if (found) {
                        return found;
                    }
                }
            }
            return null;
        };

        const firstTextNode = findFirstTextNode(clone);
        if (!firstTextNode || firstTextNode.data.trim().length === 0) {
            return;
        }

        // The text node may start with whitespace (HTML indentation). We need to find
        // the actual first non-whitespace character index to split correctly.
        const leadingWhitespaceMatch = firstTextNode.data.match(/^(\s*)([\s\S]*)$/);
        const leadingWhitespace = leadingWhitespaceMatch ? leadingWhitespaceMatch[1] : '';
        const textWithoutLeading = leadingWhitespaceMatch ? leadingWhitespaceMatch[2] : firstTextNode.data;

        if (textWithoutLeading.length === 0) {
            return;
        }

        // Isolate the first character (handle surrogate pairs / multi-codepoint graphemes
        // via Intl.Segmenter when available, otherwise fall back to Array.from).
        let firstChar: string;
        let restAfterFirstChar: string;
        if (typeof Intl !== 'undefined' && typeof Intl.Segmenter !== 'undefined') {
            const segmenter = new Intl.Segmenter();
            const segments = Array.from(segmenter.segment(textWithoutLeading));
            if (segments.length === 0) {
                return;
            }
            firstChar = segments[0].segment;
            restAfterFirstChar = textWithoutLeading.slice(firstChar.length);
        } else {
            const chars = Array.from(textWithoutLeading);
            firstChar = chars[0];
            restAfterFirstChar = chars.slice(1).join('');
        }

        // Build the wrapper <span> with only the ::first-letter styles that differ from
        // the parent element's computed style. Copying all styles via copyCSSStyles would
        // override inherited values (e.g. font-family, line-height) with the resolved
        // pseudo-element values, which can break layout. We only want the delta.
        const span = document.createElement('html2canvasfirstletter');
        span.style.display = 'inline';

        const firstLetterProperties = [
            'color',
            'font-size',
            'font-weight',
            'font-style',
            'font-variant',
            'font-family',
            'line-height',
            'text-transform',
            'letter-spacing',
            'float',
            'padding',
            'padding-top',
            'padding-right',
            'padding-bottom',
            'padding-left',
            'margin',
            'margin-top',
            'margin-right',
            'margin-bottom',
            'margin-left',
            'border',
            'border-top',
            'border-right',
            'border-bottom',
            'border-left',
            'background',
            'background-color',
            'text-decoration',
            'vertical-align',
        ] as const;

        for (const prop of firstLetterProperties) {
            const pseudoVal = style.getPropertyValue(prop);
            const elemVal = elementStyle.getPropertyValue(prop);
            if (pseudoVal && pseudoVal !== elemVal) {
                span.style.setProperty(prop, pseudoVal);
            }
        }

        span.appendChild(document.createTextNode(firstChar));

        // Replace the original text node with:
        // [leading whitespace text node (if any)] [<span>firstChar</span>] [rest text node (if any)]
        const parent = firstTextNode.parentNode;
        if (!parent) {
            return;
        }
        parent.insertBefore(span, firstTextNode);
        // Put the remaining text back: leading whitespace + rest after first char
        const remainingText = leadingWhitespace + restAfterFirstChar;
        if (remainingText.length > 0) {
            firstTextNode.data = remainingText;
        } else {
            parent.removeChild(firstTextNode);
        }

        // Mark the clone so createPseudoHideStyles can suppress the native ::first-letter.
        if (isSVGElementNode(clone as Element)) {
            (clone as SVGElement).className.baseValue += ` ${PSEUDO_HIDE_ELEMENT_CLASS_FIRST_LETTER}`;
        } else {
            (clone as HTMLElement).className += ` ${PSEUDO_HIDE_ELEMENT_CLASS_FIRST_LETTER}`;
        }
    }

    /**
     * Neutralises the native ::first-line pseudo-element in the cloned iframe document
     * by adding a marker class. Also serialises the computed ::first-line styles from the
     * original document into a data attribute so parseNodeTree can read them after the
     * iframe is created (at which point the native pseudo is already neutralised by CSS).
     *
     * Only non-layout-affecting properties (color, font-style, text-decoration) are
     * serialised. Properties that change glyph dimensions (font-size, font-weight,
     * font-family, letter-spacing, word-spacing, text-transform) cannot be supported
     * because TextBounds are measured in the iframe where ::first-line is neutralised,
     * so the positions would not match the styled output.
     */
    resolveFirstLinePseudo(node: Element, clone: Element, style: CSSStyleDeclaration): void {
        if (!style) {
            return;
        }
        const elementStyle = node.ownerDocument?.defaultView?.getComputedStyle(node);
        if (!elementStyle) {
            return;
        }
        // Only properties that do NOT affect text layout / glyph dimensions.
        // These can be swapped at render time without invalidating TextBounds positions.
        // text-decoration is excluded because neutralising it via !important in the iframe
        // would break native underlines on <a>, <u>, etc. across the entire document.
        const firstLineProps = ['color', 'font-style'] as const;
        const delta: Record<string, string> = {};
        for (const p of firstLineProps) {
            const pseudoVal = style.getPropertyValue(p);
            const elemVal = elementStyle.getPropertyValue(p);
            if (pseudoVal && pseudoVal !== elemVal) {
                delta[p] = pseudoVal;
            }
        }
        if (Object.keys(delta).length === 0) {
            return;
        }
        // Serialise the delta into a data attribute so it survives document.write() re-parsing.
        (clone as HTMLElement).setAttribute(DATA_ATTR_FIRST_LINE, JSON.stringify(delta));
        // Mark the clone so createPseudoHideStyles neutralises the native ::first-line.
        if (isSVGElementNode(clone as Element)) {
            (clone as SVGElement).className.baseValue += ` ${PSEUDO_HIDE_ELEMENT_CLASS_FIRST_LINE}`;
        } else {
            (clone as HTMLElement).className += ` ${PSEUDO_HIDE_ELEMENT_CLASS_FIRST_LINE}`;
        }
    }

    static destroy(ownerDocument: Document, id: string): boolean {
        const ownerContainer: HTMLIFrameElement | null = ownerDocument.getElementById(id) as HTMLIFrameElement;
        const documentContainer: HTMLIFrameElement | null = document.getElementById(id) as HTMLIFrameElement;
        const container = ownerContainer || documentContainer;
        if (!container) {
            return false;
        }
        // cleanup iframe first to prevent memory leaks
        try {
            // Clear the iframe's content
            container.src = 'about:blank';

            // Optionally allow the browser to handle garbage collection
            if (container.contentWindow) {
                container.contentWindow.document.open();
                container.contentWindow.document.write('');
                container.contentWindow.document.close();
            }
        } catch {}

        // Remove the iframe from the DOM
        if (container.parentNode) {
            container.parentNode.removeChild(container);
            return true;
        }

        return false;
    }
}

enum PseudoElementType {
    BEFORE,
    AFTER,
    FIRST_LETTER,
}

let iframeIdCounter = 0;
const createIFrameContainer = (ownerDocument: Document, bounds: Bounds): HTMLIFrameElement => {
    const cloneIframeContainer = ownerDocument.createElement('iframe');
    const uniqueId = `html2canvas-iframe-${iframeIdCounter++}`;

    cloneIframeContainer.setAttribute('id', uniqueId);
    cloneIframeContainer.className = 'html2canvas-container';
    cloneIframeContainer.style.visibility = 'hidden';
    cloneIframeContainer.style.position = 'fixed';
    cloneIframeContainer.style.left = '-10000px';
    cloneIframeContainer.style.top = '0px';
    cloneIframeContainer.style.border = '0';
    cloneIframeContainer.width = bounds.width.toString();
    cloneIframeContainer.height = bounds.height.toString();
    cloneIframeContainer.style.width = bounds.width.toString() + 'px';
    cloneIframeContainer.style.height = bounds.height.toString() + 'px';
    cloneIframeContainer.scrolling = 'no'; // ios won't scroll without it
    cloneIframeContainer.setAttribute(IGNORE_ATTRIBUTE, 'true');
    ownerDocument.body.appendChild(cloneIframeContainer);

    return cloneIframeContainer;
};

const imageReady = (img: HTMLImageElement): Promise<Event | void | string> => {
    return new Promise(resolve => {
        if (img.complete) {
            resolve();
            return;
        }
        if (!img.src) {
            resolve();
            return;
        }
        img.onload = resolve;
        img.onerror = resolve;
    });
};

const imagesReady = (document: HTMLDocument): Promise<unknown[]> => {
    return Promise.all([].slice.call(document.images, 0).map(imageReady));
};

const iframeLoader = (iframe: HTMLIFrameElement): Promise<HTMLIFrameElement> => {
    return new Promise((resolve, reject) => {
        const cloneWindow = iframe.contentWindow;

        if (!cloneWindow) {
            return reject(`No window assigned for iframe`);
        }

        const documentClone = cloneWindow.document;

        const checkReady = () => {
            if (documentClone.readyState === 'complete') {
                resolve(iframe);
                return true;
            }
            return false;
        };

        // Firefox may fire onload synchronously during document.write()/close(), before
        // we have a chance to attach the handler. Check readyState immediately first.
        if (!checkReady()) {
            cloneWindow.onload = iframe.onload = () => {
                cloneWindow.onload = iframe.onload = null;
                const interval = setInterval(() => {
                    if (checkReady()) {
                        clearInterval(interval);
                    }
                }, 50);
            };
        }
    });
};

const ignoredStyleProperties = new Set([
    'all', // #2476
    'd', // #2483
    'content', // Safari shows pseudoelements if content is set
]);

// Background shorthand properties that Chromium may serialize differently when read back
// via getComputedStyle in an iframe context, causing gradients to be lost. When an element
// receives its background from a stylesheet rule (not an inline style), skip copying these
// properties so that the cloned stylesheet rule takes precedence instead.
const backgroundProperties = new Set([
    'background',
    'background-image',
    'background-color',
    'background-position',
    'background-position-x',
    'background-position-y',
    'background-size',
    'background-repeat',
    'background-repeat-x',
    'background-repeat-y',
    'background-origin',
    'background-clip',
    'background-attachment',
]);

/**
 * Inlines the computed value of a height-related property on the clone when the
 * stylesheet-specified value is a percentage. This works around a Chromium bug where
 * percentage heights resolve incorrectly in iframes populated via document.write().
 *
 * For `height` we inline the element's actual computed pixel height from the original
 * document so the clone preserves the original layout regardless of how the browser
 * resolves percentages in the iframe context.
 *
 * For `min-height` with a percentage containing block without explicit height, CSS2.1
 * §10.7 says the percentage should be treated as 0. We inline `0px` when the computed
 * value is still reported as a percentage (Chromium keeps it as-is rather than
 * resolving to 0px).
 *
 * For `max-height` with a percentage containing block without explicit height, CSS2.1
 * §10.7 says the percentage should be treated as `none`. We inline `none` in that case.
 */
const _inlinePercentageHeight = (
    clone: HTMLElement | SVGElement,
    computedStyle: CSSStyleDeclaration,
    inlineStyle: CSSStyleDeclaration,
    property: 'height' | 'min-height' | 'max-height',
): void => {
    // Only act when there is no inline style override (the value comes from a stylesheet)
    if (inlineStyle.getPropertyValue(property)) {
        return;
    }
    const computed = computedStyle.getPropertyValue(property);
    if (!computed || computed === 'auto' || computed === 'none') {
        return;
    }

    if (computed.includes('%')) {
        // The browser returned a percentage — meaning it did NOT resolve it to pixels.
        // Per CSS2.1, percentage min-height should resolve to 0 and percentage max-height
        // should resolve to none when the containing block has no explicit height.
        if (property === 'min-height') {
            clone.style.setProperty(property, '0px');
        } else if (property === 'max-height') {
            clone.style.setProperty(property, 'none');
        }
        // For 'height', a percentage that wasn't resolved means 'auto' — don't set.
    }
    // Do NOT inline pixel heights when the specified value is auto (i.e. the browser
    // resolved a shrink-to-fit height). Inlining the computed pixel value would fix the
    // height of the clone and break CSS margin collapse between children and their parent,
    // causing child margins to no longer pierce the parent boundary in the iframe.
    // Only inline when the computed value is itself a percentage (handled above) — in that
    // case the browser may resolve it differently in the iframe context.
};

export const copyCSSStyles = <T extends HTMLElement | SVGElement>(
    style: CSSStyleDeclaration,
    target: T,
    onCopyProperty?: (property: string, style: CSSStyleDeclaration, target: T) => boolean | void,
    inlineStyle?: CSSStyleDeclaration,
): T => {
    // Edge does not provide value for cssText.
    // Iterate forward so we can break early when reaching CSS custom properties (--*)
    // which browsers like Firefox report first and in large numbers, causing significant
    // slowdowns when copied unnecessarily. See https://github.com/niklasvh/html2canvas/issues/3191
    for (let i = 0; i < style.length; i++) {
        const property = style.item(i);
        if (ignoredStyleProperties.has(property)) {
            continue;
        }
        // When an inline style reference is provided, skip background properties that are not
        // explicitly set as inline styles on the source element. This prevents Chromium's
        // getComputedStyle serialization of stylesheet-defined gradients from overwriting the
        // cloned stylesheet rules with a potentially malformed inline value.
        if (inlineStyle && backgroundProperties.has(property) && !inlineStyle.getPropertyValue(property)) {
            continue;
        }
        if (onCopyProperty) {
            // If the callback returns true the caller has handled this property; skip default copy.
            if (onCopyProperty(property, style, target)) {
                continue;
            }
        }
        target.style.setProperty(property, style.getPropertyValue(property));
    }
    return target;
};

const serializeDoctype = (doctype?: DocumentType | null): string => {
    let str = '';
    if (doctype) {
        str += '<!DOCTYPE ';
        if (doctype.name) {
            str += doctype.name;
        }

        if (doctype.internalSubset) {
            str += doctype.internalSubset;
        }

        if (doctype.publicId) {
            str += `"${doctype.publicId}"`;
        }

        if (doctype.systemId) {
            str += `"${doctype.systemId}"`;
        }

        str += '>';
    }

    return str;
};

const restoreOwnerScroll = (ownerDocument: Document | null, x: number, y: number) => {
    if (
        ownerDocument &&
        ownerDocument.defaultView &&
        (x !== ownerDocument.defaultView.pageXOffset || y !== ownerDocument.defaultView.pageYOffset)
    ) {
        ownerDocument.defaultView.scrollTo(x, y);
    }
};

const restoreNodeScroll = ([element, x, y]: [HTMLElement, number, number]) => {
    element.scrollLeft = x;
    element.scrollTop = y;
};

const PSEUDO_BEFORE = ':before';
const PSEUDO_AFTER = ':after';
const PSEUDO_FIRST_LETTER = '::first-letter';
const PSEUDO_FIRST_LINE = '::first-line';
const PSEUDO_HIDE_ELEMENT_CLASS_BEFORE = '___html2canvas___pseudoelement_before';
const PSEUDO_HIDE_ELEMENT_CLASS_AFTER = '___html2canvas___pseudoelement_after';
const PSEUDO_HIDE_ELEMENT_CLASS_FIRST_LETTER = '___html2canvas___pseudoelement_first_letter';
const PSEUDO_HIDE_ELEMENT_CLASS_FIRST_LINE = '___html2canvas___pseudoelement_first_line';

const PSEUDO_HIDE_ELEMENT_STYLE = `{
    content: "" !important;
    display: none !important;
}`;

const PSEUDO_HIDE_FIRST_LETTER_STYLE = `{
    color: inherit !important;
    font-size: inherit !important;
    font-weight: inherit !important;
    font-style: inherit !important;
    font-variant: inherit !important;
    font-family: inherit !important;
    line-height: inherit !important;
    text-transform: inherit !important;
    letter-spacing: inherit !important;
}`;

const PSEUDO_HIDE_FIRST_LINE_STYLE = `{
    color: inherit !important;
    font-style: inherit !important;
}`;

const createPseudoHideStyles = (body: HTMLElement) => {
    createStyles(
        body,
        `.${PSEUDO_HIDE_ELEMENT_CLASS_BEFORE}${PSEUDO_BEFORE}${PSEUDO_HIDE_ELEMENT_STYLE}
         .${PSEUDO_HIDE_ELEMENT_CLASS_AFTER}${PSEUDO_AFTER}${PSEUDO_HIDE_ELEMENT_STYLE}
         .${PSEUDO_HIDE_ELEMENT_CLASS_FIRST_LETTER}${PSEUDO_FIRST_LETTER}${PSEUDO_HIDE_FIRST_LETTER_STYLE}
         .${PSEUDO_HIDE_ELEMENT_CLASS_FIRST_LINE}${PSEUDO_FIRST_LINE}${PSEUDO_HIDE_FIRST_LINE_STYLE}`,
    );
};

const createStyles = (body: HTMLElement, styles: string) => {
    const document = body.ownerDocument;
    if (document) {
        const style = document.createElement('style');
        style.textContent = styles;
        body.appendChild(style);
    }
};

const CANVAS_DATA_ATTR = 'data-html2canvas-canvas';

/**
 * After document.write() re-parses the cloned HTML, all <canvas> elements lose their
 * bitmap data. This function finds canvases stamped with a data URL during cloning
 * and redraws their content from that stored data URL.
 */
const restoreCanvasData = (document: Document): Promise<void[]> => {
    const canvases = document.querySelectorAll<HTMLCanvasElement>(`canvas[${CANVAS_DATA_ATTR}]`);
    const promises: Promise<void>[] = [];
    canvases.forEach(canvas => {
        const dataUrl = canvas.getAttribute(CANVAS_DATA_ATTR);
        if (!dataUrl) {
            return;
        }
        canvas.removeAttribute(CANVAS_DATA_ATTR);
        promises.push(
            new Promise<void>(resolve => {
                const img = new Image();
                img.onload = () => {
                    const ctx = canvas.getContext('2d');
                    if (ctx) {
                        ctx.drawImage(img, 0, 0);
                    }
                    resolve();
                };
                img.onerror = () => resolve();
                img.src = dataUrl;
            }),
        );
    });
    return Promise.all(promises);
};

const addBase = (targetELement: HTMLElement, referenceDocument: Document) => {
    const baseNode = referenceDocument.createElement('base');
    baseNode.href = referenceDocument.baseURI;
    const headEle = targetELement.getElementsByTagName('head').item(0);
    headEle?.insertBefore(baseNode, headEle?.firstChild ?? null);
};
