import { CanvasRenderState, getLinearGradientCanvas } from '../canvas-render-state';

// getLinearGradientCanvas only touches:
//   state.gradientCanvasCache, state.canvas.ownerDocument.createElement('canvas'),
//   canvas.width/height, canvas.getContext('2d'), and the caller-provided paint().
class MockCanvas {
    width = 0;
    height = 0;
    getContext() {
        return {};
    }
}

class MockDocument {
    created: MockCanvas[] = [];
    createElement(name: string): MockCanvas {
        if (name !== 'canvas') throw new Error(`unexpected createElement('${name}')`);
        const c = new MockCanvas();
        this.created.push(c);
        return c;
    }
}

const makeState = () => {
    const doc = new MockDocument();
    const mainCanvas = { ownerDocument: doc } as unknown as HTMLCanvasElement;
    const state = {
        canvas: mainCanvas,
        gradientCanvasCache: new Map<string, HTMLCanvasElement>(),
    } as unknown as CanvasRenderState;
    return { state, doc };
};

describe('getLinearGradientCanvas', () => {
    it('paints and creates a canvas on a cache miss', () => {
        const { state, doc } = makeState();
        let painted = 0;
        getLinearGradientCanvas(state, 'k1', 100, 50, () => {
            painted++;
        });
        expect(doc.created).toHaveLength(1);
        expect(painted).toBe(1);
    });

    it('returns the cached canvas and does not repaint on a hit', () => {
        const { state, doc } = makeState();
        let painted = 0;
        const first = getLinearGradientCanvas(state, 'k1', 100, 50, () => {
            painted++;
        });
        const second = getLinearGradientCanvas(state, 'k1', 100, 50, () => {
            painted++;
        });
        expect(second).toBe(first);
        expect(doc.created).toHaveLength(1);
        expect(painted).toBe(1);
    });

    it('keeps separate entries for different keys', () => {
        const { state, doc } = makeState();
        getLinearGradientCanvas(state, 'k1', 100, 50, () => undefined);
        getLinearGradientCanvas(state, 'k2', 100, 50, () => undefined);
        expect(doc.created).toHaveLength(2);
    });

    it('sizes the canvas to the requested dimensions (min 1px)', () => {
        const { state } = makeState();
        const canvas = getLinearGradientCanvas(state, 'k1', 0, 50, () => undefined) as unknown as MockCanvas;
        expect(canvas.width).toBe(1);
        expect(canvas.height).toBe(50);
    });

    it('passes a 2d context and the dimensions to paint()', () => {
        const { state } = makeState();
        let seen: { hasCtx: boolean; w: number; h: number } | null = null;
        getLinearGradientCanvas(state, 'k1', 30, 20, (ctx, w, h) => {
            seen = { hasCtx: !!ctx, w, h };
        });
        expect(seen).toEqual({ hasCtx: true, w: 30, h: 20 });
    });
});
