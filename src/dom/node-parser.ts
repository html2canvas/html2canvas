import { Context } from '../core/context';
import { CSSParsedDeclaration } from '../css';
import { MIX_BLEND_MODE } from '../css/property-descriptors/mix-blend-mode';
import { DATA_ATTR_FIRST_LINE } from './clone-attributes';
import { ElementContainer, FLAGS } from './element-container';
import { LIElementContainer } from './elements/li-element-container';
import { OLElementContainer } from './elements/ol-element-container';
import { SelectElementContainer } from './elements/select-element-container';
import { TextareaElementContainer } from './elements/textarea-element-container';
import { CanvasElementContainer } from './replaced-elements/canvas-element-container';
import { IFrameElementContainer } from './replaced-elements/iframe-element-container';
import { ImageElementContainer } from './replaced-elements/image-element-container';
import { InputElementContainer } from './replaced-elements/input-element-container';
import { MeterElementContainer } from './replaced-elements/meter-element-container';
import { ObjectElementContainer } from './replaced-elements/object-element-container';
import { ProgressElementContainer } from './replaced-elements/progress-element-container';
import { SVGElementContainer } from './replaced-elements/svg-element-container';
import { TextContainer } from './text-container';

const LIST_OWNERS = ['OL', 'UL', 'MENU'];

const parseNodeTree = (context: Context, node: Node, parent: ElementContainer, root: ElementContainer) => {
    for (let childNode = node.firstChild, nextNode; childNode; childNode = nextNode) {
        nextNode = childNode.nextSibling;
        // Fixes #2238 #1624 - Fix the issue of TextNode content being overlooked in rendering due to being perceived as blank by trim().
        if (isTextNode(childNode) && childNode.data.length > 0) {
            // The U tag marks text with a special underline treatment, and it's not possible to get the underline style from the browser's computed style.
            const parentStep = 3;
            let hasUnderline;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            let pNode: any = childNode;
            for (let i = 0; i < parentStep; i++) {
                if (!pNode) {
                    break;
                }
                if (pNode.parentElement?.tagName === 'U') {
                    hasUnderline = true;
                    break;
                }
                pNode = pNode.parentElement;
            }
            const line = parent.styles.textDecorationLine;
            if (hasUnderline && line) {
                for (let j = 0; j < line.length; j++) {
                    line[j] = 1;
                }
            }
            parent.textNodes.push(new TextContainer(context, childNode, parent.styles));
        } else if (isElementNode(childNode)) {
            if (isSlotElement(childNode) && childNode.assignedNodes) {
                childNode.assignedNodes().forEach(childNode => parseNodeTree(context, childNode, parent, root));
            } else {
                const container = createContainer(context, childNode);
                if (container.styles.isVisible()) {
                    if (createsRealStackingContext(childNode, container, root)) {
                        container.flags |= FLAGS.CREATES_REAL_STACKING_CONTEXT;
                    } else if (createsStackingContext(container.styles)) {
                        container.flags |= FLAGS.CREATES_STACKING_CONTEXT;
                    } else if (container.legendBounds) {
                        // A <fieldset> with a <legend> must create its own stacking context
                        // so its children (legend, content) are rendered after its background,
                        // not before. Without this, inline-block fieldsets end up in inlineLevel
                        // while their children land in nonInlineLevel of the parent stacking
                        // context, causing the fieldset background to paint over its children.
                        container.flags |= FLAGS.CREATES_STACKING_CONTEXT;
                    }

                    if (LIST_OWNERS.indexOf(childNode.tagName) !== -1) {
                        container.flags |= FLAGS.IS_LIST_OWNER;
                    }

                    // Capture ::first-line styles from the data attribute serialised by
                    // DocumentCloner.resolveFirstLinePseudo(). We cannot read getComputedStyle
                    // with '::first-line' here because createPseudoHideStyles already injected
                    // CSS that resets all ::first-line properties to inherit in the iframe.
                    const firstLineSerialized = childNode.getAttribute(DATA_ATTR_FIRST_LINE);
                    if (firstLineSerialized) {
                        childNode.removeAttribute(DATA_ATTR_FIRST_LINE);
                        try {
                            const delta = JSON.parse(firstLineSerialized) as Record<string, string>;
                            // Build a minimal CSSStyleDeclaration-like object by blending
                            // the delta over the element's own computed style.
                            const win = childNode.ownerDocument?.defaultView;
                            if (win) {
                                const elemStyle = win.getComputedStyle(childNode);
                                // Create a synthetic style by applying delta values onto a
                                // temporary element so CSSParsedDeclaration can parse it.
                                const tmp = childNode.ownerDocument.createElement('span');
                                tmp.style.cssText = elemStyle.cssText;
                                for (const [prop, val] of Object.entries(delta)) {
                                    tmp.style.setProperty(prop, val);
                                }
                                childNode.parentElement?.appendChild(tmp);
                                const syntheticStyle = win.getComputedStyle(tmp);
                                container.firstLineStyles = new CSSParsedDeclaration(context, syntheticStyle);
                                childNode.parentElement?.removeChild(tmp);
                            }
                        } catch (_e) {
                            // Ignore parse errors — first-line simply won't be applied.
                        }
                    }

                    parent.elements.push(container);
                    if (childNode.shadowRoot) {
                        parseNodeTree(context, childNode.shadowRoot, container, root);
                    } else if (
                        !isTextareaElement(childNode) &&
                        !isSVGElement(childNode) &&
                        !isSelectElement(childNode) &&
                        !isLoadedObjectElement(childNode)
                    ) {
                        parseNodeTree(context, childNode, container, root);
                    }
                }
            }
        }
    }
};

