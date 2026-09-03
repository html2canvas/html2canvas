import { contains } from '../../core/bitwise';
import { Context } from '../../core/context';
import { FilterType } from '../../css/property-descriptors/filter';
import { mixBlendModeToComposite } from '../../css/property-descriptors/mix-blend-mode';
import { asString } from '../../css/types/color';
import { ElementContainer, FLAGS } from '../../dom/element-container';
import { CanvasElementContainer } from '../../dom/replaced-elements/canvas-element-container';
import { IFrameElementContainer } from '../../dom/replaced-elements/iframe-element-container';
import { ImageElementContainer } from '../../dom/replaced-elements/image-element-container';
import { CHECKBOX, InputElementContainer, RADIO, RANGE } from '../../dom/replaced-elements/input-element-container';
import { MeterElementContainer } from '../../dom/replaced-elements/meter-element-container';
import { ObjectElementContainer } from '../../dom/replaced-elements/object-element-container';
import { ProgressElementContainer } from '../../dom/replaced-elements/progress-element-container';
import { SVGElementContainer } from '../../dom/replaced-elements/svg-element-container';
import {
    EffectTarget,
    IElementEffect,
    isClipEffect,
    isFilterEffect,
    isMixBlendModeEffect,
    isOpacityEffect,
    isOverflowClipEffect,
    isPath2DClipEffect,
    isTransformEffect,
} from '../effects';
import { FontMetrics } from '../font-metrics';
import { Renderer } from '../renderer';
import { ElementPaint, parseStackingContexts, StackingContext } from '../stacking-context';
import { renderNodeBackgroundAndBorders } from './canvas-background-renderer';
import {
    isTextInputElement,
    renderCheckbox,
    renderListMarker,
    renderMeter,
    renderProgress,
    renderRadio,
    renderRange,
    renderReplacedElement,
    renderTextInputElement,
} from './canvas-form-renderer';
import { CanvasPool } from './canvas-pool';
import { canvasMask, canvasPath, CanvasRenderState, formatPath } from './canvas-render-state';
import { renderTextNode } from './canvas-text-renderer';

export type RenderConfigurations = RenderOptions & {
    backgroundColor: import('../../css/types/color').Color | null;
};

export interface RenderOptions {
    scale: number;
    canvas?: HTMLCanvasElement;
    x: number;
    y: number;
    width: number;
    height: number;
}

export class CanvasRenderer extends Renderer {
    private readonly _activeEffects: IElementEffect[] = [];

    /**
     * Single shared state object passed to all sub-renderers.
     * canvas and ctx are mutated in-place during offscreen rendering
     * so sub-renderers always read the current target without extra allocations.
     */
    readonly state: CanvasRenderState;

    // Convenience accessors that stay in sync via state
    get canvas(): HTMLCanvasElement {
        return this.state.canvas;
    }
    get ctx(): CanvasRenderingContext2D {
        return this.state.ctx;
    }

    constructor(context: Context, options: RenderConfigurations) {
        super(context, options);

        const canvas = options.canvas ? options.canvas : document.createElement('canvas');
        const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;

        if (!options.canvas) {
            canvas.width = Math.floor(options.width * options.scale);
            canvas.height = Math.floor(options.height * options.scale);
            canvas.style.width = `${options.width}px`;
            canvas.style.height = `${options.height}px`;
        }

        const isFirefox = navigator.userAgent.indexOf('Firefox') !== -1;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const isChrome = !!(window as any).chrome;

        this.state = {
            canvas,
            ctx,
            options,
            context,
            fontMetrics: new FontMetrics(document, isFirefox ? 1 : 2),
            isFirefox,
            isChrome,
            canvasPool: new CanvasPool(canvas.ownerDocument ?? document),
            resizeCache: new Map<string, HTMLCanvasElement>(),
        };

        ctx.scale(options.scale, options.scale);
        ctx.translate(-options.x, -options.y);
        ctx.textBaseline = 'bottom';
        this._activeEffects = [];
        context.logger.debug(
            `Canvas renderer initialized (${options.width}x${options.height}) with scale ${options.scale}`,
        );
    }

    // -------------------------------------------------------------------------
    // Effect stack
    // -------------------------------------------------------------------------

    applyEffects(effects: IElementEffect[]): void {
        while (this._activeEffects.length) {
            this.popEffect();
        }
        effects.forEach(effect => this.applyEffect(effect));
    }

