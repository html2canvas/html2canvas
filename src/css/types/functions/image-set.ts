/**
 * image-set() / -webkit-image-set()
 *
 * Selects the best image candidate based on the device pixel ratio (DPR).
 *
 * Syntax:
 *   image-set( <image-set-option># )
 *   <image-set-option> = [ <image> | <string> ] [ <resolution> | type(<string>) ]
 *
 * Examples:
 *   image-set(url("img.png") 1x, url("img@2x.png") 2x)
 *   image-set("img.avif" type("image/avif"), "img.jpg" 1x)
 *
 * The candidate with the resolution closest to `context.options.scale`
 * (or `window.devicePixelRatio` as fallback) is selected, then parsed as a
 * regular image so all consumers (background-image, mask-image, etc.) work
 * unchanged.
 */

import { Context } from '../../../core/context';
import { CSSValue, parseFunctionArgs } from '../../syntax/parser';
import { TokenType } from '../../syntax/tokenizer';
import { CSSImageType, CSSURLImage, ICSSImage, image as imageParse } from '../image';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Resolve the resolution number from a dimension token (1x, 2x, 1dppx, 96dpi…). */
function parseResolution(token: CSSValue): number | null {
    if (token.type === TokenType.DIMENSION_TOKEN) {
        const dim = token as { unit: string; number: number };
        switch (dim.unit.toLowerCase()) {
            case 'x':
            case 'dppx':
                return dim.number;
            case 'dpi':
                return dim.number / 96; // 96dpi ≡ 1dppx
            case 'dpcm':
                return (dim.number * 2.54) / 96;
            default:
                return null;
        }
    }
    // Plain number with no unit is treated as x-resolution (legacy syntax)
    if (token.type === TokenType.NUMBER_TOKEN) {
        return (token as { number: number }).number;
    }
    return null;
}

/**
 * Determine the target DPR.
 * `context.options.scale` mirrors devicePixelRatio.
 */
function targetDpr(context: Context): number {
    const scale = (context as unknown as { options?: { scale?: number } }).options?.scale;
    if (typeof scale === 'number' && scale > 0) return scale;
    if (typeof window !== 'undefined' && window.devicePixelRatio > 0) return window.devicePixelRatio;
    return 1;
}

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------

/**
 * Parse an `image-set()` function and return the best-matching image.
 * Called by SUPPORTED_IMAGE_FUNCTIONS in image.ts.
 */
export const imageSet = (context: Context, args: CSSValue[]): ICSSImage => {
    const dpr = targetDpr(context);

    // parseFunctionArgs splits on top-level commas → one entry per candidate
    const groups = parseFunctionArgs(args);

    let bestImage: ICSSImage | null = null;
    let bestDiff = Infinity;

    for (const group of groups) {
        // Each group looks like: [ <url-token | string-token | url-function>, <resolution>? ]
        const tokens = group.filter(t => t.type !== TokenType.WHITESPACE_TOKEN);
        if (tokens.length === 0) continue;

        let imageToken: CSSValue | null = null;
        let resolution = 1; // default 1x when omitted

        for (const token of tokens) {
            if (token.type === TokenType.URL_TOKEN || token.type === TokenType.STRING_TOKEN) {
                imageToken = token;
            } else if (token.type === TokenType.FUNCTION) {
                const fn = token as { name: string; values: CSSValue[] };
                const fnName = fn.name.toLowerCase();
                if (fnName === 'url') {
                    // url("…") inside image-set — use it directly
                    imageToken = token;
                }
                // type("image/avif") is a format hint — ignore it
            } else {
                const res = parseResolution(token);
                if (res !== null) resolution = res;
            }
        }

        if (imageToken === null) continue;

        const diff = Math.abs(resolution - dpr);
        if (diff < bestDiff) {
            bestDiff = diff;

            if (imageToken.type === TokenType.STRING_TOKEN) {
                // Bare string candidate: treat as URL
                const url = (imageToken as { value: string }).value;
                const urlImage: CSSURLImage = { url, type: CSSImageType.URL };
                context.cache.addImage(url);
                bestImage = urlImage;
            } else {
                try {
                    bestImage = imageParse.parse(context, imageToken);
                } catch {
                    // url() FUNCTION inside image-set: extract inner URL/string token
                    const fn = imageToken as { values?: CSSValue[] };
                    const inner = (fn.values ?? []).find(
                        t => t.type === TokenType.STRING_TOKEN || t.type === TokenType.URL_TOKEN,
                    );
                    if (inner) {
                        const url = (inner as { value: string }).value;
                        const urlImage: CSSURLImage = { url, type: CSSImageType.URL };
                        context.cache.addImage(url);
                        bestImage = urlImage;
                    }
                }
            }
        }
    }

    if (bestImage === null) {
        throw new Error('image-set(): no valid image candidate found');
    }

    return bestImage;
};