const createContainer = (context: Context, element: Element): ElementContainer => {
    if (isImageElement(element)) {
        return new ImageElementContainer(context, element);
    }

    if (isCanvasElement(element)) {
        return new CanvasElementContainer(context, element);
    }

    if (isSVGElement(element)) {
        return new SVGElementContainer(context, element);
    }

    if (isLIElement(element)) {
        return new LIElementContainer(context, element);
    }

    if (isOLElement(element)) {
        return new OLElementContainer(context, element);
    }

    if (isInputElement(element)) {
        return new InputElementContainer(context, element);
    }

    if (isSelectElement(element)) {
        return new SelectElementContainer(context, element);
    }

    if (isTextareaElement(element)) {
        return new TextareaElementContainer(context, element);
    }

    if (isIFrameElement(element)) {
        return new IFrameElementContainer(context, element);
    }

    if (isProgressElement(element)) {
        return new ProgressElementContainer(context, element);
    }

    if (isMeterElement(element)) {
        return new MeterElementContainer(context, element);
    }

    if (isObjectElement(element)) {
        return new ObjectElementContainer(context, element);
    }

    return new ElementContainer(context, element);
};

export const parseTree = (context: Context, element: HTMLElement): ElementContainer => {
    const container = createContainer(context, element);
    container.flags |= FLAGS.CREATES_REAL_STACKING_CONTEXT;
    parseNodeTree(context, element, container, container);
    return container;
};

const createsRealStackingContext = (node: Element, container: ElementContainer, root: ElementContainer): boolean => {
    return (
        container.styles.isPositionedWithZIndex() ||
        container.styles.opacity < 1 ||
        container.styles.isTransformed() ||
        container.styles.isFiltered() ||
        container.styles.mixBlendMode !== MIX_BLEND_MODE.NORMAL ||
        (isBodyElement(node) && root.styles.isTransparent())
    );
};

const createsStackingContext = (styles: CSSParsedDeclaration): boolean => styles.isPositioned() || styles.isFloating();

export const isTextNode = (node: Node): node is Text => node.nodeType === Node.TEXT_NODE;
export const isElementNode = (node: Node): node is Element => node.nodeType === Node.ELEMENT_NODE;
export const isHTMLElementNode = (node: Node): node is HTMLElement =>
    isElementNode(node) && typeof (node as HTMLElement).style !== 'undefined' && !isSVGElementNode(node);
