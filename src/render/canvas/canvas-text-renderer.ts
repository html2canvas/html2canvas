import { CSSParsedDeclaration } from '../../css';
import { Bounds } from '../../css/layout/bounds';
import { TextBounds, segmentGraphemes } from '../../css/layout/text';
import { BACKGROUND_CLIP } from '../../css/property-descriptors/background-clip';
import { DIRECTION } from '../../css/property-descriptors/direction';
import { PAINT_ORDER_LAYER } from '../../css/property-descriptors/paint-order';
import { TEXT_DECORATION_LINE } from '../../css/property-descriptors/text-decoration-line';
import { TEXT_DECORATION_STYLE } from '../../css/property-descriptors/text-decoration-style';
import { TextShadow } from '../../css/property-descriptors/text-shadow';
import { TEXT_UNDERLINE_POSITION } from '../../css/property-descriptors/text-underline-position';
import { WRITING_MODE } from '../../css/property-descriptors/writing-mode';
import { isDimensionToken } from '../../css/syntax/parser';
import { asString, isTransparent } from '../../css/types/color';
import { getNumber } from '../../css/types/length-percentage';
import { TextContainer } from '../../dom/text-container';
import { getBackgroundValueForIndex } from '../background';
import { CanvasRenderState } from './canvas-render-state';

// ---------------------------------------------------------------------------
// Font style cache (per CSSParsedDeclaration instance)
// ---------------------------------------------------------------------------

// see https://github.com/niklasvh/html2canvas/pull/2645
const iOSBrokenFonts = ['-apple-system', 'system-ui'];

const fixIOSSystemFonts = (fontFamilies: string[]): string[] => {
    return /iPhone OS 15_(0|1)/.test(window.navigator.userAgent)
        ? fontFamilies.filter(fontFamily => iOSBrokenFonts.indexOf(fontFamily) === -1)
        : fontFamilies;
};

const fontStyleCache = new WeakMap<CSSParsedDeclaration, string[]>();

/**
 * Returns [fontString, fontFamily, fontSize] for use with ctx.font.
 * Results are cached per CSSParsedDeclaration instance.
 */
export function createFontStyle(styles: CSSParsedDeclaration): string[] {
    const cached = fontStyleCache.get(styles);
    if (cached) {
        return cached;
    }
    const fontVariant = styles.fontVariant.filter(variant => variant === 'normal' || variant === 'small-caps').join('');
    const fontFamily = fixIOSSystemFonts(styles.fontFamily).join(', ');
    const fontSize = isDimensionToken(styles.fontSize)
        ? `${getNumber(styles.fontSize)}${styles.fontSize.unit}`
        : `${getNumber(styles.fontSize)}px`;

    const result = [
        [styles.fontStyle, fontVariant, styles.fontWeight, fontSize, fontFamily].join(' '),
        fontFamily,
        fontSize,
    ];
    fontStyleCache.set(styles, result);
    return result;
}

// ---------------------------------------------------------------------------
// Text with letter-spacing
// ---------------------------------------------------------------------------

/**
 * Draws a single text segment, handling vertical writing modes and letter-spacing.
 */
