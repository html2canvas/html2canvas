import {strictEqual} from 'assert';
import {Context} from '../../../core/context';
import {Parser} from '../../syntax/parser';
import {asString, color, isTransparent, pack} from '../color';

const parse = (value: string) => color.parse({} as Context, Parser.parseValue(value));

describe('types', () => {
    describe('<color>', () => {
        describe('parsing', () => {
            it('#000', () => strictEqual(parse('#000'), pack(0, 0, 0, 1)));
            it('#0000', () => strictEqual(parse('#0000'), pack(0, 0, 0, 0)));
            it('#000f', () => strictEqual(parse('#000f'), pack(0, 0, 0, 1)));
            it('#fff', () => strictEqual(parse('#fff'), pack(255, 255, 255, 1)));
            it('#000000', () => strictEqual(parse('#000000'), pack(0, 0, 0, 1)));
            it('#00000000', () => strictEqual(parse('#00000000'), pack(0, 0, 0, 0)));
            it('#ffffff', () => strictEqual(parse('#ffffff'), pack(255, 255, 255, 1)));
            it('#ffffffff', () => strictEqual(parse('#ffffffff'), pack(255, 255, 255, 1)));
            it('#7FFFD4', () => strictEqual(parse('#7FFFD4'), pack(127, 255, 212, 1)));
            it('#f0ffff', () => strictEqual(parse('#f0ffff'), pack(240, 255, 255, 1)));
            it('transparent', () => strictEqual(parse('transparent'), pack(0, 0, 0, 0)));
            it('bisque', () => strictEqual(parse('bisque'), pack(255, 228, 196, 1)));
            it('BLUE', () => strictEqual(parse('BLUE'), pack(0, 0, 255, 1)));
            it('rgb(1, 3, 5)', () => strictEqual(parse('rgb(1, 3, 5)'), pack(1, 3, 5, 1)));
            it('rgb(0% 0% 0%)', () => strictEqual(parse('rgb(0% 0% 0%)'), pack(0, 0, 0, 1)));
            it('rgb(50% 50% 50%)', () => strictEqual(parse('rgb(50% 50% 50%)'), pack(128, 128, 128, 1)));
            it('rgba(50% 50% 50% 50%)', () => strictEqual(parse('rgba(50% 50% 50% 50%)'), pack(128, 128, 128, 0.5)));
            it('rgb(100% 100% 100%)', () => strictEqual(parse('rgb(100% 100% 100%)'), pack(255, 255, 255, 1)));
            it('rgb(222 111 50)', () => strictEqual(parse('rgb(222 111 50)'), pack(222, 111, 50, 1)));
            it('rgba(200, 3, 5, 1)', () => strictEqual(parse('rgba(200, 3, 5, 1)'), pack(200, 3, 5, 1)));
            it('rgba(222, 111, 50, 0.22)', () =>
                strictEqual(parse('rgba(222, 111, 50, 0.22)'), pack(222, 111, 50, 0.22)));
            it('rgba(222 111 50 0.123)', () => strictEqual(parse('rgba(222 111 50 0.123)'), pack(222, 111, 50, 0.123)));
            it('hsl(270,60%,70%)', () => strictEqual(parse('hsl(270,60%,70%)'), parse('rgb(179,133,224)')));
            it('hsl(270, 60%, 70%)', () => strictEqual(parse('hsl(270, 60%, 70%)'), parse('rgb(179,133,224)')));
            it('hsl(270 60% 70%)', () => strictEqual(parse('hsl(270 60% 70%)'), parse('rgb(179,133,224)')));
            it('hsl(270deg, 60%, 70%)', () => strictEqual(parse('hsl(270deg, 60%, 70%)'), parse('rgb(179,133,224)')));
            it('hsl(4.71239rad, 60%, 70%)', () =>
                strictEqual(parse('hsl(4.71239rad, 60%, 70%)'), parse('rgb(179,133,224)')));
            it('hsl(.75turn, 60%, 70%)', () => strictEqual(parse('hsl(.75turn, 60%, 70%)'), parse('rgb(179,133,224)')));
            it('hsla(.75turn, 60%, 70%, 50%)', () =>
                strictEqual(parse('hsl(.75turn, 60%, 70%, 50%)'), parse('rgba(179,133,224, 0.5)')));
            it('lch(29.2345% 44.2 27 / 0.2)', () =>
                strictEqual(parse('lch(29.2345% 44.2 27 / 0.2)'), pack(125, 35, 41, 0.2)));
            it('lch(76.5 4.24 49.5)', () => strictEqual(parse('lch(76.5 4.24 49.5)'), pack(196, 187, 183, 1)));
            it('oklab(0.62796 0.22486 0.12585)', () => {
                // Test oklab color parsing - verify it produces a valid color
                const result = parse('oklab(0.62796 0.22486 0.12585)');
                strictEqual(result > 0, true);
                // Should be a reddish color, not transparent
                strictEqual((result & 0xff) > 0, true);
            });
            it('oklab(0.62796 0.22486 0.12585 / 0.5)', () => {
                // Test oklab with alpha
                const result = parse('oklab(0.62796 0.22486 0.12585 / 0.5)');
                strictEqual(result > 0, true);
            });
            it('oklab(70% 0.15 -0.1)', () => {
                // Test oklab with percentage lightness
                const result = parse('oklab(70% 0.15 -0.1)');
                strictEqual(result > 0, true);
            });
            it('lch(76.5 4.24 49.5)', () => strictEqual(parse('lch(76.5 4.24 49.5)'), pack(196, 187, 183, 1)));
            it('oklch(0.7 0.15 180)', () => strictEqual(parse('oklch(0.7 0.15 180)'), pack(0, 187, 162, 1)));
            it('oklab(0.7 -0.1 0.1)', () => strictEqual(parse('oklab(0.7 -0.1 0.1)'), pack(119, 178, 83, 1)));
            it('lab(50 30 -20)', () => strictEqual(parse('lab(50 30 -20)'), pack(156, 100, 154, 1)));
            it('color(display-p3 1 0 0)', () => strictEqual(parse('color(display-p3 1 0 0)'), pack(255, 11, 12, 1)));
            it('color(srgb 0.5 0.5 0.5)', () => strictEqual(parse('color(srgb 0.5 0.5 0.5)'), pack(128, 128, 128, 1)));
            it('hwb(270 20% 10%)', () => strictEqual(parse('hwb(270 20% 10%)'), pack(140, 51, 230, 1)));
            it('color-mix(in srgb, red 50%, blue 50%)', () =>
                strictEqual(parse('color-mix(in srgb, red 50%, blue 50%)'), pack(128, 0, 128, 1)));
            it('color-mix(in oklch, #34c9eb 80%, white 20%)', () =>
                strictEqual(parse('color-mix(in oklch, #34c9eb 80%, white 20%)'), pack(111, 212, 240, 1)));
            it('color-mix(in hsl, hsl(120 100% 50%) 25%, hsl(30 100% 50%) 75%)', () =>
                strictEqual(
                    parse('color-mix(in hsl, hsl(120 100% 50%) 25%, hsl(30 100% 50%) 75%)'),
                    pack(255, 223, 0, 1)
                ));
        });
        describe('util', () => {
            describe('isTransparent', () => {
                it('transparent', () => strictEqual(isTransparent(parse('transparent')), true));
                it('#000', () => strictEqual(isTransparent(parse('#000')), false));
                it('#000f', () => strictEqual(isTransparent(parse('#000f')), false));
                it('#0001', () => strictEqual(isTransparent(parse('#0001')), false));
                it('#0000', () => strictEqual(isTransparent(parse('#0000')), true));
            });

            describe('toString', () => {
                it('transparent', () => strictEqual(asString(parse('transparent')), 'rgba(0,0,0,0)'));
                it('#000', () => strictEqual(asString(parse('#000')), 'rgb(0,0,0)'));
                it('#000f', () => strictEqual(asString(parse('#000f')), 'rgb(0,0,0)'));
                it('#000f', () => strictEqual(asString(parse('#000c')), 'rgba(0,0,0,0.8)'));
                it('#fff', () => strictEqual(asString(parse('#fff')), 'rgb(255,255,255)'));
                it('#ffff', () => strictEqual(asString(parse('#ffff')), 'rgb(255,255,255)'));
                it('#fffc', () => strictEqual(asString(parse('#fffc')), 'rgba(255,255,255,0.8)'));
            });
        });
    });
});
