import { deepStrictEqual } from 'assert';
import { Context } from '../../../core/context';
import { writingMode, WRITING_MODE } from '../writing-mode';

const parse = (value: string) => writingMode.parse({} as Context, value);

describe('property-descriptors', () => {
    describe('writing-mode', () => {
        it('initial value is horizontal-tb', () => deepStrictEqual(writingMode.initialValue, 'horizontal-tb'));

        it('horizontal-tb', () => deepStrictEqual(parse('horizontal-tb'), WRITING_MODE.HORIZONTAL_TB));

        it('vertical-rl', () => deepStrictEqual(parse('vertical-rl'), WRITING_MODE.VERTICAL_RL));

        it('vertical-lr', () => deepStrictEqual(parse('vertical-lr'), WRITING_MODE.VERTICAL_LR));

        it('sideways-rl', () => deepStrictEqual(parse('sideways-rl'), WRITING_MODE.SIDEWAYS_RL));

        it('sideways-lr', () => deepStrictEqual(parse('sideways-lr'), WRITING_MODE.SIDEWAYS_LR));

        it('unknown value falls back to horizontal-tb', () =>
            deepStrictEqual(parse('unknown'), WRITING_MODE.HORIZONTAL_TB));

        it('empty string falls back to horizontal-tb', () => deepStrictEqual(parse(''), WRITING_MODE.HORIZONTAL_TB));
    });
});
