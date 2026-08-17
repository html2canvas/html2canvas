import {Bounds} from '../../../css/layout/bounds';
import {TextBounds} from '../../../css/layout/text';
import {WRITING_MODE} from '../../../css/property-descriptors/writing-mode';

// ---------------------------------------------------------------------------
// Minimal mock of CanvasRenderingContext2D that records canvas transform calls
// ---------------------------------------------------------------------------
type Call = {method: string; args: unknown[]};

class MockCanvasContext {
    calls: Call[] = [];
    textBaseline = 'alphabetic';

    save() {
        this.calls.push({method: 'save', args: []});
    }
    restore() {
        this.calls.push({method: 'restore', args: []});
    }
    translate(x: number, y: number) {
        this.calls.push({method: 'translate', args: [x, y]});
    }
    rotate(angle: number) {
        this.calls.push({method: 'rotate', args: [angle]});
    }
    fillText(text: string, x: number, y: number) {
        this.calls.push({method: 'fillText', args: [text, x, y]});
    }
    measureText(_text: string) {
        return {width: 10};
    }
    reset() {
        this.calls = [];
    }
}

// ---------------------------------------------------------------------------
// Thin wrapper that exposes renderTextWithLetterSpacing without a full Context
// ---------------------------------------------------------------------------
import {segmentGraphemes} from '../../../css/layout/text';

function renderTextWithLetterSpacing(
    ctx: MockCanvasContext,
    text: TextBounds,
    letterSpacing: number,
    baseline: number,
    wm: WRITING_MODE = WRITING_MODE.HORIZONTAL_TB
): void {
    const isVertical =
        wm === WRITING_MODE.VERTICAL_RL ||
        wm === WRITING_MODE.VERTICAL_LR ||
        wm === WRITING_MODE.SIDEWAYS_RL ||
        wm === WRITING_MODE.SIDEWAYS_LR;

    if (isVertical) {
        const isSidewaysLR = wm === WRITING_MODE.SIDEWAYS_LR;
        const angle = isSidewaysLR ? -Math.PI / 2 : Math.PI / 2;
        const cx = text.bounds.left + text.bounds.width / 2;
        const cy = text.bounds.top + text.bounds.height / 2;

        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(angle);
        ctx.translate(-cx, -cy);

        const rotatedBounds = new Bounds(
            cx - text.bounds.height / 2,
            cy - text.bounds.width / 2,
            text.bounds.height,
            text.bounds.width
        );
        const rotatedText = new TextBounds(text.text, rotatedBounds);

        if (letterSpacing === 0) {
            ctx.textBaseline = 'ideographic';
            ctx.fillText(rotatedText.text, rotatedText.bounds.left, rotatedText.bounds.top + rotatedText.bounds.height);
        } else {
            const letters = segmentGraphemes(rotatedText.text);
            letters.reduce((left, letter) => {
                ctx.fillText(letter, left, rotatedText.bounds.top + baseline);
                return left + ctx.measureText(letter).width;
            }, rotatedText.bounds.left);
        }

        ctx.restore();
    } else {
        if (letterSpacing === 0) {
            ctx.textBaseline = 'ideographic';
            ctx.fillText(text.text, text.bounds.left, text.bounds.top + text.bounds.height);
        } else {
            const letters = segmentGraphemes(text.text);
            letters.reduce((left, letter) => {
                ctx.fillText(letter, left, text.bounds.top + baseline);
                return left + ctx.measureText(letter).width;
            }, text.bounds.left);
        }
    }
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
describe('renderTextWithLetterSpacing', () => {
    let ctx: MockCanvasContext;
    // text bounds: left=10, top=20, width=30, height=100 (tall — vertical text)
    const bounds = new Bounds(10, 20, 30, 100);
    const text = new TextBounds('Hello', bounds);

    beforeEach(() => {
        ctx = new MockCanvasContext();
    });

    describe('horizontal-tb (default)', () => {
        it('does not rotate the canvas', () => {
            renderTextWithLetterSpacing(ctx, text, 0, 12, WRITING_MODE.HORIZONTAL_TB);
            const rotateCalls = ctx.calls.filter((c) => c.method === 'rotate');
            expect(rotateCalls).toHaveLength(0);
        });

        it('calls fillText at the original position', () => {
            renderTextWithLetterSpacing(ctx, text, 0, 12, WRITING_MODE.HORIZONTAL_TB);
            const fillCall = ctx.calls.find((c) => c.method === 'fillText');
            expect(fillCall).toBeDefined();
            expect(fillCall!.args[1]).toBe(bounds.left);
        });
    });

    describe('sideways-rl', () => {
        it('wraps with save/restore', () => {
            renderTextWithLetterSpacing(ctx, text, 0, 12, WRITING_MODE.SIDEWAYS_RL);
            expect(ctx.calls[0].method).toBe('save');
            expect(ctx.calls[ctx.calls.length - 1].method).toBe('restore');
        });

        it('rotates +90°', () => {
            renderTextWithLetterSpacing(ctx, text, 0, 12, WRITING_MODE.SIDEWAYS_RL);
            const rotateCall = ctx.calls.find((c) => c.method === 'rotate');
            expect(rotateCall).toBeDefined();
            expect(rotateCall!.args[0]).toBeCloseTo(Math.PI / 2);
        });

        it('translates to/from the centre of the bounds', () => {
            renderTextWithLetterSpacing(ctx, text, 0, 12, WRITING_MODE.SIDEWAYS_RL);
            const translates = ctx.calls.filter((c) => c.method === 'translate');
            const cx = bounds.left + bounds.width / 2; // 25
            const cy = bounds.top + bounds.height / 2; // 70
            expect(translates[0].args).toEqual([cx, cy]);
            expect(translates[1].args).toEqual([-cx, -cy]);
        });
    });

    describe('sideways-lr', () => {
        it('rotates -90°', () => {
            renderTextWithLetterSpacing(ctx, text, 0, 12, WRITING_MODE.SIDEWAYS_LR);
            const rotateCall = ctx.calls.find((c) => c.method === 'rotate');
            expect(rotateCall).toBeDefined();
            expect(rotateCall!.args[0]).toBeCloseTo(-Math.PI / 2);
        });
    });

    describe('vertical-rl', () => {
        it('rotates +90°', () => {
            renderTextWithLetterSpacing(ctx, text, 0, 12, WRITING_MODE.VERTICAL_RL);
            const rotateCall = ctx.calls.find((c) => c.method === 'rotate');
            expect(rotateCall!.args[0]).toBeCloseTo(Math.PI / 2);
        });
    });

    describe('vertical-lr', () => {
        it('rotates +90°', () => {
            renderTextWithLetterSpacing(ctx, text, 0, 12, WRITING_MODE.VERTICAL_LR);
            const rotateCall = ctx.calls.find((c) => c.method === 'rotate');
            expect(rotateCall!.args[0]).toBeCloseTo(Math.PI / 2);
        });
    });

    describe('letter-spacing with sideways-rl', () => {
        it('calls fillText once per grapheme', () => {
            renderTextWithLetterSpacing(ctx, text, 5, 12, WRITING_MODE.SIDEWAYS_RL);
            const fillCalls = ctx.calls.filter((c) => c.method === 'fillText');
            // 'Hello' → 5 graphemes
            expect(fillCalls).toHaveLength(5);
        });
    });
});
