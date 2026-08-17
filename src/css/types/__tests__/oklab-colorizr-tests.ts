/**
 * Test cases from colorizr library
 * Reference: https://github.com/gilbarbara/colorizr
 * These test cases verify our OKLab to RGB conversion matches the reference implementation
 */

import {strictEqual} from 'assert';
import {color} from '../color';
import {Parser} from '../../syntax/parser';
import {Context} from '../../../core/context';

const parse = (value: string) => color.parse({} as Context, Parser.parseValue(value));

// Test data from colorizr fixtures
const testCases = [
    {
        name: 'brightPink',
        oklab: {l: 0.63269, a: 0.23887, b: 0.08648},
        expectedRgb: {r: 255, g: 0, b: 68}
    },
    {
        name: 'green',
        oklab: {l: 0.86876, a: -0.22518, b: 0.1597},
        expectedRgb: {r: 0, g: 255, b: 68}
    },
    {
        name: 'orange',
        oklab: {l: 0.70622, a: 0.1374, b: 0.14283},
        expectedRgb: {r: 255, g: 110, b: 0}
    },
    {
        name: 'violet',
        oklab: {l: 0.47642, a: 0.02578, b: -0.29845},
        expectedRgb: {r: 68, g: 0, b: 255}
    },
    {
        name: 'yellow',
        oklab: {l: 0.92235, a: -0.01932, b: 0.14143},
        expectedRgb: {r: 255, g: 230, b: 109}
    },
    {
        name: 'black',
        oklab: {l: 0, a: 0, b: 0},
        expectedRgb: {r: 0, g: 0, b: 0}
    }
];

describe('OKLab color conversion (colorizr test cases)', () => {
    testCases.forEach(({name, oklab, expectedRgb}) => {
        it(`${name}: oklab(${oklab.l} ${oklab.a} ${oklab.b}) should equal rgb(${expectedRgb.r}, ${expectedRgb.g}, ${expectedRgb.b})`, () => {
            const oklabStr = `oklab(${oklab.l} ${oklab.a} ${oklab.b})`;
            const result = parse(oklabStr);

            // Extract RGB values from packed color
            const alpha = 0xff & result;
            const blue = 0xff & (result >> 8);
            const green = 0xff & (result >> 16);
            const red = 0xff & (result >> 24);

            // Allow small tolerance for rounding differences (within 1 RGB unit)
            const tolerance = 1;
            const rDiff = Math.abs(red - expectedRgb.r);
            const gDiff = Math.abs(green - expectedRgb.g);
            const bDiff = Math.abs(blue - expectedRgb.b);

            if (rDiff > tolerance || gDiff > tolerance || bDiff > tolerance) {
                throw new Error(
                    `Expected rgb(${expectedRgb.r}, ${expectedRgb.g}, ${expectedRgb.b}), ` +
                        `got rgb(${red}, ${green}, ${blue}). ` +
                        `Differences: R=${rDiff}, G=${gDiff}, B=${bDiff}`
                );
            }

            strictEqual(alpha, 255, 'Alpha should be 1 (255)');
        });
    });

    // Test with percentage values
    it('brightPink with percentage: oklab(63.269% 0.23887 0.08648)', () => {
        const result = parse('oklab(63.269% 0.23887 0.08648)');

        const alpha = 0xff & result;
        const blue = 0xff & (result >> 8);
        const green = 0xff & (result >> 16);
        const red = 0xff & (result >> 24);

        const tolerance = 1;
        const rDiff = Math.abs(red - 255);
        const gDiff = Math.abs(green - 0);
        const bDiff = Math.abs(blue - 68);

        if (rDiff > tolerance || gDiff > tolerance || bDiff > tolerance) {
            throw new Error(
                `Expected rgb(255, 0, 68), got rgb(${red}, ${green}, ${blue}). ` +
                    `Differences: R=${rDiff}, G=${gDiff}, B=${bDiff}`
            );
        }

        strictEqual(alpha, 255);
    });
});
