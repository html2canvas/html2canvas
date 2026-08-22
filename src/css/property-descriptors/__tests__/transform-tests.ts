import { deepStrictEqual } from 'assert';
import { Context } from '../../../core/context';
import { Parser } from '../../syntax/parser';
import { transform } from '../transform';

const parseValue = (value: string) => transform.parse({} as Context, Parser.parseValue(value));

/** Round each matrix component to avoid floating-point noise in trigonometry.
 *  Also normalises -0 → 0. */
const round = (m: number[] | null, precision = 10): number[] | null => {
    if (m === null) return null;
    const p = Math.pow(10, precision);
    return m.map(v => {
        const r = Math.round(v * p) / p;
        return r === 0 ? 0 : r; // normalize -0 to 0
    });
};

const deg = (d: number) => (Math.PI * d) / 180;

describe('property-descriptors', () => {
    describe('transform', () => {
        // ── none ────────────────────────────────────────────────────────────
        it('none', () => deepStrictEqual(parseValue('none'), null));

        // ── matrix ──────────────────────────────────────────────────────────
        it('matrix(1.0, 2.0, 3.0, 4.0, 5.0, 6.0)', () =>
            deepStrictEqual(parseValue('matrix(1.0, 2.0, 3.0, 4.0, 5.0, 6.0)'), [1, 2, 3, 4, 5, 6]));

        // ── matrix3d ────────────────────────────────────────────────────────
        it('matrix3d identity → 2D identity', () =>
            deepStrictEqual(
                parseValue('matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1)'),
                [1, 0, 0, 1, 0, 0],
            ));

        it('matrix3d with translation → extracts tx/ty', () =>
            deepStrictEqual(
                parseValue('matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 30, 40, 0, 1)'),
                [1, 0, 0, 1, 30, 40],
            ));

        // ── translate ───────────────────────────────────────────────────────
        it('translate(10px, 20px)', () => deepStrictEqual(parseValue('translate(10px, 20px)'), [1, 0, 0, 1, 10, 20]));

        it('translate(50px) — single arg → ty=0', () =>
            deepStrictEqual(parseValue('translate(50px)'), [1, 0, 0, 1, 50, 0]));

        it('translateX(30px)', () => deepStrictEqual(parseValue('translateX(30px)'), [1, 0, 0, 1, 30, 0]));

        it('translateY(15px)', () => deepStrictEqual(parseValue('translateY(15px)'), [1, 0, 0, 1, 0, 15]));

        // ── scale ────────────────────────────────────────────────────────────
        it('scale(2, 3)', () => deepStrictEqual(parseValue('scale(2, 3)'), [2, 0, 0, 3, 0, 0]));

        it('scale(1.5) — single arg → sy=sx', () => deepStrictEqual(parseValue('scale(1.5)'), [1.5, 0, 0, 1.5, 0, 0]));

        it('scaleX(2)', () => deepStrictEqual(parseValue('scaleX(2)'), [2, 0, 0, 1, 0, 0]));

        it('scaleY(0.5)', () => deepStrictEqual(parseValue('scaleY(0.5)'), [1, 0, 0, 0.5, 0, 0]));

        // ── rotate ───────────────────────────────────────────────────────────
        it('rotate(45deg)', () => {
            const a = deg(45);
            deepStrictEqual(
                round(parseValue('rotate(45deg)')),
                round([Math.cos(a), Math.sin(a), -Math.sin(a), Math.cos(a), 0, 0]),
            );
        });

        it('rotate(0deg) → identity', () => deepStrictEqual(round(parseValue('rotate(0deg)')), [1, 0, 0, 1, 0, 0]));

        it('rotate(90deg)', () => {
            const a = deg(90);
            deepStrictEqual(
                round(parseValue('rotate(90deg)')),
                round([Math.cos(a), Math.sin(a), -Math.sin(a), Math.cos(a), 0, 0]),
            );
        });

        it('rotateZ(30deg) — same as rotate(30deg)', () => {
            deepStrictEqual(round(parseValue('rotateZ(30deg)')), round(parseValue('rotate(30deg)') as number[]));
        });

        it('rotateX(45deg) → identity in 2D', () => deepStrictEqual(parseValue('rotateX(45deg)'), [1, 0, 0, 1, 0, 0]));

        it('rotateY(45deg) → identity in 2D', () => deepStrictEqual(parseValue('rotateY(45deg)'), [1, 0, 0, 1, 0, 0]));

        it('rotate3d(0, 0, 1, 45deg) → same as rotate(45deg)', () => {
            deepStrictEqual(
                round(parseValue('rotate3d(0, 0, 1, 45deg)')),
                round(parseValue('rotate(45deg)') as number[]),
            );
        });

        it('rotate3d(1, 0, 0, 45deg) → identity in 2D (x-axis)', () =>
            deepStrictEqual(parseValue('rotate3d(1, 0, 0, 45deg)'), [1, 0, 0, 1, 0, 0]));

        // ── skew ─────────────────────────────────────────────────────────────
        it('skewX(30deg)', () =>
            deepStrictEqual(round(parseValue('skewX(30deg)')), round([1, 0, Math.tan(deg(30)), 1, 0, 0])));

        it('skewY(20deg)', () =>
            deepStrictEqual(round(parseValue('skewY(20deg)')), round([1, Math.tan(deg(20)), 0, 1, 0, 0])));

        it('skew(30deg, 20deg)', () =>
            deepStrictEqual(
                round(parseValue('skew(30deg, 20deg)')),
                round([1, Math.tan(deg(20)), Math.tan(deg(30)), 1, 0, 0]),
            ));

        it('skew(45deg) — single arg → ay=0', () =>
            deepStrictEqual(round(parseValue('skew(45deg)')), round([1, 0, Math.tan(deg(45)), 1, 0, 0])));

        // ── 3D no-ops ────────────────────────────────────────────────────────
        it('translateZ(100px) → identity in 2D', () =>
            deepStrictEqual(parseValue('translateZ(100px)'), [1, 0, 0, 1, 0, 0]));

        it('translate3d(10px, 20px, 30px) → tx/ty only', () =>
            deepStrictEqual(parseValue('translate3d(10px, 20px, 30px)'), [1, 0, 0, 1, 10, 20]));

        it('scale3d(2, 3, 4) → sx/sy only', () => deepStrictEqual(parseValue('scale3d(2, 3, 4)'), [2, 0, 0, 3, 0, 0]));

        it('scaleZ(5) → identity in 2D', () => deepStrictEqual(parseValue('scaleZ(5)'), [1, 0, 0, 1, 0, 0]));

        it('perspective(500px) → identity in 2D', () =>
            deepStrictEqual(parseValue('perspective(500px)'), [1, 0, 0, 1, 0, 0]));
    });
});