export function renderTextWithLetterSpacing(
    state: CanvasRenderState,
    text: TextBounds,
    letterSpacing: number,
    baseline: number,
    writingMode: WRITING_MODE = WRITING_MODE.HORIZONTAL_TB,
    useStroke = false,
): void {
    const isVertical =
        writingMode === WRITING_MODE.VERTICAL_RL ||
        writingMode === WRITING_MODE.VERTICAL_LR ||
        writingMode === WRITING_MODE.SIDEWAYS_RL ||
        writingMode === WRITING_MODE.SIDEWAYS_LR;

    const drawText = useStroke
        ? (t: string, x: number, y: number) => state.ctx.strokeText(t, x, y)
        : (t: string, x: number, y: number) => state.ctx.fillText(t, x, y);

    if (isVertical) {
        // For vertical writing modes the browser already positions the text bounds correctly.
        // We rotate the canvas ±90° around the centre of the text bounds so that fillText
        // draws along the right axis, then restore.
        const isSidewaysLR = writingMode === WRITING_MODE.SIDEWAYS_LR;
        // sideways-lr rotates -90°; all other vertical modes rotate +90°
        const angle = isSidewaysLR ? -Math.PI / 2 : Math.PI / 2;
        const cx = text.bounds.left + text.bounds.width / 2;
        const cy = text.bounds.top + text.bounds.height / 2;

        state.ctx.save();
        state.ctx.translate(cx, cy);
        state.ctx.rotate(angle);
        state.ctx.translate(-cx, -cy);

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
            if (!state.isFirefox) {
                state.ctx.textBaseline = 'ideographic';
                drawText(rotatedText.text, rotatedText.bounds.left, rotatedText.bounds.top + rotatedText.bounds.height);
            } else {
                drawText(rotatedText.text, rotatedText.bounds.left, rotatedText.bounds.top + baseline);
            }
        } else {
            const letters = segmentGraphemes(rotatedText.text);
            letters.reduce((left, letter, index) => {
                drawText(letter, left, rotatedText.bounds.top + baseline);
                const isLast = index === letters.length - 1;
                return left + state.ctx.measureText(letter).width + (isLast ? 0 : letterSpacing - 1);
            }, rotatedText.bounds.left);
        }

        state.ctx.restore();
    } else {
        if (letterSpacing === 0) {
            // Fixed an issue with characters moving up in non-Firefox.
            // https://github.com/niklasvh/html2canvas/issues/2107#issuecomment-692462900
            if (!state.isFirefox) {
                state.ctx.textBaseline = 'ideographic';
                drawText(text.text, text.bounds.left, text.bounds.top + text.bounds.height);
            } else {
                drawText(text.text, text.bounds.left, text.bounds.top + baseline);
            }
        } else {
            const letters = segmentGraphemes(text.text);
            letters.reduce((left, letter, index) => {
                drawText(letter, left, text.bounds.top + baseline);
                const isLast = index === letters.length - 1;
                return left + state.ctx.measureText(letter).width + (isLast ? 0 : letterSpacing - 1);
            }, text.bounds.left);
        }
    }
}

// ---------------------------------------------------------------------------
// Decoration lines
// ---------------------------------------------------------------------------

/**
 * Draws a single text-decoration line segment using the given style.
 * For horizontal text:  x, y = top-left corner, w = length along text, h = line thickness.
 * For vertical text:    x, y = top-left corner, w = line thickness,   h = length along text.
 */
