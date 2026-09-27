import { CanvasRenderState, resizeImage } from '../canvas-render-state';

// ---------------------------------------------------------------------------
// Minimal mocks. resizeImage only touches:
//   state.resizeCache, state.canvas.ownerDocument.createElement('canvas'),
//   canvas.width/height, canvas.getContext('2d').drawImage, and image.src/width/height
// ---------------------------------------------------------------------------
class MockCtx {
    drawCalls = 0;
    drawImage() {
        this.drawCalls++;
    }
}

class MockCanvas {
    width = 0;
    height = 0;
    ctx = new MockCtx();
    getContext() {
        return this.ctx;
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
        resizeCache: new Map<string, HTMLCanvasElement>(),
    } as unknown as CanvasRenderState;
    return { state, doc };
};

const makeImage = (src: string, width = 40, height = 30) => ({ src, width, height }) as unknown as HTMLImageElement;

describe('resizeImage caching', () => {
    it('creates a canvas on a cache miss', () => {
        const { state, doc } = makeState();
        resizeImage(state, makeImage('a.png'), 100, 50);
        expect(doc.created).toHaveLength(1);
    });

    it('returns the cached canvas on a hit (same src + size)', () => {
        const { state, doc } = makeState();
        const first = resizeImage(state, makeImage('a.png'), 100, 50);
        const second = resizeImage(state, makeImage('a.png'), 100, 50);
        expect(second).toBe(first);
        expect(doc.created).toHaveLength(1); // no second allocation
    });

    it('draws only once for repeated identical requests', () => {
        const { state } = makeState();
        const canvas = resizeImage(state, makeImage('a.png'), 100, 50) as unknown as MockCanvas;
        resizeImage(state, makeImage('a.png'), 100, 50);
        expect(canvas.ctx.drawCalls).toBe(1);
    });

    it('caches separately per target size', () => {
        const { state, doc } = makeState();
        resizeImage(state, makeImage('a.png'), 100, 50);
        resizeImage(state, makeImage('a.png'), 200, 80);
        expect(doc.created).toHaveLength(2);
    });

    it('caches separately per source url', () => {
        const { state, doc } = makeState();
        resizeImage(state, makeImage('a.png'), 100, 50);
        resizeImage(state, makeImage('b.png'), 100, 50);
        expect(doc.created).toHaveLength(2);
    });

    it('sizes the canvas to the requested dimensions (min 1px)', () => {
        const { state } = makeState();
        const canvas = resizeImage(state, makeImage('a.png'), 0, 50) as unknown as MockCanvas;
        expect(canvas.width).toBe(1);
        expect(canvas.height).toBe(50);
    });
});
