import { contains } from '../../core/bitwise';
import { CSSParsedDeclaration } from '../../css';
import { Bounds } from '../../css/layout/bounds';
import { TextBounds, segmentGraphemes } from '../../css/layout/text';
import { DISPLAY } from '../../css/property-descriptors/display';
import { computeLineHeight } from '../../css/property-descriptors/line-height';
import { LIST_STYLE_POSITION } from '../../css/property-descriptors/list-style-position';
import { LIST_STYLE_TYPE } from '../../css/property-descriptors/list-style-type';
import { TEXT_ALIGN } from '../../css/property-descriptors/text-align';
import { WRITING_MODE } from '../../css/property-descriptors/writing-mode';
import { asString } from '../../css/types/color';
import { CSSImageType, CSSURLImage } from '../../css/types/image';
import { getAbsoluteValue, getNumber } from '../../css/types/length-percentage';
import { ElementContainer } from '../../dom/element-container';
import { LIElementContainer } from '../../dom/elements/li-element-container';
import { SelectElementContainer } from '../../dom/elements/select-element-container';
import { TextareaElementContainer } from '../../dom/elements/textarea-element-container';
import { ReplacedElementContainer } from '../../dom/replaced-elements';
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
import { BoundCurves, calculatePaddingBoxPath } from '../bound-curves';
import { contentBox, paddingBox } from '../box-sizing';
import { calculateObjectFitBounds } from '../object-fit';
import { ElementPaint } from '../stacking-context';
import { Vector } from '../vector';
import { CanvasRenderState, canvasPath } from './canvas-render-state';
import { createFontStyle, renderTextWithLetterSpacing } from './canvas-text-renderer';

// ---------------------------------------------------------------------------
// Replaced elements (img, canvas, svg, iframe handled separately in orchestrator)
// ---------------------------------------------------------------------------