export function renderDecorationLine(
    state: CanvasRenderState,
    style: number,
    x: number,
    y: number,
    w: number,
    h: number,
    isVertical: boolean,
    textDecorationLine: TEXT_DECORATION_LINE,
    lineStart?: number,
    _fontSizePx?: number,
): void {
    switch (style) {
        case TEXT_DECORATION_STYLE.DOUBLE: {
            // For double, `h` (or `w` in vertical) is the thickness of each individual line.
            // Gap between the two lines = max(1, round(thickness / 2)).
            if (isVertical) {
                const lineW = Math.max(1, w);
                const gap = Math.max(1, Math.round(w / 2));
                state.ctx.fillRect(x, y, lineW, h);
                if (textDecorationLine === TEXT_DECORATION_LINE.OVERLINE) {
                    state.ctx.fillRect(x - lineW - gap, y, lineW, h);
                } else {
                    state.ctx.fillRect(x + lineW + gap, y, lineW, h);
                }
            } else {
                const lineH = Math.max(1, h);
                const gap = Math.max(1, Math.trunc(h / 2));
                state.ctx.fillRect(x, y, w, lineH);
                if (textDecorationLine === TEXT_DECORATION_LINE.OVERLINE) {
                    state.ctx.fillRect(x, y - lineH - gap, w, lineH);
                } else {
                    state.ctx.fillRect(x, y + lineH + gap, w, lineH);
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
                    state.ctx.fillRect(x, y + pos, w, Math.min(dotSize, length - pos));
                } else {
                    state.ctx.fillRect(x + pos, y, Math.min(dotSize, length - pos), h);
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
                    state.ctx.fillRect(x, y + pos, w, Math.min(dashLen, length - pos));
                } else {
                    state.ctx.fillRect(x + pos, y, Math.min(dashLen, length - pos), h);
                }
            }
            break;
        }
        case TEXT_DECORATION_STYLE.WAVY: {
            // Wavy line using quadratic Bezier curves (one per half-wavelength).
            // Quadratic curves are required (not cubic) so that the tangent at each
            // midline crossing is horizontal, giving a smooth continuous wave when
            // segments are chained.
            //
            // Sizing from Chromium's MakeWave() (thickness-based):
            //   clamped         = max(1, thickness)
            //   wavelength      = 1 + 2 * round(2 * clamped + 0.5)
            //   amplitude       = 0.5 + round(3 * clamped + 0.5)   (= cpDist)
            //
            // Phase continuity across word/space segments is maintained by aligning
            // the half-wave grid to `lineStart` (the absolute start of the decoration line).
            const length = isVertical ? h : w;
            const thickness2 = isVertical ? w : h;
            const clamped = Math.max(1, thickness2);
            const wavelength = 1 + 2 * Math.round(2 * clamped + 0.5);
            const amplitude = Math.max(3, thickness2 * 1.5);
            const halfWave = wavelength / 2;

            state.ctx.save();
            state.ctx.beginPath();

            if (isVertical) {
                const ref = lineStart ?? y;
                const midX = x + w / 2;
                // Align to half-wave grid from ref.
                const phaseOffset = (((y - ref) % halfWave) + halfWave) % halfWave;
                const halfWaveOrigin = y - phaseOffset;
                // Count half-waves elapsed to determine initial direction.
                const halfWavesElapsed = Math.round((halfWaveOrigin - ref) / halfWave);
                let direction = halfWavesElapsed % 2 === 0 ? 1 : -1;

                state.ctx.moveTo(midX, y);
                let pos = halfWaveOrigin;
                while (pos < y + length) {
                    const nextPos = pos + halfWave;
                    const controlPos = (pos + nextPos) / 2;
                    state.ctx.quadraticCurveTo(
                        midX + amplitude * direction,
                        controlPos,
                        midX,
                        Math.min(nextPos, y + length),
                    );
                    pos = nextPos;
                    direction *= -1;
                }
            } else {
                const ref = lineStart ?? x;
                // midY is set so the top of the wave starts at y (top of the decoration band).
                const midY = y + amplitude;
                // Align to half-wave grid from ref.
                const phaseOffset = (((x - ref) % halfWave) + halfWave) % halfWave;
                const halfWaveOrigin = x - phaseOffset;
                const halfWavesElapsed = Math.round((halfWaveOrigin - ref) / halfWave);
                let direction = halfWavesElapsed % 2 === 0 ? 1 : -1;

                state.ctx.moveTo(x, midY);
                let pos = halfWaveOrigin;
                while (pos < x + length) {
                    const nextPos = pos + halfWave;
                    const controlPos = (pos + nextPos) / 2;
                    state.ctx.quadraticCurveTo(
                        controlPos,
                        midY + amplitude * direction,
                        Math.min(nextPos, x + length),
                        midY,
                    );
                    pos = nextPos;
                    direction *= -1;
                }
            }

            state.ctx.strokeStyle = state.ctx.fillStyle;
            state.ctx.lineWidth = thickness2 + 1;
            state.ctx.stroke();
            state.ctx.restore();
            break;
        }
        case TEXT_DECORATION_STYLE.SOLID:
        default:
            state.ctx.fillRect(x, y, w, h);
            break;
    }
}

