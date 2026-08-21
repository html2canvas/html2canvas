import {Context} from '../src/core/context';
import {
    AmountFilter,
    BlurFilter,
    CSSFilterList,
    DropShadowFilter,
    filter,
    FilterType,
    HueRotateFilter
} from '../src/css/property-descriptors/filter';
import {Parser} from '../src/css/syntax/parser';
import {Tokenizer} from '../src/css/syntax/tokenizer';

// Minimal context mock for testing
const createContext = (): Context => {
    return {
        cache: {_values: {}},
        logger: {debug: () => {}, error: () => {}, info: () => {}},
        windowBounds: {left: 0, top: 0, width: 800, height: 600}
    } as unknown as Context;
};

const parseFilter = (value: string): CSSFilterList => {
    const context = createContext();
    const tokenizer = new Tokenizer();
    tokenizer.write(value);
    const parser = new Parser(tokenizer.read());
    const tokens = parser.parseComponentValues();
    return filter.parse(context, tokens);
};

describe('CSS filter property parsing', () => {
    describe('none', () => {
        it('should return empty list for "none"', () => {
            const result = parseFilter('none');
            expect(result).toEqual([]);
        });
    });

    describe('drop-shadow()', () => {
        it('should parse drop-shadow with offsets only', () => {
            const result = parseFilter('drop-shadow(4px 8px)');
            expect(result).toHaveLength(1);
            const shadow = result[0] as DropShadowFilter;
            expect(shadow.type).toBe(FilterType.DROP_SHADOW);
            expect(shadow.offsetX.number).toBe(4);
            expect(shadow.offsetY.number).toBe(8);
            expect(shadow.blur.number).toBe(0);
        });

        it('should parse drop-shadow with blur', () => {
            const result = parseFilter('drop-shadow(2px 4px 6px)');
            expect(result).toHaveLength(1);
            const shadow = result[0] as DropShadowFilter;
            expect(shadow.type).toBe(FilterType.DROP_SHADOW);
            expect(shadow.offsetX.number).toBe(2);
            expect(shadow.offsetY.number).toBe(4);
            expect(shadow.blur.number).toBe(6);
        });

        it('should parse drop-shadow with color', () => {
            const result = parseFilter('drop-shadow(2px 4px 6px red)');
            expect(result).toHaveLength(1);
            const shadow = result[0] as DropShadowFilter;
            expect(shadow.type).toBe(FilterType.DROP_SHADOW);
            expect(shadow.offsetX.number).toBe(2);
            expect(shadow.offsetY.number).toBe(4);
            expect(shadow.blur.number).toBe(6);
            // Color should be parsed (red = 0xff0000ff)
            expect(shadow.color).toBe(0xff0000ff);
        });

        it('should parse drop-shadow with color before offsets', () => {
            const result = parseFilter('drop-shadow(blue 3px 5px)');
            expect(result).toHaveLength(1);
            const shadow = result[0] as DropShadowFilter;
            expect(shadow.type).toBe(FilterType.DROP_SHADOW);
            expect(shadow.offsetX.number).toBe(3);
            expect(shadow.offsetY.number).toBe(5);
            // blue = 0x0000ffff
            expect(shadow.color).toBe(0x0000ffff);
        });

        it('should return null for drop-shadow with insufficient lengths', () => {
            const result = parseFilter('drop-shadow(4px)');
            // Not enough lengths, should be skipped
            expect(result).toHaveLength(0);
        });
    });

    describe('blur()', () => {
        it('should parse blur with pixel value', () => {
            const result = parseFilter('blur(5px)');
            expect(result).toHaveLength(1);
            const blur = result[0] as BlurFilter;
            expect(blur.type).toBe(FilterType.BLUR);
            expect(blur.radius.number).toBe(5);
        });

        it('should parse blur with 0', () => {
            const result = parseFilter('blur(0)');
            expect(result).toHaveLength(1);
            const blur = result[0] as BlurFilter;
            expect(blur.type).toBe(FilterType.BLUR);
            expect(blur.radius.number).toBe(0);
        });
    });

    describe('brightness()', () => {
        it('should parse brightness with percentage', () => {
            const result = parseFilter('brightness(150%)');
            expect(result).toHaveLength(1);
            const f = result[0] as AmountFilter;
            expect(f.type).toBe(FilterType.BRIGHTNESS);
            expect(f.amount).toBe(1.5);
        });

        it('should parse brightness with number', () => {
            const result = parseFilter('brightness(0.5)');
            expect(result).toHaveLength(1);
            const f = result[0] as AmountFilter;
            expect(f.type).toBe(FilterType.BRIGHTNESS);
            expect(f.amount).toBe(0.5);
        });
    });

    describe('contrast()', () => {
        it('should parse contrast with percentage', () => {
            const result = parseFilter('contrast(200%)');
            expect(result).toHaveLength(1);
            const f = result[0] as AmountFilter;
            expect(f.type).toBe(FilterType.CONTRAST);
            expect(f.amount).toBe(2);
        });

        it('should parse contrast with number', () => {
            const result = parseFilter('contrast(0.75)');
            expect(result).toHaveLength(1);
            const f = result[0] as AmountFilter;
            expect(f.type).toBe(FilterType.CONTRAST);
            expect(f.amount).toBe(0.75);
        });
    });

    describe('grayscale()', () => {
        it('should parse grayscale with percentage', () => {
            const result = parseFilter('grayscale(100%)');
            expect(result).toHaveLength(1);
            const f = result[0] as AmountFilter;
            expect(f.type).toBe(FilterType.GRAYSCALE);
            expect(f.amount).toBe(1);
        });

        it('should parse grayscale with number', () => {
            const result = parseFilter('grayscale(0.5)');
            expect(result).toHaveLength(1);
            const f = result[0] as AmountFilter;
            expect(f.type).toBe(FilterType.GRAYSCALE);
            expect(f.amount).toBe(0.5);
        });
    });

    describe('hue-rotate()', () => {
        it('should parse hue-rotate with degrees', () => {
            const result = parseFilter('hue-rotate(90deg)');
            expect(result).toHaveLength(1);
            const f = result[0] as HueRotateFilter;
            expect(f.type).toBe(FilterType.HUE_ROTATE);
            expect(f.angle).toBe(90);
        });

        it('should parse hue-rotate with radians', () => {
            const result = parseFilter('hue-rotate(3.14159rad)');
            expect(result).toHaveLength(1);
            const f = result[0] as HueRotateFilter;
            expect(f.type).toBe(FilterType.HUE_ROTATE);
            expect(f.angle).toBeCloseTo(180, 0);
        });

        it('should parse hue-rotate with turns', () => {
            const result = parseFilter('hue-rotate(0.5turn)');
            expect(result).toHaveLength(1);
            const f = result[0] as HueRotateFilter;
            expect(f.type).toBe(FilterType.HUE_ROTATE);
            expect(f.angle).toBe(180);
        });

        it('should parse hue-rotate with grad', () => {
            const result = parseFilter('hue-rotate(100grad)');
            expect(result).toHaveLength(1);
            const f = result[0] as HueRotateFilter;
            expect(f.type).toBe(FilterType.HUE_ROTATE);
            expect(f.angle).toBe(90);
        });

        it('should parse hue-rotate(0)', () => {
            const result = parseFilter('hue-rotate(0)');
            expect(result).toHaveLength(1);
            const f = result[0] as HueRotateFilter;
            expect(f.type).toBe(FilterType.HUE_ROTATE);
            expect(f.angle).toBe(0);
        });
    });

    describe('invert()', () => {
        it('should parse invert with percentage', () => {
            const result = parseFilter('invert(100%)');
            expect(result).toHaveLength(1);
            const f = result[0] as AmountFilter;
            expect(f.type).toBe(FilterType.INVERT);
            expect(f.amount).toBe(1);
        });

        it('should parse invert with number', () => {
            const result = parseFilter('invert(0.8)');
            expect(result).toHaveLength(1);
            const f = result[0] as AmountFilter;
            expect(f.type).toBe(FilterType.INVERT);
            expect(f.amount).toBe(0.8);
        });
    });

    describe('opacity()', () => {
        it('should parse opacity with percentage', () => {
            const result = parseFilter('opacity(50%)');
            expect(result).toHaveLength(1);
            const f = result[0] as AmountFilter;
            expect(f.type).toBe(FilterType.OPACITY);
            expect(f.amount).toBe(0.5);
        });

        it('should parse opacity with number', () => {
            const result = parseFilter('opacity(0.3)');
            expect(result).toHaveLength(1);
            const f = result[0] as AmountFilter;
            expect(f.type).toBe(FilterType.OPACITY);
            expect(f.amount).toBeCloseTo(0.3);
        });
    });

    describe('saturate()', () => {
        it('should parse saturate with percentage', () => {
            const result = parseFilter('saturate(300%)');
            expect(result).toHaveLength(1);
            const f = result[0] as AmountFilter;
            expect(f.type).toBe(FilterType.SATURATE);
            expect(f.amount).toBe(3);
        });

        it('should parse saturate with number', () => {
            const result = parseFilter('saturate(2)');
            expect(result).toHaveLength(1);
            const f = result[0] as AmountFilter;
            expect(f.type).toBe(FilterType.SATURATE);
            expect(f.amount).toBe(2);
        });
    });

    describe('sepia()', () => {
        it('should parse sepia with percentage', () => {
            const result = parseFilter('sepia(80%)');
            expect(result).toHaveLength(1);
            const f = result[0] as AmountFilter;
            expect(f.type).toBe(FilterType.SEPIA);
            expect(f.amount).toBe(0.8);
        });

        it('should parse sepia with number', () => {
            const result = parseFilter('sepia(1)');
            expect(result).toHaveLength(1);
            const f = result[0] as AmountFilter;
            expect(f.type).toBe(FilterType.SEPIA);
            expect(f.amount).toBe(1);
        });
    });

    describe('multiple filters', () => {
        it('should parse multiple filters in sequence', () => {
            const result = parseFilter('blur(2px) grayscale(50%) brightness(1.2)');
            expect(result).toHaveLength(3);

            const blur = result[0] as BlurFilter;
            expect(blur.type).toBe(FilterType.BLUR);
            expect(blur.radius.number).toBe(2);

            const grayscale = result[1] as AmountFilter;
            expect(grayscale.type).toBe(FilterType.GRAYSCALE);
            expect(grayscale.amount).toBe(0.5);

            const brightness = result[2] as AmountFilter;
            expect(brightness.type).toBe(FilterType.BRIGHTNESS);
            expect(brightness.amount).toBe(1.2);
        });

        it('should parse complex filter chain', () => {
            const result = parseFilter('drop-shadow(2px 4px 6px black) blur(3px) sepia(100%) hue-rotate(45deg)');
            expect(result).toHaveLength(4);

            expect(result[0].type).toBe(FilterType.DROP_SHADOW);
            expect(result[1].type).toBe(FilterType.BLUR);
            expect(result[2].type).toBe(FilterType.SEPIA);
            expect(result[3].type).toBe(FilterType.HUE_ROTATE);
        });
    });

    describe('unsupported filters', () => {
        it('should ignore unknown filter functions', () => {
            const result = parseFilter('url(#my-filter)');
            expect(result).toHaveLength(0);
        });

        it('should parse supported filters and ignore unsupported', () => {
            const result = parseFilter('blur(5px) url(#something) grayscale(1)');
            expect(result).toHaveLength(2);
            expect(result[0].type).toBe(FilterType.BLUR);
            expect(result[1].type).toBe(FilterType.GRAYSCALE);
        });
    });
});
