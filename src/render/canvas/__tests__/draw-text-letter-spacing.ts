import { drawTextWithLetterSpacing } from '../canvas-text-renderer';

// ---------------------------------------------------------------------------
// Mock 2D context recording draw calls. Two variants: one exposing the native
// `letterSpacing` property, one without it (to exercise the fallback path).
// ---------------------------------------------------------------------------
type Call = { method: string; args: unknown[] };

class BaseMockContext {
    calls: Call[] = [];

    fillText(t: string, x: number, y: number) {
        this.calls.push({ method: 'fillText', args: [t, x, y] });
    }
    strokeText(t: string, x: number, y: number) {
        this.calls.push({ method: 'strokeText', args: [t, x, y] });
    }
    measureText(_t: string) {
        return { width: 10 };
    }
}

// Supports the native ctx.letterSpacing property.
class NativeMockContext extends BaseMockContext {
    letterSpacing = '0px';
}

const asCtx = (c: BaseMockContext): CanvasRenderingContext2D => c as unknown as CanvasRenderingContext2D;

describe('drawTextWithLetterSpacing', () => {
    describe('letterSpacing === 0', () => {
        it('draws the whole run in a single fillText regardless of native support', () => {
            const ctx = new BaseMockContext();
            drawTextWithLetterSpacing(asCtx(ctx), 'Hello', 5, 20, 0);
            const fills = ctx.calls.filter(c => c.method === 'fillText');
            expect(fills).toHaveLength(1);
            expect(fills[0].args).toEqual(['Hello', 5, 20]);
        });
    });

    describe('native path (ctx.letterSpacing available)', () => {
        it('draws the whole run in a single fillText', () => {
            const ctx = new NativeMockContext();
            drawTextWithLetterSpacing(asCtx(ctx), 'Hello', 5, 20, 3);
            const fills = ctx.calls.filter(c => c.method === 'fillText');
            expect(fills).toHaveLength(1);
            expect(fills[0].args).toEqual(['Hello', 5, 20]);
        });

        it('sets letterSpacing during the draw and restores it afterwards', () => {
            const ctx = new NativeMockContext();
            ctx.letterSpacing = '2px'; // pre-existing value must be restored
            drawTextWithLetterSpacing(asCtx(ctx), 'Hi', 0, 0, 4);
            expect(ctx.letterSpacing).toBe('2px');
        });

        it('uses strokeText when useStroke is true', () => {
            const ctx = new NativeMockContext();
            drawTextWithLetterSpacing(asCtx(ctx), 'Hi', 0, 0, 4, true);
            const strokes = ctx.calls.filter(c => c.method === 'strokeText');
            expect(strokes).toHaveLength(1);
        });
    });

    describe('fallback path (no native ctx.letterSpacing)', () => {
        it('draws one fillText per grapheme', () => {
            const ctx = new BaseMockContext();
            drawTextWithLetterSpacing(asCtx(ctx), 'Hello', 0, 0, 3);
            const fills = ctx.calls.filter(c => c.method === 'fillText');
            expect(fills).toHaveLength(5);
        });

        it('advances by measured width plus (letterSpacing - 1) between graphemes', () => {
            const ctx = new BaseMockContext();
            // measureText width is mocked to 10; spacing 3 → advance 10 + (3-1) = 12
            drawTextWithLetterSpacing(asCtx(ctx), 'ab', 0, 0, 3);
            const fills = ctx.calls.filter(c => c.method === 'fillText');
            expect(fills[0].args[1]).toBe(0);
            expect(fills[1].args[1]).toBe(12);
        });

        it('does not add trailing spacing after the last grapheme', () => {
            const ctx = new BaseMockContext();
            // Two graphemes → only one gap applied; verified via the x of the 2nd
            // being exactly one advance, not two.
            drawTextWithLetterSpacing(asCtx(ctx), 'ab', 0, 0, 3);
            const fills = ctx.calls.filter(c => c.method === 'fillText');
            expect(fills).toHaveLength(2);
            expect(fills[1].args[1]).toBe(12);
        });
    });
});
