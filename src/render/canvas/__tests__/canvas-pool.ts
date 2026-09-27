import { CanvasPool } from '../canvas-pool';

// ---------------------------------------------------------------------------
// Minimal mock of a 2D context that records the reset calls performed on
// release(). jsdom's canvas returns null from getContext('2d'), so we provide
// our own fake canvas/context to make the pool's behaviour observable.
// ---------------------------------------------------------------------------
type Call = { method: string; args: unknown[] };

class MockContext {
    calls: Call[] = [];
    filter = '';
    globalAlpha = 1;
    globalCompositeOperation = 'source-over';

    setTransform(...args: number[]) {
        this.calls.push({ method: 'setTransform', args });
    }
    clearRect(...args: number[]) {
        this.calls.push({ method: 'clearRect', args });
    }
}

class MockCanvas {
    width = 0;
    height = 0;
    ctx: MockContext | null;

    constructor(ctx: MockContext | null = new MockContext()) {
        this.ctx = ctx;
    }

    getContext(_type: string): MockContext | null {
        return this.ctx;
    }
}

// A mock document whose createElement('canvas') hands out MockCanvas instances
// and records how many were created (to prove the pool reuses them).
class MockDocument {
    created: MockCanvas[] = [];
    // allow forcing getContext to return null (simulates jsdom)
    ctxFactory: () => MockContext | null = () => new MockContext();

    createElement(name: string): MockCanvas {
        if (name !== 'canvas') {
            throw new Error(`unexpected createElement('${name}')`);
        }
        const canvas = new MockCanvas(this.ctxFactory());
        this.created.push(canvas);
        return canvas;
    }
}

const makePool = (doc = new MockDocument()) => {
    // CanvasPool only uses ownerDocument.createElement — the shapes are
    // structurally compatible, so cast through unknown for the test.
    const pool = new CanvasPool(doc as unknown as Document);
    return { pool, doc };
};

// The pool's public API is typed against HTMLCanvasElement, but at runtime it
// only touches width/height/getContext — all present on MockCanvas. This
// helper keeps the inspection cast in one place.
const asMock = (c: HTMLCanvasElement): MockCanvas => c as unknown as MockCanvas;

describe('CanvasPool', () => {
    describe('acquire', () => {
        it('creates a new canvas when the pool is empty', () => {
            const { pool, doc } = makePool();
            pool.acquire(100, 50);
            expect(doc.created).toHaveLength(1);
        });

        it('sets the canvas to the requested size', () => {
            const { pool } = makePool();
            const canvas = asMock(pool.acquire(100, 50));
            expect(canvas.width).toBe(100);
            expect(canvas.height).toBe(50);
        });

        it('clamps width and height to a minimum of 1px', () => {
            const { pool } = makePool();
            const canvas = asMock(pool.acquire(0, -10));
            expect(canvas.width).toBe(1);
            expect(canvas.height).toBe(1);
        });

        it('floors fractional dimensions', () => {
            const { pool } = makePool();
            const canvas = asMock(pool.acquire(100.9, 50.4));
            expect(canvas.width).toBe(100);
            expect(canvas.height).toBe(50);
        });
    });

    describe('release / reuse', () => {
        it('reuses a released canvas instead of allocating a new one', () => {
            const { pool, doc } = makePool();
            const first = pool.acquire(100, 50);
            pool.release(first);
            const second = pool.acquire(200, 80);

            expect(second).toBe(first);
            // only one canvas ever created
            expect(doc.created).toHaveLength(1);
        });

        it('resizes a reused canvas to the newly requested dimensions', () => {
            const { pool } = makePool();
            const first = pool.acquire(100, 50);
            pool.release(first);
            const second = pool.acquire(200, 80);
            expect(asMock(second).width).toBe(200);
            expect(asMock(second).height).toBe(80);
        });

        it('resets the context transform and clears the bitmap on release', () => {
            const { pool } = makePool();
            const canvas = pool.acquire(100, 50);
            const ctx = asMock(canvas).ctx!;
            pool.release(canvas);

            const methods = ctx.calls.map(c => c.method);
            expect(methods).toContain('setTransform');
            expect(methods).toContain('clearRect');

            const setTransform = ctx.calls.find(c => c.method === 'setTransform');
            expect(setTransform!.args).toEqual([1, 0, 0, 1, 0, 0]);
        });

        it('resets filter, globalAlpha and composite operation on release', () => {
            const { pool } = makePool();
            const canvas = pool.acquire(100, 50);
            const ctx = asMock(canvas).ctx!;
            ctx.filter = 'blur(4px)';
            ctx.globalAlpha = 0.3;
            ctx.globalCompositeOperation = 'destination-in';

            pool.release(canvas);

            expect(ctx.filter).toBe('none');
            expect(ctx.globalAlpha).toBe(1);
            expect(ctx.globalCompositeOperation).toBe('source-over');
        });

        it('does not throw when getContext returns null (jsdom-like)', () => {
            const doc = new MockDocument();
            doc.ctxFactory = () => null;
            const { pool } = makePool(doc);
            const canvas = pool.acquire(100, 50);
            expect(() => pool.release(canvas)).not.toThrow();
        });
    });

    describe('clear', () => {
        it('drops pooled canvases so the next acquire allocates fresh ones', () => {
            const { pool, doc } = makePool();
            const first = pool.acquire(100, 50);
            pool.release(first);
            pool.clear();

            const second = pool.acquire(100, 50);
            expect(second).not.toBe(first);
            expect(doc.created).toHaveLength(2);
        });
    });
});