export const isSVGElementNode = (element: Element): element is SVGElement =>
    typeof (element as SVGElement).className === 'object';
export const isLIElement = (node: Element): node is HTMLLIElement => node.tagName === 'LI';
export const isOLElement = (node: Element): node is HTMLOListElement => node.tagName === 'OL';
export const isInputElement = (node: Element): node is HTMLInputElement => node.tagName === 'INPUT';
export const isHTMLElement = (node: Element): node is HTMLHtmlElement => node.tagName === 'HTML';
export const isSVGElement = (node: Element): node is SVGSVGElement => node.tagName === 'svg';
export const isSVGForeignObjectElement = (node: Element): node is SVGSVGElement => node.tagName === 'foreignObject';
export const isBodyElement = (node: Element): node is HTMLBodyElement => node.tagName === 'BODY';
export const isCanvasElement = (node: Element): node is HTMLCanvasElement => node.tagName === 'CANVAS';
export const isVideoElement = (node: Element): node is HTMLVideoElement => node.tagName === 'VIDEO';
export const isImageElement = (node: Element): node is HTMLImageElement => node.tagName === 'IMG';
export const isIFrameElement = (node: Element): node is HTMLIFrameElement => node.tagName === 'IFRAME';
export const isStyleElement = (node: Element): node is HTMLStyleElement => node.tagName === 'STYLE';
export const isScriptElement = (node: Element): node is HTMLScriptElement => node.tagName === 'SCRIPT';
export const isTextareaElement = (node: Element): node is HTMLTextAreaElement => node.tagName === 'TEXTAREA';
export const isSelectElement = (node: Element): node is HTMLSelectElement => node.tagName === 'SELECT';
export const isSlotElement = (node: Element): node is HTMLSlotElement => node.tagName === 'SLOT';
export const isProgressElement = (node: Element): node is HTMLProgressElement => node.tagName === 'PROGRESS';
export const isMeterElement = (node: Element): node is HTMLMeterElement => node.tagName === 'METER';
export const isObjectElement = (node: Element): node is HTMLObjectElement => node.tagName === 'OBJECT';
// https://html.spec.whatwg.org/multipage/custom-elements.html#valid-custom-element-name
export const isCustomElement = (node: Element): node is HTMLElement => node.tagName.indexOf('-') > 0;
export const isDetailsElement = (node: Element): node is HTMLDetailsElement => node.tagName === 'DETAILS';
export const isSummaryElement = (node: Element): node is HTMLElement => node.tagName === 'SUMMARY';
export const isFieldsetElement = (node: Element): node is HTMLFieldSetElement => node.tagName === 'FIELDSET';
export const isLegendElement = (node: Element): node is HTMLLegendElement => node.tagName === 'LEGEND';

/**
 * Returns true when an `<object>` element has successfully loaded content that
 * replaces its fallback children. In that case, we must NOT traverse the child
 * nodes because they are hidden fallback content.
 *
 * The check works by looking at the object's `contentDocument`: when the browser
 * successfully loads the data attribute, it creates a nested browsing context.
 * For data-URI images the browser renders the image directly without a content
 * document, but it also hides the fallback children — however those children
 * still exist in the DOM. We detect this case by checking if the `data` attribute
 * points to an image type.
 */
const isLoadedObjectElement = (node: Element): boolean => {
    if (!isObjectElement(node)) {
        return false;
    }
    // If the object has a contentDocument, it loaded a document (HTML, SVG, etc.).
    // Its children are fallback content and should be skipped.
    if (node.contentDocument) {
        return true;
    }
    // For data-URI images and other successfully loaded resources, the browser
    // hides fallback children. We detect this by checking the data attribute.
    const data = node.data;
    if (data && /^data:image\//i.test(data)) {
        return true;
    }
    return false;
};
