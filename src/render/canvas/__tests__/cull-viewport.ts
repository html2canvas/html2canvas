import { Bounds } from '../../../css/layout/bounds';
import { CULL_MARGIN, isOutsideViewport } from '../cull';

// Viewport used across tests: x=0, y=0, 100 x 100.
const inViewport = (b: Bounds) => !isOutsideViewport(b, 0, 0, 100, 100);
const culled = (b: Bounds) => isOutsideViewport(b, 0, 0, 100, 100);

describe('isOutsideViewport', () => {
    it('keeps an element fully inside the viewport', () => {
        expect(inViewport(new Bounds(10, 10, 20, 20))).toBe(true);
    });

    it('keeps an element that partially overlaps the viewport', () => {
        // straddles the right edge
        expect(inViewport(new Bounds(90, 10, 40, 20))).toBe(true);
    });

    it('culls an element far to the right', () => {
        expect(culled(new Bounds(500, 10, 20, 20))).toBe(true);
    });

    it('culls an element far below', () => {
        expect(culled(new Bounds(10, 500, 20, 20))).toBe(true);
    });

    it('culls an element fully above (negative top)', () => {
        expect(culled(new Bounds(10, -200, 20, 20))).toBe(true);
    });

    it('culls an element fully to the left (negative left)', () => {
        expect(culled(new Bounds(-200, 10, 20, 20))).toBe(true);
    });

    describe('margin behaviour', () => {
        it('does not cull an element just outside by less than the margin', () => {
            // right edge at 100; element starts at 100 + (MARGIN-1) → still within margin
            const b = new Bounds(100 + (CULL_MARGIN - 1), 10, 5, 5);
            expect(inViewport(b)).toBe(true);
        });

        it('culls an element beyond the margin', () => {
            const b = new Bounds(100 + CULL_MARGIN + 1, 10, 5, 5);
            expect(culled(b)).toBe(true);
        });
    });

    it('respects a non-zero viewport origin (scrolled output)', () => {
        // viewport at x=200,y=200 size 100x100. Element at page (210,210) is inside.
        expect(isOutsideViewport(new Bounds(210, 210, 10, 10), 200, 200, 100, 100)).toBe(false);
        // Element at page (10,10) is outside a viewport anchored at 200,200.
        expect(isOutsideViewport(new Bounds(10, 10, 10, 10), 200, 200, 100, 100)).toBe(true);
    });
});