export function renderReplacedElement(
    state: CanvasRenderState,
    container: ReplacedElementContainer,
    curves: BoundCurves,
    image: HTMLImageElement | HTMLCanvasElement,
): void {
    if (image) {
        const isContainerWSizes = container.intrinsicWidth > 0 && container.intrinsicHeight > 0;
        const isSVGContainer =
            container instanceof SVGElementContainer || (container instanceof ImageElementContainer && container.isSVG);
        if (isContainerWSizes || isSVGContainer) {
            const box = contentBox(container);
            const path = calculatePaddingBoxPath(curves);
            canvasPath(state, path);
            const { src, dest } = calculateObjectFitBounds(
                container.styles.objectFit,
                container.intrinsicWidth,
                container.intrinsicHeight,
                box.width,
                box.height,
                getAbsoluteValue(container.styles.objectPosition[0], box.width) / box.width,
                getAbsoluteValue(container.styles.objectPosition[1] ?? container.styles.objectPosition[0], box.height) /
                    box.height,
            );
            state.ctx.save();
            state.ctx.clip();
            if (isContainerWSizes) {
                state.ctx.drawImage(
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
                state.ctx.drawImage(image, box.left, box.top, box.width, box.height);
            }
            state.ctx.restore();
        }
    }
}

// ---------------------------------------------------------------------------
// Checkbox / Radio / Range
// ---------------------------------------------------------------------------

export function renderCheckbox(state: CanvasRenderState, container: InputElementContainer): void {
    if (!container.checked) return;
    const { bounds } = container;
    const size = Math.min(bounds.width, bounds.height);
    state.ctx.save();
    canvasPath(state, [
        new Vector(bounds.left + size * 0.39363, bounds.top + size * 0.79),
        new Vector(bounds.left + size * 0.16, bounds.top + size * 0.5549),
        new Vector(bounds.left + size * 0.27347, bounds.top + size * 0.44071),
        new Vector(bounds.left + size * 0.39694, bounds.top + size * 0.5649),
        new Vector(bounds.left + size * 0.72983, bounds.top + size * 0.23),
        new Vector(bounds.left + size * 0.84, bounds.top + size * 0.34085),
        new Vector(bounds.left + size * 0.39363, bounds.top + size * 0.79),
    ]);
    state.ctx.fillStyle = asString(INPUT_COLOR);
    state.ctx.fill();
    state.ctx.restore();
}

export function renderRadio(state: CanvasRenderState, container: InputElementContainer): void {
    if (!container.checked) return;
    const { bounds } = container;
    const size = Math.min(bounds.width, bounds.height);
    state.ctx.save();
    state.ctx.beginPath();
    state.ctx.arc(bounds.left + size / 2, bounds.top + size / 2, size / 4, 0, Math.PI * 2, true);
    state.ctx.fillStyle = asString(INPUT_COLOR);
    state.ctx.fill();
    state.ctx.restore();
}

export function renderRange(state: CanvasRenderState, container: InputElementContainer): void {
    const bounds = container.bounds;
    const ratio =
        container.max > container.min ? (container.valueAsNumber - container.min) / (container.max - container.min) : 0;
    const isHorizontal = bounds.width >= bounds.height;
    const trackThickness = 4;
    const thumbRadius = Math.min(bounds.width, bounds.height) * 0.35;

    state.ctx.save();
    if (isHorizontal) {
        // Track
        const trackY = bounds.top + bounds.height / 2 - trackThickness / 2;
        const trackLeft = bounds.left + thumbRadius;
        const trackWidth = bounds.width - thumbRadius * 2;
        state.ctx.fillStyle = '#c0c0c0';
        state.ctx.fillRect(trackLeft, trackY, trackWidth, trackThickness);
        // Filled portion
        state.ctx.fillStyle = '#0075ff';
        state.ctx.fillRect(trackLeft, trackY, trackWidth * ratio, trackThickness);
        // Thumb
        const thumbX = trackLeft + trackWidth * ratio;
        const thumbY = bounds.top + bounds.height / 2;
        state.ctx.beginPath();
        state.ctx.arc(thumbX, thumbY, thumbRadius, 0, Math.PI * 2);
        state.ctx.fillStyle = '#ffffff';
        state.ctx.fill();
        state.ctx.strokeStyle = '#0075ff';
        state.ctx.lineWidth = 2;
        state.ctx.stroke();
    } else {
        // Vertical track
        const trackX = bounds.left + bounds.width / 2 - trackThickness / 2;
        const trackTop = bounds.top + thumbRadius;
        const trackHeight = bounds.height - thumbRadius * 2;
        state.ctx.fillStyle = '#c0c0c0';
        state.ctx.fillRect(trackX, trackTop, trackThickness, trackHeight);
        // Filled portion (bottom to value)
        const filledHeight = trackHeight * ratio;
        state.ctx.fillStyle = '#0075ff';
        state.ctx.fillRect(trackX, trackTop + trackHeight - filledHeight, trackThickness, filledHeight);
        // Thumb
        const thumbX = bounds.left + bounds.width / 2;
        const thumbY = trackTop + trackHeight * (1 - ratio);
        state.ctx.beginPath();
        state.ctx.arc(thumbX, thumbY, thumbRadius, 0, Math.PI * 2);
        state.ctx.fillStyle = '#ffffff';
        state.ctx.fill();
        state.ctx.strokeStyle = '#0075ff';
        state.ctx.lineWidth = 2;
        state.ctx.stroke();
    }
    state.ctx.restore();
}

// ---------------------------------------------------------------------------
// Progress / Meter
// ---------------------------------------------------------------------------

export function renderProgress(state: CanvasRenderState, container: ProgressElementContainer): void {
    const bounds = container.bounds;
    const ratio = container.ratio;
    const borderRadius = Math.min(bounds.height / 2, 4);

    state.ctx.save();
    state.ctx.beginPath();
    state.ctx.roundRect(bounds.left, bounds.top, bounds.width, bounds.height, borderRadius);
    state.ctx.fillStyle = '#e6e6e6';
    state.ctx.fill();
    if (ratio > 0) {
        const fillWidth = bounds.width * ratio;
        state.ctx.beginPath();
        state.ctx.roundRect(bounds.left, bounds.top, fillWidth, bounds.height, borderRadius);
        state.ctx.fillStyle = '#0075ff';
        state.ctx.fill();
    }
    state.ctx.restore();
}

export function renderMeter(state: CanvasRenderState, container: MeterElementContainer): void {
    const bounds = container.bounds;
    const ratio = container.ratio;
    const state2 = container.state;
    const borderRadius = Math.min(bounds.height / 2, 4);

    let fillColor: string;
    switch (state2) {
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

    state.ctx.save();
    state.ctx.beginPath();
    state.ctx.roundRect(bounds.left, bounds.top, bounds.width, bounds.height, borderRadius);
    state.ctx.fillStyle = '#e6e6e6';
    state.ctx.fill();
    if (ratio > 0) {
        const fillWidth = bounds.width * ratio;
        state.ctx.beginPath();
        state.ctx.roundRect(bounds.left, bounds.top, fillWidth, bounds.height, borderRadius);
        state.ctx.fillStyle = fillColor;
        state.ctx.fill();
    }
    state.ctx.restore();
}

// ---------------------------------------------------------------------------
// Text input elements (input, textarea, select)
// ---------------------------------------------------------------------------

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

export const isTextInputElement = (
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

export async function renderTextInputElement(
    state: CanvasRenderState,
    container: InputElementContainer | TextareaElementContainer | SelectElementContainer,
    styles: CSSParsedDeclaration,
): Promise<void> {
    const [font, fontFamily, fontSize] = createFontStyle(styles);
    const { baseline } = state.fontMetrics.getMetrics(fontFamily, fontSize);

    state.ctx.font = font;

    // Apply ::placeholder styles when the displayed text is the placeholder.
    const isPlaceholder =
        (container instanceof InputElementContainer || container instanceof TextareaElementContainer) &&
        container.isPlaceholder;
    const phStyles: Record<string, string> | null = isPlaceholder
        ? (container as InputElementContainer | TextareaElementContainer).placeholderStyles
        : null;

    if (phStyles) {
        // Color
        state.ctx.fillStyle = phStyles['color'] ?? asString(styles.color);
        // Opacity
        if (phStyles['opacity']) {
            state.ctx.globalAlpha = parseFloat(phStyles['opacity']);
        }
        // Font-weight / font-style: rebuild font string with overrides
        if (phStyles['font-weight'] || phStyles['font-style']) {
            const parts = font.split(' ');
            // font string format: "style variant weight size family"
            if (phStyles['font-style']) parts[0] = phStyles['font-style'];
            if (phStyles['font-weight']) parts[2] = phStyles['font-weight'];
            state.ctx.font = parts.join(' ');
        }
    } else {
        state.ctx.fillStyle = asString(styles.color);
    }

    state.ctx.textBaseline = 'alphabetic';
    state.ctx.textAlign = canvasTextAlign(container.styles.textAlign);

    const bounds = contentBox(container);

    // Draw placeholder background-color behind the text area if specified.
    if (phStyles?.['background-color'] && phStyles['background-color'] !== 'rgba(0, 0, 0, 0)') {
        state.ctx.save();
        state.ctx.fillStyle = phStyles['background-color'];
        state.ctx.fillRect(bounds.left, bounds.top, bounds.width, bounds.height);
        state.ctx.restore();
        // Restore text fillStyle after drawing background.
        state.ctx.fillStyle = phStyles['color'] ?? asString(styles.color);
    }

    state.ctx.save();
    canvasPath(state, [
        new Vector(bounds.left, bounds.top),
        new Vector(bounds.left + bounds.width, bounds.top),
        new Vector(bounds.left + bounds.width, bounds.top + bounds.height),
        new Vector(bounds.left, bounds.top + bounds.height),
    ]);
    state.ctx.clip();

    if (container instanceof TextareaElementContainer) {
        await _renderTextarea(state, container, styles, bounds, baseline, fontFamily, fontSize);
    } else {
        _renderSingleLineInput(state, container, styles, bounds, baseline);
    }

    state.ctx.restore();
    state.ctx.textBaseline = 'alphabetic';
    state.ctx.textAlign = 'left';

    // Restore globalAlpha if it was changed for ::placeholder opacity.
    if (phStyles?.['opacity']) {
        state.ctx.globalAlpha = 1;
    }
}

async function _renderTextarea(
    state: CanvasRenderState,
    container: TextareaElementContainer,
    styles: CSSParsedDeclaration,
    bounds: Bounds,
    baseline: number,
    _fontFamily: string,
    _fontSize: string,
): Promise<void> {
    const fontSizeNumber = getNumber(styles.fontSize);
    const lineHeight = computeLineHeight(styles.lineHeight, fontSizeNumber);
    const scrollTop = container.scrollTop ?? 0;

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

    const letterSpacing = styles.letterSpacing;
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
    const measureWidth = (text: string): number => {
        if (letterSpacing !== 0 && text.length > 0) {
            const graphemeCount = segmentGraphemes(text).length;
            // Measure the full string at once so that kerning between
            // character pairs is accounted for (ctx.measureText on a single
            // glyph misses kerning with its neighbours).  Then add
            // letter-spacing gaps: (n-1) gaps because the browser does not
            // count trailing letter-spacing in the wrap budget.
            const glyphsWidth = state.ctx.measureText(text).width / state.options.scale;
            return glyphsWidth + (letterSpacing - 1) * (graphemeCount - 1);
        }
        return state.ctx.measureText(text).width / state.options.scale;
    };

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
                lines.push(currentLine);
                const trimmed = token.trimStart();
                if (trimmed.length > 0 && measureWidth(trimmed) > maxWidth) {
                    breakChunk(trimmed);
                    currentLine = lines.pop() ?? '';
                } else {
                    currentLine = trimmed;
                }
            } else {
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

    wrappedLines.forEach((line, index) => {
        const lineTop = index * lineHeight - scrollTop;
        // Skip lines that are completely outside the content box.
        if (lineTop + lineHeight < 0 || lineTop > bounds.height) {
            return;
        }
        const lineBounds = new Bounds(originX, bounds.top + lineTop, bounds.width, lineHeight);
        renderTextWithLetterSpacing(state, new TextBounds(line, lineBounds), styles.letterSpacing, baseline);
    });
}

function _renderSingleLineInput(
    state: CanvasRenderState,
    container: InputElementContainer | SelectElementContainer,
    styles: CSSParsedDeclaration,
    bounds: Bounds,
    _baseline: number,
): void {
    let x = 0;
    switch (container.styles.textAlign) {
        case TEXT_ALIGN.CENTER:
            x += bounds.width / 2;
            break;
        case TEXT_ALIGN.RIGHT:
            x += bounds.width;
            break;
    }
    // Draw text using textBaseline='middle' centred in the padding-box.
    // We bypass renderTextWithLetterSpacing because its 'ideographic' baseline
    // mode (Chromium) positions the text too high in small input elements,
    // causing the ascenders to be clipped by the overflow:hidden clip that
    // Chromium applies to <input> elements by default.
    const pBounds = paddingBox(container);
    state.ctx.textBaseline = 'middle';
    const midY = pBounds.top + pBounds.height / 2 + 1;
    const startX = bounds.left + x;

    if (styles.letterSpacing === 0) {
        state.ctx.fillText(container.value, startX, midY);
    } else {
        const letters = segmentGraphemes(container.value);
        letters.reduce((left, letter, index) => {
            state.ctx.fillText(letter, left, midY);
            const isLast = index === letters.length - 1;
            return left + state.ctx.measureText(letter).width + (isLast ? 0 : styles.letterSpacing - 1);
        }, startX);
    }
}

// ---------------------------------------------------------------------------
// List markers
// ---------------------------------------------------------------------------

export async function renderListMarker(
    state: CanvasRenderState,
    paint: ElementPaint,
    styles: CSSParsedDeclaration,
): Promise<void> {
    const container = paint.container;
    if (!contains(container.styles.display, DISPLAY.LIST_ITEM)) return;
    if (!paint.listValue || container.styles.listStyleType === LIST_STYLE_TYPE.NONE) {
        if (container.styles.listStyleImage !== null) {
            await _renderListStyleImage(state, container, styles);
        }
        return;
    }

    if (container.styles.listStyleImage !== null) {
        await _renderListStyleImage(state, container, styles);
        return;
    }

    const [fontFamily] = createFontStyle(styles);
    const wm = styles.writingMode;
    const isVerticalList =
        wm === WRITING_MODE.VERTICAL_RL ||
        wm === WRITING_MODE.VERTICAL_LR ||
        wm === WRITING_MODE.SIDEWAYS_RL ||
        wm === WRITING_MODE.SIDEWAYS_LR;

    // Use ::marker styles (color, font) when available on the LI element.
    const markerStyles = container instanceof LIElementContainer ? container.markerStyles : null;
    state.ctx.font = markerStyles?.['font-family']
        ? fontFamily.replace(/("[^"]+"|[^,\s]+)(\s*,\s*("[^"]+"|[^,\s]+))*/, markerStyles['font-family'])
        : fontFamily;
    state.ctx.fillStyle = markerStyles?.['color'] ?? asString(styles.color);

    if (isVerticalList && container.styles.listStylePosition === LIST_STYLE_POSITION.OUTSIDE) {
        _renderVerticalListMarkerOutside(state, paint, styles, wm);
    } else if (isVerticalList && container.styles.listStylePosition === LIST_STYLE_POSITION.INSIDE) {
        _renderVerticalListMarkerInside(state, paint, styles, wm);
    } else {
        _renderHorizontalListMarker(state, paint, styles);
    }

    state.ctx.textBaseline = 'bottom';
    state.ctx.textAlign = 'left';
}

async function _renderListStyleImage(
    state: CanvasRenderState,
    container: ElementContainer,
    _styles: CSSParsedDeclaration,
): Promise<void> {
    const img = container.styles.listStyleImage;
    if (img && img.type === CSSImageType.URL) {
        const url = (img as CSSURLImage).url;
        try {
            const image = await state.context.cache.match(url);
            state.ctx.drawImage(image, container.bounds.left - (image.width + 10), container.bounds.top);
        } catch (e) {
            state.context.error(`Error loading list-style-image ${url}`, e);
        }
    }
}

function _renderVerticalListMarkerOutside(
    state: CanvasRenderState,
    paint: ElementPaint,
    styles: CSSParsedDeclaration,
    wm: WRITING_MODE,
): void {
    const container = paint.container;
    const fontSize = getNumber(styles.fontSize);
    const isSidewaysLR = wm === WRITING_MODE.SIDEWAYS_LR;
    const angle = isSidewaysLR ? -Math.PI / 2 : Math.PI / 2;

    // First column center x = container.left + paddingLeft + fontSize/2
    const markerX =
        container.bounds.left + getAbsoluteValue(container.styles.paddingLeft, container.bounds.width) + fontSize / 2;

    // Inline-start differs by writing mode:
    //   sideways-lr: inline-start is bottom → marker below content
    //   vertical-rl/lr, sideways-rl: inline-start is top → marker above content
    let markerY: number;
    if (isSidewaysLR) {
        markerY = container.bounds.top + container.bounds.height + fontSize;
    } else {
        markerY = container.bounds.top - fontSize / 2;
    }

    state.ctx.save();
    state.ctx.translate(markerX, markerY);
    state.ctx.rotate(angle);
    state.ctx.textBaseline = isSidewaysLR ? 'hanging' : 'alphabetic';
    state.ctx.textAlign = 'center';
    state.ctx.fillText(paint.listValue!, 0, 0);
    state.ctx.restore();
}

function _renderVerticalListMarkerInside(
    state: CanvasRenderState,
    paint: ElementPaint,
    styles: CSSParsedDeclaration,
    wm: WRITING_MODE,
): void {
    const container = paint.container;
    const fontSize = getNumber(styles.fontSize);
    const isSidewaysLR = wm === WRITING_MODE.SIDEWAYS_LR;
    const angle = isSidewaysLR ? -Math.PI / 2 : Math.PI / 2;

    const markerX =
        container.bounds.left + getAbsoluteValue(container.styles.paddingLeft, container.bounds.width) + fontSize / 2;

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

    state.ctx.save();
    state.ctx.translate(markerX, markerY);
    state.ctx.rotate(angle);
    state.ctx.textBaseline = isSidewaysLR ? 'hanging' : 'alphabetic';
    state.ctx.textAlign = 'right';
    state.ctx.fillText(paint.listValue!, 0, 0);
    state.ctx.restore();
}

function _renderHorizontalListMarker(
    state: CanvasRenderState,
    paint: ElementPaint,
    styles: CSSParsedDeclaration,
): void {
    const container = paint.container;
    state.ctx.textBaseline = 'alphabetic';

    const [, fontFamily, fontSize] = createFontStyle(styles);
    const { baseline } = state.fontMetrics.getRawMetrics(fontFamily, fontSize);
    const lineHeight = computeLineHeight(styles.lineHeight, getNumber(styles.fontSize));
    const leading = Math.max(0, lineHeight - getNumber(styles.fontSize));

    // Align the marker baseline with the first line of the list item.
    // Use raw metrics (no browser-specific adjustment) so the marker
    // sits exactly on the same baseline as the item text on all browsers.
    const markerY =
        Math.floor(
            container.bounds.top +
                getAbsoluteValue(container.styles.paddingTop, container.bounds.width) +
                leading / 2 +
                baseline,
        ) - (state.isFirefox ? 1 : 0);

    if (container.styles.listStylePosition === LIST_STYLE_POSITION.INSIDE) {
        // Inside markers are drawn at the start of the content area, left-aligned
        const paddingLeft = getAbsoluteValue(container.styles.paddingLeft, container.bounds.width);
        state.ctx.textAlign = 'left';
        state.ctx.fillText(paint.listValue!, container.bounds.left + paddingLeft, markerY);
    } else {
        // Outside markers are drawn to the left of the content area, right-aligned
        state.ctx.textAlign = 'right';
        state.ctx.fillText(paint.listValue!, container.bounds.left, markerY);
    }
}