// ---------------------------------------------------------------------------
// Full text node rendering
// ---------------------------------------------------------------------------

export async function renderTextNode(
    state: CanvasRenderState,
    text: TextContainer,
    styles: CSSParsedDeclaration,
): Promise<void> {
    const [font, fontFamily, fontSize] = createFontStyle(styles);
    // Numeric font-size in px, used for WAVY decoration sizing.
    const fontSizePx = getNumber(styles.fontSize);

    state.ctx.font = font;
    state.ctx.direction = styles.direction === DIRECTION.RTL ? 'rtl' : 'ltr';
    state.ctx.textAlign = 'left';
    state.ctx.textBaseline = 'alphabetic';

    const paintOrder = styles.paintOrder;
    const wm = styles.writingMode;
    const isVertical =
        wm === WRITING_MODE.VERTICAL_RL ||
        wm === WRITING_MODE.VERTICAL_LR ||
        wm === WRITING_MODE.SIDEWAYS_RL ||
        wm === WRITING_MODE.SIDEWAYS_LR;

    const { baseline } = state.fontMetrics.getMetrics(fontFamily, fontSize);

    // Pre-compute per-segment line metadata used for decoration rendering.
    //
    // For horizontal text we group by bounds.top (rounded to 1px to absorb
    // sub-pixel jitter); for vertical text we group by bounds.left.
    //
    // Instead of drawing one decoration rect per word/segment, we gather the
    // full extent of each visual line so we can draw the decoration in a
    // single call per line (covering all segments at once).
    //
    //   lineStartMap  – absolute start coordinate of the full decoration span
    //                   (used by WAVY to keep phase continuous, and as origin
    //                    for the merged single-draw optimisation)
    //   lineEndMap    – absolute end coordinate of the full decoration span
    //   isFirstInLine – true for the first segment on each visual line;
    //                   decoration is drawn only here (one draw per line)
    const lineStartMap = new Map<TextBounds, number>();
    const lineEndMap = new Map<TextBounds, number>();
    const isFirstInLine = new Set<TextBounds>();
    if (styles.textDecorationLine.length) {
        // Group bounds by line key, tracking min start / max end and the
        // corresponding first/last segment on that line.
        const lineMin = new Map<number, { val: number; tb: TextBounds }>();
        const lineMax = new Map<number, { val: number; tb: TextBounds }>();
        for (const tb of text.textBounds) {
            const lineKey = isVertical ? Math.round(tb.bounds.left) : Math.round(tb.bounds.top);
            const start = isVertical ? tb.bounds.top : tb.bounds.left;
            const end = isVertical ? tb.bounds.top + tb.bounds.height : tb.bounds.left + tb.bounds.width;
            const minEntry = lineMin.get(lineKey);
            if (minEntry === undefined || start < minEntry.val) {
                lineMin.set(lineKey, { val: start, tb });
            }
            const maxEntry = lineMax.get(lineKey);
            if (maxEntry === undefined || end > maxEntry.val) {
                lineMax.set(lineKey, { val: end, tb });
            }
        }
        // Mark only the first segment of each line; store start/end on it.
        lineMin.forEach(({ val: startVal, tb: firstTb }) => {
            isFirstInLine.add(firstTb);
            lineStartMap.set(firstTb, startVal);
        });
        // Attach lineEnd to each line's first TextBounds.
        lineMin.forEach(({ tb: firstTb }, lineKey) => {
            lineEndMap.set(firstTb, lineMax.get(lineKey)!.val);
        });
    }

    text.textBounds.forEach(textBound => {
        paintOrder.forEach(paintOrderLayer => {
            switch (paintOrderLayer) {
                case PAINT_ORDER_LAYER.FILL:
                    // When background-clip: text is active, the text fill is handled
                    // by the background compositing — skip normal text rendering.
                    if (getBackgroundValueForIndex(styles.backgroundClip, 0) === BACKGROUND_CLIP.TEXT) {
                        break;
                    }
                    state.ctx.fillStyle = asString(styles.color);
                    _renderTextFill(
                        state,
                        textBound,
                        styles,
                        baseline,
                        wm,
                        fontSizePx,
                        isVertical,
                        lineStartMap,
                        lineEndMap,
                        isFirstInLine,
                    );
                    break;

                case PAINT_ORDER_LAYER.STROKE:
                    if (styles.webkitTextStrokeWidth && textBound.text.trim().length) {
                        state.ctx.strokeStyle = asString(styles.webkitTextStrokeColor);
                        state.ctx.lineWidth = styles.webkitTextStrokeWidth;
                        state.ctx.lineJoin = state.isChrome ? 'miter' : 'round';
                        renderTextWithLetterSpacing(state, textBound, styles.letterSpacing, baseline, wm, true);
                    }
                    state.ctx.strokeStyle = '';
                    state.ctx.lineWidth = 0;
                    state.ctx.lineJoin = 'miter';
                    break;
            }
        });
    });
}

