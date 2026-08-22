import { Context } from '../core/context';
import { CSSParsedDeclaration } from '../css/index';
import { Bounds } from '../css/layout/bounds';
import { parseTextBounds, TextBounds } from '../css/layout/text';
import { TEXT_TRANSFORM } from '../css/property-descriptors/text-transform';
import { isDimensionToken } from '../css/syntax/parser';
import { DimensionToken } from '../css/syntax/tokenizer';
import { getNumber } from '../css/types/length-percentage';

export class TextContainer {
    text: string;
    textBounds: TextBounds[];

    constructor(context: Context, node: Text, styles: CSSParsedDeclaration) {
        this.text = transform(node.data, styles.textTransform);

        if (styles.textTransform === TEXT_TRANSFORM.MATH_AUTO) {
            // parseTextBounds uses Range offsets on the original DOM text node.
            // math-auto produces surrogate-pair codepoints (U+1D400+, length=2 in JS)
            // from single ASCII chars (length=1), so offsets into the original node
            // would be wrong if we pass the transformed text directly.
            // Parse bounds using the original text, then replace each segment's
            // text with its transformed equivalent and recalculate the width.
            const originalBounds = parseTextBounds(context, node.data, styles, node);
            this.textBounds = remeasureMathAutoBounds(originalBounds, styles);
        } else {
            this.textBounds = parseTextBounds(context, this.text, styles, node);
        }
    }
}

const transform = (text: string, transform: TEXT_TRANSFORM) => {
    switch (transform) {
        case TEXT_TRANSFORM.LOWERCASE:
            return text.toLowerCase();
        case TEXT_TRANSFORM.CAPITALIZE:
            return text.replace(CAPITALIZE, capitalize);
        case TEXT_TRANSFORM.UPPERCASE:
            return text.toUpperCase();
        case TEXT_TRANSFORM.FULL_WIDTH:
            return toFullWidth(text);
        case TEXT_TRANSFORM.FULL_SIZE_KANA:
            return toFullSizeKana(text);
        case TEXT_TRANSFORM.MATH_AUTO:
            return toMathAuto(text);
        case TEXT_TRANSFORM.NONE:
        default:
            return text;
    }
};

const CAPITALIZE = /(^|\s|:|-|\(|\))([a-z])/g;

const capitalize = (m: string, p1: string, p2: string) => {
    if (m.length > 0) {
        return p1 + p2.toUpperCase();
    }

    return m;
};
// Converts standard ASCII characters to full-width characters
const toFullWidth = (text: string) => {
    return text
        .replace(/[\u0021-\u007E]/g, char => String.fromCharCode(char.charCodeAt(0) + 0xfee0))
        .replace(/\u0020/g, '\u3000');
};

// Map of small Kana to normal full-size Kana
const SMALL_KANA_MAP: Record<string, string> = {
    ぁ: 'あ',
    ぃ: 'い',
    ぅ: 'う',
    ぇ: 'え',
    ぉ: 'お',
    っ: 'つ',
    ゃ: 'や',
    ゅ: 'ゆ',
    ょ: 'よ',
    ゎ: 'わ',
    ゕ: 'か',
    ゖ: 'け', // Small Hiragana ka/ke
    ァ: 'ア',
    ィ: 'イ',
    ゥ: 'ウ',
    ェ: 'エ',
    ォ: 'オ',
    ッ: 'ツ',
    ャ: 'ヤ',
    ュ: 'ユ',
    ョ: 'ヨ',
    ヮ: 'ワ',
    ヵ: 'カ',
    ヶ: 'ケ', // Small Katakana ka/ke
};

// Converts small kana characters to their full-size equivalents
const toFullSizeKana = (text: string) => {
    return text.replace(/[ぁ-ゎゕゖァ-ヮヵヶ]/g, match => SMALL_KANA_MAP[match] || match);
};

// Applies math-auto transformation (typically used for single-character MathML variables)
const toMathAuto = (text: string) => {
    const trimmed = text.trim();

    // math-auto only converts a single character to its mathematical italic equivalent.
    if (trimmed.length === 1) {
        const code = trimmed.charCodeAt(0);

        // A-Z → Mathematical Italic Capital (U+1D434..U+1D44D)
        if (code >= 65 && code <= 90) {
            return String.fromCodePoint(code + 0x1d3bf);
        }

        // a-z → Mathematical Italic Small (U+1D44E..U+1D467)
        // Exception: 'h' → U+210E (Planck constant)
        if (code >= 97 && code <= 122) {
            if (trimmed === 'h') return '\u210E';
            return String.fromCodePoint(code + 0x1d3b9);
        }
    }

    return text;
};

// Canvas used for measuring math-auto glyph widths (shared, lazy-created).
let _mathMeasureCanvas: HTMLCanvasElement | null = null;
let _mathMeasureCtx: CanvasRenderingContext2D | null = null;

const getMathMeasureCtx = (): CanvasRenderingContext2D | null => {
    if (!_mathMeasureCtx) {
        _mathMeasureCanvas = document.createElement('canvas');
        _mathMeasureCtx = _mathMeasureCanvas.getContext('2d');
    }
    return _mathMeasureCtx;
};

/**
 * Takes bounds measured on the original ASCII text, transforms each segment's
 * text via toMathAuto(), and recalculates its width using canvas measureText().
 *
 * Returns a new TextBounds[] with transformed text and corrected widths.
 * top, left, height remain from the DOM measurement.
 */
const remeasureMathAutoBounds = (originalBounds: TextBounds[], styles: CSSParsedDeclaration): TextBounds[] => {
    const ctx = getMathMeasureCtx();

    const fontVariant = styles.fontVariant.filter(v => v === 'normal' || v === 'small-caps').join('');
    const fontFamily = styles.fontFamily.join(', ');
    const fontSize = isDimensionToken(styles.fontSize)
        ? `${getNumber(styles.fontSize as DimensionToken)}${(styles.fontSize as DimensionToken).unit}`
        : `${getNumber(styles.fontSize)}px`;

    if (ctx) {
        ctx.font = [styles.fontStyle, fontVariant, styles.fontWeight, fontSize, fontFamily].join(' ');
    }

    return originalBounds.map(tb => {
        const transformedText = toMathAuto(tb.text);
        const width = ctx ? ctx.measureText(transformedText).width : tb.bounds.width;
        return new TextBounds(transformedText, new Bounds(tb.bounds.left, tb.bounds.top, width, tb.bounds.height));
    });
};