    applyEffect(effect: IElementEffect): void {
        this.state.ctx.save();
        if (isOpacityEffect(effect)) {
            this.state.ctx.globalAlpha = effect.opacity;
        }

        if (isTransformEffect(effect)) {
            this.state.ctx.translate(effect.offsetX, effect.offsetY);
            this.state.ctx.transform(
                effect.matrix[0],
                effect.matrix[1],
                effect.matrix[2],
                effect.matrix[3],
                effect.matrix[4],
                effect.matrix[5],
            );
            this.state.ctx.translate(-effect.offsetX, -effect.offsetY);
        }

        if (isClipEffect(effect)) {
            canvasPath(this.state, effect.path);
            this.state.ctx.clip(effect.fillRule);
        }

        if (isOverflowClipEffect(effect)) {
            canvasPath(this.state, effect.path);
            this.state.ctx.clip();
        }

        if (isPath2DClipEffect(effect)) {
            this.state.ctx.clip(effect.path2d, effect.fillRule ?? 'nonzero');
        }

        if (isFilterEffect(effect)) {
            // All filters are handled via offscreen canvas in renderStack.
            // This block is kept as a no-op so the effect is tracked in _activeEffects.
        }

        if (isMixBlendModeEffect(effect)) {
            this.state.ctx.globalCompositeOperation = mixBlendModeToComposite[effect.mixBlendMode];
        }

        this._activeEffects.push(effect);
    }

    popEffect(): void {
        this._activeEffects.pop();
        this.state.ctx.restore();
    }

    // -------------------------------------------------------------------------
    // Stack rendering
    // -------------------------------------------------------------------------

    async renderStack(stack: StackingContext): Promise<void> {
        const styles = stack.element.container.styles;
        if (styles.isVisible()) {
            const offscreenFilters = this._getOffscreenFilters(stack);
            if (offscreenFilters) {
                await this._renderStackWithOffscreenFilters(stack, offscreenFilters);
            } else {
                await this.renderStackContent(stack);
            }
        }
    }

    /**
     * Returns the ctx.filter string if the stacking context has filter effects,
     * or null if there are none. Offscreen rendering is needed because ctx.filter
     * interacts badly with ctx.clip().
     */
    private _getOffscreenFilters(stack: StackingContext): string | null {
        const filterStrings: string[] = [];
        for (const effect of stack.element.effects) {
            if (isFilterEffect(effect)) {
                for (const f of effect.filter) {
                    switch (f.type) {
                        case FilterType.DROP_SHADOW:
                            filterStrings.push(
                                `drop-shadow(${f.offsetX.number}px ${f.offsetY.number}px ${f.blur.number}px ${asString(f.color)})`,
                            );
                            break;
                        case FilterType.BLUR:
                            filterStrings.push(`blur(${f.radius.number}px)`);
                            break;
                        case FilterType.BRIGHTNESS:
                            filterStrings.push(`brightness(${f.amount})`);
                            break;
                        case FilterType.CONTRAST:
                            filterStrings.push(`contrast(${f.amount})`);
                            break;
                        case FilterType.GRAYSCALE:
                            filterStrings.push(`grayscale(${f.amount})`);
                            break;
                        case FilterType.HUE_ROTATE:
                            filterStrings.push(`hue-rotate(${f.angle}deg)`);
                            break;
                        case FilterType.INVERT:
                            filterStrings.push(`invert(${f.amount})`);
                            break;
                        case FilterType.OPACITY:
                            filterStrings.push(`opacity(${f.amount})`);
                            break;
                        case FilterType.SATURATE:
                            filterStrings.push(`saturate(${f.amount})`);
                            break;
                        case FilterType.SEPIA:
                            filterStrings.push(`sepia(${f.amount})`);
                            break;
                    }
                }
            }
        }
        return filterStrings.length > 0 ? filterStrings.join(' ') : null;
    }

