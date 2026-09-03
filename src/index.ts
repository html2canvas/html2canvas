import { CacheStorage } from './core/cache-storage';
import { Context, ContextOptions } from './core/context';
import { Bounds, parseBounds, parseDocumentSize } from './css/layout/bounds';
import { COLORS, isTransparent, parseColor } from './css/types/color';
import { CloneConfigurations, CloneOptions, DocumentCloner, WindowOptions } from './dom/document-cloner';
import { isBodyElement, isHTMLElement, parseTree } from './dom/node-parser';
import { CanvasRenderer, RenderConfigurations, RenderOptions } from './render/canvas/canvas-renderer';
import { ForeignObjectRenderer } from './render/canvas/foreignobject-renderer';

export type Options = CloneOptions &
    WindowOptions &
    RenderOptions &
    ContextOptions & {
        backgroundColor: string | null;
        foreignObjectRendering: boolean;
        removeContainer?: boolean;
        /**
         * When `true`, the shared image cache is emptied once rendering finishes,
         * releasing the memory held by loaded images. Defaults to `false` to
         * preserve the existing behaviour where the cache persists across calls
         * (which speeds up repeated captures of the same resources).
         *
         * Enable this in long-lived apps (SPAs) that capture many distinct
         * screenshots and would otherwise accumulate cached images indefinitely.
         * Do not enable it when sharing a cache between concurrent captures.
         */
        clearImageCache?: boolean;
    };

const html2canvas = (element: HTMLElement, options: Partial<Options> = {}): Promise<HTMLCanvasElement> => {
    return renderElement(element, options);
};

export default html2canvas;

if (typeof window !== 'undefined') {
    CacheStorage.setContext(window);
}

const renderElement = async (element: HTMLElement, opts: Partial<Options>): Promise<HTMLCanvasElement> => {
    if (!element || typeof element !== 'object') {
        return Promise.reject('Invalid element provided as first argument');
    }
    const ownerDocument = element.ownerDocument;

    if (!ownerDocument) {
        throw new Error(`Element is not attached to a Document`);
    }

    const defaultView = ownerDocument.defaultView;

    if (!defaultView) {
        throw new Error(`Document is not attached to a Window`);
    }

    const resourceOptions = {
        allowTaint: opts.allowTaint ?? false,
        imageTimeout: opts.imageTimeout ?? 15000,
        proxy: opts.proxy,
        useCORS: opts.useCORS ?? false,
        isResourceSameOrigin: opts.isResourceSameOrigin,
    };

    const contextOptions = {
        logging: opts.logging ?? true,
        cache: opts.cache,
        onError: opts.onError,
        ...resourceOptions,
    };

    const windowOptions = {
        windowWidth: opts.windowWidth ?? defaultView.innerWidth,
        windowHeight: opts.windowHeight ?? defaultView.innerHeight,
        scrollX: opts.scrollX ?? defaultView.pageXOffset,
        scrollY: opts.scrollY ?? defaultView.pageYOffset,
    };

    const windowBounds = new Bounds(
        windowOptions.scrollX,
        windowOptions.scrollY,
        windowOptions.windowWidth,
        windowOptions.windowHeight,
    );

    const context = new Context(contextOptions, windowBounds);

    const foreignObjectRendering = opts.foreignObjectRendering ?? false;

    const cloneOptions: CloneConfigurations = {
        allowTaint: opts.allowTaint ?? false,
        onclone: opts.onclone,
        ignoreElements: opts.ignoreElements,
        onCopyProperty: opts.onCopyProperty,
        inlineImages: foreignObjectRendering,
        copyStyles: foreignObjectRendering,
    };

    context.logger.debug(
        `Starting document clone with size ${windowBounds.width}x${
            windowBounds.height
        } scrolled to ${-windowBounds.left},${-windowBounds.top}`,
    );

    const documentCloner = new DocumentCloner(context, element, cloneOptions);
    if (!documentCloner.clonedReferenceElement) {
        return Promise.reject(`Unable to find element in cloned iframe`);
    }

    const container = await documentCloner.toIFrame(ownerDocument, windowBounds);

    // clonedReferenceElement is updated inside toIFrame() to point to the node in the
    // freshly parsed iframe document (document.write re-creates the DOM from HTML, so
    // the original in-memory clone reference is no longer in the live document).
    const clonedElement = documentCloner.clonedReferenceElement;
    if (!clonedElement) {
        return Promise.reject(`Unable to find element in cloned iframe`);
    }

    const { width, height, left, top } =
        isBodyElement(clonedElement) || isHTMLElement(clonedElement)
            ? parseDocumentSize(clonedElement.ownerDocument)
            : parseBounds(context, clonedElement);

    const backgroundColor = parseBackgroundColor(context, clonedElement, opts.backgroundColor);

    const renderOptions: RenderConfigurations = {
        canvas: opts.canvas,
        backgroundColor,
        scale: opts.scale ?? defaultView.devicePixelRatio ?? 1,
        x: (opts.x ?? 0) + left,
        y: (opts.y ?? 0) + top,
        width: opts.width ?? Math.ceil(width),
        height: opts.height ?? Math.ceil(height),
        cullOffscreen: opts.cullOffscreen ?? false,
    };

    let canvas;

    if (foreignObjectRendering) {
        context.logger.debug(`Document cloned, using foreign object rendering`);
        const renderer = new ForeignObjectRenderer(context, renderOptions);
        canvas = await renderer.render(clonedElement);
    } else {
        context.logger.debug(
            `Document cloned, element located at ${left},${top} with size ${width}x${height} using computed rendering`,
        );

        context.logger.debug(`Starting DOM parsing`);
        const root = parseTree(context, clonedElement);

        if (backgroundColor === root.styles.backgroundColor) {
            root.styles.backgroundColor = COLORS.TRANSPARENT;
        }

        context.logger.debug(
            `Starting renderer for element at ${renderOptions.x},${renderOptions.y} with size ${renderOptions.width}x${renderOptions.height}`,
        );

        const renderer = new CanvasRenderer(context, renderOptions);
        canvas = await renderer.render(root);
    }

    if (opts.removeContainer ?? true) {
        if (!DocumentCloner.destroy(ownerDocument, container.id)) {
            context.logger.error(`Cannot detach cloned iframe as it is not in the DOM anymore`);
        }
    }

    if (opts.clearImageCache === true) {
        const removed = context.cache.clear();
        context.logger.debug(`Cleared image cache (${removed} entries removed)`);
    }

    context.logger.debug(`Finished rendering`);
    return canvas;
};

const parseBackgroundColor = (context: Context, element: HTMLElement, backgroundColorOverride?: string | null) => {
    const ownerDocument = element.ownerDocument;
    // http://www.w3.org/TR/css3-background/#special-backgrounds
    const documentBackgroundColor = ownerDocument.documentElement
        ? parseColor(context, getComputedStyle(ownerDocument.documentElement).backgroundColor as string)
        : COLORS.TRANSPARENT;
    const bodyBackgroundColor = ownerDocument.body
        ? parseColor(context, getComputedStyle(ownerDocument.body).backgroundColor as string)
        : COLORS.TRANSPARENT;

    const defaultBackgroundColor =
        typeof backgroundColorOverride === 'string'
            ? parseColor(context, backgroundColorOverride)
            : backgroundColorOverride === null
              ? COLORS.TRANSPARENT
              : 0xffffffff;

    return element === ownerDocument.documentElement
        ? isTransparent(documentBackgroundColor)
            ? isTransparent(bodyBackgroundColor)
                ? defaultBackgroundColor
                : bodyBackgroundColor
            : documentBackgroundColor
        : defaultBackgroundColor;
};
