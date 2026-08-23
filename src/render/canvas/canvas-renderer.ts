import { contains } from '../../core/bitwise';
import { Context } from '../../core/context';
import { CSSParsedDeclaration } from '../../css';
import { Bounds } from '../../css/layout/bounds';
import { segmentGraphemes, TextBounds } from '../../css/layout/text';
import { BACKGROUND_CLIP } from '../../css/property-descriptors/background-clip';
import { BORDER_STYLE } from '../../css/property-descriptors/border-style';
import { DIRECTION } from '../../css/property-descriptors/direction';
import { DISPLAY } from '../../css/property-descriptors/display';
import { FilterType } from '../../css/property-descriptors/filter';
import { computeLineHeight } from '../../css/property-descriptors/line-height';
import { LIST_STYLE_POSITION } from '../../css/property-descriptors/list-style-position';
import { LIST_STYLE_TYPE } from '../../css/property-descriptors/list-style-type';
import { mixBlendModeToComposite } from '../../css/property-descriptors/mix-blend-mode';
import { PAINT_ORDER_LAYER } from '../../css/property-descriptors/paint-order';
import { TEXT_ALIGN } from '../../css/property-descriptors/text-align';
import { TEXT_DECORATION_LINE } from '../../css/property-descriptors/text-decoration-line';
import { TEXT_DECORATION_STYLE } from '../../css/property-descriptors/text-decoration-style';
import { TextShadow } from '../../css/property-descriptors/text-shadow';
import { WRITING_MODE } from '../../css/property-descriptors/writing-mode';
import { isDimensionToken } from '../../css/syntax/parser';
import { asString, Color, isTransparent } from '../../css/types/color';
import { calculateGradientDirection, calculateRadius, processColorStops } from '../../css/types/functions/gradient';
import {
    CSSImageType,
    CSSURLImage,
    isConicGradient,
    isLinearGradient,
    isRadialGradient,
    isRepeatingConicGradient,
    isRepeatingLinearGradient,
    isRepeatingRadialGradient,
} from '../../css/types/image';
import { FIFTY_PERCENT, getAbsoluteValue, getNumber } from '../../css/types/length-percentage';
import { ElementContainer, FLAGS } from '../../dom/element-container';
import { SelectElementContainer } from '../../dom/elements/select-element-container';
import { TextareaElementContainer } from '../../dom/elements/textarea-element-container';
import { ReplacedElementContainer } from '../../dom/replaced-elements';
import { CanvasElementContainer } from '../../dom/replaced-elements/canvas-element-container';
import { IFrameElementContainer } from '../../dom/replaced-elements/iframe-element-container';
import { ImageElementContainer } from '../../dom/replaced-elements/image-element-container';
import {
    CHECKBOX,
    INPUT_COLOR,
    InputElementContainer,
    RADIO,
    RANGE,
} from '../../dom/replaced-elements/input-element-container';
import { METER_STATE, MeterElementContainer } from '../../dom/replaced-elements/meter-element-container';
import { ProgressElementContainer } from '../../dom/replaced-elements/progress-element-container';
import { SVGElementContainer } from '../../dom/replaced-elements/svg-element-container';
import { TextContainer } from '../../dom/text-container';
import { calculateBackgroundRendering, getBackgroundValueForIndex } from '../background';
import { BezierCurve, isBezierCurve } from '../bezier-curve';
import {
    parsePathForBorder,
    parsePathForBorderDoubleInner,
    parsePathForBorderDoubleOuter,
    parsePathForBorderStroke,
} from '../border';
import {
    BoundCurves,
    calculateBorderBoxPath,
    calculateContentBoxPath,
    calculatePaddingBoxPath,
    expandBorderBoxPath,
} from '../bound-curves';
import { contentBox } from '../box-sizing';
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
import { calculateObjectFitBounds } from '../object-fit';
import { Path, reversePath } from '../path';
import { Renderer } from '../renderer';
import { ElementPaint, parseStackingContexts, StackingContext } from '../stacking-context';
import { Vector } from '../vector';

