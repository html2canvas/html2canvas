import { Bounds } from '../../../css/layout/bounds';
import { TextBounds } from '../../../css/layout/text';
import { computeLineClamp } from '../canvas-text-renderer';

// Build a TextBounds on a given line (top) at horizontal position left..left+width.
const seg = (text: string, left: number, top: number, width: number) =>
    new TextBounds(text, new Bounds(left, top, width, 16));

describe('computeLineClamp', () => {
    it('returns null when the text already fits within the limit', () => {
        const bounds = [seg('a', 0, 0, 10), seg('b', 10, 0, 10), seg('c', 0, 20, 10)];
        // 2 lines, limit 3 → no clamp
        expect(computeLineClamp(bounds, 3)).toBeNull();
    });

    it('returns null when line count equals the limit', () => {
        const bounds = [seg('l1', 0, 0, 10), seg('l2', 0, 20, 10)];
        expect(computeLineClamp(bounds, 2)).toBeNull();
    });

    it('keeps only the first N lines', () => {
        const bounds = [seg('l1', 0, 0, 10), seg('l2', 0, 20, 10), seg('l3', 0, 40, 10), seg('l4', 0, 60, 10)];
        const result = computeLineClamp(bounds, 2)!;
        expect(result).not.toBeNull();
        expect(result.kept.has(bounds[0])).toBe(true); // line 1
        expect(result.kept.has(bounds[1])).toBe(true); // line 2
        expect(result.kept.has(bounds[2])).toBe(false); // line 3 dropped
        expect(result.kept.has(bounds[3])).toBe(false); // line 4 dropped
    });

    it('keeps every segment of a kept line', () => {
        const bounds = [
            seg('a', 0, 0, 10),
            seg('b', 10, 0, 10), // same line as 'a'
            seg('c', 0, 20, 10),
            seg('d', 0, 40, 10),
        ];
        const result = computeLineClamp(bounds, 1)!;
        expect(result.kept.has(bounds[0])).toBe(true);
        expect(result.kept.has(bounds[1])).toBe(true);
        expect(result.kept.has(bounds[2])).toBe(false);
    });

    it('anchors the ellipsis on the rightmost segment of the last kept line', () => {
        const bounds = [
            seg('a', 0, 0, 10),
            seg('b', 30, 0, 10), // rightmost on line 1 (right edge = 40)
            seg('c', 15, 0, 10), // middle of line 1
            seg('d', 0, 20, 10), // line 2 (dropped when limit=1)
        ];
        const result = computeLineClamp(bounds, 1)!;
        expect(result.ellipsisAnchor).toBe(bounds[1]);
    });

    it('groups lines by rounded top (absorbs sub-pixel jitter)', () => {
        const bounds = [
            seg('a', 0, 0.2, 10),
            seg('b', 10, -0.1, 10), // same visual line as 'a' after rounding
            seg('c', 0, 20.4, 10), // second line
        ];
        const result = computeLineClamp(bounds, 1)!;
        expect(result.kept.has(bounds[0])).toBe(true);
        expect(result.kept.has(bounds[1])).toBe(true);
        expect(result.kept.has(bounds[2])).toBe(false);
    });
});