    /**
     * Renders a stacking context into an offscreen canvas, then composites it
     * onto the main canvas with the CSS filter applied.
     *
     * Note: when clip-path and filter are combined on the same element, the Canvas 2D
     * API applies the clip before the filter (clip → render → filter). The CSS spec
     * order would be render → filter → clip, which is not achievable with Canvas 2D
     * clip primitives alone. This is a known Canvas 2D limitation.
     */
    private async _renderStackWithOffscreenFilters(stack: StackingContext, filterString: string): Promise<void> {
        const mainCanvas = this.state.canvas;
        const mainCtx = this.state.ctx;

        // Detach active effects so that popEffect() during offscreen rendering
        // doesn't call ctx.restore() on the wrong context.
        const savedActiveEffects = this._activeEffects.splice(0);

        // Offscreen canvas — same physical size, same transform as the main canvas.
        const offscreen = this.state.canvasPool.acquire(mainCanvas.width, mainCanvas.height);
        const offCtx = offscreen.getContext('2d') as CanvasRenderingContext2D;
        offCtx.scale(this.options.scale, this.options.scale);
        offCtx.translate(-this.options.x, -this.options.y);
        offCtx.textBaseline = 'bottom';

        // Swap to offscreen — mutate in place so sub-renderers see the new target
        this.state.canvas = offscreen;
        this.state.ctx = offCtx;
        await this.renderStackContent(stack);

        // Restore main canvas
        this.state.canvas = mainCanvas;
        this.state.ctx = mainCtx;
        this._activeEffects.push(...savedActiveEffects);

        // Pop all active ancestor effects from the main ctx so we can use
        // setTransform(identity) for the drawImage without misaligned clips.
        // The next applyEffects() call will re-establish them for the next element.
        const activeCount = this._activeEffects.length;
        for (let i = 0; i < activeCount; i++) {
            this.state.ctx.restore();
        }
        this._activeEffects.length = 0;

        this.state.ctx.save();
        this.state.ctx.filter = filterString;
        this.state.ctx.setTransform(1, 0, 0, 1, 0, 0);
        this.state.ctx.drawImage(offscreen, 0, 0);
        this.state.ctx.restore();

        // Return the offscreen canvas to the pool for reuse.
        this.state.canvasPool.release(offscreen);
    }

    async renderStackContent(stack: StackingContext): Promise<void> {
        if (contains(stack.element.container.flags, FLAGS.DEBUG_RENDER)) {
            debugger;
        }
        // https://www.w3.org/TR/css-position-3/#painting-order
        // 1. the background and borders of the element forming the stacking context.
        await this.renderNodeBackgroundAndBorders(stack.element);
        // 2. the child stacking contexts with negative stack levels (most negative first).
        for (const child of stack.negativeZIndex) {
            await this.renderStack(child);
        }
        // 3. For all its in-flow, non-positioned, block-level descendants in tree order:
        await this.renderNodeContent(stack.element);
        for (const child of stack.nonInlineLevel) {
            await this.renderNode(child);
        }
        // 4. All non-positioned floating descendants, in tree order. For each one of these,
        // treat the element as if it created a new stacking context, but any positioned descendants and descendants
        // which actually create a new stacking context should be considered part of the parent stacking context,
        // not this new one.
        for (const child of stack.nonPositionedFloats) {
            await this.renderStack(child);
        }
        // 5. the in-flow, inline-level, non-positioned descendants, including inline tables and inline blocks.
        for (const child of stack.nonPositionedInlineLevel) {
            await this.renderStack(child);
        }
        for (const child of stack.inlineLevel) {
            await this.renderNode(child);
        }
        // 6. All positioned, opacity or transform descendants, in tree order that fall into the following categories:
        //  All positioned descendants with 'z-index: auto' or 'z-index: 0', in tree order.
        //  For those with 'z-index: auto', treat the element as if it created a new stacking context,
        //  but any positioned descendants and descendants which actually create a new stacking context should be
        //  considered part of the parent stacking context, not this new one. For those with 'z-index: 0',
        //  treat the stacking context generated atomically.
        //
        //  All opacity descendants with opacity less than 1
        //
        //  All transform descendants with transform other than none
        for (const child of stack.zeroOrAutoZIndexOrTransformedOrOpacity) {
            await this.renderStack(child);
        }
        // 7. Stacking contexts formed by positioned descendants with z-indices greater than or equal to 1 in z-index
        // order (smallest first) then tree order.
        for (const child of stack.positiveZIndex) {
            await this.renderStack(child);
        }
    }

    // -------------------------------------------------------------------------
    // Node rendering
    // -------------------------------------------------------------------------

    async renderNode(paint: ElementPaint): Promise<void> {
        if (contains(paint.container.flags, FLAGS.DEBUG_RENDER)) {
            debugger;
        }
        if (paint.container.styles.isVisible()) {
            await this.renderNodeBackgroundAndBorders(paint);
            await this.renderNodeContent(paint);
        }
    }

    async renderNodeBackgroundAndBorders(paint: ElementPaint): Promise<void> {
        this.applyEffects(paint.getEffects(EffectTarget.BACKGROUND_BORDERS));
        await renderNodeBackgroundAndBorders(this.state, paint);
    }