// ---------------------------------------------------------------------------
// Internal helper for FILL paint order layer
// ---------------------------------------------------------------------------

function _renderTextFill(
    state: CanvasRenderState,
    textBound: TextBounds,
    styles: CSSParsedDeclaration,
    baseline: number,
    wm: WRITING_MODE,
    fontSizePx: number,
    isVertical: boolean,
    lineStartMap: Map<TextBounds, number>,
    lineEndMap: Map<TextBounds, number>,
    isFirstInLine: Set<TextBounds>,
): void {
    const textShadows: TextShadow = styles.textShadow;

    if (textShadows.length && textBound.text.trim().length) {
        _renderTextShadows(state, textBound, styles, baseline, wm, textShadows);
    } else if (!isTransparent(styles.color)) {
        renderTextWithLetterSpacing(state, textBound, styles.letterSpacing, baseline, wm);
    }

    if (styles.textDecorationLine.length) {
        _renderTextDecorations(
            state,
            textBound,
            styles,
            baseline,
            wm,
            isVertical,
            fontSizePx,
            lineStartMap,
            lineEndMap,
            isFirstInLine,
        );
    }
}

function _renderTextShadows(
    state: CanvasRenderState,
    textBound: TextBounds,
    styles: CSSParsedDeclaration,
    baseline: number,
    wm: WRITING_MODE,
    textShadows: TextShadow,
): void {
    const w = state.canvas.width;
    const h = state.canvas.height;
    const scale = state.options.scale;
    const ox = state.options.x;
    const oy = state.options.y;

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
            shadowCtx.translate(-ox + textShadow.offsetX.number, -oy + textShadow.offsetY.number);
            shadowCtx.font = state.ctx.font;
            shadowCtx.direction = state.ctx.direction;
            shadowCtx.textAlign = state.ctx.textAlign;
            shadowCtx.textBaseline = state.ctx.textBaseline;
            shadowCtx.fillStyle = asString(textShadow.color);

            const mainCtx = state.ctx;
            state.ctx = shadowCtx;
            renderTextWithLetterSpacing(state, textBound, styles.letterSpacing, baseline, wm);
            state.ctx = mainCtx;

            if (textShadow.blur.number > 0) {
                state.ctx.save();
                // Apply blur via ctx.filter on the main canvas drawImage call.
                state.ctx.filter = `blur(${textShadow.blur.number / 2}px)`;
            }
            state.ctx.drawImage(shadowCanvas, 0, 0, w, h, ox, oy, w / scale, h / scale);
            if (textShadow.blur.number > 0) {
                state.ctx.restore();
            }
        });

    // Draw the real text on top of all shadows.
    // Skipped for transparent text — shadows are the only visual.
    if (!isTransparent(styles.color)) {
        state.ctx.save();
        state.ctx.fillStyle = asString(styles.color);
        renderTextWithLetterSpacing(state, textBound, styles.letterSpacing, baseline, wm);
        state.ctx.restore();
    }
}