export type RenderConfigurations = RenderOptions & {
    backgroundColor: Color | null;
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
    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;
    private readonly _activeEffects: IElementEffect[] = [];
    private readonly fontMetrics: FontMetrics;
    private readonly _isFirefox: boolean;
    private readonly _isChrome: boolean;
    private readonly _fontStyleCache = new WeakMap<CSSParsedDeclaration, string[]>();

    constructor(context: Context, options: RenderConfigurations) {
        super(context, options);
        this.canvas = options.canvas ? options.canvas : document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d') as CanvasRenderingContext2D;
        if (!options.canvas) {
            this.canvas.width = Math.floor(options.width * options.scale);
            this.canvas.height = Math.floor(options.height * options.scale);
            this.canvas.style.width = `${options.width}px`;
            this.canvas.style.height = `${options.height}px`;
        }
        this._isFirefox = navigator.userAgent.indexOf('Firefox') !== -1;
        this.fontMetrics = new FontMetrics(document, this._isFirefox ? 1 : 2);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        this._isChrome = !!(window as any).chrome;
        this.ctx.scale(this.options.scale, this.options.scale);
        this.ctx.translate(-options.x, -options.y);
        this.ctx.textBaseline = 'bottom';
        this._activeEffects = [];
        this.context.logger.debug(
            `Canvas renderer initialized (${options.width}x${options.height}) with scale ${options.scale}`,
        );
    }

    applyEffects(effects: IElementEffect[]): void {
        while (this._activeEffects.length) {
            this.popEffect();
        }

        effects.forEach(effect => this.applyEffect(effect));
    }

    applyEffect(effect: IElementEffect): void {
        this.ctx.save();
        if (isOpacityEffect(effect)) {
            this.ctx.globalAlpha = effect.opacity;
        }

        if (isTransformEffect(effect)) {
            this.ctx.translate(effect.offsetX, effect.offsetY);
            this.ctx.transform(
                effect.matrix[0],
                effect.matrix[1],
                effect.matrix[2],
                effect.matrix[3],
                effect.matrix[4],
                effect.matrix[5],
            );
            this.ctx.translate(-effect.offsetX, -effect.offsetY);
        }

        if (isClipEffect(effect)) {
            this.path(effect.path);
            this.ctx.clip(effect.fillRule);
        }

        if (isOverflowClipEffect(effect)) {
            this.path(effect.path);
            this.ctx.clip();
        }

        if (isPath2DClipEffect(effect)) {
            this.ctx.clip(effect.path2d, effect.fillRule ?? 'nonzero');
        }

        if (isFilterEffect(effect)) {
            // All filters are now handled via offscreen canvas in renderStack.
            // This block is kept as a no-op for the effect to be tracked in _activeEffects.
        }

        if (isMixBlendModeEffect(effect)) {
            this.ctx.globalCompositeOperation = mixBlendModeToComposite[effect.mixBlendMode];
        }

        this._activeEffects.push(effect);
    }

    popEffect(): void {
        this._activeEffects.pop();
        this.ctx.restore();
    }

    async renderStack(stack: StackingContext): Promise<void> {
        const styles = stack.element.container.styles;
        if (styles.isVisible()) {
            // Check if this stacking context has drop-shadow or blur filters that need
            // offscreen rendering to avoid being clipped by the element's clip region.
            const offscreenFilters = this._getOffscreenFilters(stack);
            if (offscreenFilters) {
                await this._renderStackWithOffscreenFilters(stack, offscreenFilters);
            } else {
                await this.renderStackContent(stack);
            }
        }
    }

    /**
     * Returns the ctx.filter string for all filters if the stacking context's own
     * effects include them, or null if there are none.
     * Offscreen rendering is needed because ctx.filter interacts badly with ctx.clip().
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
     * Renders a stacking context into an offscreen canvas, then draws it onto the
     * main canvas with the drop-shadow/blur filter applied. This prevents the filter
     * from being clipped by the element's own clip region.
     */
    /**
     * Renders a stacking context into an offscreen canvas, composites it onto the
     * main canvas with the CSS filter applied.
     *
     * Note: when clip-path and filter are combined on the same element, the Canvas 2D
     * API applies the clip before the filter (clip → render → filter). The CSS spec
     * order would be render → filter → clip, which is not achievable with Canvas 2D
     * clip primitives alone. This is a known Canvas 2D limitation.
     */
    private async _renderStackWithOffscreenFilters(stack: StackingContext, filterString: string): Promise<void> {
        const mainCanvas = this.canvas;
        const mainCtx = this.ctx;

        // Detach the active effects array from the main canvas so that popEffect()
        // calls during offscreen rendering don't call ctx.restore() on the wrong context.
        const savedActiveEffects = this._activeEffects.splice(0);

        // Offscreen canvas — same physical size, same transform as the main canvas.
        const offscreen = document.createElement('canvas');
        offscreen.width = mainCanvas.width;
        offscreen.height = mainCanvas.height;
        const offCtx = offscreen.getContext('2d') as CanvasRenderingContext2D;
        offCtx.scale(this.options.scale, this.options.scale);
        offCtx.translate(-this.options.x, -this.options.y);
        offCtx.textBaseline = 'bottom';

        this.canvas = offscreen;
        this.ctx = offCtx;
        await this.renderStackContent(stack);

        this.canvas = mainCanvas;
        this.ctx = mainCtx;
        this._activeEffects.push(...savedActiveEffects);

        // Pop all active ancestor effects from the main ctx so we can use
        // setTransform(identity) for the drawImage without misaligned clips.
        // The next applyEffects() call will re-establish them for the next element.
        const activeCount = this._activeEffects.length;
        for (let i = 0; i < activeCount; i++) {
            this.ctx.restore();
        }
        this._activeEffects.length = 0;

        this.ctx.save();
        this.ctx.filter = filterString;
        this.ctx.setTransform(1, 0, 0, 1, 0, 0);
        this.ctx.drawImage(offscreen, 0, 0);
        this.ctx.restore();
    }

    async renderNode(paint: ElementPaint): Promise<void> {
        if (contains(paint.container.flags, FLAGS.DEBUG_RENDER)) {
            debugger;
        }

        if (paint.container.styles.isVisible()) {
            await this.renderNodeBackgroundAndBorders(paint);
            await this.renderNodeContent(paint);
        }
    }

    renderTextWithLetterSpacing(
        text: TextBounds,
        letterSpacing: number,
        baseline: number,
        writingMode: WRITING_MODE = WRITING_MODE.HORIZONTAL_TB,
        useStroke: boolean = false,
    ): void {
        const isVertical =
            writingMode === WRITING_MODE.VERTICAL_RL ||
            writingMode === WRITING_MODE.VERTICAL_LR ||
            writingMode === WRITING_MODE.SIDEWAYS_RL ||
            writingMode === WRITING_MODE.SIDEWAYS_LR;

        const drawText = useStroke
            ? (t: string, x: number, y: number) => this.ctx.strokeText(t, x, y)
            : (t: string, x: number, y: number) => this.ctx.fillText(t, x, y);

        if (isVertical) {
            // For vertical writing modes the browser already positions the text bounds correctly.
            // We rotate the canvas ±90° around the centre of the text bounds so that fillText
            // draws along the right axis, then restore.
            const isSidewaysLR = writingMode === WRITING_MODE.SIDEWAYS_LR;
            // sideways-lr rotates -90°; all other vertical modes rotate +90°
            const angle = isSidewaysLR ? -Math.PI / 2 : Math.PI / 2;
            const cx = text.bounds.left + text.bounds.width / 2;
            const cy = text.bounds.top + text.bounds.height / 2;

            this.ctx.save();
            this.ctx.translate(cx, cy);
            this.ctx.rotate(angle);
            this.ctx.translate(-cx, -cy);

            // After rotation the "visual" width and height swap, so we need to
            // paint as if the text was horizontal with swapped bounds.
            const rotatedBounds = new Bounds(
                cx - text.bounds.height / 2,
                cy - text.bounds.width / 2,
                text.bounds.height,
                text.bounds.width,
            );
            const rotatedText = new TextBounds(text.text, rotatedBounds);

            if (letterSpacing === 0) {
                if (!this._isFirefox) {
                    this.ctx.textBaseline = 'ideographic';
                    drawText(
                        rotatedText.text,
                        rotatedText.bounds.left,
                        rotatedText.bounds.top + rotatedText.bounds.height,
                    );
                } else {
                    drawText(rotatedText.text, rotatedText.bounds.left, rotatedText.bounds.top + baseline);
                }
            } else {
                const letters = segmentGraphemes(rotatedText.text);
                letters.reduce((left, letter, index) => {
                    drawText(letter, left, rotatedText.bounds.top + baseline);
                    const isLast = index === letters.length - 1;
                    return left + this.ctx.measureText(letter).width + (isLast ? 0 : letterSpacing - 1);
                }, rotatedText.bounds.left);
            }

            this.ctx.restore();
        } else {
            if (letterSpacing === 0) {
                // Fixed an issue with characters moving up in non-Firefox.
                // https://github.com/niklasvh/html2canvas/issues/2107#issuecomment-692462900
                if (!this._isFirefox) {
                    this.ctx.textBaseline = 'ideographic';
                    drawText(text.text, text.bounds.left, text.bounds.top + text.bounds.height);
                } else {
                    drawText(text.text, text.bounds.left, text.bounds.top + baseline);
                }
            } else {
                const letters = segmentGraphemes(text.text);
                letters.reduce((left, letter, index) => {
                    drawText(letter, left, text.bounds.top + baseline);
                    const isLast = index === letters.length - 1;
                    return left + this.ctx.measureText(letter).width + (isLast ? 0 : letterSpacing - 1);
                }, text.bounds.left);
            }
        }
    }

    private createFontStyle(styles: CSSParsedDeclaration): string[] {
        const cached = this._fontStyleCache.get(styles);
        if (cached) {
            return cached;
        }
        const fontVariant = styles.fontVariant
            .filter(variant => variant === 'normal' || variant === 'small-caps')
            .join('');
        const fontFamily = fixIOSSystemFonts(styles.fontFamily).join(', ');
        const fontSize = isDimensionToken(styles.fontSize)
            ? `${getNumber(styles.fontSize)}${styles.fontSize.unit}`
            : `${getNumber(styles.fontSize)}px`;

        const result = [
            [styles.fontStyle, fontVariant, styles.fontWeight, fontSize, fontFamily].join(' '),
            fontFamily,
            fontSize,
        ];
        this._fontStyleCache.set(styles, result);
        return result;
    }

    /**
     * Draws a single text-decoration line segment using the given style.
     * For horizontal text:  x, y = top-left corner, w = length along text, h = line thickness.
     * For vertical text:    x, y = top-left corner, w = line thickness,   h = length along text.
     * The `isVertical` flag swaps the semantics of w/h for dotted/dashed segment sizing.
     */
    renderDecorationLine(
        style: number,
        x: number,
        y: number,
        w: number,
        h: number,
        isVertical: boolean,
        textDecorationLine: TEXT_DECORATION_LINE,
    ): void {
        switch (style) {
            case TEXT_DECORATION_STYLE.DOUBLE: {
                // For double, `h` (or `w` in vertical) is the thickness of each individual line.
                // Gap between the two lines = max(1, round(thickness / 2)).
                if (isVertical) {
                    const lineW = Math.max(1, w);
                    const gap = Math.max(1, Math.round(w / 2));
                    this.ctx.fillRect(x, y, lineW, h);
                    if (textDecorationLine === TEXT_DECORATION_LINE.OVERLINE) {
                        this.ctx.fillRect(x - lineW - gap, y, lineW, h);
                    } else {
                        this.ctx.fillRect(x + lineW + gap, y, lineW, h);
                    }
                } else {
                    const lineH = Math.max(1, h);
                    const gap = Math.max(1, Math.trunc(h / 2));
                    this.ctx.fillRect(x, y, w, lineH);
                    if (textDecorationLine === TEXT_DECORATION_LINE.OVERLINE) {
                        this.ctx.fillRect(x, y - lineH - gap, w, lineH);
                    } else {
                        this.ctx.fillRect(x, y + lineH + gap, w, lineH);
                    }
                }
                break;
            }
            case TEXT_DECORATION_STYLE.DOTTED: {
                // Dots (squares) with diameter = thickness, spaced by one dot width.
                const dotSize = isVertical ? w : h;
                const length = isVertical ? h : w;
                const step = dotSize * 2;
                for (let pos = 0; pos < length; pos += step) {
                    if (isVertical) {
                        this.ctx.fillRect(x, y + pos, w, Math.min(dotSize, length - pos));
                    } else {
                        this.ctx.fillRect(x + pos, y, Math.min(dotSize, length - pos), h);
                    }
                }
                break;
            }
            case TEXT_DECORATION_STYLE.DASHED: {
                // Dashes 3× the thickness long, with a gap equal to the dash length.
                const thickness = isVertical ? w : h;
                const dashLen = thickness * 3;
                const length = isVertical ? h : w;
                const step = dashLen * 2;
                for (let pos = 0; pos < length; pos += step) {
                    if (isVertical) {
                        this.ctx.fillRect(x, y + pos, w, Math.min(dashLen, length - pos));
                    } else {
                        this.ctx.fillRect(x + pos, y, Math.min(dashLen, length - pos), h);
                    }
                }
                break;
            }
            case TEXT_DECORATION_STYLE.SOLID:
            case TEXT_DECORATION_STYLE.WAVY:
            default:
                // solid (and unimplemented wavy) fall back to a simple filled rectangle.
                this.ctx.fillRect(x, y, w, h);
                break;
        }
    }

    async renderTextNode(text: TextContainer, styles: CSSParsedDeclaration): Promise<void> {
        const [font, fontFamily, fontSize] = this.createFontStyle(styles);

        this.ctx.font = font;

        this.ctx.direction = styles.direction === DIRECTION.RTL ? 'rtl' : 'ltr';
        this.ctx.textAlign = 'left';
        this.ctx.textBaseline = 'alphabetic';
        const paintOrder = styles.paintOrder;
        const wm = styles.writingMode;
        const isVertical =
            wm === WRITING_MODE.VERTICAL_RL ||
            wm === WRITING_MODE.VERTICAL_LR ||
            wm === WRITING_MODE.SIDEWAYS_RL ||
            wm === WRITING_MODE.SIDEWAYS_LR;

        // Use the real measured baseline offset so that Firefox and Chrome both
        // place text at the correct vertical position regardless of line-height.
        const { baseline } = this.fontMetrics.getMetrics(fontFamily, fontSize);

        text.textBounds.forEach(text => {
            paintOrder.forEach(paintOrderLayer => {
                switch (paintOrderLayer) {
                    case PAINT_ORDER_LAYER.FILL:
                        // When background-clip: text is active, the text fill is handled
                        // by the background compositing — skip normal text rendering.
                        if (getBackgroundValueForIndex(styles.backgroundClip, 0) === BACKGROUND_CLIP.TEXT) {
                            break;
                        }
                        this.ctx.fillStyle = asString(styles.color);
                        const textShadows: TextShadow = styles.textShadow;

                        if (textShadows.length && text.text.trim().length) {
                            // Render each shadow manually: draw the text in the shadow color
                            // at the shadow offset on an isolated offscreen canvas, then apply
                            // a CSS blur filter before compositing onto the main canvas.
                            // This bypasses the Canvas shadow API entirely, which cannot handle
                            // transparent text or multiple independent blur radii.
                            const w = this.canvas.width;
                            const h = this.canvas.height;
                            const scale = this.options.scale;
                            const ox = this.options.x;
                            const oy = this.options.y;

                            textShadows
                                .slice(0)
                                .reverse()
                                .forEach(textShadow => {
                                    const shadowCanvas = document.createElement('canvas');
                                    shadowCanvas.width = w;
                                    shadowCanvas.height = h;
                                    const shadowCtx = shadowCanvas.getContext('2d') as CanvasRenderingContext2D;
                                    shadowCtx.scale(scale, scale);
                                    // Incorporate the shadow offset into the translate so the
                                    // text is drawn at the correct position on the offscreen.
                                    shadowCtx.translate(
                                        -ox + textShadow.offsetX.number,
                                        -oy + textShadow.offsetY.number,
                                    );
                                    shadowCtx.font = this.ctx.font;
                                    shadowCtx.direction = this.ctx.direction;
                                    shadowCtx.textAlign = this.ctx.textAlign;
                                    shadowCtx.textBaseline = this.ctx.textBaseline;
                                    shadowCtx.fillStyle = asString(textShadow.color);

                                    const mainCtx = this.ctx;
                                    this.ctx = shadowCtx;
                                    this.renderTextWithLetterSpacing(text, styles.letterSpacing, baseline, wm);
                                    this.ctx = mainCtx;

                                    // Apply blur via ctx.filter on the main canvas drawImage call.
                                    if (textShadow.blur.number > 0) {
                                        this.ctx.save();
                                        this.ctx.filter = `blur(${textShadow.blur.number / 2}px)`;
                                    }
                                    this.ctx.drawImage(shadowCanvas, 0, 0, w, h, ox, oy, w / scale, h / scale);
                                    if (textShadow.blur.number > 0) {
                                        this.ctx.restore();
                                    }
                                });

                            // Draw the real text on top of all shadows.
                            // Skipped for transparent text — shadows are the only visual.
                            if (!isTransparent(styles.color)) {
                                this.ctx.save();
                                this.ctx.fillStyle = asString(styles.color);
                                this.renderTextWithLetterSpacing(text, styles.letterSpacing, baseline, wm);
                                this.ctx.restore();
                            }
                        } else if (!isTransparent(styles.color)) {
                            this.renderTextWithLetterSpacing(text, styles.letterSpacing, baseline, wm);
                        }

                        if (styles.textDecorationLine.length) {
                            this.ctx.fillStyle = asString(
                                isTransparent(styles.textDecorationColor) ? styles.color : styles.textDecorationColor,
                            );
                            // Resolve line thickness: explicit value or 1px fallback for auto/from-font.
                            const thickness =
                                typeof styles.textDecorationThickness === 'number' ? styles.textDecorationThickness : 1;
                            styles.textDecorationLine.forEach(textDecorationLine => {
                                if (isVertical) {
                                    const underlineOnLeft =
                                        wm === WRITING_MODE.VERTICAL_LR || wm === WRITING_MODE.VERTICAL_RL;
                                    let lineX: number;
                                    switch (textDecorationLine) {
                                        case TEXT_DECORATION_LINE.UNDERLINE:
                                            lineX = underlineOnLeft
                                                ? text.bounds.left
                                                : text.bounds.left + text.bounds.width - thickness;
                                            break;
                                        case TEXT_DECORATION_LINE.OVERLINE:
                                            lineX = underlineOnLeft
                                                ? text.bounds.left + text.bounds.width - thickness
                                                : text.bounds.left;
                                            break;
                                        case TEXT_DECORATION_LINE.LINE_THROUGH:
                                        default:
                                            lineX = text.bounds.left + text.bounds.width / 2 - thickness / 2;
                                            break;
                                    }
                                    this.renderDecorationLine(
                                        styles.textDecorationStyle,
                                        lineX,
                                        text.bounds.top,
                                        thickness,
                                        text.bounds.height,
                                        true,
                                        textDecorationLine,
                                    );
                                } else {
                                    // baseline = distance from bounds.top to the alphabetic baseline.
                                    // Use it to position decorations relative to actual glyph positions
                                    // rather than the full line-height bounding box.
                                    const baselineY = text.bounds.top + baseline;
                                    let lineY: number;
                                    switch (textDecorationLine) {
                                        case TEXT_DECORATION_LINE.UNDERLINE:
                                            lineY = baselineY + 2;
                                            break;
                                        case TEXT_DECORATION_LINE.OVERLINE:
                                            lineY = Math.round(text.bounds.top + (text.bounds.height - baseline) * 0.1);
                                            break;
                                        case TEXT_DECORATION_LINE.LINE_THROUGH:
                                        default:
                                            lineY = Math.round(baselineY - baseline * 0.4) + 2;
                                            break;
                                    }
                                    this.renderDecorationLine(
                                        styles.textDecorationStyle,
                                        text.bounds.left,
                                        lineY,
                                        text.bounds.width,
                                        thickness,
                                        false,
                                        textDecorationLine,
                                    );
                                }
                            });
                        }
                        break;
                    case PAINT_ORDER_LAYER.STROKE:
                        if (styles.webkitTextStrokeWidth && text.text.trim().length) {
                            this.ctx.strokeStyle = asString(styles.webkitTextStrokeColor);
                            this.ctx.lineWidth = styles.webkitTextStrokeWidth;
                            this.ctx.lineJoin = this._isChrome ? 'miter' : 'round';
                            this.renderTextWithLetterSpacing(text, styles.letterSpacing, baseline, wm, true);
                        }
                        this.ctx.strokeStyle = '';
                        this.ctx.lineWidth = 0;
                        this.ctx.lineJoin = 'miter';
                        break;
                }
            });
        });
    }

    renderReplacedElement(
        container: ReplacedElementContainer,
        curves: BoundCurves,
        image: HTMLImageElement | HTMLCanvasElement,
    ): void {
        if (image) {
            const isContainerWSizes = container.intrinsicWidth > 0 && container.intrinsicHeight > 0;
            const isSVGContainer =
                container instanceof SVGElementContainer ||
                (container instanceof ImageElementContainer && container.isSVG);
            if (isContainerWSizes || isSVGContainer) {
                const box = contentBox(container);
                const path = calculatePaddingBoxPath(curves);
                this.path(path);
                const { src, dest } = calculateObjectFitBounds(
                    container.styles.objectFit,
                    container.intrinsicWidth,
                    container.intrinsicHeight,
                    box.width,
                    box.height,
                );
                this.ctx.save();
                this.ctx.clip();
                if (isContainerWSizes) {
                    this.ctx.drawImage(
                        image,
                        src.left,
                        src.top,
                        src.width,
                        src.height,
                        box.left + dest.left,
                        box.top + dest.top,
                        dest.width,
                        dest.height,
                    );
                } else {
                    // As usual it won't work in FF. https://bugzilla.mozilla.org/show_bug.cgi?id=700533
                    this.ctx.drawImage(image, box.left, box.top, box.width, box.height);
                }
                this.ctx.restore();
            }
        }
    }

    async renderNodeContent(paint: ElementPaint): Promise<void> {
        this.applyEffects(paint.getEffects(EffectTarget.CONTENT));
        const container = paint.container;
        const curves = paint.curves;
        const styles = container.styles;
        for (const child of container.textNodes) {
            await this.renderTextNode(child, styles);
        }

        if (container instanceof ImageElementContainer) {
            try {
                const image = await this.context.cache.match(container.src);
                await container.setup(image);
                this.renderReplacedElement(container, curves, image);
            } catch (e) {
                try {
                    if (this.context.cache.deleteImage(container.src) && e.type === 'error') {
                        this.context.cache.addImage(container.src);
                        const image = await this.context.cache.match(container.src);
                        this.renderReplacedElement(container, curves, image);
                    }
                } catch (e) {
                    this.context.logger.error(`Error loading image ${container.src}`);
                }
            }
        }

        if (container instanceof CanvasElementContainer) {
            this.renderReplacedElement(container, curves, container.canvas);
        }

        if (container instanceof SVGElementContainer) {
            try {
                const image = await this.context.cache.match(container.svg);
                this.renderReplacedElement(container, curves, image);
            } catch (e) {
                this.context.logger.error(`Error loading svg ${container.svg.substring(0, 255)}`);
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
                this.ctx.drawImage(
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

        if (container instanceof InputElementContainer) {
            const size = Math.min(container.bounds.width, container.bounds.height);

            if (container.type === CHECKBOX) {
                if (container.checked) {
                    this.ctx.save();
                    this.path([
                        new Vector(container.bounds.left + size * 0.39363, container.bounds.top + size * 0.79),
                        new Vector(container.bounds.left + size * 0.16, container.bounds.top + size * 0.5549),
                        new Vector(container.bounds.left + size * 0.27347, container.bounds.top + size * 0.44071),
                        new Vector(container.bounds.left + size * 0.39694, container.bounds.top + size * 0.5649),
                        new Vector(container.bounds.left + size * 0.72983, container.bounds.top + size * 0.23),
                        new Vector(container.bounds.left + size * 0.84, container.bounds.top + size * 0.34085),
                        new Vector(container.bounds.left + size * 0.39363, container.bounds.top + size * 0.79),
                    ]);

                    this.ctx.fillStyle = asString(INPUT_COLOR);
                    this.ctx.fill();
                    this.ctx.restore();
                }
            } else if (container.type === RADIO) {
                if (container.checked) {
                    this.ctx.save();
                    this.ctx.beginPath();
                    this.ctx.arc(
                        container.bounds.left + size / 2,
                        container.bounds.top + size / 2,
                        size / 4,
                        0,
                        Math.PI * 2,
                        true,
                    );
                    this.ctx.fillStyle = asString(INPUT_COLOR);
                    this.ctx.fill();
                    this.ctx.restore();
                }
            } else if (container.type === RANGE) {
                // Draw range input: track + thumb
                const bounds = container.bounds;
                const ratio =
                    container.max > container.min
                        ? (container.valueAsNumber - container.min) / (container.max - container.min)
                        : 0;
                const isHorizontal = bounds.width >= bounds.height;
                const trackThickness = 4;
                const thumbRadius = Math.min(bounds.width, bounds.height) * 0.35;

                this.ctx.save();
                if (isHorizontal) {
                    // Track
                    const trackY = bounds.top + bounds.height / 2 - trackThickness / 2;
                    const trackLeft = bounds.left + thumbRadius;
                    const trackWidth = bounds.width - thumbRadius * 2;
                    this.ctx.fillStyle = '#c0c0c0';
                    this.ctx.fillRect(trackLeft, trackY, trackWidth, trackThickness);
                    // Filled portion
                    this.ctx.fillStyle = '#0075ff';
                    this.ctx.fillRect(trackLeft, trackY, trackWidth * ratio, trackThickness);
                    // Thumb
                    const thumbX = trackLeft + trackWidth * ratio;
                    const thumbY = bounds.top + bounds.height / 2;
                    this.ctx.beginPath();
                    this.ctx.arc(thumbX, thumbY, thumbRadius, 0, Math.PI * 2);
                    this.ctx.fillStyle = '#ffffff';
                    this.ctx.fill();
                    this.ctx.strokeStyle = '#0075ff';
                    this.ctx.lineWidth = 2;
                    this.ctx.stroke();
                } else {
                    // Vertical track
                    const trackX = bounds.left + bounds.width / 2 - trackThickness / 2;
                    const trackTop = bounds.top + thumbRadius;
                    const trackHeight = bounds.height - thumbRadius * 2;
                    this.ctx.fillStyle = '#c0c0c0';
                    this.ctx.fillRect(trackX, trackTop, trackThickness, trackHeight);
                    // Filled portion (bottom to value)
                    const filledHeight = trackHeight * ratio;
                    this.ctx.fillStyle = '#0075ff';
                    this.ctx.fillRect(trackX, trackTop + trackHeight - filledHeight, trackThickness, filledHeight);
                    // Thumb
                    const thumbX = bounds.left + bounds.width / 2;
                    const thumbY = trackTop + trackHeight * (1 - ratio);
                    this.ctx.beginPath();
                    this.ctx.arc(thumbX, thumbY, thumbRadius, 0, Math.PI * 2);
                    this.ctx.fillStyle = '#ffffff';
                    this.ctx.fill();
                    this.ctx.strokeStyle = '#0075ff';
                    this.ctx.lineWidth = 2;
                    this.ctx.stroke();
                }
                this.ctx.restore();
            }
        }

        if (container instanceof ProgressElementContainer) {
            const bounds = container.bounds;
            const ratio = container.ratio;
            const borderRadius = Math.min(bounds.height / 2, 4);

            this.ctx.save();
            // Track background
            this.ctx.beginPath();
            this.ctx.roundRect(bounds.left, bounds.top, bounds.width, bounds.height, borderRadius);
            this.ctx.fillStyle = '#e6e6e6';
            this.ctx.fill();
            // Filled bar
            if (ratio > 0) {
                const fillWidth = bounds.width * ratio;
                this.ctx.beginPath();
                this.ctx.roundRect(bounds.left, bounds.top, fillWidth, bounds.height, borderRadius);
                this.ctx.fillStyle = '#0075ff';
                this.ctx.fill();
            }
            this.ctx.restore();
        }

        if (container instanceof MeterElementContainer) {
            const bounds = container.bounds;
            const ratio = container.ratio;
            const state = container.state;
            const borderRadius = Math.min(bounds.height / 2, 4);

            // Color based on meter state
            let fillColor: string;
            switch (state) {
                case METER_STATE.OPTIMUM:
                    fillColor = '#30b030';
                    break;
                case METER_STATE.SUBOPTIMUM:
                    fillColor = '#daa520';
                    break;
                case METER_STATE.CRITICAL:
                default:
                    fillColor = '#e04040';
                    break;
            }

            this.ctx.save();
            // Track background
            this.ctx.beginPath();
            this.ctx.roundRect(bounds.left, bounds.top, bounds.width, bounds.height, borderRadius);
            this.ctx.fillStyle = '#e6e6e6';
            this.ctx.fill();
            // Filled bar
            if (ratio > 0) {
                const fillWidth = bounds.width * ratio;
                this.ctx.beginPath();
                this.ctx.roundRect(bounds.left, bounds.top, fillWidth, bounds.height, borderRadius);
                this.ctx.fillStyle = fillColor;
                this.ctx.fill();
            }
            this.ctx.restore();
        }

        if (isTextInputElement(container) && container.value.length) {
            const [font, fontFamily, fontSize] = this.createFontStyle(styles);
            const { baseline } = this.fontMetrics.getMetrics(fontFamily, fontSize);

            this.ctx.font = font;
            this.ctx.fillStyle = asString(styles.color);

            this.ctx.textBaseline = 'alphabetic';
            this.ctx.textAlign = canvasTextAlign(container.styles.textAlign);

            const bounds = contentBox(container);

            this.ctx.save();
            this.path([
                new Vector(bounds.left, bounds.top),
                new Vector(bounds.left + bounds.width, bounds.top),
                new Vector(bounds.left + bounds.width, bounds.top + bounds.height),
                new Vector(bounds.left, bounds.top + bounds.height),
            ]);
            this.ctx.clip();

            if (container instanceof TextareaElementContainer) {
                // Multi-line rendering for <textarea>
                // Use the browser-computed line height so that spacing exactly
                // matches the reference rendering.
                const fontSizeNumber = getNumber(styles.fontSize);
                const lineHeight = computeLineHeight(styles.lineHeight, fontSizeNumber);

                // Honour scrollTop so that a scrolled textarea clips correctly.
                const scrollTop = container.scrollTop ?? 0;

                // Align the x origin with the textAlign setting (same as input below).
                let xOffset = 0;
                switch (container.styles.textAlign) {
                    case TEXT_ALIGN.CENTER:
                        xOffset = bounds.width / 2;
                        break;
                    case TEXT_ALIGN.RIGHT:
                        xOffset = bounds.width;
                        break;
                }
                const originX = bounds.left + xOffset;

                // Measure the rendered width of a string in CSS pixels.
                //
                // ctx has an active scale transform, so measureText returns widths in
                // physical pixels — divide by scale to get CSS pixels comparable to
                // bounds.width.
                //
                // When letterSpacing !== 0, renderTextWithLetterSpacing draws each
                // grapheme individually and advances by ctx.measureText(g).width +
                // letterSpacing per grapheme.  We mirror that here so the wrap budget
                // matches the actual painted width.  The division by scale applies only
                // to the measureText part; letterSpacing is already in CSS pixels.
                const letterSpacing = styles.letterSpacing;
                const measureWidth = (text: string): number => {
                    if (letterSpacing !== 0 && text.length > 0) {
                        const graphemeCount = segmentGraphemes(text).length;
                        // Measure the full string at once so that kerning between
                        // character pairs is accounted for (ctx.measureText on a single
                        // glyph misses kerning with its neighbours).  Then add
                        // letter-spacing gaps: (n-1) gaps because the browser does not
                        // count trailing letter-spacing in the wrap budget.
                        const glyphsWidth = this.ctx.measureText(text).width / this.options.scale;
                        return glyphsWidth + (letterSpacing - 1) * (graphemeCount - 1);
                    }
                    return this.ctx.measureText(text).width / this.options.scale;
                };

                // Wrap a single paragraph into lines that fit within maxWidth.
                // 1. First try to break on whitespace / after hyphens (normal wrap).
                // 2. If a single token still exceeds maxWidth, fall back to breaking
                //    it character by character (browser behaviour for long words /
                //    overflow-wrap: break-word equivalent in textarea).
                const wrapParagraph = (paragraph: string, maxWidth: number): string[] => {
                    const lines: string[] = [];

                    // Helper: break a single unsplittable chunk character-by-character.
                    const breakChunk = (chunk: string): void => {
                        const graphemes = segmentGraphemes(chunk);
                        let current = '';
                        for (const g of graphemes) {
                            const candidate = current + g;
                            if (current.length > 0 && measureWidth(candidate) > maxWidth) {
                                lines.push(current);
                                current = g;
                            } else {
                                current = candidate;
                            }
                        }
                        if (current.length > 0) {
                            lines.push(current);
                        }
                    };

                    // Tokenise on whitespace AND after hyphens so that hyphenated
                    // compounds ("many-manymany") can break after the dash, matching
                    // the browser's default line-breaking behaviour for textareas.
                    const tokens = paragraph.split(/(\s+|(?<=-+))/);
                    let currentLine = '';
                    for (const token of tokens) {
                        if (token === '') continue;
                        const candidate = currentLine + token;
                        if (currentLine.length > 0 && measureWidth(candidate) > maxWidth) {
                            // Flush the current line.
                            lines.push(currentLine);
                            const trimmed = token.trimStart();
                            // If the token itself is wider than the box, break it
                            // character by character rather than leaving it on one line.
                            if (trimmed.length > 0 && measureWidth(trimmed) > maxWidth) {
                                breakChunk(trimmed);
                                currentLine = lines.pop() ?? '';
                            } else {
                                currentLine = trimmed;
                            }
                        } else {
                            // First token on a new line: if it alone exceeds the width,
                            // break it character by character right away.
                            if (currentLine.length === 0 && measureWidth(token.trimStart()) > maxWidth) {
                                const trimmed = token.trimStart();
                                breakChunk(trimmed);
                                currentLine = lines.pop() ?? '';
                            } else {
                                currentLine = candidate;
                            }
                        }
                    }
                    if (currentLine.length > 0) {
                        lines.push(currentLine);
                    }
                    return lines;
                };

                // Split on explicit newlines first, then word-wrap each paragraph.
                const paragraphs = container.value.split('\n');
                const wrappedLines: string[] = [];
                for (const paragraph of paragraphs) {
                    if (paragraph.length === 0) {
                        // Preserve blank lines produced by consecutive newlines.
                        wrappedLines.push('');
                        continue;
                    }
                    for (const line of wrapParagraph(paragraph, bounds.width)) {
                        wrappedLines.push(line);
                    }
                }

                // Render each wrapped line at the appropriate vertical position,
                // accounting for scrollTop so only visible lines are painted.
                wrappedLines.forEach((line, index) => {
                    const lineTop = index * lineHeight - scrollTop;
                    // Skip lines that are completely outside the content box.
                    if (lineTop + lineHeight < 0 || lineTop > bounds.height) {
                        return;
                    }
                    const lineBounds = new Bounds(originX, bounds.top + lineTop, bounds.width, lineHeight);
                    this.renderTextWithLetterSpacing(new TextBounds(line, lineBounds), styles.letterSpacing, baseline);
                });
            } else {
                // Single-line rendering for <input> and <select>.
                let x = 0;
                switch (container.styles.textAlign) {
                    case TEXT_ALIGN.CENTER:
                        x += bounds.width / 2;
                        break;
                    case TEXT_ALIGN.RIGHT:
                        x += bounds.width;
                        break;
                }
                const textBounds = bounds.add(x, 0, 0, -bounds.height / 2 + 1);
                this.renderTextWithLetterSpacing(
                    new TextBounds(container.value, textBounds),
                    styles.letterSpacing,
                    baseline,
                );
            }

            this.ctx.restore();
            this.ctx.textBaseline = 'alphabetic';
            this.ctx.textAlign = 'left';
        }

        if (contains(container.styles.display, DISPLAY.LIST_ITEM)) {
            if (container.styles.listStyleImage !== null) {
                const img = container.styles.listStyleImage;
                if (img.type === CSSImageType.URL) {
                    let image;
                    const url = (img as CSSURLImage).url;
                    try {
                        image = await this.context.cache.match(url);
                        this.ctx.drawImage(image, container.bounds.left - (image.width + 10), container.bounds.top);
                    } catch (e) {
                        this.context.logger.error(`Error loading list-style-image ${url}`);
                    }
                }
            } else if (paint.listValue && container.styles.listStyleType !== LIST_STYLE_TYPE.NONE) {
                const [fontFamily] = this.createFontStyle(styles);
                const wm = styles.writingMode;
                const isVerticalList =
                    wm === WRITING_MODE.VERTICAL_RL ||
                    wm === WRITING_MODE.VERTICAL_LR ||
                    wm === WRITING_MODE.SIDEWAYS_RL ||
                    wm === WRITING_MODE.SIDEWAYS_LR;

                this.ctx.font = fontFamily;
                this.ctx.fillStyle = asString(styles.color);

                if (isVerticalList && container.styles.listStylePosition === LIST_STYLE_POSITION.OUTSIDE) {
                    // In vertical writing modes with list-style-position: outside,
                    // the list marker appears at inline-start outside the <li>, rotated like the text.
                    const fontSize = getNumber(styles.fontSize);
                    const isSidewaysLR = wm === WRITING_MODE.SIDEWAYS_LR;
                    const angle = isSidewaysLR ? -Math.PI / 2 : Math.PI / 2;

                    // First column center x = container.left + paddingLeft + fontSize/2
                    const markerX =
                        container.bounds.left +
                        getAbsoluteValue(container.styles.paddingLeft, container.bounds.width) +
                        fontSize / 2;

                    // Inline-start differs by writing mode:
                    //   sideways-lr: inline-start is bottom → marker below content
                    //   vertical-rl/lr, sideways-rl: inline-start is top → marker above content
                    let markerY: number;
                    if (isSidewaysLR) {
                        markerY = container.bounds.top + container.bounds.height + fontSize;
                    } else {
                        markerY = container.bounds.top - fontSize / 2;
                    }

                    this.ctx.save();
                    this.ctx.translate(markerX, markerY);
                    this.ctx.rotate(angle);
                    this.ctx.textBaseline = isSidewaysLR ? 'hanging' : 'alphabetic';
                    this.ctx.textAlign = 'center';
                    this.ctx.fillText(paint.listValue, 0, 0);
                    this.ctx.restore();
                } else if (isVerticalList && container.styles.listStylePosition === LIST_STYLE_POSITION.INSIDE) {
                    // In vertical writing modes with list-style-position: inside,
                    // the marker is at the beginning of the text content (inline-start, inside padding).
                    const fontSize = getNumber(styles.fontSize);
                    const isSidewaysLR = wm === WRITING_MODE.SIDEWAYS_LR;
                    const angle = isSidewaysLR ? -Math.PI / 2 : Math.PI / 2;

                    // Position within the content area
                    const markerX =
                        container.bounds.left +
                        getAbsoluteValue(container.styles.paddingLeft, container.bounds.width) +
                        fontSize / 2;

                    // Inside: marker at the start of content within the box
                    let markerY: number;
                    if (isSidewaysLR) {
                        // sideways-lr: text goes bottom→top, so inline-start = bottom of content
                        markerY =
                            container.bounds.top +
                            container.bounds.height -
                            getAbsoluteValue(container.styles.paddingBottom, container.bounds.height) -
                            fontSize / 2;
                    } else {
                        // vertical-rl/lr: text goes top→bottom, so inline-start = top of content
                        markerY =
                            container.bounds.top +
                            getAbsoluteValue(container.styles.paddingTop, container.bounds.height) +
                            fontSize / 2;
                    }

                    this.ctx.save();
                    this.ctx.translate(markerX, markerY);
                    this.ctx.rotate(angle);
                    this.ctx.textBaseline = isSidewaysLR ? 'hanging' : 'alphabetic';
                    this.ctx.textAlign = 'right';
                    this.ctx.fillText(paint.listValue, 0, 0);
                    this.ctx.restore();
                } else {
                    this.ctx.textBaseline = 'alphabetic';
                    this.ctx.textAlign = 'right';

                    // Align the marker baseline with the first line of the list item.
                    // Use raw metrics (no browser-specific adjustment) so the marker
                    // sits exactly on the same baseline as the item text on all browsers.
                    const [, fontFamily, fontSize] = this.createFontStyle(styles);
                    const { baseline } = this.fontMetrics.getRawMetrics(fontFamily, fontSize);
                    const lineHeight = computeLineHeight(styles.lineHeight, getNumber(styles.fontSize));
                    const leading = Math.max(0, lineHeight - getNumber(styles.fontSize));

                    const markerY =
                        Math.floor(
                            container.bounds.top +
                                getAbsoluteValue(container.styles.paddingTop, container.bounds.width) +
                                leading / 2 +
                                baseline,
                        ) - (this._isFirefox ? 1 : 0);

                    this.ctx.fillText(paint.listValue, container.bounds.left, markerY);
                }
                this.ctx.textBaseline = 'bottom';
                this.ctx.textAlign = 'left';
            }
        }
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

    mask(paths: Path[]): void {
        this.ctx.beginPath();
        this.ctx.save();
        // reset tranform to identity
        this.ctx.setTransform(1, 0, 0, 1, 0, 0);
        this.ctx.moveTo(0, 0);
        this.ctx.lineTo(this.canvas.width, 0);
        this.ctx.lineTo(this.canvas.width, this.canvas.height);
        this.ctx.lineTo(0, this.canvas.height);
        this.ctx.lineTo(0, 0);
        this.ctx.restore();
        this.formatPath(reversePath(paths));
        this.ctx.closePath();
    }

    path(paths: Path[]): void {
        this.ctx.beginPath();
        this.formatPath(paths);
        this.ctx.closePath();
    }

    formatPath(paths: Path[]): void {
        paths.forEach((point, index) => {
            const start: Vector = isBezierCurve(point) ? point.start : point;
            if (index === 0) {
                this.ctx.moveTo(start.x, start.y);
            } else {
                this.ctx.lineTo(start.x, start.y);
            }
            if (isBezierCurve(point)) {
                this.ctx.bezierCurveTo(
                    point.startControl.x,
                    point.startControl.y,
                    point.endControl.x,
                    point.endControl.y,
                    point.end.x,
                    point.end.y,
                );
            }
        });
    }

    renderRepeat(path: Path[], pattern: CanvasPattern | CanvasGradient, offsetX: number, offsetY: number): void {
        this.path(path);
        this.ctx.fillStyle = pattern;
        this.ctx.translate(offsetX, offsetY);
        this.ctx.fill();
        this.ctx.translate(-offsetX, -offsetY);
    }

    resizeImage(image: HTMLImageElement, width: number, height: number): HTMLCanvasElement | HTMLImageElement {
        // Commented out to solve "Operation is insecure" on safari
        // if (image.width === width && image.height === height) {
        //     return image;
        // }

        const ownerDocument = this.canvas.ownerDocument ?? document;
        const canvas = ownerDocument.createElement('canvas');
        canvas.width = Math.max(1, width);
        canvas.height = Math.max(1, height);
        const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
        ctx.drawImage(image, 0, 0, image.width, image.height, 0, 0, width, height);
        return canvas;
    }

    async renderBackgroundImage(container: ElementContainer): Promise<void> {
        let index = container.styles.backgroundImage.length - 1;
        for (const backgroundImage of container.styles.backgroundImage.slice(0).reverse()) {
            console.log('>>>', backgroundImage.type);

            const blendMode = getBackgroundValueForIndex(container.styles.backgroundBlendMode, index);
            if (blendMode !== 'source-over') {
                this.ctx.globalCompositeOperation = blendMode;
            }
            if (backgroundImage.type === CSSImageType.URL) {
                let image;
                const url = (backgroundImage as CSSURLImage).url;
                try {
                    image = await this.context.cache.match(url);
                } catch (e) {
                    this.context.logger.error(`Error loading background-image ${url}`);
                }

                if (image && image.width > 0 && image.height > 0) {
                    const [path, x, y, width, height] = calculateBackgroundRendering(container, index, [
                        image.width,
                        image.height,
                        image.width / image.height,
                    ]);
                    const pattern = this.ctx.createPattern(
                        this.resizeImage(image, width, height),
                        'repeat',
                    ) as CanvasPattern;
                    this.renderRepeat(path, pattern, x, y);
                }
            } else if (isLinearGradient(backgroundImage)) {
                const [path, x, y, width, height] = calculateBackgroundRendering(container, index, [null, null, null]);
                const [lineLength, x0, x1, y0, y1] = calculateGradientDirection(backgroundImage.angle, width, height);

                const canvas = document.createElement('canvas');
                canvas.width = Math.max(1, width);
                canvas.height = Math.max(1, height);
                const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
                const gradient = ctx.createLinearGradient(x0, y0, x1, y1);

                processColorStops(backgroundImage.stops, lineLength || 1).forEach(colorStop =>
                    gradient.addColorStop(colorStop.stop, asString(colorStop.color)),
                );

                ctx.fillStyle = gradient;
                ctx.fillRect(0, 0, width, height);
                if (width > 0 && height > 0) {
                    const pattern = this.ctx.createPattern(canvas, 'repeat') as CanvasPattern;
                    this.renderRepeat(path, pattern, x, y);
                }
            } else if (isRepeatingLinearGradient(backgroundImage)) {
                const [path, x, y, width, height] = calculateBackgroundRendering(container, index, [null, null, null]);
                const [lineLength, x0, x1, y0, y1] = calculateGradientDirection(backgroundImage.angle, width, height);

                const canvas = document.createElement('canvas');
                canvas.width = Math.max(1, width);
                canvas.height = Math.max(1, height);
                const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
                const gradient = ctx.createLinearGradient(x0, y0, x1, y1);

                // processColorStops normalises stops to [0,1] relative to lineLength
                const processedStops = processColorStops(backgroundImage.stops, lineLength || 1);
                const tileStart = processedStops[0].stop;
                const tileEnd = processedStops[processedStops.length - 1].stop;
                const tileSize = tileEnd - tileStart;

                if (tileSize > 0) {
                    // Build all tiled stops in [0,1] by repeating the tile backward and forward.
                    // Use a max-iterations guard to prevent runaway loops on degenerate inputs.
                    const MAX_ITER = 512;
                    const allStops: Array<{ stop: number; color: (typeof processedStops)[0]['color'] }> = [];

                    // Tile backward: while the tile still contributes stops >= 0
                    for (let iter = 1; iter <= MAX_ITER && tileStart - iter * tileSize > -tileSize; iter++) {
                        const offset = iter * tileSize;
                        processedStops.forEach(s => {
                            allStops.push({ stop: Math.max(0, s.stop - offset), color: s.color });
                        });
                        if (tileStart - offset <= 0) break;
                    }
                    // Original tile
                    processedStops.forEach(s => allStops.push({ stop: s.stop, color: s.color }));
                    // Tile forward: while the tile still contributes stops <= 1
                    for (let iter = 1; iter <= MAX_ITER && tileEnd + (iter - 1) * tileSize < 1; iter++) {
                        const offset = iter * tileSize;
                        processedStops.forEach(s => {
                            allStops.push({ stop: Math.min(1, s.stop + offset), color: s.color });
                        });
                    }

                    // Clamp edges: ensure 0 and 1 are covered with the boundary stop's colour
                    if (allStops[0].stop > 0) {
                        allStops.unshift({ stop: 0, color: allStops[0].color });
                    }
                    if (allStops[allStops.length - 1].stop < 1) {
                        allStops.push({ stop: 1, color: allStops[allStops.length - 1].color });
                    }

                    allStops.forEach(s => gradient.addColorStop(s.stop, asString(s.color)));
                } else {
                    processedStops.forEach(s => gradient.addColorStop(s.stop, asString(s.color)));
                }

                ctx.fillStyle = gradient;
                ctx.fillRect(0, 0, width, height);
                if (width > 0 && height > 0) {
                    const pattern = this.ctx.createPattern(canvas, 'repeat') as CanvasPattern;
                    this.renderRepeat(path, pattern, x, y);
                }
            } else if (isRadialGradient(backgroundImage)) {
                const [path, left, top, width, height] = calculateBackgroundRendering(container, index, [
                    null,
                    null,
                    null,
                ]);
                const position = backgroundImage.position.length === 0 ? [FIFTY_PERCENT] : backgroundImage.position;
                const x = getAbsoluteValue(position[0], width);
                const y = getAbsoluteValue(position[position.length - 1], height);

                const [rx, ry] = calculateRadius(backgroundImage, x, y, width, height);
                if (rx > 0 && ry > 0) {
                    const radialGradient = this.ctx.createRadialGradient(left + x, top + y, 0, left + x, top + y, rx);

                    processColorStops(backgroundImage.stops, rx * 2).forEach(colorStop =>
                        radialGradient.addColorStop(colorStop.stop, asString(colorStop.color)),
                    );

                    this.path(path);
                    this.ctx.fillStyle = radialGradient;
                    if (rx !== ry) {
                        // transforms for elliptical radial gradient
                        const midX = container.bounds.left + 0.5 * container.bounds.width;
                        const midY = container.bounds.top + 0.5 * container.bounds.height;
                        const f = ry / rx;
                        const invF = 1 / f;

                        this.ctx.save();
                        this.ctx.translate(midX, midY);
                        this.ctx.transform(1, 0, 0, f, 0, 0);
                        this.ctx.translate(-midX, -midY);

                        this.ctx.fillRect(left, invF * (top - midY) + midY, width, height * invF);
                        this.ctx.restore();
                    } else {
                        this.ctx.fill();
                    }
                }
            } else if (isRepeatingRadialGradient(backgroundImage)) {
                const [path, left, top, width, height] = calculateBackgroundRendering(container, index, [
                    null,
                    null,
                    null,
                ]);
                const position = backgroundImage.position.length === 0 ? [FIFTY_PERCENT] : backgroundImage.position;
                const x = getAbsoluteValue(position[0], width);
                const y = getAbsoluteValue(position[position.length - 1], height);

                const [rx, ry] = calculateRadius(backgroundImage, x, y, width, height);
                if (rx > 0 && ry > 0) {
                    // Centre in page-space coordinates
                    const cx = left + x;
                    const cy = top + y;

                    // Calculate maxRadius based on the deformation (f)
                    const f = rx !== ry ? ry / rx : 1;
                    const invF = rx !== ry ? rx / ry : 1;

                    // Apply the inverse ratio (invF) to the Y distance to compensate for the subsequent transform
                    const maxDistX = Math.max(x, width - x);
                    const maxDistY = Math.max(y, height - y) * invF;
                    const maxRadius = Math.sqrt(maxDistX ** 2 + maxDistY ** 2);

                    const drawRadius = Math.max(rx, maxRadius);

                    // Normalise stops against rx...
                    const processedStops = processColorStops(backgroundImage.stops, rx);
                    const scale = rx / drawRadius;
                    const scaledStops = processedStops.map(s => ({ color: s.color, stop: s.stop * scale }));
                    const tileStart = scaledStops[0].stop;
                    const tileEnd = scaledStops[scaledStops.length - 1].stop;
                    const tileSize = tileEnd - tileStart;

                    const allStops: Array<{ stop: number; color: (typeof scaledStops)[0]['color'] }> = [];
                    if (tileSize > 0) {
                        const MAX_ITER = 512;
                        for (let iter = 1; iter <= MAX_ITER && tileStart - iter * tileSize > -tileSize; iter++) {
                            const offset = iter * tileSize;
                            scaledStops.forEach(s => {
                                allStops.push({ color: s.color, stop: Math.max(0, s.stop - offset) });
                            });
                            if (tileStart - offset <= 0) break;
                        }
                        scaledStops.forEach(s => allStops.push({ color: s.color, stop: s.stop }));
                        for (let iter = 1; iter <= MAX_ITER && tileEnd + (iter - 1) * tileSize < 1; iter++) {
                            const offset = iter * tileSize;
                            scaledStops.forEach(s => {
                                allStops.push({ color: s.color, stop: Math.min(1, s.stop + offset) });
                            });
                        }
                    } else {
                        scaledStops.forEach(s => allStops.push({ stop: s.stop, color: s.color }));
                    }

                    const radialGradient = this.ctx.createRadialGradient(cx, cy, 0, cx, cy, drawRadius);
                    allStops.forEach(s => radialGradient.addColorStop(s.stop, asString(s.color)));

                    // Prepare the path (e.g., the box with its border-radius)
                    this.path(path);
                    this.ctx.fillStyle = radialGradient;

                    if (rx !== ry) {
                        // Ellipse
                        this.ctx.save();
                        this.ctx.clip();
                        this.ctx.translate(cx, cy);
                        this.ctx.transform(1, 0, 0, f, 0, 0);
                        this.ctx.translate(-cx, -cy);

                        this.ctx.fillRect(left, invF * (top - cy) + cy, width, height * invF);
                        this.ctx.restore();
                    } else {
                        // Perfect circle
                        this.ctx.fill();
                    }
                }
            } else if (isConicGradient(backgroundImage)) {
                if (
                    typeof CanvasRenderingContext2D !== 'undefined' &&
                    typeof CanvasRenderingContext2D.prototype.createConicGradient === 'function'
                ) {
                    const [path, left, top, width, height] = calculateBackgroundRendering(container, index, [
                        null,
                        null,
                        null,
                    ]);
                    const position = backgroundImage.position.length === 0 ? [FIFTY_PERCENT] : backgroundImage.position;
                    const cx = left + getAbsoluteValue(position[0], width);
                    const cy = top + getAbsoluteValue(position[position.length - 1], height);

                    // CSS conic starts at top (12 o'clock); Canvas createConicGradient starts at right (3 o'clock).
                    // Compensate by subtracting π/2.
                    const conicGrad = this.ctx.createConicGradient(backgroundImage.startAngle - Math.PI / 2, cx, cy);
                    processColorStops(backgroundImage.stops, 360).forEach(colorStop =>
                        conicGrad.addColorStop(colorStop.stop, asString(colorStop.color)),
                    );

                    this.path(path);
                    this.ctx.fillStyle = conicGrad;
                    this.ctx.fill();
                } else {
                    this.context.logger.error('conic-gradient is not supported in this browser');
                }
            } else if (isRepeatingConicGradient(backgroundImage)) {
                if (
                    typeof CanvasRenderingContext2D !== 'undefined' &&
                    typeof CanvasRenderingContext2D.prototype.createConicGradient === 'function'
                ) {
                    const [path, left, top, width, height] = calculateBackgroundRendering(container, index, [
                        null,
                        null,
                        null,
                    ]);
                    const position = backgroundImage.position.length === 0 ? [FIFTY_PERCENT] : backgroundImage.position;
                    // Centre in page-space coordinates (same as radial gradient)
                    const cx = left + getAbsoluteValue(position[0], width);
                    const cy = top + getAbsoluteValue(position[position.length - 1], height);

                    // Conic stops use degree values; normalise against 360 so that e.g. 90deg → 0.25
                    // CSS conic starts at top (12 o'clock); Canvas createConicGradient starts at right (3 o'clock).
                    // Compensate by subtracting π/2 from the start angle.
                    const processedStops = processColorStops(backgroundImage.stops, 360);
                    const tileStart = processedStops[0].stop;
                    const tileEnd = processedStops[processedStops.length - 1].stop;
                    const tileSize = tileEnd - tileStart;

                    const conicGrad = this.ctx.createConicGradient(backgroundImage.startAngle - Math.PI / 2, cx, cy);
                    if (tileSize > 0) {
                        const MAX_ITER = 512;
                        const allStops: Array<{ stop: number; color: (typeof processedStops)[0]['color'] }> = [];

                        for (let iter = 1; iter <= MAX_ITER && tileStart - iter * tileSize > -tileSize; iter++) {
                            const offset = iter * tileSize;
                            processedStops.forEach(s => {
                                allStops.push({ stop: Math.max(0, s.stop - offset), color: s.color });
                            });
                            if (tileStart - offset <= 0) break;
                        }
                        processedStops.forEach(s => allStops.push({ stop: s.stop, color: s.color }));
                        for (let iter = 1; iter <= MAX_ITER && tileEnd + (iter - 1) * tileSize < 1; iter++) {
                            const offset = iter * tileSize;
                            processedStops.forEach(s => {
                                allStops.push({ stop: Math.min(1, s.stop + offset), color: s.color });
                            });
                            // Interpolate the colour at exactly position 1.0 within this tile
                            const tilePos = 1 - processedStops[0].stop - offset;
                            if (tilePos >= 0 && tilePos <= tileSize) {
                                // Find the stop colour just before position 1.0
                                for (let si = processedStops.length - 1; si >= 0; si--) {
                                    if (processedStops[si].stop + offset <= 1) {
                                        allStops.push({ stop: 1, color: processedStops[si].color });
                                        break;
                                    }
                                }
                            }
                        }

                        if (allStops[0].stop > 0) {
                            allStops.unshift({ stop: 0, color: allStops[0].color });
                        }
                        if (allStops[allStops.length - 1].stop < 1) {
                            allStops.push({ stop: 1, color: allStops[allStops.length - 1].color });
                        }

                        allStops.forEach(s => conicGrad.addColorStop(s.stop, asString(s.color)));
                    } else {
                        processedStops.forEach(s => conicGrad.addColorStop(s.stop, asString(s.color)));
                    }

                    this.path(path);
                    this.ctx.fillStyle = conicGrad;
                    this.ctx.fill();
                } else {
                    this.context.logger.error('repeating-conic-gradient is not supported in this browser');
                }
            }
            index--;
            if (blendMode !== 'source-over') {
                this.ctx.globalCompositeOperation = 'source-over';
            }
        }
    }

    async renderSolidBorder(color: Color, side: number, curvePoints: BoundCurves): Promise<void> {
        this.path(parsePathForBorder(curvePoints, side));
        this.ctx.fillStyle = asString(color);
        this.ctx.fill();
    }

    async renderDoubleBorder(color: Color, width: number, side: number, curvePoints: BoundCurves): Promise<void> {
        if (width < 3) {
            await this.renderSolidBorder(color, side, curvePoints);
            return;
        }

        const outerPaths = parsePathForBorderDoubleOuter(curvePoints, side);
        this.path(outerPaths);
        this.ctx.fillStyle = asString(color);
        this.ctx.fill();
        const innerPaths = parsePathForBorderDoubleInner(curvePoints, side);
        this.path(innerPaths);
        this.ctx.fill();
    }

    /**
     * Renders background clipped to text shapes using an offscreen canvas.
     * Steps:
     * 1. Create an offscreen canvas the size of the element's border box.
     * 2. Draw the background (color + images) normally onto the offscreen canvas.
     * 3. Create a text mask canvas with all text shapes drawn as opaque black.
     * 4. Apply 'destination-in' with the mask canvas to clip the background to text.
     * 5. Composite the offscreen canvas back onto the main canvas.
     */
    private async renderBackgroundClipText(paint: ElementPaint): Promise<void> {
        const container = paint.container;
        const styles = container.styles;
        const bounds = container.bounds;

        if (container.textNodes.length === 0) {
            return;
        }

        // Create offscreen canvas sized to element (in device pixels)
        const width = Math.ceil(bounds.width * this.options.scale);
        const height = Math.ceil(bounds.height * this.options.scale);
        if (width <= 0 || height <= 0) {
            return;
        }

        const offscreen = document.createElement('canvas');
        offscreen.width = width;
        offscreen.height = height;
        const offCtx = offscreen.getContext('2d') as CanvasRenderingContext2D;

        // Apply the same transform so absolute coordinates work correctly.
        offCtx.scale(this.options.scale, this.options.scale);
        offCtx.translate(-bounds.left, -bounds.top);

        // Step 1: Draw the background onto the offscreen canvas.
        // Temporarily swap this.ctx so rendering methods target the offscreen canvas.
        const mainCtx = this.ctx;
        this.ctx = offCtx;

        if (!isTransparent(styles.backgroundColor)) {
            this.ctx.fillStyle = asString(styles.backgroundColor);
            this.ctx.fillRect(bounds.left, bounds.top, bounds.width, bounds.height);
        }

        await this.renderBackgroundImage(container);

        this.ctx = mainCtx;

        // Step 2: Create a text mask canvas.
        // All text is drawn as opaque black on a separate canvas so we can apply
        // the mask in a single 'destination-in' operation (avoiding the problem
        // where multiple fillText calls with destination-in erase each other).
        const maskCanvas = document.createElement('canvas');
        maskCanvas.width = width;
        maskCanvas.height = height;
        const maskCtx = maskCanvas.getContext('2d') as CanvasRenderingContext2D;
        maskCtx.scale(this.options.scale, this.options.scale);
        maskCtx.translate(-bounds.left, -bounds.top);

        const [font, fontFamily, fontSize] = this.createFontStyle(styles);
        maskCtx.font = font;
        maskCtx.direction = styles.direction === DIRECTION.RTL ? 'rtl' : 'ltr';
        maskCtx.textAlign = 'left';
        maskCtx.fillStyle = '#000000';

        const wm = styles.writingMode;
        const { baseline } = this.fontMetrics.getMetrics(fontFamily, fontSize);
        const isVertical =
            wm === WRITING_MODE.VERTICAL_RL ||
            wm === WRITING_MODE.VERTICAL_LR ||
            wm === WRITING_MODE.SIDEWAYS_RL ||
            wm === WRITING_MODE.SIDEWAYS_LR;

        for (const textNode of container.textNodes) {
            for (const textBound of textNode.textBounds) {
                if (isVertical) {
                    const cx = textBound.bounds.left + textBound.bounds.width / 2;
                    const cy = textBound.bounds.top + textBound.bounds.height / 2;
                    const isSidewaysLR = wm === WRITING_MODE.SIDEWAYS_LR;
                    const angle = isSidewaysLR ? -Math.PI / 2 : Math.PI / 2;
                    maskCtx.save();
                    maskCtx.translate(cx, cy);
                    maskCtx.rotate(angle);
                    maskCtx.translate(-cx, -cy);
                    const rotatedBounds = new Bounds(
                        cx - textBound.bounds.height / 2,
                        cy - textBound.bounds.width / 2,
                        textBound.bounds.height,
                        textBound.bounds.width,
                    );
                    if (!this._isFirefox) {
                        maskCtx.textBaseline = 'ideographic';
                        maskCtx.fillText(textBound.text, rotatedBounds.left, rotatedBounds.top + rotatedBounds.height);
                    } else {
                        maskCtx.textBaseline = 'alphabetic';
                        maskCtx.fillText(textBound.text, rotatedBounds.left, rotatedBounds.top + baseline);
                    }
                    maskCtx.restore();
                } else {
                    if (styles.letterSpacing === 0) {
                        if (!this._isFirefox) {
                            maskCtx.textBaseline = 'ideographic';
                            maskCtx.fillText(
                                textBound.text,
                                textBound.bounds.left,
                                textBound.bounds.top + textBound.bounds.height,
                            );
                        } else {
                            maskCtx.textBaseline = 'alphabetic';
                            maskCtx.fillText(textBound.text, textBound.bounds.left, textBound.bounds.top + baseline);
                        }
                    } else {
                        maskCtx.textBaseline = 'alphabetic';
                        const letters = segmentGraphemes(textBound.text);
                        letters.reduce((left, letter, index) => {
                            maskCtx.fillText(letter, left, textBound.bounds.top + baseline);
                            const isLast = index === letters.length - 1;
                            return left + maskCtx.measureText(letter).width + (isLast ? 0 : styles.letterSpacing - 1);
                        }, textBound.bounds.left);
                    }
                }
            }
        }

        // Step 3: Apply the text mask to the background using 'destination-in'.
        // This is a single drawImage call so it clips the entire background at once.
        offCtx.globalCompositeOperation = 'destination-in';
        offCtx.setTransform(1, 0, 0, 1, 0, 0); // Reset transform for pixel-to-pixel copy
        offCtx.drawImage(maskCanvas, 0, 0);

        // Step 4: Draw the clipped result onto the main canvas
        this.ctx.drawImage(offscreen, 0, 0, width, height, bounds.left, bounds.top, bounds.width, bounds.height);
    }

    async renderNodeBackgroundAndBorders(paint: ElementPaint): Promise<void> {
        this.applyEffects(paint.getEffects(EffectTarget.BACKGROUND_BORDERS));
        const styles = paint.container.styles;
        const hasBackground = !isTransparent(styles.backgroundColor) || styles.backgroundImage.length;

        const borders = [
            { style: styles.borderTopStyle, color: styles.borderTopColor, width: styles.borderTopWidth },
            { style: styles.borderRightStyle, color: styles.borderRightColor, width: styles.borderRightWidth },
            { style: styles.borderBottomStyle, color: styles.borderBottomColor, width: styles.borderBottomWidth },
            { style: styles.borderLeftStyle, color: styles.borderLeftColor, width: styles.borderLeftWidth },
        ];
        const backgroundPaintingArea = calculateBackgroundCurvedPaintingArea(
            getBackgroundValueForIndex(styles.backgroundClip, 0),
            paint.curves,
        );
        if (hasBackground || styles.boxShadow.length) {
            const isBackgroundClipText = getBackgroundValueForIndex(styles.backgroundClip, 0) === BACKGROUND_CLIP.TEXT;

            if (isBackgroundClipText && hasBackground) {
                // background-clip: text — render background clipped to text shapes
                // using an offscreen canvas with composite operations.
                await this.renderBackgroundClipText(paint);
            } else if (hasBackground) {
                this.ctx.save();
                this.path(backgroundPaintingArea);
                this.ctx.clip();

                if (!isTransparent(styles.backgroundColor)) {
                    this.ctx.fillStyle = asString(styles.backgroundColor);

                    if (styles.display === DISPLAY.INLINE) {
                        for (const textNode of paint.container.textNodes) {
                            for (const textBound of textNode.textBounds) {
                                this.ctx.fillRect(
                                    textBound.bounds.left,
                                    textBound.bounds.top,
                                    textBound.bounds.width,
                                    textBound.bounds.height,
                                );
                            }
                        }
                    } else {
                        this.ctx.fill();
                    }
                }

                await this.renderBackgroundImage(paint.container);

                this.ctx.restore();
            }

            styles.boxShadow
                .slice(0)
                .reverse()
                .forEach(shadow => {
                    this.ctx.save();
                    const borderBoxArea = calculateBorderBoxPath(paint.curves);
                    // Build the painting area by applying offset and spread.
                    // expandBorderBoxPath rebuilds the Bézier curves with adjusted radii
                    // (border-radius ± spread) per the CSS spec, unlike transformPath which
                    // only translates corners without updating the curve geometry.
                    // ctx.filter = blur() is the sole blur mechanism, avoiding the double-blur
                    // that occurred when both ctx.shadowBlur and ctx.filter were set simultaneously.
                    // See https://github.com/html2canvas/html2canvas/issues/21
                    const effectiveSpread = shadow.inset ? -shadow.spread.number : shadow.spread.number;
                    const shadowPaintingArea = expandBorderBoxPath(paint.curves, effectiveSpread).map((p: Path) =>
                        p.add(shadow.offsetX.number, shadow.offsetY.number),
                    );
                    if (shadow.inset) {
                        this.path(borderBoxArea);
                        this.ctx.clip();
                        this.mask(shadowPaintingArea);
                    } else {
                        this.mask(borderBoxArea);
                        this.ctx.clip();
                        this.path(shadowPaintingArea);
                    }
                    this.ctx.fillStyle = asString(shadow.color);
                    if (shadow.blur.number) {
                        this.ctx.filter = `blur(${shadow.blur.number / 2}px)`;
                    }
                    this.ctx.fill();
                    this.ctx.restore();
                });
        }

        let side = 0;
        for (const border of borders) {
            if (border.style !== BORDER_STYLE.NONE && !isTransparent(border.color) && border.width > 0) {
                if (border.style === BORDER_STYLE.DASHED) {
                    await this.renderDashedDottedBorder(
                        border.color,
                        border.width,
                        side,
                        paint.curves,
                        BORDER_STYLE.DASHED,
                    );
                } else if (border.style === BORDER_STYLE.DOTTED) {
                    await this.renderDashedDottedBorder(
                        border.color,
                        border.width,
                        side,
                        paint.curves,
                        BORDER_STYLE.DOTTED,
                    );
                } else if (border.style === BORDER_STYLE.DOUBLE) {
                    await this.renderDoubleBorder(border.color, border.width, side, paint.curves);
                } else {
                    await this.renderSolidBorder(border.color, side, paint.curves);
                }
            }
            side++;
        }
    }

    async renderDashedDottedBorder(
        color: Color,
        width: number,
        side: number,
        curvePoints: BoundCurves,
        style: BORDER_STYLE,
    ): Promise<void> {
        this.ctx.save();

        const strokePaths = parsePathForBorderStroke(curvePoints, side);
        const boxPaths = parsePathForBorder(curvePoints, side);

        if (style === BORDER_STYLE.DASHED) {
            this.path(boxPaths);
            this.ctx.clip();
        }

        let startX, startY, endX, endY;
        if (isBezierCurve(boxPaths[0])) {
            startX = (boxPaths[0] as BezierCurve).start.x;
            startY = (boxPaths[0] as BezierCurve).start.y;
        } else {
            startX = (boxPaths[0] as Vector).x;
            startY = (boxPaths[0] as Vector).y;
        }
        if (isBezierCurve(boxPaths[1])) {
            endX = (boxPaths[1] as BezierCurve).end.x;
            endY = (boxPaths[1] as BezierCurve).end.y;
        } else {
            endX = (boxPaths[1] as Vector).x;
            endY = (boxPaths[1] as Vector).y;
        }

        let length;
        if (side === 0 || side === 2) {
            length = Math.abs(startX - endX);
        } else {
            length = Math.abs(startY - endY);
        }

        this.ctx.beginPath();
        if (style === BORDER_STYLE.DOTTED) {
            this.formatPath(strokePaths);
        } else {
            this.formatPath(boxPaths.slice(0, 2));
        }

        let dashLength = width < 3 ? width * 3 : width * 2;
        let spaceLength = width < 3 ? width * 2 : width;
        if (style === BORDER_STYLE.DOTTED) {
            dashLength = width;
            spaceLength = width;
        }

        let useLineDash = true;
        if (length <= dashLength * 2) {
            useLineDash = false;
        } else if (length <= dashLength * 2 + spaceLength) {
            const multiplier = length / (2 * dashLength + spaceLength);
            dashLength *= multiplier;
            spaceLength *= multiplier;
        } else {
            const numberOfDashes = Math.floor((length + spaceLength) / (dashLength + spaceLength));
            const minSpace = (length - numberOfDashes * dashLength) / (numberOfDashes - 1);
            const maxSpace = (length - (numberOfDashes + 1) * dashLength) / numberOfDashes;
            spaceLength =
                maxSpace <= 0 || Math.abs(spaceLength - minSpace) < Math.abs(spaceLength - maxSpace)
                    ? minSpace
                    : maxSpace;
        }

        if (useLineDash) {
            if (style === BORDER_STYLE.DOTTED) {
                this.ctx.setLineDash([0, dashLength + spaceLength]);
            } else {
                this.ctx.setLineDash([dashLength, spaceLength]);
            }
        }

        if (style === BORDER_STYLE.DOTTED) {
            this.ctx.lineCap = 'round';
            this.ctx.lineWidth = width;
        } else {
            this.ctx.lineWidth = width * 2 + 1.1;
        }
        this.ctx.strokeStyle = asString(color);
        this.ctx.stroke();
        this.ctx.setLineDash([]);

        // dashed round edge gap
        if (style === BORDER_STYLE.DASHED) {
            if (isBezierCurve(boxPaths[0])) {
                const path1 = boxPaths[3] as BezierCurve;
                const path2 = boxPaths[0] as BezierCurve;
                this.ctx.beginPath();
                this.formatPath([new Vector(path1.end.x, path1.end.y), new Vector(path2.start.x, path2.start.y)]);
                this.ctx.stroke();
            }
            if (isBezierCurve(boxPaths[1])) {
                const path1 = boxPaths[1] as BezierCurve;
                const path2 = boxPaths[2] as BezierCurve;
                this.ctx.beginPath();
                this.formatPath([new Vector(path1.end.x, path1.end.y), new Vector(path2.start.x, path2.start.y)]);
                this.ctx.stroke();
            }
        }

        this.ctx.restore();
    }

    async render(element: ElementContainer): Promise<HTMLCanvasElement> {
        if (this.options.backgroundColor) {
            this.ctx.fillStyle = asString(this.options.backgroundColor);
            this.ctx.fillRect(this.options.x, this.options.y, this.options.width, this.options.height);
        }

        const stack = parseStackingContexts(element);

        await this.renderStack(stack);
        this.applyEffects([]);
        return this.canvas;
    }
}

const isTextInputElement = (
    container: ElementContainer,
): container is InputElementContainer | TextareaElementContainer | SelectElementContainer => {
    if (container instanceof TextareaElementContainer) {
        return true;
    } else if (container instanceof SelectElementContainer) {
        return true;
    } else if (
        container instanceof InputElementContainer &&
        container.type !== RADIO &&
        container.type !== CHECKBOX &&
        container.type !== RANGE
    ) {
        return true;
    }
    return false;
};

const calculateBackgroundCurvedPaintingArea = (clip: BACKGROUND_CLIP, curves: BoundCurves): Path[] => {
    switch (clip) {
        case BACKGROUND_CLIP.BORDER_BOX:
            return calculateBorderBoxPath(curves);
        case BACKGROUND_CLIP.CONTENT_BOX:
            return calculateContentBoxPath(curves);
        case BACKGROUND_CLIP.TEXT:
            // For background-clip: text, use padding-box as the initial painting area.
            // The actual text-shape clipping is handled in renderNodeBackgroundAndBorders
            // via offscreen canvas compositing.
            return calculatePaddingBoxPath(curves);
        case BACKGROUND_CLIP.PADDING_BOX:
        default:
            return calculatePaddingBoxPath(curves);
    }
};

const canvasTextAlign = (textAlign: TEXT_ALIGN): CanvasTextAlign => {
    switch (textAlign) {
        case TEXT_ALIGN.CENTER:
            return 'center';
        case TEXT_ALIGN.RIGHT:
            return 'right';
        case TEXT_ALIGN.LEFT:
        default:
            return 'left';
    }
};

// see https://github.com/niklasvh/html2canvas/pull/2645
const iOSBrokenFonts = ['-apple-system', 'system-ui'];

const fixIOSSystemFonts = (fontFamilies: string[]): string[] => {
    return /iPhone OS 15_(0|1)/.test(window.navigator.userAgent)
        ? fontFamilies.filter(fontFamily => iOSBrokenFonts.indexOf(fontFamily) === -1)
        : fontFamilies;
};