    async renderNodeContent(paint: ElementPaint): Promise<void> {
        this.applyEffects(paint.getEffects(EffectTarget.CONTENT));
        const container = paint.container;
        const curves = paint.curves;
        const styles = container.styles;

        // Text nodes
        for (const child of container.textNodes) {
            await renderTextNode(this.state, child, styles, container.firstLineStyles ?? undefined);
        }

        // Replaced elements
        if (container instanceof ImageElementContainer) {
            try {
                const image = await this.context.cache.match(container.src);
                await container.setup(image);
                renderReplacedElement(this.state, container, curves, image);
            } catch (e) {
                try {
                    if (this.context.cache.deleteImage(container.src) && (e as ErrorEvent).type === 'error') {
                        this.context.cache.addImage(container.src);
                        const image = await this.context.cache.match(container.src);
                        renderReplacedElement(this.state, container, curves, image);
                    }
                } catch (_e) {
                    this.context.error(`Error loading image ${container.src}`, _e);
                }
            }
        }

        if (container instanceof CanvasElementContainer) {
            renderReplacedElement(this.state, container, curves, container.canvas);
        }

        if (container instanceof SVGElementContainer) {
            try {
                const image = await this.context.cache.match(container.svg);
                renderReplacedElement(this.state, container, curves, image);
            } catch (e) {
                this.context.error(`Error loading svg ${container.svg.substring(0, 255)}`, e);
            }
        }

        if (container instanceof ObjectElementContainer) {
            try {
                const image = await this.context.cache.match(container.src);
                if (image) {
                    container.intrinsicWidth = image.naturalWidth || image.width;
                    container.intrinsicHeight = image.naturalHeight || image.height;
                    if (container.hasLoadedImage()) {
                        renderReplacedElement(this.state, container, curves, image);
                    }
                }
            } catch (e) {
                this.context.error(`Error loading object data ${container.src}`, e);
            }
        }

        if (container instanceof IFrameElementContainer && container.tree) {
            const iframeRenderer = new CanvasRenderer(this.context, {
                scale: this.options.scale,
                backgroundColor: container.backgroundColor,
                x: 0,
                y: 0,
                width: container.width,
                height: container.height,
            });
            const canvas = await iframeRenderer.render(container.tree);
            if (container.width && container.height) {
                this.state.ctx.drawImage(
                    canvas,
                    0,
                    0,
                    container.width,
                    container.height,
                    container.bounds.left,
                    container.bounds.top,
                    container.bounds.width,
                    container.bounds.height,
                );
            }
        }

        // Form controls
        if (container instanceof InputElementContainer) {
            if (container.type === CHECKBOX) {
                renderCheckbox(this.state, container);
            } else if (container.type === RADIO) {
                renderRadio(this.state, container);
            } else if (container.type === RANGE) {
                renderRange(this.state, container);
            }
        }

        if (container instanceof ProgressElementContainer) {
            renderProgress(this.state, container);
        }

        if (container instanceof MeterElementContainer) {
            renderMeter(this.state, container);
        }

        // Text input values
        if (isTextInputElement(container) && container.value.length) {
            await renderTextInputElement(this.state, container, styles);
        }

        // List markers
        await renderListMarker(this.state, paint, styles);
    }

    // -------------------------------------------------------------------------
    // Low-level path helpers (kept as instance methods for backwards compat)
    // -------------------------------------------------------------------------

    path(paths: import('../path').Path[]): void {
        canvasPath(this.state, paths);
    }

    mask(paths: import('../path').Path[]): void {
        canvasMask(this.state, paths);
    }

    formatPath(paths: import('../path').Path[]): void {
        formatPath(this.state.ctx, paths);
    }

    // -------------------------------------------------------------------------
    // Entry point
    // -------------------------------------------------------------------------

    async render(element: ElementContainer): Promise<HTMLCanvasElement> {
        if (this.options.backgroundColor) {
            this.state.ctx.fillStyle = asString(this.options.backgroundColor);
            this.state.ctx.fillRect(this.options.x, this.options.y, this.options.width, this.options.height);
        }
        const stack = parseStackingContexts(element);
        await this.renderStack(stack);
        this.applyEffects([]);
        // Release pooled offscreen canvases and the resize cache so their
        // backing memory is reclaimed.
        this.state.canvasPool.clear();
        this.state.resizeCache.clear();
        return this.state.canvas;
    }
}