function _renderTextDecorations(
    state: CanvasRenderState,
    textBound: TextBounds,
    styles: CSSParsedDeclaration,
    baseline: number,
    wm: WRITING_MODE,
    isVertical: boolean,
    fontSizePx: number,
    lineStartMap: Map<TextBounds, number>,
    lineEndMap: Map<TextBounds, number>,
    isFirstInLine: Set<TextBounds>,
): void {
    // Decoration is drawn once per visual line, using the full span from
    // lineStart to lineEnd.  Skip all non-first segments — nothing to draw.
    if (!isFirstInLine.has(textBound)) {
        return;
    }

    state.ctx.fillStyle = asString(
        isTransparent(styles.textDecorationColor) ? styles.color : styles.textDecorationColor,
    );
    // Resolve line thickness: explicit value or 1px fallback for auto/from-font.
    const thickness = typeof styles.textDecorationThickness === 'number' ? styles.textDecorationThickness : 1;
    const underlineOffset = styles.textUnderlineOffset ? styles.textUnderlineOffset - 2 : 0;
    const inset = styles.textDecorationInset;

    // Full extent of the decoration span across all words on this line.
    const lineStart = lineStartMap.get(textBound)!;
    const lineEnd = lineEndMap.get(textBound)!;

    styles.textDecorationLine.forEach(textDecorationLine => {
        if (isVertical) {
            const underlineOnLeft = wm === WRITING_MODE.VERTICAL_LR || wm === WRITING_MODE.VERTICAL_RL;
            let lineX: number;
            switch (textDecorationLine) {
                case TEXT_DECORATION_LINE.UNDERLINE:
                    lineX = underlineOnLeft
                        ? textBound.bounds.left
                        : textBound.bounds.left + textBound.bounds.width - thickness;
                    break;
                case TEXT_DECORATION_LINE.OVERLINE:
                    lineX = underlineOnLeft
                        ? textBound.bounds.left + textBound.bounds.width - thickness
                        : textBound.bounds.left;
                    break;
                case TEXT_DECORATION_LINE.LINE_THROUGH:
                default:
                    lineX = textBound.bounds.left + textBound.bounds.width / 2 - thickness / 2;
                    break;
            }
            // Draw the full vertical span in one call, applying insets at both ends.
            const insetY = lineStart + inset.start;
            const insetH = Math.max(0, lineEnd - lineStart - inset.start - inset.end);
            renderDecorationLine(
                state,
                styles.textDecorationStyle,
                lineX,
                insetY,
                thickness,
                insetH,
                true,
                textDecorationLine,
                lineStart,
                fontSizePx,
            );
        } else {
            const baselineY = textBound.bounds.top + baseline;
            let lineY: number;
            switch (textDecorationLine) {
                case TEXT_DECORATION_LINE.UNDERLINE:
                    if (styles.textUnderlinePosition === TEXT_UNDERLINE_POSITION.UNDER) {
                        lineY = textBound.bounds.top + textBound.bounds.height;
                    } else {
                        lineY = baselineY + 2;
                    }
                    lineY += underlineOffset;
                    break;
                case TEXT_DECORATION_LINE.OVERLINE:
                    lineY = Math.round(textBound.bounds.top + (textBound.bounds.height - baseline) * 0.1);
                    break;
                case TEXT_DECORATION_LINE.LINE_THROUGH:
                default:
                    lineY = Math.round(baselineY - baseline * 0.4) + 2;
                    break;
            }
            // Draw the full horizontal span in one call, applying insets at both ends.
            const insetX = lineStart + inset.start;
            const insetW = Math.max(0, lineEnd - lineStart - inset.start - inset.end);
            renderDecorationLine(
                state,
                styles.textDecorationStyle,
                insetX,
                lineY,
                insetW,
                thickness,
                false,
                textDecorationLine,
                lineStart,
                fontSizePx,
            );
        }
    });
}
